import { createRouter, createWebHistory } from 'vue-router'
import DocumentsView from '@/views/DocumentsView.vue'
import LandingView from '@/views/LandingView.vue'
import RegisterView from '@/views/RegisterView.vue'
import SignInView from '@/views/SignInView.vue'

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
      path: '/documents',
      name: 'documents',
      component: DocumentsView,
    },
  ],
})

export default router
