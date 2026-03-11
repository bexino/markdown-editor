import { ref } from 'vue'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'markdown-editor-theme'

export const theme = ref<ThemeMode>('light')

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

function readStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') {
    return null
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY)
  return isThemeMode(storedTheme) ? storedTheme : null
}

function getPreferredTheme(): ThemeMode {
  const storedTheme = readStoredTheme()

  if (storedTheme) {
    return storedTheme
  }

  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

function syncTheme(nextTheme: ThemeMode): void {
  theme.value = nextTheme

  if (typeof document !== 'undefined') {
    const root = document.documentElement
    root.classList.toggle('dark', nextTheme === 'dark')
    root.style.colorScheme = nextTheme
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, nextTheme)
  }
}

export function initializeTheme(): void {
  syncTheme(getPreferredTheme())
}

export function toggleTheme(): void {
  syncTheme(theme.value === 'dark' ? 'light' : 'dark')
}
