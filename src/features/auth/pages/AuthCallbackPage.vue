<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { Subscription } from '@supabase/supabase-js'
import { RouterLink, useRouter } from 'vue-router'

import { getSession, onAuthStateChange } from '@/shared/lib/auth'

type VerificationState = 'loading' | 'success' | 'error'

const router = useRouter()

const verificationState = ref<VerificationState>('loading')
const message = ref('Verifying your email...')

let redirectTimeoutId: number | undefined
let subscription: Subscription | undefined

function getErrorMessageFromUrl(): string | null {
  const searchParams = new URLSearchParams(window.location.search)
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))

  return searchParams.get('error_description') ?? hashParams.get('error_description')
}

async function completeVerification(): Promise<void> {
  const errorMessage = getErrorMessageFromUrl()

  if (errorMessage) {
    verificationState.value = 'error'
    message.value = decodeURIComponent(errorMessage.replace(/\+/g, ' '))
    return
  }

  const session = await getSession()

  if (!session) {
    verificationState.value = 'error'
    message.value = 'Verification could not be completed. Try the link again or sign in manually.'
    return
  }

  verificationState.value = 'success'
  message.value = 'Your email has been verified. Redirecting to your documents...'
  redirectTimeoutId = window.setTimeout(() => {
    router.push('/documents')
  }, 1500)
}

onMounted(async () => {
  subscription = onAuthStateChange((event, session) => {
    if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
      verificationState.value = 'success'
      message.value = 'Your email has been verified. Redirecting to your documents...'
      redirectTimeoutId = window.setTimeout(() => {
        router.push('/documents')
      }, 1500)
    }
  })

  await completeVerification()
})

onUnmounted(() => {
  subscription?.unsubscribe()

  if (redirectTimeoutId) {
    window.clearTimeout(redirectTimeoutId)
  }
})
</script>

<template>
  <main
    class="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4 py-10 text-foreground"
  >
    <section class="w-full max-w-md rounded-xl border border-border bg-card p-8 text-card-foreground shadow-sm">
      <div class="space-y-4 text-center">
        <div
          class="mx-auto flex size-12 items-center justify-center rounded-full"
          :class="
            verificationState === 'success'
              ? 'bg-emerald-100 text-emerald-700'
              : verificationState === 'error'
                ? 'bg-destructive/10 text-destructive'
                : 'bg-muted text-muted-foreground'
          "
        >
          <svg
            v-if="verificationState === 'success'"
            class="size-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m20 6-11 11-5-5" />
          </svg>
          <svg
            v-else-if="verificationState === 'error'"
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
            {{
              verificationState === 'success'
                ? 'Email verified'
                : verificationState === 'error'
                  ? 'Verification failed'
                  : 'Confirming your email'
            }}
          </h1>
          <p class="text-sm text-muted-foreground">{{ message }}</p>
        </div>

        <div class="flex flex-col gap-3 pt-2">
          <RouterLink
            v-if="verificationState === 'success'"
            to="/documents"
            class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
          >
            Go to documents
          </RouterLink>
          <RouterLink
            v-else
            to="/signin"
            class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
          >
            Go to sign in
          </RouterLink>

          <RouterLink
            to="/"
            class="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Back to home
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>
