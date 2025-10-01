import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

// إنشاء تدوينة جديدة
export const createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const author = req.user.userId;

        console.log('Request body:', req.body);
        console.log('Request file:', req.file);
        console.log('User ID:', author);

        if (!content || !content.trim()) {
            return res.status(400).json({
                success: false,
                message: 'محتوى التدوينة مطلوب'
            });
        }

        // بناء بيانات التدوينة
        const postData = {
            content: content.trim(),
            author: author
        };

        // إضافة الصورة إذا كانت موجودة
        if (req.file) {
            postData.image = `/uploads/${req.file.filename}`;
        }

        const newPost = new Post(postData);
        await newPost.save();
        
        // تحميل بيانات المؤلف
        await newPost.populate('author', 'username email');

        console.log('New post created:', newPost);

        // إرسال event عبر Socket.io
        if (req.io) {
            req.io.emit('newPost', newPost);
        }

        res.status(201).json({
            success: true,
            message: 'تم نشر التدوينة بنجاح',
            post: newPost
        });

    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إنشاء التدوينة',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// الحصول على جميع التدوينات
export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find({ isPublished: true, isBlocked: false })
            .populate('author', 'username email')
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            posts: posts
        });

    } catch (error) {
        console.error('Error getting posts:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب التدوينات'
        });
    }
};

// الحصول على تدوينة محددة
export const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'username email');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'التدوينة غير موجودة'
            });
        }

        res.json({
            success: true,
            post: post
        });

    } catch (error) {
        console.error('Error getting post:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب التدوينة'
        });
    }
};

// الإعجاب أو إلغاء الإعجاب بتدوينة
export const likePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.userId;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'التدوينة غير موجودة'
            });
        }

        const likeIndex = post.likes.indexOf(userId);
        let action;

        if (likeIndex > -1) {
            // إلغاء الإعجاب
            post.likes.splice(likeIndex, 1);
            action = 'unliked';
        } else {
            // إضافة إعجاب
            post.likes.push(userId);
            action = 'liked';
        }

        await post.save();

        // إرسال event عبر Socket.io
        if (req.io) {
            req.io.emit('postLiked', { postId, userId, action });
        }

        res.json({
            success: true,
            message: action === 'liked' ? 'تم الإعجاب بالتدوينة' : 'تم إلغاء الإعجاب',
            likes: post.likes.length
        });

    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء التفاعل مع التدوينة'
        });
    }
};

// حذف تدوينة
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'التدوينة غير موجودة'
            });
        }

        await Post.deleteOne({ _id: post._id });

        // إرسال event عبر Socket.io
        if (req.io) {
            req.io.emit('postDeleted', post._id);
        }

        res.json({
            success: true,
            message: 'تم حذف التدوينة بنجاح'
        });

    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء حذف التدوينة'
        });
    }
};