<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const mockupModes = ['light', 'dark'] as const
const activeMockupIndex = ref(0)
const activeMode = computed(() => mockupModes[activeMockupIndex.value] ?? 'light')

let mockupInterval: number | undefined

function getMockupThemeStyle(mode: (typeof mockupModes)[number]): Record<string, string> {
  if (mode === 'dark') {
    return {
      colorScheme: 'dark',
      '--background': '#111111',
      '--foreground': '#e5e5e5',
      '--card': '#0e0e0e',
      '--card-foreground': '#e5e5e5',
      '--primary': '#f5f5f5',
      '--primary-foreground': '#111111',
      '--muted-foreground': '#a3a3a3',
      '--border': '#2a2a2a',
    }
  }

  return {
    colorScheme: 'light',
    '--background': '#ffffff',
    '--foreground': '#030213',
    '--card': '#ffffff',
    '--card-foreground': '#030213',
    '--primary': '#030213',
    '--primary-foreground': '#ffffff',
    '--muted-foreground': '#717182',
    '--border': 'rgba(0, 0, 0, 0.1)',
  }
}

onMounted(() => {
  mockupInterval = window.setInterval(() => {
    activeMockupIndex.value = activeMockupIndex.value === mockupModes.length - 1 ? 0 : activeMockupIndex.value + 1
  }, 4000)
})

onBeforeUnmount(() => {
  if (mockupInterval) {
    window.clearInterval(mockupInterval)
  }
})
</script>

<template>
  <div class="overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-8 lg:p-12">
    <Transition
      mode="out-in"
      enter-active-class="transition-all duration-700 ease-in-out"
      enter-from-class="translate-y-6 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-700 ease-in-out"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="-translate-y-6 opacity-0"
    >
      <div
        :key="activeMode"
        class="space-y-6 rounded-xl p-4"
        :style="getMockupThemeStyle(activeMode)"
        :class="activeMode === 'dark' ? 'bg-[#0e0e0e] text-foreground' : 'bg-transparent text-foreground'"
      >
        <div class="rounded-lg border border-border bg-card p-4">
          <div class="mb-2 flex items-center gap-2">
            <div class="size-3 rounded-full bg-primary"></div>
            <span class="font-mono text-sm text-muted-foreground">editor.md</span>
          </div>
          <div class="space-y-1 font-mono text-sm">
            <div class="text-primary"># Hello World</div>
            <div class="text-muted-foreground">This is **markdown**</div>
          </div>
        </div>
        <div class="rounded-lg border border-border bg-card p-4">
          <div class="mb-2 text-2xl font-bold">Hello World</div>
          <div class="text-muted-foreground">This is <strong>markdown</strong></div>
        </div>
      </div>
    </Transition>
  </div>
</template>
