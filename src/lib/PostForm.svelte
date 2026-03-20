<script lang="ts">
  import {
    publishPost,
    shortNpub,
    authStore,
    isNip07Available,
    loginWithNip07,
    logout,
  } from './nostr'
  import type { Event } from 'nostr-tools'
  import EggAvatar from './EggAvatar.svelte'
  import { themeStore } from './theme.svelte'
  import { i18n } from './i18n.svelte'

  interface Props {
    onPosted: (event: Event) => void
  }

  const { onPosted }: Props = $props()

  let postText = $state(i18n.t.defaultText)
  let isPosting = $state(false)
  let error = $state('')
  let loginError = $state('')

  $effect(() => {
    postText = i18n.t.defaultText
  })

  async function handleSubmit() {
    if (!postText.trim() || isPosting) return
    isPosting = true
    error = ''
    try {
      const event = await publishPost(postText)
      onPosted(event)
      postText = i18n.t.defaultText
    } catch (e) {
      error = i18n.t.postFailed
      console.error(e)
    } finally {
      isPosting = false
    }
  }

  async function handleLoginWithNip07() {
    loginError = ''
    try {
      await loginWithNip07()
    } catch (e) {
      loginError = i18n.t.noExtension
      console.error(e)
    }
  }

  const displayName = $derived(shortNpub(authStore.currentNpub))
  const currentPubkey = $derived(authStore.currentPubkey)
</script>

<div class="px-4 py-3 border-b {themeStore.borderClass}">
  <!-- NIP-07 login bar -->
  <div class="flex items-center justify-between mb-3">
    {#if authStore.mode === 'nip07'}
      <span class="text-xs text-emerald-500">{i18n.t.loggedIn} (NIP-07)</span>
      <button
        onclick={logout}
        class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline"
      >
        {i18n.t.logout}
      </button>
    {:else if isNip07Available()}
      <button
        onclick={handleLoginWithNip07}
        class="text-xs text-sky-500 hover:text-sky-400 transition-colors underline"
      >
        {i18n.t.loginWithExtension}
      </button>
      {#if loginError}
        <span class="text-xs text-red-500">{loginError}</span>
      {/if}
    {:else}
      <span class="text-xs text-zinc-600">{i18n.t.noExtension}</span>
    {/if}
  </div>

  <div class="flex gap-3">
    <div class="flex-shrink-0">
      <div class="w-10 h-10 rounded-full overflow-hidden">
        <EggAvatar pubkey={currentPubkey} size={40} />
      </div>
    </div>
    <div class="flex-1">
      <div class="{themeStore.subtextClass} text-xs mb-2">{displayName}</div>
      <textarea
        bind:value={postText}
        rows="3"
        placeholder={i18n.t.defaultText}
        class="w-full bg-transparent {themeStore.textClass} text-xl placeholder-zinc-600 resize-none outline-none leading-relaxed"
      ></textarea>
      {#if error}
        <p class="text-red-500 text-sm mt-1">{error}</p>
      {/if}
      <div class="flex justify-end mt-3">
        <button
          onclick={handleSubmit}
          disabled={isPosting || !postText.trim()}
          class="bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-2 rounded-full transition-colors text-sm"
        >
          {isPosting ? i18n.t.posting : i18n.t.post}
        </button>
      </div>
    </div>
  </div>
</div>
