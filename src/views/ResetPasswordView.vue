<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import type { Subscription } from '@supabase/supabase-js'

import ResetPasswordCard from '@/components/ResetPasswordCard.vue'
import { getSession, onAuthStateChange } from '@/lib/auth'

type RecoveryState = 'loading' | 'ready' | 'success' | 'error'

const recoveryState = ref<RecoveryState>('loading')
const message = ref('Checking your password reset link...')

let subscription: Subscription | undefined

const statusIconClassName = computed(() =>
  recoveryState.value === 'success'
    ? 'bg-emerald-100 text-emerald-700'
    : recoveryState.value === 'error'
      ? 'bg-destructive/10 text-destructive'
      : 'bg-muted text-muted-foreground',
)

function getHashOrSearchParam(key: string): string | null {
  const searchParams = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))

  return searchParams.get(key) ?? hashParams.get(key)
}

function getErrorMessageFromUrl(): string | null {
  return getHashOrSearchParam('error_description')
}

function isRecoveryType(): boolean {
  return getHashOrSearchParam('type') === 'recovery'
}

async function initializeRecoveryState(): Promise<void> {
  const errorMessage = getErrorMessageFromUrl()

  if (errorMessage) {
    recoveryState.value = 'error'
    message.value = decodeURIComponent(errorMessage.replace(/\+/g, ' '))
    return
  }

  const session = await getSession()

  if (session && isRecoveryType()) {
    recoveryState.value = 'ready'
    return
  }

  recoveryState.value = 'error'
  message.value = 'This reset link is invalid or has expired. Request a new password reset email.'
}

onMounted(async () => {
  subscription = onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY' && session) {
      recoveryState.value = 'ready'
    }
  })

  await initializeRecoveryState()
})

onUnmounted(() => {
  subscription?.unsubscribe()
})
</script>

<template>
  <main
    class="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4 py-10 text-foreground"
  >
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg
            class="size-10 text-primary"
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
          <span class="text-3xl font-semibold">MarkdownPro</span>
        </RouterLink>
      </div>

      <ResetPasswordCard v-if="recoveryState === 'ready'" />

      <section
        v-else
        class="rounded-xl border border-border bg-card p-8 text-center text-card-foreground shadow-sm"
      >
        <div class="space-y-4">
          <div :class="statusIconClassName" class="mx-auto flex size-12 items-center justify-center rounded-full">
            <svg
              v-if="recoveryState === 'error'"
              class="size-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
            <svg
              v-else
              class="size-6 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>

          <div class="space-y-2">
            <h1 class="text-2xl">
              {{ recoveryState === 'loading' ? 'Preparing reset form' : 'Reset link unavailable' }}
            </h1>
            <p class="text-sm text-muted-foreground">{{ message }}</p>
          </div>

          <div class="flex flex-col gap-3 pt-2">
            <RouterLink
              v-if="recoveryState === 'error'"
              to="/forgot-password"
              class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
            >
              Request a new link
            </RouterLink>
            <RouterLink
              to="/signin"
              class="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Back to sign in
            </RouterLink>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
