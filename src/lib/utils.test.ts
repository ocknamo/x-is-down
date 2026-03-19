import { describe, expect, it } from 'vitest'
import type { Event } from 'nostr-tools'
import { addUniqueEvent, sortedByTime } from './utils'

function makeEvent(id: string, created_at: number): Event {
  return {
    id,
    pubkey: 'pubkey',
    created_at,
    kind: 1,
    tags: [],
    content: 'test',
    sig: 'sig',
  }
}

describe('sortedByTime', () => {
  it('sorts events newest first', () => {
    const events = [makeEvent('a', 100), makeEvent('b', 300), makeEvent('c', 200)]
    const result = sortedByTime(events)
    expect(result.map((e) => e.id)).toEqual(['b', 'c', 'a'])
  })

  it('returns new array without mutating original', () => {
    const events = [makeEvent('a', 100), makeEvent('b', 300)]
    const original = [...events]
    sortedByTime(events)
    expect(events).toEqual(original)
  })

  it('handles empty array', () => {
    expect(sortedByTime([])).toEqual([])
  })

  it('handles single element', () => {
    const events = [makeEvent('a', 100)]
    expect(sortedByTime(events)).toEqual(events)
  })
})

describe('addUniqueEvent', () => {
  it('adds a new event and returns sorted array', () => {
    const existing = [makeEvent('a', 200), makeEvent('b', 100)]
    const newEvent = makeEvent('c', 300)
    const result = addUniqueEvent(existing, newEvent)
    expect(result.map((e) => e.id)).toEqual(['c', 'a', 'b'])
  })

  it('ignores duplicate events with the same id', () => {
    const existing = [makeEvent('a', 200)]
    const duplicate = makeEvent('a', 200)
    const result = addUniqueEvent(existing, duplicate)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('a')
  })

  it('does not mutate the original array', () => {
    const existing = [makeEvent('a', 200)]
    const original = [...existing]
    addUniqueEvent(existing, makeEvent('b', 300))
    expect(existing).toEqual(original)
  })

  it('adds event to empty array', () => {
    const event = makeEvent('a', 100)
    const result = addUniqueEvent([], event)
    expect(result).toEqual([event])
  })
})
