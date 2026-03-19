import type { Event } from 'nostr-tools'

export function sortedByTime(events: Event[]): Event[] {
  return [...events].sort((a, b) => b.created_at - a.created_at)
}

export function addUniqueEvent(events: Event[], event: Event): Event[] {
  if (events.find((p) => p.id === event.id)) return events
  return sortedByTime([event, ...events])
}
