<template>
  <div class="register-page">
    <div class="container">
      <div class="register-card card">
        <div class="register-header">
          <h1>🌟 إنشاء حساب جديد</h1>
          <p>انضم إلى مجتمعنا وابدأ مشاركة أفكارك</p>
        </div>

        <form @submit.prevent="handleRegister" class="register-form">
          <div class="form-row">
            <div class="form-group">
              <label for="username">اسم المستخدم</label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                class="form-control"
                placeholder="اختر اسم مستخدم"
                required
                minlength="3"
              >
            </div>

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
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="password">كلمة المرور</label>
              <input
                id="password"
                v-model="form.password"
                type="password"
                class="form-control"
                placeholder="اختر كلمة مرور قوية"
                required
                minlength="6"
              >
            </div>

            <div class="form-group">
              <label for="confirmPassword">تأكيد كلمة المرور</label>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                type="password"
                class="form-control"
                placeholder="أعد إدخال كلمة المرور"
                required
              >
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.agreeToTerms" required>
              <span>أوافق على <a href="#" class="terms-link">شروط الخدمة</a> و <a href="#" class="terms-link">سياسة الخصوصية</a></span>
            </label>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary btn-block"
            :disabled="loading"
          >
            <span v-if="loading">⏳ جاري إنشاء الحساب...</span>
            <span v-else>🚀 إنشاء الحساب</span>
          </button>

          <div class="register-footer">
            <p>لديك حساب بالفعل؟ 
              <router-link to="/login" class="link">
                سجل الدخول
              </router-link>
            </p>
          </div>
        </form>

        <!-- رسائل الخطأ -->
        <div v-if="error" class="alert alert-error">
          ❌ {{ error }}
        </div>

        <!-- رسائل النجاح -->
        <div v-if="success" class="alert alert-success">
          ✅ {{ success }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/index.js'
import { authService } from '../services/api.js'

export default {
  name: 'RegisterPage',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    
    const form = reactive({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    })
    
    const loading = ref(false)
    const error = ref('')
    const success = ref('')

    // مراقبة تغييرات الحقول لإزالة رسائل الخطأ
    watch(form, () => {
      if (error.value) error.value = ''
    })

    const validateForm = () => {
      if (form.password !== form.confirmPassword) {
        error.value = 'كلمات المرور غير متطابقة'
        return false
      }
      
      if (form.password.length < 6) {
        error.value = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
        return false
      }
      
      if (!form.agreeToTerms) {
        error.value = 'يجب الموافقة على الشروط والأحكام'
        return false
      }
      
      return true
    }

    const handleRegister = async () => {
      if (!validateForm()) return

      loading.value = true
      error.value = ''

      try {
        const response = await authService.register({
          username: form.username,
          email: form.email,
          password: form.password
        })

        success.value = 'تم إنشاء الحساب بنجاح! جاري توجيهك...'
        
        // تسجيل الدخول تلقائياً بعد التسجيل
        setTimeout(async () => {
          authStore.setAuth(response.data.user, response.data.token)
          router.push('/feed')
        }, 2000)
        
      } catch (err) {
        error.value = err.response?.data?.message || 'حدث خطأ أثناء إنشاء الحساب'
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      error,
      success,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  color: #333;
  margin-bottom: 10px;
  font-size: 1.8rem;
}

.register-header p {
  color: #666;
  font-size: 0.95rem;
}

.register-form {
  space-y: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
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

.terms-link {
  color: #007bff;
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.btn-block {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
  margin-bottom: 20px;
}

.register-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.register-footer p {
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

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>