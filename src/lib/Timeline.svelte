<script lang="ts">
  import type { Event } from 'nostr-tools'
  import Post from './Post.svelte'
  import type { UserProfile } from './nostr'
  import { getTranslations } from './i18n'
  import { theme } from './theme.svelte'
  import NostrPromo from './NostrPromo.svelte'

  interface Props {
    posts: Event[]
    loading: boolean
    profiles: Map<string, UserProfile>
    earthquakePostIds: Set<string>
    showEarthquake: boolean
    onToggleEarthquake: () => void
  }

  const { posts, loading, profiles, earthquakePostIds, showEarthquake, onToggleEarthquake }: Props = $props()

  const t = $derived(getTranslations(theme()))
</script>

<section>
  <div class="px-4 py-3 border-b border-theme flex items-center gap-2">
    <div class="flex-1 min-w-0">
      <h2 class="font-bold text-theme">{t.timelineTitle}</h2>
      <p class="text-theme-muted text-sm">{t.timelineSubtitle}</p>
    </div>
    <div class="flex flex-col items-end gap-1 flex-shrink-0">
      <button
        onclick={onToggleEarthquake}
        role="switch"
        aria-checked={showEarthquake}
        class="flex items-center gap-1.5 text-xs transition-opacity"
        class:opacity-40={!showEarthquake}
        title={showEarthquake ? '地震速報を非表示' : '地震速報を表示'}
      >
        <svg viewBox="0 0 24 24" class="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="2,12 5,12 7,5 9,19 11,8 13,16 15,12 22,12"/>
        </svg>
        <span class="text-theme-muted">地震速報</span>
        <span class="relative inline-flex w-8 h-4 rounded-full transition-colors flex-shrink-0 {showEarthquake ? 'bg-orange-500' : 'bg-gray-400'}">
          <span class="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform {showEarthquake ? 'left-[18px]' : 'left-0.5'}"></span>
        </span>
      </button>
      <NostrPromo />
    </div>
  </div>

  {#if loading}
    <div class="flex justify-center py-8">
      <div class="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin border-theme-accent"></div>
    </div>
  {:else if posts.length === 0}
    <div class="px-4 py-8 text-center text-theme-muted">
      <p>{t.noPosts}</p>
      <p class="text-sm mt-1">{t.noPostsCallToAction}</p>
    </div>
  {:else}
    {#each posts as event (event.id)}
      <Post {event} profile={profiles.get(event.pubkey)} isEarthquake={earthquakePostIds.has(event.id)} />
    {/each}
  {/if}
</section>
