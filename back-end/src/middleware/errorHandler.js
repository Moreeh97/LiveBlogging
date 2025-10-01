// معالج الأخطاء المركزي
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // خطأ في التحقق من الصحة
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(error => error.message);
        return res.status(400).json({
            success: false,
            message: 'خطأ في التحقق من البيانات',
            errors: errors
        });
    }

    // خطأ في تكرار البيانات
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `${field} مسجل مسبقاً`
        });
    }

    // خطأ في تنسيق الObjectId
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'معرّف غير صالح'
        });
    }

    // خطأ افتراضي
    res.status(500).json({
        success: false,
        message: 'حدث خطأ في السيرفر',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
};

// معالج لمسارات غير موجودة
export const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: 'المسار غير موجود'
    });
};