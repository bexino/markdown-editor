<script setup lang="ts">
import SignInCard from '@/components/auth/SignInCard.vue'
</script>

<template>
  <main
    class="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 px-4 py-10 text-foreground"
  >
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg
            class="size-10 text-primary"
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
          <span class="text-3xl font-semibold">MarkDocs</span>
        </RouterLink>
      </div>

      <SignInCard />

      <div class="mt-4 text-center">
        <RouterLink
          to="/"
          class="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          ← Back to home
        </RouterLink>
      </div>
    </div>
  </main>
</template>
