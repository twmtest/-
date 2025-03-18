import { createRouter, createWebHistory } from 'vue-router'
import MainHome from '../components/Home.vue'
import UserLogin from '../components/UserLogin.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: UserLogin
  },
  {
    path: '/home',
    name: 'Home',
    component: MainHome
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
