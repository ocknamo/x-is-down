import {
  SimplePool,
  finalizeEvent,
  generateSecretKey,
  getPublicKey,
  nip19,
} from 'nostr-tools'
import type { Event, Filter } from 'nostr-tools'

export const RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
  'wss://yabu.me',
  'wss://r.kojira.io',
]

export const HASHTAG = 'xisdown'

const SK_STORAGE_KEY = 'x-is-down:sk'

// NIP-07 window.nostr interface
interface Nip07Provider {
  getPublicKey(): Promise<string>
  signEvent(event: {
    kind: number
    created_at: number
    tags: string[][]
    content: string
  }): Promise<Event>
}

declare global {
  interface Window {
    nostr?: Nip07Provider
  }
}

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

// NIP-07 login state
export type LoginMode = 'generated' | 'nip07'

class AuthStore {
  mode = $state<LoginMode>('generated')
  nip07Pubkey = $state<string | null>(null)

  get currentPubkey(): string {
    return this.mode === 'nip07' && this.nip07Pubkey ? this.nip07Pubkey : publicKey
  }

  get currentNpub(): string {
    return nip19.npubEncode(this.currentPubkey)
  }
}

export const authStore = new AuthStore()

export function isNip07Available(): boolean {
  return typeof window !== 'undefined' && !!window.nostr
}

export async function loginWithNip07(): Promise<void> {
  if (!window.nostr) throw new Error('NIP-07 extension not found')
  const pk = await window.nostr.getPublicKey()
  authStore.nip07Pubkey = pk
  authStore.mode = 'nip07'
  console.log('[nostr] NIP-07 login, pubkey:', pk)
}

export function logout(): void {
  authStore.mode = 'generated'
  authStore.nip07Pubkey = null
  console.log('[nostr] logged out, using generated key')
}

export function shortNpub(npubStr: string): string {
  return `${npubStr.slice(0, 8)}...${npubStr.slice(-4)}`
}

export async function publishPost(content: string): Promise<Event> {
  let event: Event

  if (authStore.mode === 'nip07' && window.nostr) {
    const unsigned = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['t', HASHTAG]],
      content,
    }
    event = await window.nostr.signEvent(unsigned)
    console.log('[publishPost] NIP-07 signed event:', JSON.stringify(event, null, 2))
  } else {
    event = finalizeEvent(
      {
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [['t', HASHTAG]],
        content,
      },
      secretKey,
    )
    console.log('[publishPost] finalized event:', JSON.stringify(event, null, 2))
  }

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
