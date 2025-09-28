<template>
  <div class="login-page">
    <div class="container">
      <div class="login-card card">
        <div class="login-header">
          <h1>🚀 مرحلاً بعودتك!</h1>
          <p>سجل الدخول إلى حسابك للمتابعة</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">البريد الإلكتروني</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-control"
              placeholder="ادخل بريدك الإلكتروني"
              required
            >
          </div>

          <div class="form-group">
            <label for="password">كلمة المرور</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-control"
              placeholder="ادخل كلمة المرور"
              required
            >
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.remember">
              <span>تذكرني</span>
            </label>
            <router-link to="/forgot-password" class="forgot-link">
              نسيت كلمة المرور؟
            </router-link>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary btn-block"
            :disabled="loading"
          >
            <span v-if="loading">⏳ جاري تسجيل الدخول...</span>
            <span v-else>🔑 تسجيل الدخول</span>
          </button>

          <div class="login-footer">
            <p>ليس لديك حساب؟ 
              <router-link to="/register" class="link">
                إنشاء حساب جديد
              </router-link>
            </p>
          </div>
        </form>

        <!-- رسائل الخطأ -->
        <div v-if="error" class="alert alert-error">
          ❌ {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import { ref, reactive } from 'vue'
// import { useRouter } from 'vue-router'
// import { useAuthStore } from '../store'
// import { authService } from '../services'

export default {
  name: 'LoginPage',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    
    const form = reactive({
      email: '',
      password: '',
      remember: false
    })
    
    const loading = ref(false)
    const error = ref('')

    const handleLogin = async () => {
      if (!form.email || !form.password) {
        error.value = 'جميع الحقول مطلوبة'
        return
      }

      loading.value = true
      error.value = ''

      try {
        const response = await authService.login({
          email: form.email,
          password: form.password
        })

        // حفظ بيانات المستخدم
        authStore.setAuth(response.data.user, response.data.token)
        
        // التوجيه إلى الصفحة الرئيسية
        router.push('/feed')
        
      } catch (err) {
        error.value = err.response?.data?.message || 'حدث خطأ أثناء تسجيل الدخول'
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      error,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
  color: #333;
  margin-bottom: 10px;
  font-size: 1.8rem;
}

.login-header p {
  color: #666;
  font-size: 0.95rem;
}

.login-form {
  space-y: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.forgot-link {
  color: #007bff;
  text-decoration: none;
  font-size: 0.9rem;
}

.forgot-link:hover {
  text-decoration: underline;
}

.btn-block {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  margin-bottom: 20px;
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.login-footer p {
  color: #666;
  margin: 0;
}

.link {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

.alert {
  padding: 12px 15px;
  border-radius: 8px;
  margin-top: 20px;
  font-size: 0.9rem;
}

.alert-error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>