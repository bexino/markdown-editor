<script setup lang="ts">
import type { ProfileFormData } from '@/types/profile'

const formData = defineModel<ProfileFormData>('formData', { required: true })

defineProps<{
  isEditing: boolean
  isResolvingPendingEmailChange: boolean
  isSavingProfile: boolean
}>()

const emit = defineEmits<{
  cancel: []
  edit: []
  save: []
}>()
</script>

<template>
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
        @click="emit('edit')"
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
          :disabled="isSavingProfile || isResolvingPendingEmailChange"
          @click="emit('save')"
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
          :disabled="isSavingProfile || isResolvingPendingEmailChange"
          @click="emit('cancel')"
        >
          Cancel
        </button>
      </div>
    </div>
  </section>
</template>
