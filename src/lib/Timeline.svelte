<script lang="ts">
  import type { Event } from 'nostr-tools'
  import Post from './Post.svelte'
  import type { UserProfile } from './nostr'
  import { t } from './i18n'
  import NostrPromo from './NostrPromo.svelte'

  interface Props {
    posts: Event[]
    loading: boolean
    profiles: Map<string, UserProfile>
  }

  const { posts, loading, profiles }: Props = $props()
</script>

<section>
  <div class="px-4 py-3 border-b border-zinc-800 flex items-end justify-between">
    <div>
      <h2 class="font-bold text-white">{t.timelineTitle}</h2>
      <p class="text-zinc-500 text-sm">{t.timelineSubtitle}</p>
    </div>
    <NostrPromo />
  </div>

  {#if loading}
    <div class="flex justify-center py-8">
      <div class="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  {:else if posts.length === 0}
    <div class="px-4 py-8 text-center text-zinc-500">
      <p>{t.noPosts}</p>
      <p class="text-sm mt-1">{t.noPostsCallToAction}</p>
    </div>
  {:else}
    {#each posts as event (event.id)}
      <Post {event} profile={profiles.get(event.pubkey)} />
    {/each}
  {/if}
</section>
