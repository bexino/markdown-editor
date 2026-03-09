<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <article class="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg">
    <div class="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
      <slot name="icon" />
    </div>
    <h3 class="mb-2 text-xl font-semibold">{{ title }}</h3>
    <p class="text-muted-foreground">{{ description }}</p>
  </article>
</template>
