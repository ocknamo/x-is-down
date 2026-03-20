// 'x'      : 現在のX風（黒背景）
// 'twitter': 昔のTwitter風（白背景・青アクセント）
export type Theme = 'x' | 'twitter'

class ThemeStore {
  current = $state<Theme>('x')

  set(t: Theme) {
    this.current = t
  }

  get bgClass(): string {
    return this.current === 'twitter' ? 'bg-white' : 'bg-black'
  }

  get textClass(): string {
    return this.current === 'twitter' ? 'text-gray-900' : 'text-white'
  }

  get borderClass(): string {
    return this.current === 'twitter' ? 'border-blue-100' : 'border-zinc-800'
  }

  get headerBgClass(): string {
    return this.current === 'twitter' ? 'bg-white/90' : 'bg-black/80'
  }

  get hoverClass(): string {
    return this.current === 'twitter' ? 'hover:bg-blue-50' : 'hover:bg-zinc-950'
  }

  get subtextClass(): string {
    return this.current === 'twitter' ? 'text-gray-500' : 'text-zinc-400'
  }
}

export const themeStore = new ThemeStore()
