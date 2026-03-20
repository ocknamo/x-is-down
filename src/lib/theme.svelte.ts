export type Theme = 'dark' | 'dim' | 'light'

class ThemeStore {
  current = $state<Theme>('dark')

  set(t: Theme) {
    this.current = t
  }

  get bgClass(): string {
    if (this.current === 'light') return 'bg-white'
    if (this.current === 'dim') return 'bg-zinc-800'
    return 'bg-black'
  }

  get textClass(): string {
    return this.current === 'light' ? 'text-zinc-900' : 'text-white'
  }

  get borderClass(): string {
    if (this.current === 'light') return 'border-zinc-200'
    if (this.current === 'dim') return 'border-zinc-600'
    return 'border-zinc-800'
  }

  get headerBgClass(): string {
    if (this.current === 'light') return 'bg-white/80'
    if (this.current === 'dim') return 'bg-zinc-800/80'
    return 'bg-black/80'
  }

  get hoverClass(): string {
    if (this.current === 'light') return 'hover:bg-zinc-50'
    if (this.current === 'dim') return 'hover:bg-zinc-700'
    return 'hover:bg-zinc-950'
  }

  get subtextClass(): string {
    return this.current === 'light' ? 'text-zinc-500' : 'text-zinc-400'
  }
}

export const themeStore = new ThemeStore()
