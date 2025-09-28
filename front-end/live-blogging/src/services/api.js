import axios from 'axios'

const API_BASE_URL = 'http://localhost:3000/api'

// إنشاء instance من axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// إضافة token لطلبات المصادقة
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// auth services
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile')
}

// blog services
export const postService = {
  getPosts: () => api.get('/posts'),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (postData) => api.post('/posts', postData),
  deletePost: (id) => api.delete(`/posts/${id}`),
  likePost: (id) => api.post(`/posts/${id}/like`)
}

// comment services
export const commentService = {
  getComments: (postId) => api.get(`/posts/${postId}/comments`),
  addComment: (postId, commentData) => api.post(`/posts/${postId}/comments`, commentData),
  deleteComment: (id) => api.delete(`/comments/${id}`)
}

// admin services
export const adminService = {
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  deletePost: (id) => api.delete(`/admin/posts/${id}`),
  deleteComment: (id) => api.delete(`/admin/comments/${id}`)
}

export default api