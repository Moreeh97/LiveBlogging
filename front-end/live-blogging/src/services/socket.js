import { io } from 'socket.io-client'

class SocketService {
  constructor() {
    this.socket = null
  }

  connect(token) {
    if (!this.socket) {
      this.socket = io('http://localhost:3000', {
        auth: {
          token: token
        }
      })

      this.socket.on('connect', () => {
        console.log('Connected to server')
      })

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server')
      })

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
      })
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  // استماع للأحداث
  onNewPost(callback) {
    if (this.socket) {
      this.socket.on('newPost', callback)
    }
  }

  onNewComment(callback) {
    if (this.socket) {
      this.socket.on('newComment', callback)
    }
  }

  onPostLiked(callback) {
    if (this.socket) {
      this.socket.on('postLiked', callback)
    }
  }

  onPostDeleted(callback) {
    if (this.socket) {
      this.socket.on('postDeleted', callback)
    }
  }

  // إزالة المستمعين
  removeListener(event) {
    if (this.socket) {
      this.socket.off(event)
    }
  }
}

export default new SocketService()