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
  <div class="px-4 py-3 border-b border-theme" style="display: grid; grid-template-columns: 1fr auto; grid-template-rows: auto auto; column-gap: 8px;">
    <h2 class="font-bold text-theme" style="grid-column: 1; grid-row: 1;">{t.timelineTitle}</h2>
    <div style="grid-column: 2; grid-row: 1; display: flex; align-items: flex-start; justify-content: flex-end;">
      <button
        onclick={onToggleEarthquake}
        role="switch"
        aria-checked={showEarthquake}
        class="transition-opacity"
        style="display: inline-flex; flex-direction: row; align-items: center; gap: 4px; font-size: 10px; white-space: nowrap;"
        class:opacity-40={!showEarthquake}
        title={showEarthquake ? '地震速報を非表示' : '地震速報を表示'}
      >
        <svg viewBox="0 0 24 24" style="width: 12px; height: 12px; flex-shrink: 0;" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-orange-500">
          <polyline points="2,12 5,12 7,5 9,19 11,8 13,16 15,12 22,12"/>
        </svg>
        <span class="text-theme-muted">地震速報</span>
        <span style="position: relative; display: inline-flex; width: 26px; height: 14px; border-radius: 9999px; flex-shrink: 0;" class="transition-colors {showEarthquake ? 'bg-orange-500' : 'bg-gray-400'}">
          <span style="position: absolute; top: 2px; width: 10px; height: 10px; border-radius: 9999px; background: white; transition: left 0.15s;" style:left={showEarthquake ? '14px' : '2px'}></span>
        </span>
      </button>
    </div>
    <p class="text-theme-muted text-sm" style="grid-column: 1; grid-row: 2;">{t.timelineSubtitle}</p>
    <div style="grid-column: 2; grid-row: 2; display: flex; align-items: flex-end; justify-content: flex-end;">
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
