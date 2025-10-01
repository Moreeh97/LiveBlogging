import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// middleware للتحقق من المصادقة
export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'مطلوب مصادقة. يرجى تسجيل الدخول'
            });
        }

        const token = authHeader.substring(7);

        // التحقق من الtoken
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // التحقق من وجود المستخدم
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        // التحقق من حالة الحساب
        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: 'الحساب موقوف. يرجى التواصل مع الإدارة'
            });
        }

        // إضافة بيانات المستخدم إلى request
        req.user = {
            userId: user._id,
            role: user.role,
            username: user.username
        };

        next();

    } catch (error) {
        console.error('Authentication error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token غير صالح'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'انتهت صلاحية الToken'
            });
        }

        res.status(500).json({
            success: false,
            message: 'خطأ في المصادقة'
        });
    }
};

// middleware للتحقق من صلاحيات المشرف
export const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'غير مصرح. مطلوب صلاحيات مشرف'
        });
    }
    next();
};

// middleware للتحقق من ملكية المحتوى أو صلاحيات المشرف
export const authorizeContent = (model) => {
    return async (req, res, next) => {
        try {
            const resource = await model.findById(req.params.id);
            
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'المورد غير موجود'
                });
            }

            // التحقق إذا كان المستخدم هو المالك أو مشرف
            const isOwner = resource.author && resource.author.toString() === req.user.userId;
            const isAdmin = req.user.role === 'admin';

            if (!isOwner && !isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: 'غير مصرح. لا تملك صلاحية التعديل على هذا المورد'
                });
            }

            req.resource = resource;
            next();

        } catch (error) {
            console.error('Authorization error:', error);
            res.status(500).json({
                success: false,
                message: 'خطأ في التحقق من الصلاحيات'
            });
        }
    };
};