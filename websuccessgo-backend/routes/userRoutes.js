const router = require('express').Router();
const controller = require('../controllers/userController');
const auth = require('../middleware/auth');
const { validate, registerSchema, loginSchema } = require('../utils/validators');

// Public routes
router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/refresh-token', controller.refreshToken);

// Protected routes
router.get('/me', auth, controller.me);
router.patch('/profile', auth, controller.updateProfile);
router.post('/change-password', auth, controller.changePassword);

module.exports = router;
