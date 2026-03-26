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

export async function publishPost(content: string, nip07Pubkey?: string): Promise<Event> {
  let event: Event

  if (nip07Pubkey && window.nostr) {
    event = await window.nostr.signEvent({
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['t', HASHTAG]],
      content,
      pubkey: nip07Pubkey,
    })
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
