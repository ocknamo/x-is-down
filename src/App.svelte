<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import type { Event } from 'nostr-tools'
  import { subscribeToTag, fetchRecentPosts, fetchUserProfiles, subscribeToEarthquakeAccounts, EARTHQUAKE_PUBKEYS, type UserProfile } from './lib/nostr'
  import { addUniqueEvent } from './lib/utils'
  import PostForm from './lib/PostForm.svelte'
  import Timeline from './lib/Timeline.svelte'
  import NostrPromo from './lib/NostrPromo.svelte'
  import { theme, toggleTheme, initTheme } from './lib/theme.svelte'

  let posts = $state<Event[]>([])
  let loading = $state(true)
  let profiles = $state<Map<string, UserProfile>>(new Map())
  const fetchedPubkeys = new Set<string>()

  const earthquakePostIds = new Set<string>()
  const EQ_TOGGLE_KEY = 'x-is-down:showEarthquake'
  let showEarthquake = $state(localStorage.getItem(EQ_TOGGLE_KEY) !== 'false')
  function toggleEarthquake() {
    showEarthquake = !showEarthquake
    localStorage.setItem(EQ_TOGGLE_KEY, String(showEarthquake))
  }
  const visiblePosts = $derived(
    showEarthquake
      ? posts
      : posts.filter((p) => !earthquakePostIds.has(p.id))
  )

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

  function handleEarthquakeEvent(event: Event) {
    earthquakePostIds.add(event.id)
    handleEvent(event)
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

  const { unsubscribe: unsubscribeEq } = subscribeToEarthquakeAccounts(
    handleEarthquakeEvent,
    () => {
      loadProfiles(EARTHQUAKE_PUBKEYS).catch((e: unknown) =>
        console.error('[profiles] earthquake fetchUserProfiles failed:', e),
      )
    },
  )

  onDestroy(() => {
    unsubscribe()
    unsubscribeEq()
    clearInterval(refreshInterval)
  })
</script>

<div class="min-h-screen bg-theme text-theme">
  <!-- Header -->
  <header class="sticky top-0 z-10 border-b border-theme" style="background-color: var(--bg-overlay); backdrop-filter: blur(12px);">
    <div class="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
      <div class="w-8 h-8 flex items-center justify-center flex-shrink-0">
        {#if theme() === 'twitter'}
          <!-- Bird logo (mirrored + rotated + reshaped) -->
          <svg viewBox="-1 -1 26 26" class="w-6 h-6" aria-hidden="true" style="fill: var(--logo);">
            <g transform="translate(12,12) rotate(-20) scale(-1, 0.82) translate(-12,-12)">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </g>
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
          <!-- Bird icon (mirrored + rotated + reshaped) -->
          <svg viewBox="-1 -1 26 26" class="w-5 h-5" aria-hidden="true" fill="currentColor">
            <g transform="translate(12,12) rotate(-20) scale(-1, 0.82) translate(-12,-12)">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </g>
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
    <Timeline posts={visiblePosts} {loading} {profiles} {earthquakePostIds} {showEarthquake} onToggleEarthquake={toggleEarthquake} />
  </main>

  <footer class="max-w-xl mx-auto px-4 py-4 flex justify-center border-t border-theme-subtle mt-2">
    <NostrPromo />
  </footer>
</div>
