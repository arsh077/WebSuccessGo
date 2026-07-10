const router = require('express').Router();
const controller = require('../controllers/orderController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validate, createOrderSchema } = require('../utils/validators');

// All routes require authentication
router.use(auth);

router.post('/', validate(createOrderSchema), controller.createOrder);
router.get('/mine', controller.getMyOrders);
router.get('/:id', controller.getOrder);
router.post('/:id/files', upload.array('files', 5), controller.uploadFiles);

module.exports = router;
