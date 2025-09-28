import { defineStore } from 'pinia'
import { authService } from '../services/api'
import socketService from '../services/socket'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token')
  }),

  actions: {
    setAuth(user, token) {
      this.user = user
      this.token = token
      this.isAuthenticated = true
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      // توصيل Socket.io
      socketService.connect(token)
    },

    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      socketService.disconnect()
    },

    async checkAuth() {
      if (this.token) {
        try {
          const response = await authService.getProfile()
          this.user = response.data.user
          this.isAuthenticated = true
          socketService.connect(this.token)
        } catch (error) {
          this.logout()
        }
      }
    }
  },

  getters: {
    isAdmin: (state) => state.user?.role === 'admin'
  }
})

export const usePostStore = defineStore('posts', {
  state: () => ({
    posts: [],
    loading: false
  }),

  actions: {
    setPosts(posts) {
      this.posts = posts
    },

    addPost(post) {
      this.posts.unshift(post)
    },

    updatePost(updatedPost) {
      const index = this.posts.findIndex(p => p._id === updatedPost._id)
      if (index !== -1) {
        this.posts.splice(index, 1, updatedPost)
      }
    },

    removePost(postId) {
      this.posts = this.posts.filter(p => p._id !== postId)
    },

    addComment(postId, comment) {
      const post = this.posts.find(p => p._id === postId)
      if (post) {
        if (!post.comments) post.comments = []
        post.comments.push(comment)
      }
    },

    toggleLike(postId, userId) {
      const post = this.posts.find(p => p._id === postId)
      if (post) {
        const likeIndex = post.likes.indexOf(userId)
        if (likeIndex > -1) {
          post.likes.splice(likeIndex, 1)
        } else {
          post.likes.push(userId)
        }
      }
    }
  }
})