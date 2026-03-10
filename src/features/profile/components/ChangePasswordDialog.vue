<script setup lang="ts">
import type { PasswordFormData } from '@/features/profile/types/profile'

const passwordData = defineModel<PasswordFormData>('passwordData', { required: true })

defineProps<{
  isChangingPassword: boolean
  visible: boolean
}>()

const emit = defineEmits<{
  change: []
  close: []
}>()
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    @click.self="emit('close')"
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
          @click="emit('close')"
        >
          Cancel
        </button>

        <button
          type="button"
          class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isChangingPassword"
          @click="emit('change')"
        >
          {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
        </button>
      </div>
    </section>
  </div>
</template>
