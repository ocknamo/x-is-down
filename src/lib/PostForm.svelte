<script lang="ts">
  import { publishPost, npub, publicKey, shortNpub } from './nostr'
  import type { Event } from 'nostr-tools'
  import EggAvatar from './EggAvatar.svelte'

  interface Props {
    onPosted: (event: Event) => void
  }

  const { onPosted }: Props = $props()

  let postText = $state('X落ちてる')
  let isPosting = $state(false)
  let error = $state('')

  async function handleSubmit() {
    if (!postText.trim() || isPosting) return
    isPosting = true
    error = ''
    try {
      const event = await publishPost(postText)
      onPosted(event)
      postText = 'X落ちてる'
    } catch (e) {
      error = '投稿に失敗しました。リレーに接続できません。'
      console.error(e)
    } finally {
      isPosting = false
    }
  }

  const displayName = shortNpub(npub)
</script>

<div class="px-4 py-3 border-b border-zinc-800">
  <div class="flex gap-3">
    <div class="flex-shrink-0">
      <div class="w-10 h-10 rounded-full overflow-hidden">
        <EggAvatar pubkey={publicKey} size={40} />
      </div>
    </div>
    <div class="flex-1">
      <div class="text-zinc-500 text-xs mb-2">{displayName}</div>
      <textarea
        bind:value={postText}
        rows="3"
        placeholder="X落ちてる"
        class="w-full bg-transparent text-white text-xl placeholder-zinc-600 resize-none outline-none leading-relaxed"
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
          {isPosting ? '投稿中...' : '投稿する'}
        </button>
      </div>
    </div>
  </div>
</div>
