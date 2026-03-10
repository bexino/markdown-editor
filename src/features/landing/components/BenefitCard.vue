<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <article class="flex gap-3">
    <div class="mt-0.5 shrink-0 text-primary">
      <slot name="icon">
        <svg
          class="size-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M9 12l2 2 4-4" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      </slot>
    </div>

    <div>
      <h3 class="mb-1 font-semibold">{{ title }}</h3>
      <p class="text-muted-foreground">{{ description }}</p>
    </div>
  </article>
</template>
