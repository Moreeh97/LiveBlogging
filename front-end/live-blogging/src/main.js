import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// إنشاء التطبيق
const app = createApp(App)
const pinia = createPinia()

// استخدام Plugins
app.use(pinia)
app.use(router)

// تركيب التطبيق
app.mount('#app')