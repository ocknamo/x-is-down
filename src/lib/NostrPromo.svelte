<script lang="ts">
  import { t } from './i18n'

  let dialog: HTMLDialogElement

  const clients = [
    {
      platform: 'Web',
      items: [
        { name: 'Primal', url: 'https://primal.net/search/%23xisdown' },
        { name: 'Nostter', url: 'https://nostter.app/search?q=%23xisdown' },
        { name: 'snort', url: 'https://snort.social/search/%23xisdown' },
      ],
    },
    {
      platform: 'iOS',
      items: [
        { name: 'Damus', url: 'https://damus.io' },
        { name: 'Primal', url: 'https://primal.net' },
      ],
    },
    {
      platform: 'Android',
      items: [
        { name: 'Amethyst', url: 'https://amethyst.social' },
        { name: 'Primal', url: 'https://primal.net' },
      ],
    },
  ]

  function openDialog() {
    dialog.showModal()
  }

  function closeDialog() {
    dialog.close()
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === dialog) closeDialog()
  }
</script>

<button
  onclick={openDialog}
  class="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
>
  {t.openInClient} ↗
</button>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialog}
  onclick={handleBackdropClick}
  class="m-auto bg-zinc-900 text-white rounded-xl border border-zinc-700 p-5 w-80 max-w-[90vw] backdrop:bg-black/60"
>
  <div class="flex items-center justify-between mb-4">
    <h2 class="font-bold text-sm">{t.openInClient}</h2>
    <button
      onclick={closeDialog}
      class="text-zinc-500 hover:text-zinc-300 transition-colors text-lg leading-none"
      aria-label={t.close}
    >
      ✕
    </button>
  </div>

  {#each clients as group}
    <div class="mb-3">
      <p class="text-zinc-500 text-xs mb-1">{group.platform}</p>
      <div class="flex flex-wrap gap-2">
        {#each group.items as client}
          <a
            href={client.url}
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-sky-400 hover:text-sky-300 transition-colors"
          >
            {client.name} ↗
          </a>
        {/each}
      </div>
    </div>
  {/each}
</dialog>
