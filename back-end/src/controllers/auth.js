import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import jwtConfig from '../config/jwt.js';

// تسجيل مستخدم جديد
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // التحقق من وجود البيانات المطلوبة
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'جميع الحقول مطلوبة'
            });
        }

        // التحقق من صحة البريد الإلكتروني
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'صيغة البريد الإلكتروني غير صحيحة'
            });
        }

        // التحقق من طول كلمة المرور
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
            });
        }

        // التحقق من عدم وجود المستخدم مسبقاً
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        });

        if (existingUser) {
            if (existingUser.email === email.toLowerCase()) {
                return res.status(400).json({
                    success: false,
                    message: 'البريد الإلكتروني مسجل مسبقاً'
                });
            }
            if (existingUser.username === username.toLowerCase()) {
                return res.status(400).json({
                    success: false,
                    message: 'اسم المستخدم مسجل مسبقاً'
                });
            }
        }

        // إنشاء المستخدم الجديد (التشفير في middleware)
        const newUser = new User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: password,
            role: 'user' // الدور الافتراضي
        });

        await newUser.save();

        // إنشاء token
        const token = jwt.sign(
            { 
                userId: newUser._id,
                role: newUser.role 
            },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );

        // إرجاع البيانات بدون كلمة المرور
        const userResponse = newUser.toJSON();

        res.status(201).json({
            success: true,
            message: 'تم إنشاء الحساب بنجاح',
            user: userResponse,
            token: token
        });

    } catch (error) {
        console.error('Error in register:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في السيرفر',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// تسجيل الدخول
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // التحقق من وجود البيانات المطلوبة
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'البريد الإلكتروني وكلمة المرور مطلوبان'
            });
        }

        // البحث عن المستخدم
        const user = await User.findOne({ 
            email: email.toLowerCase() 
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            });
        }

        // التحقق من كلمة المرور
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
            });
        }

        // التحقق من حالة الحساب
        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: 'الحساب موقوف. يرجى التواصل مع الإدارة'
            });
        }

        // إنشاء token
        const token = jwt.sign(
            { 
                userId: user._id,
                role: user.role 
            },
            jwtConfig.secret,
            { expiresIn: jwtConfig.expiresIn }
        );

        // تحديث آخر دخول
        user.lastLogin = new Date();
        await user.save();

        // إرجاع البيانات بدون كلمة المرور
        const userResponse = user.toJSON();

        res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            user: userResponse,
            token: token
        });

    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في السيرفر',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// الحصول على بيانات المستخدم الحالي
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        const userResponse = user.toJSON();

        res.json({
            success: true,
            user: userResponse
        });

    } catch (error) {
        console.error('Error in getProfile:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ في السيرفر'
        });
    }
};