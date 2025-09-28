<template>
  <div class="profile-page">
    <div class="container">
      <!-- حالة التحميل -->
      <LoadingSpinner 
        v-if="loading" 
        message="جاري تحميل الملف الشخصي..."
        size="large"
      />

      <div v-else class="profile-content">
        <!-- رأس الملف الشخصي -->
        <div class="profile-header card">
          <div class="profile-info">
            <div class="profile-avatar">
              {{ userAvatar }}
            </div>
            <div class="profile-details">
              <h1 class="profile-name">{{ user.username }}</h1>
              <p class="profile-email">{{ user.email }}</p>
              <div class="profile-stats">
                <div class="stat">
                  <span class="stat-number">{{ userStats.postsCount }}</span>
                  <span class="stat-label">تدوينة</span>
                </div>
                <div class="stat">
                  <span class="stat-number">{{ userStats.commentsCount }}</span>
                  <span class="stat-label">تعليق</span>
                </div>
                <div class="stat">
                  <span class="stat-number">{{ userStats.likesCount }}</span>
                  <span class="stat-label">إعجاب</span>
                </div>
              </div>
            </div>
          </div>

          <div class="profile-actions">
            <button @click="showEditModal = true" class="btn btn-outline">
              ✏️ تعديل الملف
            </button>
          </div>
        </div>

        <!-- تدوينات المستخدم -->
        <div class="user-posts-section">
          <h2>📝 تدويناتي</h2>
          
          <div v-if="userPosts.length === 0" class="empty-posts">
            <p>لم تقم بنشر أي تدوينات بعد</p>
            <router-link to="/feed" class="btn btn-primary">
              ابدأ بنشر أول تدوينة
            </router-link>
          </div>

          <div v-else class="user-posts">
            <PostCard 
              v-for="post in userPosts" 
              :key="post._id" 
              :post="post"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- modal تعديل الملف -->
    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>✏️ تعديل الملف الشخصي</h3>
          <button @click="showEditModal = false" class="btn-close">&times;</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="updateProfile">
            <div class="form-group">
              <label>اسم المستخدم</label>
              <input 
                v-model="editForm.username" 
                type="text" 
                class="form-control"
                required
              >
            </div>
            
            <div class="form-group">
              <label>البريد الإلكتروني</label>
              <input 
                v-model="editForm.email" 
                type="email" 
                class="form-control"
                required
              >
            </div>

            <div class="form-actions">
              <button 
                type="button" 
                @click="showEditModal = false" 
                class="btn btn-outline"
              >
                إلغاء
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="updating"
              >
                <span v-if="updating">⏳ جاري الحفظ...</span>
                <span v-else>💾 حفظ التغييرات</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore, usePostStore } from '../store'
import PostCard from '../components/PostCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

export default {
  name: 'ProfilePage',
  components: {
    PostCard,
    LoadingSpinner
  },
  setup() {
    const authStore = useAuthStore()
    const postStore = usePostStore()
    
    const loading = ref(false)
    const updating = ref(false)
    const showEditModal = ref(false)
    
    const editForm = reactive({
      username: '',
      email: ''
    })

    const user = computed(() => authStore.user)
    const userPosts = computed(() => {
      if (!user.value) return []
      return postStore.posts.filter(post => post.author?._id === user.value._id)
    })

    const userAvatar = computed(() => {
      return user.value?.username?.charAt(0)?.toUpperCase() || 'U'
    })

    const userStats = computed(() => {
      const postsCount = userPosts.value.length
      const commentsCount = userPosts.value.reduce((total, post) => {
        return total + (post.comments?.length || 0)
      }, 0)
      const likesCount = userPosts.value.reduce((total, post) => {
        return total + (post.likes?.length || 0)
      }, 0)

      return {
        postsCount,
        commentsCount,
        likesCount
      }
    })

    const loadUserData = async () => {
      loading.value = true
      try {
        // يتم تحميل البيانات من خلال الstore
        await authStore.checkAuth()
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        loading.value = false
      }
    }

    const updateProfile = async () => {
      if (!editForm.username.trim() || !editForm.email.trim()) {
        alert('جميع الحقول مطلوبة')
        return
      }

      updating.value = true
      try {
        // هنا سيتم إضافة خدمة تحديث الملف الشخصي
        // await authService.updateProfile(editForm)
        authStore.user.username = editForm.username
        authStore.user.email = editForm.email
        
        showEditModal.value = false
        alert('✅ تم تحديث الملف الشخصي بنجاح')
      } catch (error) {
        console.error('Error updating profile:', error)
        alert('❌ حدث خطأ أثناء تحديث الملف الشخصي')
      } finally {
        updating.value = false
      }
    }

    onMounted(() => {
      loadUserData()
      
      // تعبئة نموذج التعديل ببيانات المستخدم الحالية
      if (user.value) {
        editForm.username = user.value.username
        editForm.email = user.value.email
      }
    })

    return {
      loading,
      updating,
      showEditModal,
      editForm,
      user,
      userPosts,
      userAvatar,
      userStats,
      updateProfile
    }
  }
}
</script>

<style scoped>
.profile-page {
  padding: 20px 0;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.profile-info {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
  flex-shrink: 0;
}

.profile-details {
  flex: 1;
}

.profile-name {
  margin: 0 0 5px 0;
  color: #333;
  font-size: 1.5rem;
}

.profile-email {
  margin: 0 0 15px 0;
  color: #666;
}

.profile-stats {
  display: flex;
  gap: 30px;
}

.stat {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
}

.profile-actions {
  flex-shrink: 0;
}

.btn-outline {
  background: transparent;
  border: 2px solid #007bff;
  color: #007bff;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-outline:hover {
  background: #007bff;
  color: white;
}

.user-posts-section {
  margin-top: 30px;
}

.user-posts-section h2 {
  margin-bottom: 20px;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.empty-posts {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.empty-posts p {
  margin-bottom: 20px;
  color: #666;
  font-size: 1.1rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    gap: 20px;
  }
  
  .profile-info {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-stats {
    justify-content: center;
  }
  
  .profile-actions {
    align-self: stretch;
  }
  
  .btn-outline {
    width: 100%;
  }
}
</style>