import type {
  AuthChangeEvent,
  AuthResponse,
  Session,
  Subscription,
  User,
} from '@supabase/supabase-js'

import { supabase } from './supabase'

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

export async function register({
  email,
  password,
  fullName,
  username,
  options,
}: RegisterCredentials): Promise<AuthResponse> {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username,
      },
      emailRedirectTo: options?.emailRedirectTo,
    },
  })
}

export async function login({ email, password }: AuthCredentials): Promise<AuthResponse> {
  return supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export async function logout(): Promise<{ error: Error | null }> {
  const { error } = await supabase.auth.signOut()

  return { error }
}

export async function getSession(): Promise<Session | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}

export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export function onAuthStateChange(callback: AuthStateChangeCallback): Subscription {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback)

  return subscription
}
