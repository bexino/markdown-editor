<script setup lang="ts">
import type { ProfileFeedbackTone } from '@/types/profile'

defineProps<{
  message: string
  tone: ProfileFeedbackTone
}>()
</script>

<template>
  <div
    class="rounded-lg border px-4 py-3 text-sm"
    :class="
      tone === 'error'
        ? 'border-destructive/20 bg-destructive/10 text-destructive'
        : 'border-primary/15 bg-primary/5 text-foreground'
    "
  >
    {{ message }}
  </div>
</template>
