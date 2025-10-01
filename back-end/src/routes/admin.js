import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

const router = express.Router();

// الحصول على جميع المستخدمين
router.get('/users', authenticate, requireAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({
            success: true,
            users: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب المستخدمين'
        });
    }
});

// حذف مستخدم
router.delete('/users/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        // منع حذف الحساب الحالي
        if (user._id.toString() === req.user.userId) {
            return res.status(400).json({
                success: false,
                message: 'لا يمكن حذف حسابك الشخصي'
            });
        }

        await User.deleteOne({ _id: user._id });
        
        // حذف تدوينات المستخدم وتعليقاته
        await Post.deleteMany({ author: user._id });
        await Comment.deleteMany({ author: user._id });

        res.json({
            success: true,
            message: 'تم حذف المستخدم وجميع محتوياته بنجاح'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء حذف المستخدم'
        });
    }
});

// حذف تدوينة (للمشرف)
router.delete('/posts/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'التدوينة غير موجودة'
            });
        }

        await Post.deleteOne({ _id: post._id });
        await Comment.deleteMany({ post: post._id });

        res.json({
            success: true,
            message: 'تم حذف التدوينة بنجاح'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء حذف التدوينة'
        });
    }
});

// حذف تعليق (للمشرف)
router.delete('/comments/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'التعليق غير موجود'
            });
        }

        await Comment.deleteOne({ _id: comment._id });
        
        // إزالة التعليق من التدوينة
        await Post.findByIdAndUpdate(comment.post, {
            $pull: { comments: comment._id }
        });

        res.json({
            success: true,
            message: 'تم حذف التعليق بنجاح'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء حذف التعليق'
        });
    }
});

export default router;