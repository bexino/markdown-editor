<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { login } from '@/lib/auth'

interface SignInFormState {
  email: string
  password: string
}

type FeedbackTone = 'info' | 'error'

const router = useRouter()

const formData = reactive<SignInFormState>({
  email: '',
  password: '',
})

const isLoading = ref(false)
const feedbackMessage = ref('')
const feedbackTone = ref<FeedbackTone>('error')

const feedbackClassName = computed(() =>
  feedbackTone.value === 'info'
    ? 'border-sky-200 bg-sky-50 text-sky-700'
    : 'border-destructive/20 bg-destructive/10 text-destructive',
)

function setFeedback(message: string, tone: FeedbackTone): void {
  feedbackMessage.value = message
  feedbackTone.value = tone
}

function validateForm(): boolean {
  if (!formData.email.trim() || !formData.password) {
    setFeedback('Please fill in all fields.', 'error')
    return false
  }

  return true
}

function showForgotPasswordMessage(): void {
  setFeedback('Password reset feature coming soon.', 'info')
}

async function handleSubmit(): Promise<void> {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  feedbackMessage.value = ''

  const { data, error } = await login({
    email: formData.email.trim(),
    password: formData.password,
  })

  isLoading.value = false

  if (error || !data.session) {
    setFeedback(error?.message ?? 'Login failed.', 'error')
    return
  }

  await router.push('/documents')
}
</script>

<template>
  <section class="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
    <header class="space-y-1.5 p-6">
      <h1 class="text-2xl">Welcome back</h1>
      <p class="text-sm text-muted-foreground">Sign in to your account to continue</p>
    </header>

    <div class="p-6 pt-0">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div v-if="feedbackMessage" :class="feedbackClassName" class="rounded-lg border px-4 py-3 text-sm">
          {{ feedbackMessage }}
        </div>

        <div class="space-y-2">
          <label for="email">Email</label>
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
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="you@example.com"
              class="flex h-10 w-full rounded-md border border-border bg-input-background px-3 py-2 pl-9 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isLoading"
              autocomplete="email"
            />
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between gap-4">
            <label for="password">Password</label>
            <button
              type="button"
              class="text-sm text-primary transition-colors hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              @click="showForgotPasswordMessage"
            >
              Forgot password?
            </button>
          </div>

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
              id="password"
              v-model="formData.password"
              type="password"
              placeholder="••••••••"
              class="flex h-10 w-full rounded-md border border-border bg-input-background px-3 py-2 pl-9 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isLoading"
              autocomplete="current-password"
            />
          </div>
        </div>

        <button
          type="submit"
          class="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <div class="mt-6 text-center text-sm">
        <span class="text-muted-foreground">Don't have an account? </span>
        <RouterLink class="text-primary transition-colors hover:underline" to="/register">
          Sign up
        </RouterLink>
      </div>
    </div>
  </section>
</template>
