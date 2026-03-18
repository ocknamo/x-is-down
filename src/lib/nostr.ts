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

  console.log('[publishPost] event:', event)
  console.log('[publishPost] relays:', RELAYS)

  const pool = new SimplePool()
  const results = pool.publish(RELAYS, event)

  const promises = results.map((p, i) =>
    p
      .then(() => console.log(`[publishPost] success: ${RELAYS[i]}`))
      .catch((e: unknown) => console.error(`[publishPost] failed: ${RELAYS[i]}`, e)),
  )

  await Promise.any(results)
  console.log('[publishPost] at least one relay accepted the event')

  await Promise.allSettled(promises)
  await new Promise((resolve) => setTimeout(resolve, 5000))
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
    {
      kinds: [1],
      '#t': [HASHTAG],
      limit: 50,
    } satisfies Filter,
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
