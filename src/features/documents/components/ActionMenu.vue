<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface ActionMenuItem {
  id: string
  label: string
  destructive?: boolean
}

const props = defineProps<{
  ariaLabel: string
  items: ActionMenuItem[]
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const root = ref<HTMLElement | null>(null)
const isOpen = ref(false)

function toggleMenu(event: MouseEvent): void {
  event.stopPropagation()
  isOpen.value = !isOpen.value
}

function closeMenu(): void {
  isOpen.value = false
}

function handleSelect(id: string, event: MouseEvent): void {
  event.stopPropagation()
  emit('select', id)
  closeMenu()
}

function handleDocumentClick(event: MouseEvent): void {
  if (!root.value) {
    return
  }

  if (event.target instanceof Node && !root.value.contains(event.target)) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      :aria-label="props.ariaLabel"
      @click="toggleMenu"
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
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </svg>
    </button>

    <div
      v-if="isOpen"
      class="absolute top-10 right-0 z-20 min-w-44 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
    >
      <button
        v-for="item in props.items"
        :key="item.id"
        type="button"
        class="flex w-full cursor-pointer items-center rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
        :class="item.destructive ? 'text-destructive hover:bg-destructive/10 hover:text-destructive' : ''"
        @click="handleSelect(item.id, $event)"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>
