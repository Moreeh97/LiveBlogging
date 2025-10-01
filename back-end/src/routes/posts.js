import express from 'express';
import { 
    createPost, 
    getPosts, 
    getPost, 
    likePost, 
    deletePost 
} from '../controllers/posts.js';
import { authenticate, authorizeContent } from '../middleware/auth.js';
import Post from '../models/Post.js';
import upload from '../utils/upload.js';

const router = express.Router();

// Routes
router.post('/', authenticate, upload.single('image'), createPost);
router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/:id/like', authenticate, likePost);
router.delete('/:id', authenticate, deletePost); // إزالة authorizeContent مؤقتاً للتجربة

export default router;