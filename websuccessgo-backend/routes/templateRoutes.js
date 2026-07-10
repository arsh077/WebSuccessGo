const router = require('express').Router();
const controller = require('../controllers/templateController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { validate, templateSchema } = require('../utils/validators');

// Public routes
router.get('/', controller.getTemplates);
router.get('/:id', controller.getTemplate);

// Admin/Manager routes
router.post('/', auth, roleAuth(['admin', 'manager']), validate(templateSchema), controller.addTemplate);
router.patch('/:id', auth, roleAuth(['admin', 'manager']), validate(templateSchema), controller.updateTemplate);
router.delete('/:id', auth, roleAuth(['admin']), controller.deleteTemplate);

module.exports = router;
