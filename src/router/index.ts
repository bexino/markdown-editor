import { createRouter, createWebHistory } from 'vue-router'
import DocumentsView from '@/views/app/DocumentsView.vue'
import EditorView from '@/views/app/EditorView.vue'
import ProfileView from '@/views/app/ProfileView.vue'
import AuthCallbackView from '@/views/auth/AuthCallbackView.vue'
import ForgotPasswordView from '@/views/auth/ForgotPasswordView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue'
import SignInView from '@/views/auth/SignInView.vue'
import LandingView from '@/views/landing/LandingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/signin',
      name: 'signin',
      component: SignInView,
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordView,
    },
    {
      path: '/documents',
      name: 'documents',
      component: DocumentsView,
    },
    {
      path: '/editor/:id',
      name: 'editor',
      component: EditorView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: AuthCallbackView,
    },
    {
      path: '/auth/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
    },
  ],
})

export default router
