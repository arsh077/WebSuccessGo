const router = require('express').Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const controller = require('../controllers/adminController');
const { validate, updateProjectStatusSchema, assignDeveloperSchema } = require('../utils/validators');

// All routes require admin or manager role
router.use(auth, roleAuth(['admin', 'manager']));

router.get('/dashboard', controller.dashboard);
router.get('/orders', controller.getOrders);
router.get('/users', controller.getUsers);
router.patch('/orders/:id/status', validate(updateProjectStatusSchema), controller.updateProject);
router.patch('/orders/:id/developer', validate(assignDeveloperSchema), controller.assignDeveloper);
router.post('/orders/:id/invoice', controller.generateInvoice);

module.exports = router;
