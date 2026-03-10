<script setup lang="ts">
const emit = defineEmits<{
  openPassword: []
}>()
</script>

<template>
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
          <div class="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
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
          @click="emit('openPassword')"
        >
          Change Password
        </button>
      </div>
    </div>
  </section>
</template>
