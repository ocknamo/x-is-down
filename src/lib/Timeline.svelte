<script lang="ts">
  import type { Event } from 'nostr-tools'
  import Post from './Post.svelte'
  import { themeStore } from './theme.svelte'
  import { i18n } from './i18n.svelte'
  import { HASHTAG } from './nostr'

  interface Props {
    posts: Event[]
    loading: boolean
  }

  const { posts, loading }: Props = $props()

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

  const nostrLinks = isMobile
    ? [
        {
          name: 'Amethyst',
          url: 'https://play.google.com/store/apps/details?id=com.vitorpamplona.amethyst',
        },
        { name: 'Damus', url: 'https://apps.apple.com/app/damus/id1628663131' },
      ]
    : [
        { name: 'Primal', url: `https://primal.net/t/${HASHTAG}` },
        { name: 'Nostter', url: `https://nostter.app/search?q=%23${HASHTAG}` },
      ]
</script>

<section>
  <div class="px-4 py-3 border-b {themeStore.borderClass}">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="font-bold {themeStore.textClass}">{i18n.t.timelineTitle}</h2>
        <p class="{themeStore.subtextClass} text-sm">{i18n.t.timelineSubtitle}</p>
      </div>
      <!-- Nostr links -->
      <div class="flex flex-col items-end gap-1">
        <span class="text-xs {themeStore.subtextClass}">{i18n.t.nostrLinksTitle}</span>
        <div class="flex gap-2">
          {#each nostrLinks as link (link.name)}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs text-sky-500 hover:text-sky-400 transition-colors"
            >
              {link.name}
            </a>
          {/each}
        </div>
      </div>
    </div>
  </div>

  {#if loading}
    <div class="flex justify-center py-8">
      <div class="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin">
      </div>
    </div>
  {:else if posts.length === 0}
    <div class="px-4 py-8 text-center {themeStore.subtextClass}">
      <p>{i18n.t.noPostsYet}</p>
      <p class="text-sm mt-1">{i18n.t.beFirst}</p>
    </div>
  {:else}
    {#each posts as event (event.id)}
      <Post {event} />
    {/each}
  {/if}
</section>
