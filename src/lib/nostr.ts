import { NosskeyIframeClient, NosskeyIframeError } from 'nosskey-iframe'
import {
  SimplePool,
  finalizeEvent,
  generateSecretKey,
  getPublicKey,
  nip19,
} from 'nostr-tools'
import type { Event, Filter } from 'nostr-tools'

export interface UserProfile {
  name?: string
  display_name?: string
  picture?: string
}

declare global {
  interface Window {
    nostr?: {
      getPublicKey(): Promise<string>
      signEvent(event: {
        kind: number
        created_at: number
        tags: string[][]
        content: string
        pubkey: string
      }): Promise<Event>
    }
  }
}

export const RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
  'wss://yabu.me',
  'wss://r.kojira.io',
]

export const HASHTAG = 'xisdown'

export const EARTHQUAKE_NPUBS = [
  'npub1namazu7um9xvgfpax6yrk9tl3segxpgac67jx7cuttzqp7usem9sqavlhz',
  'npub1p92agfqsynk3lv8mturqwaq68wpvat55qsf72e3j97wkrnyy9hhsxczd3x',
]
export const EARTHQUAKE_PUBKEYS = EARTHQUAKE_NPUBS.map(
  (n) => nip19.decode(n).data as string,
)

const SK_STORAGE_KEY = 'x-is-down:sk'

function loadOrCreateSecretKey(): Uint8Array {
  const stored = localStorage.getItem(SK_STORAGE_KEY)
  if (stored) {
    const arr = JSON.parse(stored) as number[]
    return new Uint8Array(arr)
  }
  const sk = generateSecretKey()
  localStorage.setItem(SK_STORAGE_KEY, JSON.stringify(Array.from(sk)))
  return sk
}

export const secretKey = loadOrCreateSecretKey()
export const publicKey = getPublicKey(secretKey)
export const npub = nip19.npubEncode(publicKey)

console.log('[nostr] pubkey:', publicKey)
console.log('[nostr] npub:', npub)

export function shortNpub(npubStr: string): string {
  return `${npubStr.slice(0, 8)}...${npubStr.slice(-4)}`
}

export function isNip07Available(): boolean {
  return typeof window !== 'undefined' && typeof window.nostr !== 'undefined'
}

export async function getNip07PublicKey(): Promise<string> {
  if (!window.nostr) throw new Error('NIP-07 extension not available')
  return window.nostr.getPublicKey()
}

// --- nosskey.app (iframe signing provider) -----------------------------------

const NOSSKEY_IFRAME_URL = 'https://nosskey.app/#/iframe'

export type NosskeyTheme = 'neutral-dark' | 'neutral-light'

/** Map the parent app theme to a matching nosskey iframe theme. */
export function nosskeyThemeFor(appTheme: 'x' | 'twitter'): NosskeyTheme {
  // 'x' is the dark theme, 'twitter' is the light theme.
  return appTheme === 'twitter' ? 'neutral-light' : 'neutral-dark'
}

interface NosskeySession {
  client: NosskeyIframeClient
  cleanup: () => void
}

let nosskeySession: NosskeySession | null = null

export function isNosskeyLoggedIn(): boolean {
  return nosskeySession !== null
}

/**
 * Style the iframe as a centered modal and add a dimmed backdrop. The SDK only
 * toggles `iframe.style.display` between `none`/`block` when a consent dialog is
 * needed, so we observe that and sync the backdrop visibility.
 */
function mountNosskeyModal(client: NosskeyIframeClient): () => void {
  const iframe = client.iframe
  Object.assign(iframe.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(420px, 92vw)',
    height: 'min(640px, 90vh)',
    border: 'none',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.45)',
    zIndex: '10000',
  })

  const backdrop = document.createElement('div')
  Object.assign(backdrop.style, {
    position: 'fixed',
    inset: '0',
    background: 'rgba(0, 0, 0, 0.6)',
    zIndex: '9999',
    display: 'none',
  })
  document.body.appendChild(backdrop)

  const sync = () => {
    backdrop.style.display = iframe.style.display === 'none' ? 'none' : 'block'
  }
  const observer = new MutationObserver(sync)
  observer.observe(iframe, { attributes: true, attributeFilter: ['style'] })
  sync()

  return () => {
    observer.disconnect()
    backdrop.remove()
  }
}

/**
 * Create the nosskey iframe client and resolve the user's public key. Throws
 * `NosskeyIframeError` with code `NO_KEY` when no passkey has been set up yet
 * (the user must visit nosskey.app first).
 */
export async function loginWithNosskey(theme: NosskeyTheme): Promise<string> {
  logoutNosskey()

  const lang: 'ja' | 'en' =
    typeof navigator !== 'undefined' && navigator.language.startsWith('ja')
      ? 'ja'
      : 'en'

  const client = new NosskeyIframeClient({
    iframeUrl: NOSSKEY_IFRAME_URL,
    theme,
    lang,
  })
  const cleanup = mountNosskeyModal(client)

  try {
    await client.ready()
    const pubkey = await client.getPublicKey()
    nosskeySession = { client, cleanup }
    return pubkey
  } catch (e) {
    cleanup()
    client.destroy()
    throw e
  }
}

export function logoutNosskey(): void {
  if (!nosskeySession) return
  nosskeySession.cleanup()
  nosskeySession.client.destroy()
  nosskeySession = null
}

export function isNosskeyNoKeyError(e: unknown): boolean {
  return e instanceof NosskeyIframeError && e.code === 'NO_KEY'
}

// --- publishing --------------------------------------------------------------

export type LoginMethod = 'nip07' | 'nosskey'

export interface PostAuth {
  method: LoginMethod
  pubkey: string
}

export async function publishPost(content: string, auth?: PostAuth): Promise<Event> {
  const unsigned = {
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['t', HASHTAG]],
    content,
  }

  let event: Event

  if (auth?.method === 'nip07' && window.nostr) {
    event = await window.nostr.signEvent({ ...unsigned, pubkey: auth.pubkey })
  } else if (auth?.method === 'nosskey' && nosskeySession) {
    event = (await nosskeySession.client.signEvent({
      ...unsigned,
      pubkey: auth.pubkey,
    })) as Event
  } else {
    event = finalizeEvent(unsigned, secretKey)
  }

  console.log('[publishPost] finalized event:', JSON.stringify(event, null, 2))

  const pool = new SimplePool()
  const results = pool.publish(RELAYS, event)

  const promises = results.map((p, i) =>
    p
      .then((msg) => console.log(`[publishPost] relay ok: ${RELAYS[i]}`, msg))
      .catch((e: unknown) => console.error(`[publishPost] relay failed: ${RELAYS[i]}`, e)),
  )

  try {
    await Promise.any(results)
    console.log('[publishPost] at least one relay accepted the event')
  } catch (e) {
    console.error('[publishPost] ALL relays failed!', e)
    throw e
  }

  await Promise.allSettled(promises)
  console.log('[publishPost] all relay responses settled, closing pool in 5s...')
  await new Promise((resolve) => setTimeout(resolve, 1000))
  pool.close(RELAYS)
  console.log('[publishPost] pool closed')

  return event
}

export function subscribeToTag(
  onEvent: (event: Event) => void,
  onEose?: () => void,
): { unsubscribe: () => void } {
  console.log('[subscribeToTag] starting subscription, relays:', RELAYS)
  const pool = new SimplePool()

  const sub = pool.subscribeMany(
    RELAYS,
    {
      kinds: [1],
      '#t': [HASHTAG],
      limit: 50,
    } satisfies Filter,
    {
      onevent: (event) => {
        console.log('[subscribeToTag] received event id:', event.id, 'pubkey:', event.pubkey)
        onEvent(event)
      },
      oneose: () => {
        console.log('[subscribeToTag] EOSE received')
        onEose?.()
      },
    },
  )

  return {
    unsubscribe: () => {
      sub.close()
      pool.close(RELAYS)
    },
  }
}

export async function fetchRecentPosts(
  since: number,
  onEvent: (event: Event) => void,
): Promise<void> {
  return new Promise((resolve) => {
    console.log('[fetchRecentPosts] fetching since:', since)
    const pool = new SimplePool()

    let sub: ReturnType<SimplePool['subscribeMany']>

    sub = pool.subscribeMany(
      RELAYS,
      {
        kinds: [1],
        '#t': [HASHTAG],
        since,
      } satisfies Filter,
      {
        onevent: (event) => {
          console.log('[fetchRecentPosts] received event id:', event.id)
          onEvent(event)
        },
        oneose: () => {
          console.log('[fetchRecentPosts] EOSE received, closing')
          sub.close()
          pool.close(RELAYS)
          resolve()
        },
      },
    )
  })
}

export function subscribeToEarthquakeAccounts(
  onEvent: (event: Event) => void,
  onEose?: () => void,
): { unsubscribe: () => void } {
  console.log('[subscribeToEarthquakeAccounts] starting subscription, pubkeys:', EARTHQUAKE_PUBKEYS)
  const pool = new SimplePool()

  const sub = pool.subscribeMany(
    RELAYS,
    {
      kinds: [1],
      authors: EARTHQUAKE_PUBKEYS,
      limit: 20,
    } satisfies Filter,
    {
      onevent: (event) => {
        console.log('[subscribeToEarthquakeAccounts] received event id:', event.id, 'pubkey:', event.pubkey)
        onEvent(event)
      },
      oneose: () => {
        console.log('[subscribeToEarthquakeAccounts] EOSE received')
        onEose?.()
      },
    },
  )

  return {
    unsubscribe: () => {
      sub.close()
      pool.close(RELAYS)
    },
  }
}

export async function fetchUserProfiles(pubkeys: string[]): Promise<Map<string, UserProfile>> {
  return new Promise((resolve) => {
    if (pubkeys.length === 0) {
      resolve(new Map())
      return
    }

    console.log('[fetchUserProfiles] fetching kind0 for', pubkeys.length, 'pubkeys')
    const pool = new SimplePool()
    const collected = new Map<string, Event[]>()

    const finish = () => {
      sub.close()
      pool.close(RELAYS)

      const profiles = new Map<string, UserProfile>()
      for (const [pubkey, events] of collected) {
        const latest = events.reduce((a, b) => (a.created_at >= b.created_at ? a : b))
        try {
          const profile = JSON.parse(latest.content) as UserProfile
          profiles.set(pubkey, profile)
        } catch {
          // ignore parse errors
        }
      }

      console.log('[fetchUserProfiles] resolved', profiles.size, 'profiles')
      resolve(profiles)
    }

    const timeout = setTimeout(finish, 5000)

    const sub = pool.subscribeMany(
      RELAYS,
      { kinds: [0], authors: pubkeys } satisfies Filter,
      {
        onevent: (event) => {
          console.log('[fetchUserProfiles] received kind0 for pubkey:', event.pubkey)
          const existing = collected.get(event.pubkey) ?? []
          collected.set(event.pubkey, [...existing, event])
        },
        oneose: () => {
          console.log('[fetchUserProfiles] EOSE received, waiting until 5s timeout')
        },
      },
    )

    // Ensure timeout is cleared if finish() is called early (not currently, but safe)
    void timeout
  })
}
