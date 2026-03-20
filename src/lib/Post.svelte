<script lang="ts">
  import type { Event } from 'nostr-tools'
  import { nip19 } from 'nostr-tools'
  import { shortNpub, HASHTAG } from './nostr'
  import EggAvatar from './EggAvatar.svelte'
  import { themeStore } from './theme.svelte'
  import { i18n } from './i18n.svelte'

  interface Props {
    event: Event
  }

  const { event }: Props = $props()

  const npubStr = $derived(nip19.npubEncode(event.pubkey))
  const displayName = $derived(shortNpub(npubStr))
  const date = $derived(new Date(event.created_at * 1000))
  const timeStr = $derived(
    date.toLocaleString(i18n.lang === 'ja' ? 'ja-JP' : 'en-US', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  )
</script>

<article
  class="flex gap-3 px-4 py-3 border-b {themeStore.borderClass} {themeStore.hoverClass} transition-colors"
>
  <div class="flex-shrink-0">
    <div class="w-10 h-10 rounded-full overflow-hidden">
      <EggAvatar pubkey={event.pubkey} size={40} />
    </div>
  </div>
  <div class="flex-1 min-w-0">
    <div class="flex items-center gap-2 mb-1">
      <span class="font-bold text-sm {themeStore.textClass} truncate">{displayName}</span>
      <span class="{themeStore.subtextClass} text-sm flex-shrink-0">· {timeStr}</span>
    </div>
    <p class="{themeStore.textClass} text-sm leading-relaxed whitespace-pre-wrap break-words">
      {event.content}
    </p>
    <div class="mt-1">
      <span class="text-sky-500 text-sm">#{HASHTAG}</span>
    </div>
  </div>
</article>
