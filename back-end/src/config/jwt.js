import dotenv from 'dotenv';

dotenv.config();

const jwtConfig = {
    secret: process.env.JWT_SECRET || 'fallback_secret_key_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'blog-platform',
    audience: process.env.JWT_AUDIENCE || 'blog-platform-users'
};

export default jwtConfig;