<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getAuthCallbackUrl, register } from '@/shared/lib/auth'
import {
  FULL_NAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  getRegisterErrorMessage,
  validateRegisterInput,
} from '@/features/auth/lib/registerValidation'

interface RegisterFormState {
  fullName: string
  username: string
  email: string
  password: string
  confirmPassword: string
}

type FeedbackTone = 'success' | 'error'

const router = useRouter()

const formData = reactive<RegisterFormState>({
  fullName: '',
  username: '',
  email: '',
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
  const validationResult = validateRegisterInput(formData)

  if (!validationResult.isValid && validationResult.message) {
    setFeedback(validationResult.message, 'error')
    return
  }

  isLoading.value = true
  feedbackMessage.value = ''

  const { data, error } = await register({
    email: formData.email.trim(),
    password: formData.password,
    fullName: formData.fullName.trim(),
    username: formData.username.trim(),
    options: {
      emailRedirectTo: getAuthCallbackUrl(),
    },
  })
  const identitiesCount = data.user?.identities?.length

  isLoading.value = false

  if (error) {
    setFeedback(getRegisterErrorMessage(error.message, identitiesCount), 'error')
    return
  }

  if (identitiesCount === 0) {
    setFeedback(getRegisterErrorMessage('', identitiesCount), 'error')
    return
  }

  if (data.session) {
    await router.push('/documents')
    return
  }

  setFeedback('Account created. Check your email to confirm your registration.', 'success')
}
</script>

<template>
  <section class="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
    <header class="space-y-1.5 p-6">
      <h1 class="text-2xl">Create an account</h1>
      <p class="text-sm text-muted-foreground">Enter your information to get started</p>
    </header>

    <div class="p-6 pt-0">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div v-if="feedbackMessage" :class="feedbackClassName" class="rounded-lg border px-4 py-3 text-sm">
          {{ feedbackMessage }}
        </div>

        <div class="space-y-2">
          <label for="full-name">Full Name</label>
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
              <path d="M18 21a6 6 0 0 0-12 0" />
              <circle cx="12" cy="8" r="4" />
            </svg>
            <input
              id="full-name"
              v-model="formData.fullName"
              type="text"
              placeholder="John Doe"
              class="flex h-10 w-full rounded-md border border-border bg-input-background px-3 py-2 pl-9 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isLoading"
              autocomplete="name"
              :maxlength="FULL_NAME_MAX_LENGTH"
            />
          </div>
        </div>

        <div class="space-y-2">
          <label for="username">Username</label>
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
              <path d="M16 18 22 12 16 6" />
              <path d="M8 6 2 12l6 6" />
            </svg>
            <input
              id="username"
              v-model="formData.username"
              type="text"
              placeholder="johndoe"
              class="flex h-10 w-full rounded-md border border-border bg-input-background px-3 py-2 pl-9 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="isLoading"
              autocomplete="username"
              :maxlength="USERNAME_MAX_LENGTH"
            />
          </div>
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
          <label for="password">Password</label>
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
              autocomplete="new-password"
            />
          </div>
          <p class="text-xs text-muted-foreground">
            Must be at least {{ PASSWORD_MIN_LENGTH }} characters and include letters, numbers, and a special character
          </p>
        </div>

        <div class="space-y-2">
          <label for="confirm-password">Confirm Password</label>
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
              id="confirm-password"
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
          {{ isLoading ? 'Creating account...' : 'Create account' }}
        </button>
      </form>

      <div class="mt-6 text-center text-sm">
        <span class="text-muted-foreground">Already have an account? </span>
        <RouterLink class="text-primary transition-colors hover:underline" to="/signin">
          Sign in
        </RouterLink>
      </div>
    </div>
  </section>
</template>
