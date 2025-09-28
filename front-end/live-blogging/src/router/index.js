import { createRouter, createWebHistory } from 'vue-router'

// استيراد المكونات
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Feed from '../pages/Feed.vue'
import Profile from '../pages/Profile.vue'
import AdminPanel from '../pages/AdminPanel.vue'

const routes = [
  { 
    path: '/', 
    redirect: '/feed' 
  },
  { 
    path: '/login', 
    component: Login,
    meta: { requiresGuest: true }
  },
  { 
    path: '/register', 
    component: Register,
    meta: { requiresGuest: true }
  },
  { 
    path: '/feed', 
    component: Feed,
    meta: { requiresAuth: true }
  },
  { 
    path: '/profile', 
    component: Profile,
    meta: { requiresAuth: true }
  },
  { 
    path: '/admin', 
    component: AdminPanel,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// حماية المسارات
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  
  const isAuthenticated = !!token
  const isAdmin = user.role === 'admin'

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next('/feed')
  } else if (to.meta.requiresAdmin && !isAdmin) {
    next('/feed')
  } else {
    next()
  }
})

export default router