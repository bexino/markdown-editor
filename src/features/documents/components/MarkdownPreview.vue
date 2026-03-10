<script setup lang="ts">
import { computed } from 'vue'

import '@/assets/markdown.css'

import { renderMarkdown } from '@/features/documents/lib/markdown'

const props = defineProps<{
  content: string
  emptyMessage?: string
}>()

const renderedContent = computed(() => {
  const trimmed = props.content.trim()
  return trimmed ? renderMarkdown(props.content) : ''
})
</script>

<template>
  <div
    v-if="renderedContent"
    class="prose prose-slate max-w-none"
    v-html="renderedContent"
  />
  <div
    v-else
    class="rounded-xl border border-dashed border-border bg-background/70 px-6 py-12 text-center text-sm text-muted-foreground"
  >
    {{ emptyMessage ?? 'Start writing to see your preview.' }}
  </div>
</template>
