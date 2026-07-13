import type {
  AuthChangeEvent,
  AuthResponse,
  Session,
  Subscription,
  User,
} from '@supabase/supabase-js'

import { supabase } from '@/shared/services/supabase'
import { guestAuth } from '@/shared/lib/guestAuth'

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends AuthCredentials {
  fullName: string
  username: string
  options?: {
    emailRedirectTo?: string
  }
}

export type AuthStateChangeCallback = (event: AuthChangeEvent, session: Session | null) => void

function getAuthRedirectUrl(path: string): string | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  return new URL(path, window.location.origin + import.meta.env.BASE_URL).toString()
}

export function getAuthCallbackUrl(): string | undefined {
  return getAuthRedirectUrl('auth/callback')
}

export function getPasswordResetCallbackUrl(): string | undefined {
  return getAuthRedirectUrl('auth/reset-password')
}

export async function register({
  email,
  password,
  fullName,
  username,
  options,
}: RegisterCredentials): Promise<AuthResponse> {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username,
      },
      emailRedirectTo: options?.emailRedirectTo ?? getAuthCallbackUrl(),
    },
  })
}

export async function login({ email, password }: AuthCredentials): Promise<AuthResponse> {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  return supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export async function requestPasswordReset(email: string): Promise<{ error: Error | null }> {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getPasswordResetCallbackUrl(),
  })

  return { error }
}

export async function updatePassword(password: string): Promise<{ error: Error | null }> {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  const { error } = await supabase.auth.updateUser({
    password,
  })

  return { error }
}

export async function logout(): Promise<{ error: Error | null }> {
  if (guestAuth.isGuest()) {
    guestAuth.logout()
    return { error: null }
  }

  if (!supabase) {
    return { error: null }
  }

  const { error } = await supabase.auth.signOut()

  return { error }
}

export async function getSession(): Promise<Session | null> {
  if (guestAuth.isGuest()) {
    return guestAuth.getFakeSession()
  }

  if (!supabase) {
    return null
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}

export async function getCurrentUser(): Promise<User | null> {
  if (guestAuth.isGuest()) {
    return guestAuth.getUser() as unknown as User
  }

  if (!supabase) {
    return null
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export function onAuthStateChange(callback: AuthStateChangeCallback): Subscription | null {
  if (!supabase) {
    return null
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback)

  return subscription
}
