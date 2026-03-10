<script setup lang="ts">
import { ref } from 'vue'

export interface SlashCommandItem {
  id: string
  title: string
  description: string
}

defineProps<{
  commands: SlashCommandItem[]
  selectedIndex: number
  top?: number
  left?: number
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const hoveredIndex = ref<number | null>(null)
</script>

<template>
  <div
    class="absolute z-20 w-72 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-xl"
    :style="{ top: `${top ?? 16}px`, left: `${left ?? 16}px` }"
    role="listbox"
    aria-label="Slash commands"
  >
    <div class="mb-1 px-2 py-1 text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
      Slash commands
    </div>

    <div
      class="overflow-y-auto pr-1"
      :style="commands.length > 3 ? { height: '12rem' } : undefined"
    >
      <button
        v-for="(command, index) in commands"
        :key="command.id"
        type="button"
        class="flex min-h-16 w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring"
        :class="
          hoveredIndex === index || (hoveredIndex === null && index === selectedIndex)
            ? 'bg-accent text-accent-foreground'
            : ''
        "
        role="option"
        :aria-selected="index === selectedIndex"
        @mouseenter="hoveredIndex = index"
        @mouseleave="hoveredIndex = null"
        @mousedown.prevent
        @click="emit('select', command.id)"
      >
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-medium">{{ command.title }}</span>
          <span class="block text-xs text-muted-foreground">
            {{ command.description }}
          </span>
        </span>
      </button>
    </div>
  </div>
</template>
