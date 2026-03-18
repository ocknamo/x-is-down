import {
  SimplePool,
  finalizeEvent,
  generateSecretKey,
  getPublicKey,
  nip19,
} from 'nostr-tools'
import type { Event } from 'nostr-tools'

export const RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.nostr.band',
]

export const HASHTAG = 'xisdown'

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

export function shortNpub(npubStr: string): string {
  return `${npubStr.slice(0, 8)}...${npubStr.slice(-4)}`
}

export async function publishPost(content: string): Promise<Event> {
  const event = finalizeEvent(
    {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [['t', HASHTAG]],
      content,
    },
    secretKey,
  )

  const pool = new SimplePool()
  await Promise.any(pool.publish(RELAYS, event))
  pool.close(RELAYS)

  return event
}

export function subscribeToTag(
  onEvent: (event: Event) => void,
  onEose?: () => void,
): () => void {
  const pool = new SimplePool()

  const sub = pool.subscribeMany(
    RELAYS,
    [
      {
        kinds: [1],
        '#t': [HASHTAG],
        limit: 50,
      },
    ],
    {
      onevent: onEvent,
      oneose: onEose,
    },
  )

  return () => {
    sub.close()
    pool.close(RELAYS)
  }
}
