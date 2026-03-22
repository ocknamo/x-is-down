export type Theme = 'x' | 'twitter'

const STORAGE_KEY = 'theme'
const DEFAULT_THEME: Theme = 'x'

function loadTheme(): Theme {
  if (typeof localStorage === 'undefined') return DEFAULT_THEME
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'twitter' ? 'twitter' : 'x'
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

let _theme = $state<Theme>(loadTheme())

export function theme(): Theme {
  return _theme
}

export function toggleTheme() {
  _theme = _theme === 'x' ? 'twitter' : 'x'
  localStorage.setItem(STORAGE_KEY, _theme)
  applyTheme(_theme)
}

export function initTheme() {
  applyTheme(_theme)
}
