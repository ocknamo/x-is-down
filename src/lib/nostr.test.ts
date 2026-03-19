import { beforeEach, describe, expect, it, vi } from 'vitest'

// localStorage mock must be set up before importing nostr module
const store: Record<string, string> = {}
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    store[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete store[key]
  }),
  clear: vi.fn(() => {
    for (const key of Object.keys(store)) delete store[key]
  }),
}
vi.stubGlobal('localStorage', localStorageMock)

const { shortNpub } = await import('./nostr')

describe('shortNpub', () => {
  it('returns first 8 chars + ... + last 4 chars', () => {
    const npub = 'npub1abcdefghijklmnopqrstuvwxyz1234'
    expect(shortNpub(npub)).toBe('npub1abc...1234')
  })

  it('abbreviates a typical npub string correctly', () => {
    const npub = 'npub1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqxyz9'
    const result = shortNpub(npub)
    expect(result).toBe(`${npub.slice(0, 8)}...${npub.slice(-4)}`)
  })
})

describe('loadOrCreateSecretKey (via module init)', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.resetModules()
  })

  it('generates a new key and stores it in localStorage when none exists', async () => {
    const { secretKey } = await import('./nostr')
    expect(secretKey).toBeInstanceOf(Uint8Array)
    expect(secretKey.length).toBe(32)
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'x-is-down:sk',
      expect.any(String),
    )
  })

  it('returns the same key on subsequent imports', async () => {
    const { secretKey: key1 } = await import('./nostr')
    vi.resetModules()
    // Re-populate store as the module would have stored it
    const stored = store['x-is-down:sk']
    localStorageMock.getItem.mockImplementation((k: string) =>
      k === 'x-is-down:sk' ? stored : null as unknown as string,
    )
    const { secretKey: key2 } = await import('./nostr')
    expect(key1).toEqual(key2)
  })
})
