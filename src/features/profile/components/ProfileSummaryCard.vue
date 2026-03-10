<script setup lang="ts">
defineProps<{
  displayName: string
  documentCount: number
  email: string
  initials: string
  joinedDate: string
  pendingEmail: string
}>()

const emit = defineEmits<{
  wait: []
  resolvePending: []
}>()
</script>

<template>
  <section class="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
    <div class="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      <div
        class="flex size-24 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground"
      >
        {{ initials }}
      </div>

      <div class="flex-1 text-center sm:text-left">
        <h2 class="text-2xl font-bold">{{ displayName }}</h2>
        <p class="mt-1 text-muted-foreground">{{ email }}</p>

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

        <div
          v-if="pendingEmail"
          class="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-900"
        >
          <p>Pending email change: confirm {{ pendingEmail }} from your inbox.</p>
          <p class="mt-2 text-amber-800/80">
            Your confirmed email is still {{ email }} until that verification is completed.
          </p>
          <div class="mt-3 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-amber-900 px-4 py-2 text-sm text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
              @click="emit('resolvePending')"
            >
              Resolve Pending Change
            </button>
            <button
              type="button"
              class="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-amber-800/20 bg-transparent px-4 py-2 text-sm text-amber-900 transition-colors hover:bg-amber-500/10 focus-visible:ring-2 focus-visible:ring-ring"
              @click="emit('wait')"
            >
              Keep Waiting
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
