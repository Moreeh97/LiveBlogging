import express from 'express';
import { register, login, getProfile } from '../controllers/auth.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Routes
router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);

export default router;