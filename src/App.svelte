<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import type { Event } from 'nostr-tools'
  import { subscribeToTag, fetchRecentPosts, fetchUserProfiles, type UserProfile } from './lib/nostr'
  import { addUniqueEvent } from './lib/utils'
  import PostForm from './lib/PostForm.svelte'
  import Timeline from './lib/Timeline.svelte'
  import NostrPromo from './lib/NostrPromo.svelte'
  import { theme, toggleTheme, initTheme } from './lib/theme.svelte'

  let posts = $state<Event[]>([])
  let loading = $state(true)
  let profiles = $state<Map<string, UserProfile>>(new Map())
  const fetchedPubkeys = new Set<string>()

  onMount(() => {
    initTheme()
  })

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

<div class="min-h-screen bg-theme text-theme">
  <!-- Header -->
  <header class="sticky top-0 z-10 border-b border-theme" style="background-color: var(--bg-overlay); backdrop-filter: blur(12px);">
    <div class="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
      <div class="w-8 h-8 flex items-center justify-center flex-shrink-0">
        {#if theme() === 'twitter'}
          <!-- Original bird logo -->
          <svg viewBox="0 0 24 24" class="w-6 h-6" aria-hidden="true" style="fill: var(--logo);">
            <path fill-rule="evenodd" d="M19 9.5 L18 8 C17 6 15 5 13 5 C10 5 7.5 7.5 7.5 10.5 C7.5 13.5 9.5 16 12.5 16.5 L10.5 19 L12.5 18.5 L13 20.5 L14.5 18 L16 19 L14.5 16.5 C17 15.5 19 13 19 10.5 Z M16.5 8.5 C17.1 8.5 17.5 9 17.5 9.5 C17.5 10 17.1 10.5 16.5 10.5 C15.9 10.5 15.5 10 15.5 9.5 C15.5 9 15.9 8.5 16.5 8.5 Z"/>
          </svg>
        {:else}
          <!-- X logo -->
          <svg viewBox="0 0 24 24" class="w-6 h-6" aria-hidden="true" style="fill: var(--logo);">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        {/if}
      </div>
      <div class="flex-1">
        <h1 class="font-bold text-theme leading-none">
          {theme() === 'twitter' ? (navigator.language.startsWith('ja') ? 'Twitter落ちてる？' : 'Twitter is Down') : (navigator.language.startsWith('ja') ? 'X落ちてる？' : 'X is Down')}
        </h1>
        <p class="text-theme-muted text-xs">
          {theme() === 'twitter' ? (navigator.language.startsWith('ja') ? 'Twitter障害時の緊急掲示板 on Nostr' : 'Emergency bulletin board on Nostr') : (navigator.language.startsWith('ja') ? 'X障害時の緊急掲示板 on Nostr' : 'Emergency bulletin board on Nostr')}
        </p>
      </div>
      <button
        onclick={toggleTheme}
        class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors text-theme-muted hover:text-theme-accent"
        title={theme() === 'x' ? 'Twitterテーマに切り替え' : 'Xテーマに切り替え'}
        aria-label={theme() === 'x' ? 'Switch to Twitter theme' : 'Switch to X theme'}
      >
        {#if theme() === 'x'}
          <!-- Show original bird icon (switch to Twitter) -->
          <svg viewBox="0 0 24 24" class="w-5 h-5" aria-hidden="true" fill="currentColor">
            <path fill-rule="evenodd" d="M19 9.5 L18 8 C17 6 15 5 13 5 C10 5 7.5 7.5 7.5 10.5 C7.5 13.5 9.5 16 12.5 16.5 L10.5 19 L12.5 18.5 L13 20.5 L14.5 18 L16 19 L14.5 16.5 C17 15.5 19 13 19 10.5 Z M16.5 8.5 C17.1 8.5 17.5 9 17.5 9.5 C17.5 10 17.1 10.5 16.5 10.5 C15.9 10.5 15.5 10 15.5 9.5 C15.5 9 15.9 8.5 16.5 8.5 Z"/>
          </svg>
        {:else}
          <!-- Show X icon (switch to X) -->
          <svg viewBox="0 0 24 24" class="w-5 h-5" aria-hidden="true" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        {/if}
      </button>
    </div>
  </header>

  <!-- Main -->
  <main class="max-w-xl mx-auto">
    <!-- Post Form -->
    <PostForm onPosted={handleEvent} />

    <!-- Timeline -->
    <Timeline {posts} {loading} {profiles} />
  </main>

  <footer class="max-w-xl mx-auto px-4 py-4 flex justify-center border-t border-theme-subtle mt-2">
    <NostrPromo />
  </footer>
</div>
