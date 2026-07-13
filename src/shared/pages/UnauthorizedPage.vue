<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { guestAuth } from '@/shared/lib/guestAuth'

const route = useRoute()
const router = useRouter()

const attemptedPath = computed(() => {
  const redirect =
    typeof route.query.redirect === 'string' && route.query.redirect.trim().length > 0
      ? route.query.redirect
      : route.path

  return redirect.trim().length > 0 ? redirect : '/'
})

async function enterGuestMode(): Promise<void> {
  guestAuth.loginAsGuest()
  const redirectPath =
    typeof route.query.redirect === 'string' ? route.query.redirect : '/documents'
  await router.push(redirectPath)
}
</script>

<template>
  <main class="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
    <div
      class="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--color-primary)_12%,transparent)_0%,transparent_72%)]"
    />
    <div
      class="absolute left-0 top-20 -z-10 h-80 w-80 -translate-x-1/4 rounded-full border border-border/60 bg-card/50 blur-3xl"
      aria-hidden="true"
    />

    <div class="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8">
      <section
        class="grid w-full gap-8 overflow-hidden rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-[0_32px_120px_-48px_rgba(3,2,19,0.4)] backdrop-blur sm:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:p-12"
      >
        <div class="flex flex-col justify-between gap-10">
          <div class="space-y-6">
            <RouterLink
              to="/"
              class="inline-flex w-fit items-center gap-3 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <svg
                class="size-5 text-primary"
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
              <span>MarkDocs</span>
            </RouterLink>

            <div class="space-y-4">
              <p class="text-sm font-semibold uppercase tracking-[0.3em] text-primary/70">
                Error 401
              </p>
              <h1 class="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                You need to sign in to continue.
              </h1>
              <p class="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                This route requires an authenticated session. Sign in to access your documents,
                preview protected content, or return to the public areas of the application.
              </p>
            </div>

            <div class="flex flex-wrap gap-3">
              <RouterLink
                to="/signin"
                class="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
              >
                Sign in
              </RouterLink>
              <RouterLink
                to="/register"
                class="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-background px-5 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                Create account
              </RouterLink>
              <button
                type="button"
                class="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-dashed border-muted-foreground/50 bg-muted/30 px-5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-muted-foreground hover:bg-muted/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                @click="enterGuestMode"
              >
                Continue as Guest
              </button>
              <RouterLink
                to="/"
                class="inline-flex min-h-11 items-center justify-center rounded-xl border border-border/70 bg-card px-5 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                Return home
              </RouterLink>
            </div>
          </div>

          <div class="rounded-2xl border border-border/70 bg-background/80 p-4 sm:p-5">
            <p class="text-sm font-medium text-muted-foreground">Requested resource</p>
            <p class="mt-2 break-all font-mono text-sm text-foreground sm:text-base">
              {{ attemptedPath }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-center">
          <div
            class="relative flex aspect-square w-full max-w-md items-center justify-center rounded-[2rem] border border-border/60 bg-[linear-gradient(160deg,color-mix(in_oklab,var(--color-primary)_8%,transparent),color-mix(in_oklab,var(--color-background)_88%,transparent))] p-8"
          >
            <div class="absolute inset-6 rounded-[1.5rem] border border-dashed border-border/70" />
            <div class="relative flex w-full max-w-xs flex-col gap-4">
              <div class="rounded-2xl border border-border/70 bg-background/90 p-5 shadow-sm">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-muted-foreground">Session state</span>
                  <span
                    class="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary"
                  >
                    Required
                  </span>
                </div>
                <div class="mt-6 flex items-end gap-3">
                  <span class="text-6xl font-semibold leading-none">401</span>
                  <span class="pb-2 text-sm text-muted-foreground">Unauthorized</span>
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div class="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Cause
                  </p>
                  <p class="mt-2 text-sm leading-6 text-foreground">
                    The app could not verify an active signed-in session for this route.
                  </p>
                </div>
                <div class="rounded-2xl border border-border/70 bg-background/80 p-4">
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Next step
                  </p>
                  <p class="mt-2 text-sm leading-6 text-foreground">
                    Authenticate first, then return to the requested page if access is allowed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
