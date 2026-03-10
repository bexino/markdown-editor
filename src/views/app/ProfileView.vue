<script setup lang="ts">
import type { User } from '@supabase/supabase-js'

import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import UserMenu from '@/components/app/UserMenu.vue'
import { getCurrentUser, logout } from '@/lib/auth'
import { documentStorage } from '@/lib/documentStorage'
import { createProfileForm, getUserDisplayName, getUserInitials } from '@/lib/userProfile'
import { changePassword, createPasswordForm, updateProfile } from '@/services/profileService'
import type { PasswordFormData, ProfileFormData } from '@/types/profile'

type FeedbackTone = 'error' | 'success'

const router = useRouter()

const joinedDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
})

const user = ref<User | null>(null)
const isLoading = ref(true)
const isEditing = ref(false)
const isSavingProfile = ref(false)
const isChangingPassword = ref(false)
const isDeletingAccount = ref(false)
const showDeleteDialog = ref(false)
const showPasswordDialog = ref(false)
const documentCount = ref(0)
const feedbackMessage = ref('')
const feedbackTone = ref<FeedbackTone>('success')
const formData = ref<ProfileFormData>({
  name: '',
  email: '',
})
const passwordData = ref<PasswordFormData>(createPasswordForm())

const displayName = computed(() => getUserDisplayName(user.value))
const initials = computed(() => getUserInitials(user.value))
const joinedDate = computed(() => {
  if (!user.value?.created_at) {
    return ''
  }

  return joinedDateFormatter.format(new Date(user.value.created_at))
})
const pendingEmail = computed(() => user.value?.new_email?.trim() ?? '')

onMounted(() => {
  void loadProfile()
})

function setFeedback(message: string, tone: FeedbackTone): void {
  feedbackMessage.value = message
  feedbackTone.value = tone
}

function resetProfileForm(): void {
  if (!user.value) {
    formData.value = {
      name: '',
      email: '',
    }
    return
  }

  formData.value = createProfileForm(user.value)
}

function resetPasswordForm(): void {
  passwordData.value = createPasswordForm()
}

async function loadProfile(): Promise<void> {
  isLoading.value = true
  feedbackMessage.value = ''

  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      await router.replace('/signin')
      return
    }

    user.value = currentUser
    resetProfileForm()

    const documents = await documentStorage.getAll()
    documentCount.value = documents.length
  } catch (error) {
    setFeedback(
      error instanceof Error ? error.message : 'Unable to load your profile right now.',
      'error'
    )
  } finally {
    isLoading.value = false
  }
}

async function handleSaveProfile(): Promise<void> {
  if (!user.value) {
    return
  }

  isSavingProfile.value = true
  feedbackMessage.value = ''

  try {
    const updatedUser = await updateProfile(user.value, formData.value)
    user.value = updatedUser
    isEditing.value = false
    resetProfileForm()

    if (updatedUser.new_email) {
      setFeedback(
        `Profile updated. Confirm your new email at ${updatedUser.new_email} to finish the change.`,
        'success'
      )
      return
    }

    setFeedback('Profile updated successfully.', 'success')
  } catch (error) {
    setFeedback(
      error instanceof Error ? error.message : 'Unable to update your profile right now.',
      'error'
    )
  } finally {
    isSavingProfile.value = false
  }
}

function handleCancelEditing(): void {
  isEditing.value = false
  resetProfileForm()
}

async function handleChangePassword(): Promise<void> {
  isChangingPassword.value = true
  feedbackMessage.value = ''

  try {
    await changePassword(passwordData.value)
    showPasswordDialog.value = false
    resetPasswordForm()
    setFeedback('Password changed successfully.', 'success')
  } catch (error) {
    setFeedback(
      error instanceof Error ? error.message : 'Unable to change your password right now.',
      'error'
    )
  } finally {
    isChangingPassword.value = false
  }
}

async function handleDeleteAccount(): Promise<void> {
  isDeletingAccount.value = true

  try {
    throw new Error('Account deletion is not configured yet. Add a secure server-side deletion endpoint to enable it.')
  } catch (error) {
    setFeedback(
      error instanceof Error ? error.message : 'Unable to delete your account right now.',
      'error'
    )
    showDeleteDialog.value = false
  } finally {
    isDeletingAccount.value = false
  }
}

async function goBack(): Promise<void> {
  await router.push('/documents')
}

async function signOutAndReturnHome(): Promise<void> {
  await logout()
  await router.push('/')
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background text-foreground">
    <header class="border-b border-border bg-card px-4 py-3 sm:px-6">
      <div class="mx-auto flex max-w-6xl items-center gap-3">
        <button
          type="button"
          class="inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
          @click="goBack"
        >
          <svg
            class="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span class="hidden sm:inline">Back to Documents</span>
        </button>

        <h1 class="flex-1 text-lg font-semibold">Profile Settings</h1>

        <UserMenu />
      </div>
    </header>

    <main class="flex-1 overflow-auto p-4 sm:p-6">
      <div class="mx-auto max-w-4xl space-y-6">
        <div
          v-if="feedbackMessage"
          class="rounded-lg border px-4 py-3 text-sm"
          :class="
            feedbackTone === 'error'
              ? 'border-destructive/20 bg-destructive/10 text-destructive'
              : 'border-primary/15 bg-primary/5 text-foreground'
          "
        >
          {{ feedbackMessage }}
        </div>

        <section
          v-if="isLoading"
          class="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground shadow-sm"
        >
          Loading profile...
        </section>

        <template v-else-if="user">
          <section class="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <div class="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <div
                class="flex size-24 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground"
              >
                {{ initials }}
              </div>

              <div class="flex-1 text-center sm:text-left">
                <h2 class="text-2xl font-bold">{{ displayName }}</h2>
                <p class="mt-1 text-muted-foreground">{{ user.email }}</p>

                <div
                  class="mt-4 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground sm:justify-start"
                >
                  <div class="flex items-center gap-2">
                    <svg
                      class="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M8 2v4" />
                      <path d="M16 2v4" />
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <path d="M3 10h18" />
                    </svg>
                    <span>Joined {{ joinedDate }}</span>
                  </div>

                  <div class="flex items-center gap-2">
                    <svg
                      class="size-4"
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
                    <span>
                      {{ documentCount }}
                      {{ documentCount === 1 ? 'document' : 'documents' }}
                    </span>
                  </div>
                </div>

                <p v-if="pendingEmail" class="mt-4 text-sm text-muted-foreground">
                  Pending email change: confirm {{ pendingEmail }} from your inbox.
                </p>
              </div>
            </div>
          </section>

          <section class="rounded-2xl border border-border bg-card shadow-sm">
            <header class="flex items-start justify-between gap-4 border-b border-border p-6">
              <div>
                <h2 class="text-xl font-semibold">Personal Information</h2>
                <p class="mt-1 text-sm text-muted-foreground">Update your account details</p>
              </div>

              <button
                v-if="!isEditing"
                type="button"
                class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
                @click="isEditing = true"
              >
                Edit
              </button>
            </header>

            <div class="space-y-4 p-6">
              <div class="space-y-2">
                <label for="name">Full Name</label>
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
                    <path d="M20 21a8 8 0 0 0-16 0" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    id="name"
                    v-model="formData.name"
                    type="text"
                    class="flex h-11 w-full rounded-md border border-border bg-input-background px-3 py-2 pl-9 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70"
                    :disabled="!isEditing || isSavingProfile"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label for="email">Email Address</label>
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
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                  <input
                    id="email"
                    v-model="formData.email"
                    type="email"
                    class="flex h-11 w-full rounded-md border border-border bg-input-background px-3 py-2 pl-9 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70"
                    :disabled="!isEditing || isSavingProfile"
                  />
                </div>
              </div>

              <div v-if="isEditing" class="flex flex-col gap-2 pt-2 sm:flex-row">
                <button
                  type="button"
                  class="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                  :disabled="isSavingProfile"
                  @click="handleSaveProfile"
                >
                  <svg
                    class="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
                    <path d="M17 21v-8H7v8" />
                    <path d="M7 3v5h8" />
                  </svg>
                  {{ isSavingProfile ? 'Saving...' : 'Save Changes' }}
                </button>

                <button
                  type="button"
                  class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  :disabled="isSavingProfile"
                  @click="handleCancelEditing"
                >
                  Cancel
                </button>
              </div>
            </div>
          </section>

          <section class="rounded-2xl border border-border bg-card shadow-sm">
            <header class="border-b border-border p-6">
              <h2 class="text-xl font-semibold">Security</h2>
              <p class="mt-1 text-sm text-muted-foreground">
                Manage your password and security settings
              </p>
            </header>

            <div class="p-6">
              <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div class="flex items-center gap-3">
                  <div
                    class="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground"
                  >
                    <svg
                      class="size-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
                    </svg>
                  </div>

                  <div>
                    <p class="font-medium">Password</p>
                    <p class="text-sm text-muted-foreground">••••••••</p>
                  </div>
                </div>

                <button
                  type="button"
                  class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  @click="showPasswordDialog = true"
                >
                  Change Password
                </button>
              </div>
            </div>
          </section>

          <section class="rounded-2xl border border-destructive/40 bg-card shadow-sm">
            <header class="border-b border-destructive/20 p-6">
              <h2 class="text-xl font-semibold text-destructive">Danger Zone</h2>
              <p class="mt-1 text-sm text-muted-foreground">
                Irreversible actions for your account
              </p>
            </header>

            <div class="p-6">
              <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p class="font-medium">Delete Account</p>
                  <p class="mt-1 text-sm text-muted-foreground">
                    Permanently delete your account and all documents
                  </p>
                </div>

                <button
                  type="button"
                  class="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
                  @click="showDeleteDialog = true"
                >
                  <svg
                    class="size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                  Delete Account
                </button>
              </div>
            </div>
          </section>
        </template>

        <section
          v-else
          class="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground shadow-sm"
        >
          <p>You are not signed in.</p>
          <button
            type="button"
            class="mt-4 inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
            @click="signOutAndReturnHome"
          >
            Return Home
          </button>
        </section>
      </div>
    </main>

    <div
      v-if="showPasswordDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="
        showPasswordDialog = false
        resetPasswordForm()
      "
    >
      <section class="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
        <header>
          <h2 class="text-xl font-semibold">Change Password</h2>
          <p class="mt-2 text-sm text-muted-foreground">
            Enter your current password and choose a new one
          </p>
        </header>

        <div class="mt-6 space-y-4">
          <div class="space-y-2">
            <label for="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              v-model="passwordData.currentPassword"
              type="password"
              placeholder="••••••••"
              class="flex h-11 w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div class="space-y-2">
            <label for="newPassword">New Password</label>
            <input
              id="newPassword"
              v-model="passwordData.newPassword"
              type="password"
              placeholder="••••••••"
              class="flex h-11 w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div class="space-y-2">
            <label for="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              v-model="passwordData.confirmPassword"
              type="password"
              placeholder="••••••••"
              class="flex h-11 w-full rounded-md border border-border bg-input-background px-3 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
            :disabled="isChangingPassword"
            @click="
              showPasswordDialog = false
              resetPasswordForm()
            "
          >
            Cancel
          </button>

          <button
            type="button"
            class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isChangingPassword"
            @click="handleChangePassword"
          >
            {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
          </button>
        </div>
      </section>
    </div>

    <div
      v-if="showDeleteDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      @click.self="showDeleteDialog = false"
    >
      <section class="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
        <header>
          <h2 class="text-xl font-semibold">Are you absolutely sure?</h2>
          <p class="mt-2 text-sm text-muted-foreground">
            This action cannot be undone. This project still needs a secure server-side deletion
            endpoint before account removal can be enabled safely.
          </p>
        </header>

        <div class="mt-6 flex justify-end gap-3">
          <button
            type="button"
            class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
            :disabled="isDeletingAccount"
            @click="showDeleteDialog = false"
          >
            Cancel
          </button>

          <button
            type="button"
            class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isDeletingAccount"
            @click="handleDeleteAccount"
          >
            {{ isDeletingAccount ? 'Deleting...' : 'Yes, Delete My Account' }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
