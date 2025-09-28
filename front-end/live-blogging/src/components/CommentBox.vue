<template>
  <div class="comment-box">
    <div class="comment-header">
      <h4>💬 التعليقات ({{ comments.length }})</h4>
    </div>
    
    <!-- إضافة تعليق جديد -->
    <div class="add-comment">
      <textarea
        v-model="newComment"
        placeholder="اكتب تعليقك..."
        rows="3"
        class="comment-textarea"
        :maxlength="maxLength"
      ></textarea>
      <div class="comment-actions">
        <div class="char-count">{{ newComment.length }}/{{ maxLength }}</div>
        <button 
          @click="submitComment" 
          class="btn btn-primary"
          :disabled="!newComment.trim() || loading"
        >
          <span v-if="loading">⏳</span>
          <span v-else>نشر التعليق</span>
        </button>
      </div>
    </div>

    <!-- قائمة التعليقات -->
    <div class="comments-list">
      <div 
        v-for="comment in comments" 
        :key="comment._id"
        class="comment-item"
      >
        <div class="comment-header">
          <div class="comment-user">
            <div class="user-avatar">
              {{ comment.author?.username?.charAt(0)?.toUpperCase() || 'U' }}
            </div>
            <div class="user-info">
              <div class="username">{{ comment.author?.username }}</div>
              <div class="comment-time">{{ formatTime(comment.createdAt) }}</div>
            </div>
          </div>
          
          <button 
            v-if="canDeleteComment(comment)"
            @click="deleteComment(comment._id)"
            class="btn-icon"
            title="حذف التعليق"
          >
            🗑️
          </button>
        </div>
        
        <p class="comment-content">{{ comment.content }}</p>
      </div>
    </div>

    <!-- لا توجد تعليقات -->
    <div v-if="comments.length === 0" class="no-comments">
      <p>لا توجد تعليقات بعد. كن أول من يعلق!</p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useAuthStore } from '../store'

export default {
  name: 'CommentBox',
  props: {
    comments: {
      type: Array,
      default: () => []
    },
    onAddComment: {
      type: Function,
      required: true
    },
    onDeleteComment: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    const authStore = useAuthStore()
    const newComment = ref('')
    const loading = ref(false)
    const maxLength = 500

    const canDeleteComment = (comment) => {
      return authStore.isAdmin || comment.author?._id === authStore.user?._id
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleString('ar-EG')
    }

    const submitComment = async () => {
      if (!newComment.value.trim()) return

      loading.value = true
      try {
        await props.onAddComment(newComment.value.trim())
        newComment.value = ''
      } catch (error) {
        console.error('Error submitting comment:', error)
      } finally {
        loading.value = false
      }
    }

    const deleteComment = async (commentId) => {
      if (!confirm('هل أنت متأكد من حذف هذا التعليق؟')) return
      
      try {
        await props.onDeleteComment(commentId)
      } catch (error) {
        console.error('Error deleting comment:', error)
      }
    }

    return {
      newComment,
      loading,
      maxLength,
      canDeleteComment,
      formatTime,
      submitComment,
      deleteComment
    }
  }
}
</script>

<style scoped>
.comment-box {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.comment-header h4 {
  margin-bottom: 15px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}

.add-comment {
  margin-bottom: 20px;
}

.comment-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 10px;
}

.comment-textarea:focus {
  outline: none;
  border-color: #007bff;
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.char-count {
  font-size: 0.8rem;
  color: #666;
}

.comments-list {
  space-y: 15px;
}

.comment-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.comment-item .comment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  border: none;
  padding: 0;
}

.comment-user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.user-info .username {
  font-weight: bold;
  color: #333;
  font-size: 0.9rem;
}

.user-info .comment-time {
  font-size: 0.8rem;
  color: #666;
}

.comment-content {
  margin: 0;
  color: #333;
  line-height: 1.5;
  font-size: 0.95rem;
}

.no-comments {
  text-align: center;
  padding: 30px;
  color: #666;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.3s;
  font-size: 0.9rem;
}

.btn-icon:hover {
  background: rgba(220, 53, 69, 0.1);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>