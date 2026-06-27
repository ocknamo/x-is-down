<script lang="ts">
  import { getTranslations } from './i18n'
  import { theme } from './theme.svelte'

  interface Props {
    nip07Available: boolean
    busy?: boolean
    onSelectNip07: () => void
    onSelectNosskey: () => void
  }

  const { nip07Available, busy = false, onSelectNip07, onSelectNosskey }: Props =
    $props()

  const t = $derived(getTranslations(theme()))

  let dialog: HTMLDialogElement

  function openDialog() {
    dialog.showModal()
  }

  export function close() {
    dialog.close()
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === dialog) dialog.close()
  }

  function selectNip07() {
    onSelectNip07()
  }

  function selectNosskey() {
    onSelectNosskey()
  }
</script>

<button
  onclick={openDialog}
  class="text-xs text-theme-accent border border-theme-accent px-3 py-1 rounded-full transition-colors hover:opacity-80"
>
  {t.loginWithNostr}
</button>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
<dialog
  bind:this={dialog}
  onclick={handleBackdropClick}
  class="m-auto text-theme rounded-xl border border-theme-dialog p-5 w-80 max-w-[90vw] backdrop:bg-black/60"
  style="background-color: var(--bg-dialog);"
>
  <div class="flex items-center justify-between mb-4">
    <h2 class="font-bold text-sm text-theme">{t.loginDialogTitle}</h2>
    <button
      onclick={close}
      class="text-theme-muted hover:text-theme transition-colors text-lg leading-none"
      aria-label={t.close}
    >
      ✕
    </button>
  </div>

  <div class="flex flex-col gap-3">
    {#if nip07Available}
      <button
        onclick={selectNip07}
        disabled={busy}
        class="text-left rounded-lg border border-theme-dialog px-4 py-3 transition-colors hover:bg-theme-hover disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div class="font-bold text-sm text-theme">{t.loginWithNip07}</div>
        <div class="text-xs text-theme-muted mt-0.5">{t.loginWithNip07Desc}</div>
      </button>
    {/if}

    <button
      onclick={selectNosskey}
      disabled={busy}
      class="text-left rounded-lg border border-theme-dialog px-4 py-3 transition-colors hover:bg-theme-hover disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div class="font-bold text-sm text-theme">{t.loginWithNosskey}</div>
      <div class="text-xs text-theme-muted mt-0.5">{t.loginWithNosskeyDesc}</div>
    </button>

    {#if busy}
      <p class="text-xs text-theme-muted text-center">{t.nosskeyConnecting}</p>
    {/if}
  </div>
</dialog>
