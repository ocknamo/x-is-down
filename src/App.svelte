<script lang="ts">
  import { onDestroy } from 'svelte'
  import type { Event } from 'nostr-tools'
  import { subscribeToTag, fetchRecentPosts } from './lib/nostr'
  import { addUniqueEvent } from './lib/utils'
  import PostForm from './lib/PostForm.svelte'
  import Timeline from './lib/Timeline.svelte'

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
      const since = posts.length > 0
        ? Math.max(...posts.map(p => p.created_at))
        : Math.floor(Date.now() / 1000) - 60
      fetchRecentPosts(since, handleEvent)
        .catch((e: unknown) =>
          console.error('[refresh] fetchRecentPosts failed:', e)
        )
    }, 60_000)
  })

  onDestroy(() => {
    unsubscribe()
    clearInterval(refreshInterval)
  })
</script>

<div class="min-h-screen bg-black text-white">
  <!-- Header -->
  <header class="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-zinc-800">
    <div class="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
      <div class="w-8 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" class="w-6 h-6 fill-white" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </div>
      <div>
        <h1 class="font-bold text-white leading-none">X落ちてる速報</h1>
        <p class="text-zinc-500 text-xs">X障害時の緊急掲示板 on Nostr</p>
      </div>
    </div>
  </header>

  <!-- Main -->
  <main class="max-w-xl mx-auto">
    <!-- Post Form -->
    <PostForm onPosted={handleEvent} />

    <!-- Timeline -->
    <Timeline {posts} {loading} />
  </main>
</div>
