<template>
  <div class="post-card card">
    <!-- رأس البطاقة -->
    <div class="post-header">
      <div class="user-info">
        <div class="avatar">
          {{ post.author?.username?.charAt(0)?.toUpperCase() || 'U' }}
        </div>
        <div class="user-details">
          <div class="username">{{ post.author?.username || 'مستخدم' }}</div>
          <div class="post-time">{{ formatTime(post.createdAt) }}</div>
        </div>
      </div>
      
      <div class="post-actions" v-if="canDelete">
        <button @click="deletePost" class="btn-icon" title="حذف التدوينة">
          🗑️
        </button>
      </div>
    </div>

    <!-- محتوى البطاقة -->
    <div class="post-content">
      <p>{{ post.content }}</p>
      <img 
        v-if="post.image" 
        :src="post.image" 
        :alt="post.content"
        class="post-image"
        @click="openImage"
      >
    </div>

    <!-- إحصائيات البطاقة -->
    <div class="post-stats">
      <span class="likes-count">❤️ {{ post.likes?.length || 0 }}</span>
      <span class="comments-count">💬 {{ post.comments?.length || 0 }}</span>
    </div>

    <!-- تفاعلات البطاقة -->
    <div class="post-actions-bar">
      <button 
        @click="toggleLike" 
        :class="['action-btn', { liked: isLiked }]"
      >
        {{ isLiked ? '❤️ معجب به' : '🤍 إعجاب' }}
      </button>
      
      <button 
        @click="toggleComments" 
        class="action-btn"
      >
        💬 تعليق
      </button>
    </div>

    <!-- قسم التعليقات -->
    <div v-if="showComments" class="comments-section">
      <!-- إضافة تعليق جديد -->
      <div class="add-comment">
        <input
          v-model="newComment"
          @keypress.enter="addComment"
          placeholder="اكتب تعليقك..."
          class="comment-input"
        >
        <button @click="addComment" class="btn btn-primary btn-sm">
          نشر
        </button>
      </div>

      <!-- قائمة التعليقات -->
      <div class="comments-list">
        <div 
          v-for="comment in post.comments" 
          :key="comment._id"
          class="comment-item"
        >
          <div class="comment-header">
            <span class="comment-author">{{ comment.author?.username }}</span>
            <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
            <button 
              v-if="canDeleteComment(comment)"
              @click="deleteComment(comment._id)"
              class="btn-icon btn-sm"
              title="حذف التعليق"
            >
              🗑️
            </button>
          </div>
          <p class="comment-content">{{ comment.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useAuthStore, usePostStore } from '../store/index.js'
import { postService, commentService } from '../services/api.js'

export default {
  name: 'PostCard',
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const authStore = useAuthStore()
    const postStore = usePostStore()
    const showComments = ref(false)
    const newComment = ref('')
    const commentLoading = ref(false)

    const isLiked = computed(() => {
      return props.post.likes?.includes(authStore.user?._id)
    })

    const canDelete = computed(() => {
      return authStore.isAdmin || props.post.author?._id === authStore.user?._id
    })

    const canDeleteComment = (comment) => {
      return authStore.isAdmin || comment.author?._id === authStore.user?._id
    }

    const formatTime = (timestamp) => {
      if (!timestamp) return ''
      return new Date(timestamp).toLocaleString('ar-EG')
    }

    const toggleLike = async () => {
      try {
        await postService.likePost(props.post._id)
        postStore.toggleLike(props.post._id, authStore.user._id)
      } catch (error) {
        console.error('Error toggling like:', error)
        alert('❌ حدث خطأ أثناء التفاعل مع التدوينة')
      }
    }

    const toggleComments = () => {
      showComments.value = !showComments.value
    }

    const addComment = async () => {
      if (!newComment.value.trim()) return

      commentLoading.value = true
      
      try {
        console.log('Adding comment to post:', props.post._id)
        console.log('Comment content:', newComment.value.trim())
        
        const response = await commentService.addComment(props.post._id, {
          content: newComment.value.trim()
        })
        
        console.log('Comment added successfully:', response.data)
        
        postStore.addComment(props.post._id, response.data.comment)
        newComment.value = ''
        
      } catch (error) {
        console.error('Error adding comment:', error)
        console.error('Error response:', error.response)
        
        if (error.response?.data?.message) {
          alert(`❌ ${error.response.data.message}`)
        } else {
          alert('❌ حدث خطأ أثناء إضافة التعليق')
        }
      } finally {
        commentLoading.value = false
      }
    }

    const deletePost = async () => {
      if (!confirm('هل أنت متأكد من حذف هذه التدوينة؟')) return

      try {
        await postService.deletePost(props.post._id)
        postStore.removePost(props.post._id)
        alert('✅ تم حذف التدوينة بنجاح')
      } catch (error) {
        console.error('Error deleting post:', error)
        alert('❌ حدث خطأ أثناء حذف التدوينة')
      }
    }

    const deleteComment = async (commentId) => {
      if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return

      try {
        await commentService.deleteComment(commentId)
        // إزالة التعليق من القائمة المحلية
        const post = postStore.posts.find(p => p._id === props.post._id)
        if (post && post.comments) {
          post.comments = post.comments.filter(c => c._id !== commentId)
        }
      } catch (error) {
        console.error('Error deleting comment:', error)
        alert('❌ حدث خطأ أثناء حذف التعليق')
      }
    }

    const openImage = () => {
      if (props.post.image) {
        window.open(props.post.image, '_blank')
      }
    }

    return {
      showComments,
      newComment,
      commentLoading,
      isLiked,
      canDelete,
      canDeleteComment,
      formatTime,
      toggleLike,
      toggleComments,
      addComment,
      deletePost,
      deleteComment,
      openImage
    }
  }
}
</script>

<style scoped>
.post-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
}

.user-details .username {
  font-weight: bold;
  color: #333;
}

.user-details .post-time {
  font-size: 0.8rem;
  color: #666;
}

.post-actions .btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.post-actions .btn-icon:hover {
  background: #f8f9fa;
}

.post-content p {
  margin-bottom: 15px;
  line-height: 1.6;
  color: #333;
}

.post-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
  cursor: zoom-in;
  transition: transform 0.3s ease;
}

.post-image:hover {
  transform: scale(1.02);
}

.post-stats {
  display: flex;
  gap: 15px;
  margin: 15px 0;
  padding: 10px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.9rem;
  color: #666;
}

.post-actions-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.action-btn {
  flex: 1;
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.action-btn:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
}

.action-btn.liked {
  background: #fff5f5;
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.comments-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 15px;
}

.add-comment {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.comment-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 20px;
  outline: none;
}

.comment-input:focus {
  border-color: #007bff;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 0.8rem;
}

.comments-list {
  space-y: 12px;
}

.comment-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 10px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.comment-author {
  font-weight: bold;
  color: #333;
  font-size: 0.9rem;
}

.comment-time {
  font-size: 0.8rem;
  color: #666;
}

.comment-content {
  margin: 0;
  color: #333;
  line-height: 1.5;
}

.btn-icon.btn-sm {
  padding: 2px 6px;
  font-size: 0.8rem;
}
</style>