<template>
  <div class="feed-page">
    <div class="container">
      <!-- إنشاء تدوينة جديدة -->
      <CreatePost />

      <!-- حالة التحميل -->
      <LoadingSpinner 
        v-if="loading && posts.length === 0" 
        message="جاري تحميل التدوينات..."
        size="large"
      />

      <!-- قائمة التدوينات -->
      <div v-else>
        <div class="posts-header">
          <h2>📝 آخر التدوينات</h2>
          <div class="posts-stats">
            <span class="posts-count">{{ posts.length }} تدوينة</span>
          </div>
        </div>

        <!-- لا توجد تدوينات -->
        <div v-if="posts.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>لا توجد تدوينات بعد</h3>
          <p>كن أول من يشارك تدوينة جديدة!</p>
        </div>

        <!-- قائمة التدوينات -->
        <div class="posts-list">
          <PostCard 
            v-for="post in posts" 
            :key="post._id" 
            :post="post"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { usePostStore, useAuthStore } from '../store/index.js'
import { postService } from '../services/api.js'
import socketService from '../services/socket.js'
import CreatePost from '../components/CreatePost.vue'
import PostCard from '../components/PostCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

export default {
  name: 'FeedPage',
  components: {
    CreatePost,
    PostCard,
    LoadingSpinner
  },
  setup() {
    const postStore = usePostStore()
    const authStore = useAuthStore()
    const loading = ref(false)

    const posts = postStore.posts

    const loadPosts = async () => {
      loading.value = true
      try {
        const response = await postService.getPosts()
        postStore.setPosts(response.data.posts || [])
      } catch (error) {
        console.error('Error loading posts:', error)
        alert('❌ حدث خطأ أثناء تحميل التدوينات')
      } finally {
        loading.value = false
      }
    }

    // استماع للتحديثات اللحظية
    const setupSocketListeners = () => {
      // تدوينة جديدة
      socketService.onNewPost((newPost) => {
        postStore.addPost(newPost)
      })

      // تعليق جديد
      socketService.onNewComment(({ postId, comment }) => {
        postStore.addComment(postId, comment)
      })

      // إعجاب جديد
      socketService.onPostLiked(({ postId, userId }) => {
        postStore.toggleLike(postId, userId)
      })

      // حذف تدوينة
      socketService.onPostDeleted((postId) => {
        postStore.removePost(postId)
      })
    }

    onMounted(async () => {
      await loadPosts()
      setupSocketListeners()
    })

    onUnmounted(() => {
      // تنظيف المستمعين
      socketService.removeListener('newPost')
      socketService.removeListener('newComment')
      socketService.removeListener('postLiked')
      socketService.removeListener('postDeleted')
    })

    return {
      posts,
      loading
    }
  }
}
</script>

<style scoped>
.feed-page {
  padding: 20px 0;
}

.posts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.posts-header h2 {
  color: #333;
  margin: 0;
}

.posts-stats {
  color: #666;
  font-size: 0.9rem;
}

.posts-count {
  background: #f8f9fa;
  padding: 5px 10px;
  border-radius: 15px;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-state h3 {
  margin-bottom: 10px;
  color: #333;
}

.empty-state p {
  font-size: 1.1rem;
  margin: 0;
}

.posts-list {
  space-y: 20px;
}

@media (max-width: 768px) {
  .posts-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .feed-page {
    padding: 10px 0;
  }
}
</style>