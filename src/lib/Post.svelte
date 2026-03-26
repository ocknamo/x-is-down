<script lang="ts">
  import type { Event } from 'nostr-tools'
  import { nip19 } from 'nostr-tools'
  import { shortNpub, HASHTAG, type UserProfile } from './nostr'
  import EggAvatar from './EggAvatar.svelte'

  interface Props {
    event: Event
    profile?: UserProfile
    isEarthquake?: boolean
  }

  const { event, profile, isEarthquake = false }: Props = $props()

  const npubStr = $derived(nip19.npubEncode(event.pubkey))
  const displayName = $derived(profile?.display_name ?? profile?.name ?? shortNpub(npubStr))
  const date = $derived(new Date(event.created_at * 1000))
  const timeStr = $derived(date.toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }))

  const URL_REGEX = /https?:\/\/[^\s<>"]+/g

  function linkify(text: string): string {
    // HTMLエスケープしてからURLをリンクに置換（XSS対策）
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
    return escaped.replace(URL_REGEX, (url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-theme-accent underline break-all hover:opacity-80">${url}</a>`
    )
  }

  const linkedContent = $derived(linkify(event.content))
</script>

<article class="flex gap-3 px-4 py-3 border-b border-theme hover:bg-theme-hover transition-colors">
  <div class="flex-shrink-0">
    <div class="w-10 h-10 rounded-full overflow-hidden">
      {#if profile?.picture}
        <img src={profile.picture} alt={displayName} class="w-10 h-10 rounded-full object-cover" />
      {:else}
        <EggAvatar pubkey={event.pubkey} size={40} />
      {/if}
    </div>
  </div>
  <div class="flex-1 min-w-0">
    <div class="flex items-center gap-2 mb-1">
      <span class="font-bold text-sm text-theme truncate">{displayName}</span>
      <span class="text-theme-muted text-sm flex-shrink-0">· {timeStr}</span>
    </div>
    <p class="text-theme text-sm leading-relaxed whitespace-pre-wrap break-words">{@html linkedContent}</p>
    <div class="mt-1">
      {#if isEarthquake}
        <span class="text-orange-500 text-xs font-bold">⚠ 地震速報</span>
      {:else}
        <span class="text-theme-accent text-sm">#{HASHTAG}</span>
      {/if}
    </div>
  </div>
</article>
