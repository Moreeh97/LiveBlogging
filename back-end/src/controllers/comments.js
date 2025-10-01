import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

// إضافة تعليق
export const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const postId = req.params.id;
        const author = req.user.userId;

        console.log('=== بدء إضافة تعليق ===');
        console.log('Post ID:', postId);
        console.log('Author ID:', author);
        console.log('Content:', content);

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'محتوى التعليق مطلوب'
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'التدوينة غير موجودة'
            });
        }

        console.log('✅ التدوينة موجودة');

        // إنشاء التعليق الجديد
        const newComment = new Comment({
            content: content.trim(),
            author: author,
            post: postId
        });

        console.log('✅ تم إنشاء كائن التعليق');

        // حفظ التعليق
        const savedComment = await newComment.save();
        console.log('✅ تم حفظ التعليق:', savedComment._id);

        // تهيئة حقل comments إذا كان undefined
        if (!post.comments) {
            post.comments = [];
        }

        // إضافة التعليق للتدوينة
        post.comments.push(savedComment._id);
        await post.save();
        console.log('✅ تم تحديث التدوينة');

        // تحميل بيانات المؤلف
        await savedComment.populate('author', 'username email');
        console.log('✅ تم تحميل بيانات المؤلف');

        // إعداد الـ response
        const commentResponse = {
            _id: savedComment._id,
            content: savedComment.content,
            author: {
                _id: savedComment.author._id,
                username: savedComment.author.username,
                email: savedComment.author.email
            },
            post: savedComment.post,
            likes: savedComment.likes || [],
            isBlocked: savedComment.isBlocked,
            createdAt: savedComment.createdAt,
            updatedAt: savedComment.updatedAt
        };

        console.log('✅ الـ response جاهز:', commentResponse);

        // إرسال event عبر Socket.io
        if (req.io) {
            req.io.emit('newComment', { 
                postId: postId, 
                comment: commentResponse 
            });
            console.log('✅ تم إرسال event عبر Socket.io');
        }


        // إرسال الـ response
        console.log('✅ إرسال الـ response إلى العميل');
        res.status(201).json({
            success: true,
            message: 'تم إضافة التعليق بنجاح',
            comment: commentResponse
        });

        console.log('=== انتهاء إضافة تعليق بنجاح ===');

    } catch (error) {
        console.error('❌ خطأ في addComment:', error);
        console.error('❌ تفاصيل الخطأ:', error.message);
        console.error('❌ stack:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إضافة التعليق',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// الحصول على تعليقات تدوينة
export const getComments = async (req, res) => {
    try {
        const postId = req.params.id;

        // التحقق من صحة postId
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: 'معرّف التدوينة غير صالح'
            });
        }

        const comments = await Comment.find({ 
            post: postId, 
            isBlocked: false 
        })
        .populate('author', 'username email')
        .sort({ createdAt: -1 })
        .lean();

        res.json({
            success: true,
            comments: comments
        });

    } catch (error) {
        console.error('Error getting comments:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب التعليقات'
        });
    }
};

// حذف تعليق
export const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        
        console.log('=== بدء حذف تعليق ===');
        console.log('Comment ID:', commentId);

        const comment = await Comment.findById(commentId);
        
        if (!comment) {
            console.log('❌ التعليق غير موجود');
            return res.status(404).json({
                success: false,
                message: 'التعليق غير موجود'
            });
        }

        console.log('✅ التعليق موجود:', comment._id);

        // إزالة التعليق من التدوينة
        await Post.findByIdAndUpdate(comment.post, {
            $pull: { comments: comment._id }
        });
        console.log('✅ تم إزالة التعليق من التدوينة');

        await Comment.deleteOne({ _id: comment._id });
        console.log('✅ تم حذف التعليق من قاعدة البيانات');

        res.json({
            success: true,
            message: 'تم حذف التعليق بنجاح'
        });

        console.log('=== انتهاء حذف تعليق بنجاح ===');

    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء حذف التعليق'
        });
    }
};