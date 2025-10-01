<template>
  <div class="create-post card">
    <h3>✏️ اكتب تدوينة جديدة</h3>
    
    <form @submit.prevent="submitPost" enctype="multipart/form-data">
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
        <span v-if="uploadError" class="error-text">{{ uploadError }}</span>
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
import { usePostStore } from '../store/index.js'
import { postService } from '../services/api.js'

export default {
  name: 'CreatePost',
  setup() {
    const postStore = usePostStore()
    const postContent = ref('')
    const selectedFile = ref(null)
    const fileInput = ref(null)
    const loading = ref(false)
    const uploadError = ref('')
    const maxLength = 1000

    const triggerFileInput = () => {
      fileInput.value.click()
    }

    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      uploadError.value = ''
      
      if (file) {
        // التحقق من نوع الملف
        if (!file.type.startsWith('image/')) {
          uploadError.value = 'يسمح برفع الصور فقط'
          selectedFile.value = null
          fileInput.value.value = ''
          return
        }

        // التحقق من حجم الملف (5MB كحد أقصى)
        if (file.size > 5 * 1024 * 1024) {
          uploadError.value = 'حجم الصورة يجب أن يكون أقل من 5MB'
          selectedFile.value = null
          fileInput.value.value = ''
          return
        }
        
        selectedFile.value = file
      }
    }

    const submitPost = async () => {
      if (!postContent.value.trim()) return

      loading.value = true
      uploadError.value = ''
      
      try {
        const formData = new FormData()
        formData.append('content', postContent.value.trim())
        
        if (selectedFile.value) {
          formData.append('image', selectedFile.value)
        }

        console.log('Sending post data...')
        const response = await postService.createPost(formData)
        console.log('Post created successfully:', response.data)
        
        postStore.addPost(response.data.post)
        
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
        
        if (error.response?.data?.message) {
          uploadError.value = error.response.data.message
        } else {
          uploadError.value = '❌ حدث خطأ أثناء نشر التدوينة'
        }
        
        alert(uploadError.value)
      } finally {
        loading.value = false
      }
    }

    return {
      postContent,
      selectedFile,
      fileInput,
      loading,
      uploadError,
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
  margin-right: 10px;
}

.btn-outline:hover {
  background: #007bff;
  color: white;
}

.file-name {
  color: #666;
  font-size: 0.9rem;
}

.error-text {
  color: #dc3545;
  font-size: 0.8rem;
  display: block;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
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