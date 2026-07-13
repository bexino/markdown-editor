<script setup lang="ts">
import type { User } from '@supabase/supabase-js'

import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getCurrentUser, logout } from '@/shared/lib/auth'
import { guestAuth } from '@/shared/lib/guestAuth'
import { getUserDisplayName, getUserInitials } from '@/features/profile/lib/userProfile'
import { theme, toggleTheme } from '@/shared/services/theme'

const router = useRouter()

const isOpen = ref(false)
const isLoading = ref(false)
const user = ref<User | null>(null)
const menuRoot = ref<HTMLElement | null>(null)

const isGuest = computed(() => guestAuth.isGuest())

const userName = computed(() => {
  if (isGuest.value) {
    return 'Guest'
  }

  return getUserDisplayName(user.value)
})

const initials = computed(() => {
  if (isGuest.value) {
    return 'G'
  }

  return getUserInitials(user.value)
})

const themeLabel = computed(() => {
  return theme.value === 'dark' ? 'Light Mode' : 'Dark Mode'
})

async function loadUser(): Promise<void> {
  user.value = await getCurrentUser()
}

function handleDocumentClick(event: MouseEvent): void {
  if (!menuRoot.value) {
    return
  }

  if (!menuRoot.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

async function navigateTo(path: string): Promise<void> {
  isOpen.value = false
  await router.push(path)
}

async function handleLogout(): Promise<void> {
  isLoading.value = true
  isOpen.value = false

  await logout()
  isLoading.value = false
  await router.push('/')
}

function handleThemeToggle(): void {
  toggleTheme()
  isOpen.value = false
}

onMounted(() => {
  void loadUser()
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<template>
  <div v-if="user" ref="menuRoot" class="relative">
    <button
      type="button"
      class="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md px-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
      :aria-expanded="isOpen"
      aria-haspopup="menu"
      @click="isOpen = !isOpen"
    >
      <span
        class="flex size-8 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground"
      >
        {{ initials }}
      </span>
      <span class="hidden sm:inline">{{ userName }}</span>
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
      role="menu"
    >
      <div class="px-2 py-2.5">
        <div class="flex flex-col gap-1">
          <p class="font-medium">{{ userName }}</p>
          <p v-if="!isGuest" class="text-xs text-muted-foreground">{{ user?.email }}</p>
          <p v-else class="text-xs text-muted-foreground">Data saved locally</p>
        </div>
      </div>

      <div class="my-1 h-px bg-border"></div>

      <button
        type="button"
        class="flex w-full cursor-pointer items-center rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
        role="menuitem"
        @click="navigateTo('/documents')"
      >
        <svg
          class="mr-2 size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
          <path d="M10 9H8" />
        </svg>
        My Documents
      </button>

      <button
        v-if="!isGuest"
        type="button"
        class="flex w-full cursor-pointer items-center rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
        role="menuitem"
        @click="navigateTo('/profile')"
      >
        <svg
          class="mr-2 size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M6 20a6 6 0 0 1 12 0" />
        </svg>
        Account Settings
      </button>

      <button
        type="button"
        class="flex w-full cursor-pointer items-center rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
        role="menuitem"
        @click="handleThemeToggle"
      >
        <svg
          v-if="theme === 'dark'"
          class="mr-2 size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
        <svg
          v-else
          class="mr-2 size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3a6 6 0 1 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
        {{ themeLabel }}
      </button>

      <div class="my-1 h-px bg-border"></div>

      <button
        type="button"
        class="flex w-full cursor-pointer items-center rounded-md px-2 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="isLoading"
        role="menuitem"
        @click="handleLogout"
      >
        <svg
          class="mr-2 size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m9 21-5-5 5-5" />
          <path d="M4 16h12" />
          <path d="M20 3v18" />
        </svg>
        {{ isLoading ? 'Logging Out...' : isGuest ? 'Exit Guest Mode' : 'Log Out' }}
      </button>
    </div>
  </div>
</template>
