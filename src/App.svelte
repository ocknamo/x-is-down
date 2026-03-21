<script lang="ts">
  import { onDestroy } from 'svelte'
  import type { Event } from 'nostr-tools'
  import { subscribeToTag, fetchRecentPosts, fetchUserProfiles, type UserProfile } from './lib/nostr'
  import { addUniqueEvent } from './lib/utils'
  import PostForm from './lib/PostForm.svelte'
  import Timeline from './lib/Timeline.svelte'
  import NostrPromo from './lib/NostrPromo.svelte'
  import { t } from './lib/i18n'

  let posts = $state<Event[]>([])
  let loading = $state(true)
  let profiles = $state<Map<string, UserProfile>>(new Map())
  const fetchedPubkeys = new Set<string>()

  async function loadProfiles(pubkeys: string[]) {
    const newPubkeys = pubkeys.filter((pk) => !fetchedPubkeys.has(pk))
    if (newPubkeys.length === 0) return
    for (const pk of newPubkeys) fetchedPubkeys.add(pk)

    const result = await fetchUserProfiles(newPubkeys)
    if (result.size > 0) {
      profiles = new Map([...profiles, ...result])
    }
  }

  function handleEvent(event: Event) {
    posts = addUniqueEvent(posts, event)
    if (!fetchedPubkeys.has(event.pubkey)) {
      loadProfiles([event.pubkey]).catch((e: unknown) =>
        console.error('[profiles] fetchUserProfiles failed:', e),
      )
    }
  }

  let refreshInterval: ReturnType<typeof setInterval> | undefined

  const { unsubscribe } = subscribeToTag(handleEvent, () => {
    loading = false
    const pubkeys = [...new Set(posts.map((p) => p.pubkey))]
    loadProfiles(pubkeys).catch((e: unknown) =>
      console.error('[profiles] initial fetchUserProfiles failed:', e),
    )
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
        <h1 class="font-bold text-white leading-none">{t.appTitle}</h1>
        <p class="text-zinc-500 text-xs">{t.appSubtitle}</p>
      </div>
    </div>
  </header>

  <!-- Main -->
  <main class="max-w-xl mx-auto">
    <!-- Post Form -->
    <PostForm onPosted={handleEvent} />

    <!-- Timeline -->
    <Timeline {posts} {loading} {profiles} />
  </main>

  <footer class="max-w-xl mx-auto px-4 py-4 flex justify-center border-t border-zinc-900 mt-2">
    <NostrPromo />
  </footer>
</div>
