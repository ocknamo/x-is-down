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
  }

  const { posts, loading, profiles }: Props = $props()

  const t = $derived(getTranslations(theme()))
</script>

<section>
  <div class="px-4 py-3 border-b border-theme flex items-end justify-between">
    <div>
      <h2 class="font-bold text-theme">{t.timelineTitle}</h2>
      <p class="text-theme-muted text-sm">{t.timelineSubtitle}</p>
    </div>
    <NostrPromo />
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
      <Post {event} profile={profiles.get(event.pubkey)} />
    {/each}
  {/if}
</section>
