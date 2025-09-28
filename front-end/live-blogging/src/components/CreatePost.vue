<template>
  <div class="create-post card">
    <h3>✏️ اكتب تدوينة جديدة</h3>
    
    <form @submit.prevent="submitPost">
      <div class="form-group">
        <textarea
          v-model="postContent"
          placeholder="ماذا تريد أن تشارك اليوم؟"
          rows="4"
          class="form-control"
          :maxlength="maxLength"
          required
        ></textarea>
        <div class="char-count">{{ postContent.length }}/{{ maxLength }}</div>
      </div>

      <div class="form-group">
        <input
          type="file"
          ref="fileInput"
          @change="handleFileSelect"
          accept="image/*"
          class="file-input"
        >
        <button type="button" @click="triggerFileInput" class="btn btn-outline">
          📸 إضافة صورة
        </button>
        <span v-if="selectedFile" class="file-name">{{ selectedFile.name }}</span>
      </div>

      <div class="form-actions">
        <button 
          type="submit" 
          class="btn btn-primary"
          :disabled="!postContent.trim() || loading"
        >
          <span v-if="loading">⏳ جاري النشر...</span>
          <span v-else>📤 نشر التدوينة</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref } from 'vue'
import { usePostStore } from '../store'
import { postService } from '../services'

export default {
  name: 'CreatePost',
  setup() {
    const postStore = usePostStore()
    const postContent = ref('')
    const selectedFile = ref(null)
    const fileInput = ref(null)
    const loading = ref(false)
    const maxLength = 1000

    const triggerFileInput = () => {
      fileInput.value.click()
    }

    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        // التحقق من حجم الملف (5MB كحد أقصى)
        if (file.size > 5 * 1024 * 1024) {
          alert('حجم الصورة يجب أن يكون أقل من 5MB')
          return
        }
        selectedFile.value = file
      }
    }

    const submitPost = async () => {
      if (!postContent.value.trim()) return

      loading.value = true
      
      try {
        const formData = new FormData()
        formData.append('content', postContent.value.trim())
        if (selectedFile.value) {
          formData.append('image', selectedFile.value)
        }

        const response = await postService.createPost(formData)
        postStore.addPost(response.data)
        
        // إعادة تعيين النموذج
        postContent.value = ''
        selectedFile.value = null
        if (fileInput.value) {
          fileInput.value.value = ''
        }
        
        // إظهار رسالة نجاح
        alert('✅ تم نشر التدوينة بنجاح!')
      } catch (error) {
        console.error('Error creating post:', error)
        alert('❌ حدث خطأ أثناء نشر التدوينة')
      } finally {
        loading.value = false
      }
    }

    return {
      postContent,
      selectedFile,
      fileInput,
      loading,
      maxLength,
      triggerFileInput,
      handleFileSelect,
      submitPost
    }
  }
}
</script>

<style scoped>
.create-post {
  margin-bottom: 30px;
}

.create-post h3 {
  margin-bottom: 15px;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.char-count {
  text-align: left;
  font-size: 0.8rem;
  color: #666;
  margin-top: 5px;
}

.file-input {
  display: none;
}

.btn-outline {
  background: transparent;
  border: 2px dashed #007bff;
  color: #007bff;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-outline:hover {
  background: #007bff;
  color: white;
}

.file-name {
  margin-right: 10px;
  color: #666;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}
</style>