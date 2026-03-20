<script lang="ts">
  import { onDestroy } from 'svelte'
  import type { Event } from 'nostr-tools'
  import { subscribeToTag, fetchRecentPosts } from './lib/nostr'
  import { addUniqueEvent } from './lib/utils'
  import PostForm from './lib/PostForm.svelte'
  import Timeline from './lib/Timeline.svelte'
  import { themeStore } from './lib/theme.svelte'
  import { i18n } from './lib/i18n.svelte'
  import type { Theme } from './lib/theme.svelte'

  let posts = $state<Event[]>([])
  let loading = $state(true)

  function handleEvent(event: Event) {
    posts = addUniqueEvent(posts, event)
  }

  let refreshInterval: ReturnType<typeof setInterval> | undefined

  const { unsubscribe } = subscribeToTag(handleEvent, () => {
    loading = false
    refreshInterval = setInterval(() => {
      console.log('[refresh] fetching recent posts')
      const since =
        posts.length > 0
          ? Math.max(...posts.map((p) => p.created_at))
          : Math.floor(Date.now() / 1000) - 60
      fetchRecentPosts(since, handleEvent).catch((e: unknown) =>
        console.error('[refresh] fetchRecentPosts failed:', e),
      )
    }, 60_000)
  })

  onDestroy(() => {
    unsubscribe()
    clearInterval(refreshInterval)
  })

  const themes: Theme[] = ['x', 'twitter']

  function themeButtonClass(t: Theme): string {
    const active = themeStore.current === t
    if (active) return 'px-3 py-1 rounded-full text-xs font-bold bg-sky-500 text-white'
    return `px-3 py-1 rounded-full text-xs border ${themeStore.borderClass} ${themeStore.subtextClass} hover:border-sky-500 hover:text-sky-500 transition-colors`
  }
</script>

<div class="min-h-screen {themeStore.bgClass} {themeStore.textClass}">
  <!-- Header -->
  <header
    class="sticky top-0 z-10 {themeStore.headerBgClass} backdrop-blur-md border-b {themeStore.borderClass}"
  >
    <div class="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
      <div class="w-8 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" class="w-6 h-6 fill-current" aria-hidden="true">
          <path
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          />
        </svg>
      </div>
      <div class="flex-1">
        <h1 class="font-bold leading-none">{i18n.t.title}</h1>
        <p class="{themeStore.subtextClass} text-xs">{i18n.t.subtitle}</p>
      </div>
      <!-- Theme toggle: X / Twitter -->
      <div class="flex items-center gap-1">
        {#each themes as t (t)}
          <button onclick={() => themeStore.set(t)} class={themeButtonClass(t)}>
            {t === 'x' ? i18n.t.themeX : i18n.t.themeTwitter}
          </button>
        {/each}
      </div>
    </div>
  </header>

  <!-- Main -->
  <main class="max-w-xl mx-auto">
    <PostForm onPosted={handleEvent} />
    <Timeline {posts} {loading} />
  </main>
</div>
