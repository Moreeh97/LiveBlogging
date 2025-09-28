import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

//  import components
import Login from './pages/Login.vue'
import Register from './pages/Register.vue'
import Feed from './pages/Feed.vue'
import Profile from './pages/Profile.vue'
import AdminPanel from './pages/AdminPanel.vue'

// create Router
const routes = [
  { path: '/', redirect: '/feed' },
  { path: '/login', component: Login, meta: { requiresGuest: true } },
  { path: '/register', component: Register, meta: { requiresGuest: true } },
  { path: '/feed', component: Feed, meta: { requiresAuth: true } },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/admin', component: AdminPanel, meta: { requiresAuth: true, requiresAdmin: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})


const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')