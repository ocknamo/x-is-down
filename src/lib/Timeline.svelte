<script lang="ts">
  import type { Event } from 'nostr-tools'
  import Post from './Post.svelte'

  interface Props {
    posts: Event[]
    loading: boolean
  }

  const { posts, loading }: Props = $props()
</script>

<section>
  <div class="px-4 py-3 border-b border-zinc-800">
    <h2 class="font-bold text-white">みんなの「X落ちてる」</h2>
    <p class="text-zinc-500 text-sm">#xisdown タグの投稿</p>
  </div>

  {#if loading}
    <div class="flex justify-center py-8">
      <div class="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  {:else if posts.length === 0}
    <div class="px-4 py-8 text-center text-zinc-500">
      <p>まだ投稿がありません</p>
      <p class="text-sm mt-1">最初に「X落ちてる」と投稿しよう！</p>
    </div>
  {:else}
    {#each posts as event (event.id)}
      <Post {event} />
    {/each}
  {/if}
</section>
