<script setup lang="ts">
import { computed, ref } from 'vue'

import EditorIcon from '@/features/documents/components/EditorIcon.vue'
import type { MarkdownHeading } from '@/features/documents/lib/markdown'

export interface OutlineHeadingNode {
  heading: MarkdownHeading
  children: OutlineHeadingNode[]
}

const props = defineProps<{
  node: OutlineHeadingNode
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const isExpanded = ref(true)

const hasChildren = computed(() => {
  return props.node.children.length > 0
})

const indentClass = computed(() => {
  if (props.node.heading.level <= 1) {
    return 'pl-3'
  }

  if (props.node.heading.level === 2) {
    return 'pl-7'
  }

  if (props.node.heading.level === 3) {
    return 'pl-11'
  }

  return 'pl-14'
})

function toggleExpanded(): void {
  if (!hasChildren.value) {
    emit('select', props.node.heading.id)
    return
  }

  isExpanded.value = !isExpanded.value
}
</script>

<template>
  <div class="space-y-1">
    <div class="flex items-center gap-1" :class="indentClass">
      <button
        type="button"
        class="inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
        :class="hasChildren ? 'visible' : 'invisible'"
        @click="toggleExpanded"
      >
        <EditorIcon :name="isExpanded ? 'chevron-down' : 'chevron-right'" />
      </button>

      <button
        type="button"
        class="min-w-0 flex-1 cursor-pointer rounded-md py-1.5 pr-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
        @click="emit('select', node.heading.id)"
      >
        <span class="block truncate">{{ node.heading.text }}</span>
      </button>
    </div>

    <div v-if="hasChildren && isExpanded" class="space-y-1">
      <DocumentOutlineItem
        v-for="child in node.children"
        :key="child.heading.id"
        :node="child"
        @select="emit('select', $event)"
      />
    </div>
  </div>
</template>
