import express from 'express';
import { 
    addComment, 
    getComments, 
    deleteComment 
} from '../controllers/comments.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Routes - تصحيح المسارات
router.post('/posts/:id/comments', authenticate, addComment);
router.get('/posts/:id/comments', getComments);
router.delete('/comments/:id', authenticate, deleteComment);

export default router;