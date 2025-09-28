<template>
  <div class="admin-page">
    <div class="container">
      <div class="admin-header">
        <h1>⚙️ لوحة التحكم</h1>
        <p>إدارة المستخدمين والمحتوى في المنصة</p>
      </div>

      <!-- إحصائيات سريعة -->
      <div class="admin-stats">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalUsers }}</div>
            <div class="stat-label">مستخدم</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalPosts }}</div>
            <div class="stat-label">تدوينة</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">💬</div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalComments }}</div>
            <div class="stat-label">تعليق</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">❤️</div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.totalLikes }}</div>
            <div class="stat-label">إعجاب</div>
          </div>
        </div>
      </div>

      <!-- أقسام الإدارة -->
      <div class="admin-sections">
        <!-- إدارة المستخدمين -->
        <div class="admin-section card">
          <div class="section-header">
            <h3>👥 إدارة المستخدمين</h3>
          </div>
          
          <div class="section-content">
            <LoadingSpinner v-if="loadingUsers" size="small" />
            
            <div v-else class="users-list">
              <div 
                v-for="user in users" 
                :key="user._id"
                class="user-item"
              >
                <div class="user-info">
                  <div class="user-avatar">
                    {{ user.username?.charAt(0)?.toUpperCase() }}
                  </div>
                  <div class="user-details">
                    <div class="user-name">{{ user.username }}</div>
                    <div class="user-email">{{ user.email }}</div>
                    <div class="user-role">
                      <span :class="['role-badge', user.role]">
                        {{ user.role === 'admin' ? 'مشرف' : 'مستخدم' }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="user-actions">
                  <button 
                    v-if="user.role !== 'admin'"
                    @click="deleteUser(user._id)"
                    class="btn btn-danger btn-sm"
                    title="حذف المستخدم"
                  >
                    🗑️ حذف
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- إدارة التدوينات -->
        <div class="admin-section card">
          <div class="section-header">
            <h3>📝 إدارة التدوينات</h3>
          </div>
          
          <div class="section-content">
            <div class="posts-list">
              <div 
                v-for="post in recentPosts" 
                :key="post._id"
                class="post-item"
              >
                <div class="post-content">
                  <div class="post-author">
                    {{ post.author?.username }}
                  </div>
                  <p class="post-text">{{ post.content }}</p>
                  <div class="post-meta">
                    <span class="post-time">{{ formatTime(post.createdAt) }}</span>
                    <span class="post-stats">
                      ❤️ {{ post.likes?.length || 0 }} | 
                      💬 {{ post.comments?.length || 0 }}
                    </span>
                  </div>
                </div>
                
                <div class="post-actions">
                  <button 
                    @click="deletePost(post._id)"
                    class="btn btn-danger btn-sm"
                    title="حذف التدوينة"
                  >
                    🗑️ حذف
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import { ref, reactive, onMounted } from 'vue'
// import { usePostStore } from '../store'
// import { adminService } from '../services'
// import LoadingSpinner from '../components/LoadingSpinner.vue'

// export default {
//   name: 'AdminPanel',
//   components: {
//     LoadingSpinner
//   },
//   setup() {
//     const postStore = usePostStore()
    
//     const loadingUsers = ref(false)
//     const users = ref([])
    
//     const stats = reactive({
//       totalUsers: 0,
//       totalPosts: 0,
//       totalComments: 0,
//       totalLikes: 0
//     })

//     const recentPosts = postStore.posts.slice(0, 10) // آخر 10 تدوينات

//     const loadUsers = async () => {
//       loadingUsers.value = true
//       try {
//         // سيتم تفعيل هذه الخدمة لاحقاً
//         // const response = await adminService.getUsers()
//         // users.value = response.data
        
//         // بيانات تجريبية
//         users.value = [
//           {
//             _id: '1',
//             username: 'admin',
//             email: 'admin@example.com',
//             role: 'admin'
//           },
//           {
//             _id: '2',
//             username: 'user1',
//             email: 'user1@example.com',
//             role: 'user'
//           }
//         ]
        
//         stats.totalUsers = users.value.length
//         stats.totalPosts = postStore.posts.length
//         stats.totalComments = postStore.posts.reduce((total, post) => {
//           return total + (post.comments?.length || 0)
//         }, 0)
//         stats.totalLikes = postStore.posts.reduce((total, post) => {
//           return total + (post.likes?.length || 0)
//         }, 0)
        
//       } catch (error) {
//         console.error('Error loading users:', error)
//         alert('❌ حدث خطأ أثناء تحميل بيانات المستخدمين')
//       } finally {
//         loadingUsers.value = false
//       }
//     }

//     const deleteUser = async (userId) => {
//       if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.')) {
//         return
//       }

//       try {
//         // await adminService.deleteUser(userId)
//         users.value = users.value.filter(user => user._id !== userId)
//         stats.totalUsers--
//         alert('✅ تم حذف المستخدم بنجاح')
//       } catch (error) {
//         console.error('Error deleting user:', error)
//         alert('❌ حدث خطأ أثناء حذف المستخدم')
//       }
//     }

//     const deletePost = async (postId) => {
//       if (!confirm('هل أنت متأكد من حذف هذه التدوينة؟')) {
//         return
//       }

//       try {
//         // await adminService.deletePost(postId)
//         postStore.removePost(postId)
//         stats.totalPosts--
//         alert('✅ تم حذف التدوينة بنجاح')
//       } catch (error) {
//         console.error('Error deleting post:', error)
//         alert('❌ حدث خطأ أثناء حذف التدوينة')
//       }
//     }

//     const formatTime = (timestamp) => {
//       return new Date(timestamp).toLocaleString('ar-EG')
//     }

//     onMounted(() => {
//       loadUsers()
//     })

//     return {
//       loadingUsers,
//       users,
//       stats,
//       recentPosts,
//       deleteUser,
//       deletePost,
//       formatTime
//     }
//   }
// }
</script>

<style scoped>
.admin-page {
  padding: 20px 0;
}

.admin-header {
  text-align: center;
  margin-bottom: 30px;
}

.admin-header h1 {
  color: #333;
  margin-bottom: 10px;
}

.admin-header p {
  color: #666;
  font-size: 1.1rem;
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2rem;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  line-height: 1;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.admin-sections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.admin-section {
  margin-bottom: 0;
}

.section-header {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  color: #333;
}

.users-list,
.posts-list {
  space-y: 15px;
  max-height: 400px;
  overflow-y: auto;
}

.user-item,
.post-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.user-info {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: bold;
  color: #333;
  margin-bottom: 2px;
}

.user-email {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 5px;
}

.role-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
}

.role-badge.admin {
  background: #fff3cd;
  color: #856404;
}

.role-badge.user {
  background: #d1ecf1;
  color: #0c5460;
}

.post-content {
  flex: 1;
}

.post-author {
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
  font-size: 0.9rem;
}

.post-text {
  margin: 0 0 8px 0;
  color: #333;
  line-height: 1.4;
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #666;
}

.post-time {
  font-size: 0.7rem;
}

.post-stats {
  font-size: 0.7rem;
}

.user-actions,
.post-actions {
  flex-shrink: 0;
  margin-left: 10px;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

@media (max-width: 1024px) {
  .admin-sections {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .user-item,
  .post-item {
    flex-direction: column;
    gap: 10px;
  }
  
  .user-actions,
  .post-actions {
    align-self: flex-end;
    margin-left: 0;
  }
}
</style>