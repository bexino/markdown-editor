<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import { requestPasswordReset } from '@/shared/lib/auth'

type FeedbackTone = 'success' | 'error'

const formData = reactive({
  email: '',
})

const isLoading = ref(false)
const feedbackMessage = ref('')
const feedbackTone = ref<FeedbackTone>('error')

const feedbackClassName = computed(() =>
  feedbackTone.value === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-destructive/20 bg-destructive/10 text-destructive',
)

function setFeedback(message: string, tone: FeedbackTone): void {
  feedbackMessage.value = message
  feedbackTone.value = tone
}

async function handleSubmit(): Promise<void> {
  if (!formData.email.trim()) {
    setFeedback('Please enter your email address.', 'error')
    return
  }

  isLoading.value = true
  feedbackMessage.value = ''

  const { error } = await requestPasswordReset(formData.email.trim())

  isLoading.value = false

  if (error) {
    setFeedback(error.message, 'error')
    return
  }

  setFeedback('If an account exists for that email, a reset link has been sent.', 'success')
}
</script>

<template>
  <section class="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
    <header class="space-y-1.5 p-6">
      <h1 class="text-2xl">Reset your password</h1>
      <p class="text-sm text-muted-foreground">Enter your email and we will send you a reset link</p>
    </header>

    <div class="p-6 pt-0">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div v-if="feedbackMessage" :class="feedbackClassName" class="rounded-lg border px-4 py-3 text-sm">
          {{ feedbackMessage }}
        </div>

        <div class="space-y-2">
          <label for="forgot-password-email">Email</label>
          <div class="relative">
            <svg
              class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m4 7 8 6 8-6" />
            </svg>
            <input
              id="forgot-password-email"
              v-model="formData.email"
              type="email"
              placeholder="you@example.com"
              class="flex h-10 w-full rounded-md border border-border bg-input-background px-3 py-2 pl-9 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isLoading"
              autocomplete="email"
            />
          </div>
        </div>

        <button
          type="submit"
          class="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Sending reset link...' : 'Send reset link' }}
        </button>
      </form>

      <div class="mt-6 text-center text-sm">
        <span class="text-muted-foreground">Remembered your password? </span>
        <RouterLink class="text-primary transition-colors hover:underline" to="/signin">
          Sign in
        </RouterLink>
      </div>
    </div>
  </section>
</template>
