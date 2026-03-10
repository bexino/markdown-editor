<script setup lang="ts">
const emit = defineEmits<{
  openDelete: []
}>()
</script>

<template>
  <section class="rounded-2xl border border-destructive/40 bg-card shadow-sm">
    <header class="border-b border-destructive/20 p-6">
      <h2 class="text-xl font-semibold text-destructive">Danger Zone</h2>
      <p class="mt-1 text-sm text-muted-foreground">Irreversible actions for your account</p>
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
          @click="emit('openDelete')"
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
