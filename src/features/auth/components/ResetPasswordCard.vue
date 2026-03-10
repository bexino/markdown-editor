<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { updatePassword } from '@/shared/lib/auth'
import { PASSWORD_MIN_LENGTH, validatePasswordChangeInput } from '@/features/auth/lib/registerValidation'

type FeedbackTone = 'success' | 'error'

const router = useRouter()

const formData = reactive({
  password: '',
  confirmPassword: '',
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
  const validationResult = validatePasswordChangeInput(formData.password, formData.confirmPassword)

  if (!validationResult.isValid && validationResult.message) {
    setFeedback(validationResult.message, 'error')
    return
  }

  isLoading.value = true
  feedbackMessage.value = ''

  const { error } = await updatePassword(formData.password)

  isLoading.value = false

  if (error) {
    setFeedback(error.message, 'error')
    return
  }

  setFeedback('Password updated successfully. Redirecting to sign in...', 'success')

  window.setTimeout(() => {
    router.push('/signin')
  }, 1500)
}
</script>

<template>
  <section class="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
    <header class="space-y-1.5 p-6">
      <h1 class="text-2xl">Choose a new password</h1>
      <p class="text-sm text-muted-foreground">Enter a new password for your account</p>
    </header>

    <div class="p-6 pt-0">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div v-if="feedbackMessage" :class="feedbackClassName" class="rounded-lg border px-4 py-3 text-sm">
          {{ feedbackMessage }}
        </div>

        <div class="space-y-2">
          <label for="new-password">New Password</label>
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
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="new-password"
              v-model="formData.password"
              type="password"
              placeholder="••••••••"
              class="flex h-10 w-full rounded-md border border-border bg-input-background px-3 py-2 pl-9 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isLoading"
              autocomplete="new-password"
            />
          </div>
          <p class="text-xs text-muted-foreground">
            Must be at least {{ PASSWORD_MIN_LENGTH }} characters and include letters, numbers, and a special character
          </p>
        </div>

        <div class="space-y-2">
          <label for="confirm-new-password">Confirm New Password</label>
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
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="confirm-new-password"
              v-model="formData.confirmPassword"
              type="password"
              placeholder="••••••••"
              class="flex h-10 w-full rounded-md border border-border bg-input-background px-3 py-2 pl-9 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isLoading"
              autocomplete="new-password"
            />
          </div>
        </div>

        <button
          type="submit"
          class="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Updating password...' : 'Update password' }}
        </button>
      </form>
    </div>
  </section>
</template>
