<script setup lang="ts">
defineProps<{
  email: string
  isPending: boolean
  pendingEmail: string
  willStartAnotherEmailChange: boolean
  visible: boolean
}>()

const emit = defineEmits<{
  cancelPending: []
  close: []
  wait: []
}>()
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
    @click.self="emit('close')"
  >
    <section class="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-lg">
      <header>
        <h2 class="text-xl font-semibold">Pending Email Verification</h2>
        <p class="mt-2 text-sm text-muted-foreground">
          Your confirmed email is still {{ email }}. You already have a pending change to
          {{ pendingEmail }}.
        </p>
      </header>

      <div class="mt-6 space-y-4 text-sm text-muted-foreground">
        <div class="rounded-xl border border-border bg-background px-4 py-3">
          <p class="font-medium text-foreground">Option 1</p>
          <p v-if="willStartAnotherEmailChange" class="mt-1">
            Cancel the pending email change, invalidate that verification flow, and continue with
            this new email update.
          </p>
          <p v-else class="mt-1">
            Cancel the pending email change and keep your confirmed email as {{ email }}.
          </p>
        </div>

        <div class="rounded-xl border border-border bg-background px-4 py-3">
          <p class="font-medium text-foreground">Option 2</p>
          <p class="mt-1">
            Keep the current pending change and wait until {{ pendingEmail }} is verified before
            changing your email again.
          </p>
        </div>
      </div>

      <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
          :disabled="isPending"
          @click="emit('wait')"
        >
          Wait for Verification
        </button>

        <button
          type="button"
          class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isPending"
          @click="emit('cancelPending')"
        >
          {{
            isPending
              ? 'Updating...'
              : willStartAnotherEmailChange
                ? 'Cancel Pending Change and Continue'
                : 'Cancel Pending Change'
          }}
        </button>
      </div>
    </section>
  </div>
</template>
