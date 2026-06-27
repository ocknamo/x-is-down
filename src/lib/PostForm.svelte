<script lang="ts">
  import { onMount } from 'svelte'
  import { nip19 } from 'nostr-tools'
  import type { Event } from 'nostr-tools'
  import {
    publishPost,
    npub,
    publicKey,
    shortNpub,
    isNip07Available,
    getNip07PublicKey,
    loginWithNosskey,
    logoutNosskey,
    nosskeyThemeFor,
    isNosskeyNoKeyError,
    type LoginMethod,
  } from './nostr'
  import EggAvatar from './EggAvatar.svelte'
  import LoginDialog from './LoginDialog.svelte'
  import { getTranslations } from './i18n'
  import { theme } from './theme.svelte'

  interface Props {
    onPosted: (event: Event) => void
  }

  const { onPosted }: Props = $props()

  const t = $derived(getTranslations(theme()))

  let postText = $state(getTranslations(theme()).defaultPostText)
  let isPosting = $state(false)
  let error = $state('')
  let nip07Available = $state(false)
  let loginMethod = $state<LoginMethod | null>(null)
  let loginPubkey = $state<string | null>(null)
  let loggingIn = $state(false)
  let loginDialog = $state<{ close: () => void }>()

  const activePubkey = $derived(loginPubkey ?? publicKey)
  const activeNpub = $derived(loginPubkey ? nip19.npubEncode(loginPubkey) : npub)
  const displayName = $derived(shortNpub(activeNpub))
  const loggedInLabel = $derived(
    loginMethod === 'nosskey' ? t.loggedInWithNosskey : t.loggedInWithNip07,
  )

  onMount(() => {
    setTimeout(() => {
      if (isNip07Available()) {
        nip07Available = true
      } else {
        setTimeout(() => {
          nip07Available = isNip07Available()
        }, 5000)
      }
    }, 1000)
  })

  async function selectNip07() {
    error = ''
    loggingIn = true
    try {
      loginPubkey = await getNip07PublicKey()
      loginMethod = 'nip07'
      loginDialog?.close()
    } catch (e) {
      console.error('[NIP-07] login failed:', e)
    } finally {
      loggingIn = false
    }
  }

  async function selectNosskey() {
    error = ''
    loggingIn = true
    try {
      loginPubkey = await loginWithNosskey(nosskeyThemeFor(theme()))
      loginMethod = 'nosskey'
      loginDialog?.close()
    } catch (e) {
      console.error('[nosskey] login failed:', e)
      error = isNosskeyNoKeyError(e) ? t.nosskeyNoKey : t.nosskeyLoginError
      loginDialog?.close()
    } finally {
      loggingIn = false
    }
  }

  function logout() {
    if (loginMethod === 'nosskey') logoutNosskey()
    loginMethod = null
    loginPubkey = null
  }

  async function handleSubmit() {
    if (!postText.trim() || isPosting) return
    isPosting = true
    error = ''
    try {
      const auth =
        loginMethod && loginPubkey
          ? { method: loginMethod, pubkey: loginPubkey }
          : undefined
      const event = await publishPost(postText, auth)
      onPosted(event)
      postText = t.defaultPostText
    } catch (e) {
      error = t.postError
      console.error(e)
    } finally {
      isPosting = false
    }
  }
</script>

<div class="px-4 py-3 border-b border-theme">
  {#if !loginMethod}
    <div class="mb-3 flex justify-end">
      <LoginDialog
        bind:this={loginDialog}
        {nip07Available}
        busy={loggingIn}
        onSelectNip07={selectNip07}
        onSelectNosskey={selectNosskey}
      />
    </div>
  {:else}
    <div class="mb-3 flex justify-end items-center gap-2">
      <span class="text-xs text-theme-muted">{loggedInLabel}</span>
      <button
        onclick={logout}
        class="text-xs text-theme-muted hover:opacity-70 transition-opacity"
      >
        {t.logout}
      </button>
    </div>
  {/if}
  <div class="flex gap-3">
    <div class="flex-shrink-0">
      <div class="w-10 h-10 rounded-full overflow-hidden">
        <EggAvatar pubkey={activePubkey} size={40} />
      </div>
    </div>
    <div class="flex-1">
      <div class="text-theme-muted text-xs mb-2">{displayName}</div>
      <textarea
        bind:value={postText}
        rows="3"
        placeholder={t.postPlaceholder}
        class="w-full bg-transparent text-theme text-xl resize-none outline-none leading-relaxed placeholder-[color:var(--text-faint)]"
      ></textarea>
      {#if error}
        <p class="text-red-500 text-sm mt-1">{error}</p>
      {/if}
      <div class="flex justify-end mt-3">
        <button
          onclick={handleSubmit}
          disabled={isPosting || !postText.trim()}
          class="disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-2 rounded-full transition-colors text-sm"
          style="background-color: var(--accent);"
          onmouseenter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)' }}
          onmouseleave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--accent)' }}
        >
          {isPosting ? t.posting : t.post}
        </button>
      </div>
    </div>
  </div>
</div>
