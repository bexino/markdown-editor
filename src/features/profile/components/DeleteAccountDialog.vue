<script setup lang="ts">
defineProps<{
  isDeletingAccount: boolean
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  confirm: []
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
          @click="emit('close')"
        >
          Cancel
        </button>

        <button
          type="button"
          class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm text-destructive-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isDeletingAccount"
          @click="emit('confirm')"
        >
          {{ isDeletingAccount ? 'Deleting...' : 'Yes, Delete My Account' }}
        </button>
      </div>
    </section>
  </div>
</template>
