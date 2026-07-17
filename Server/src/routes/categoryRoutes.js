import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import authenticate from '../middleware/authMiddleware.js';
import authorize from '../middleware/authorizeMiddleware.js';
import { body, param } from 'express-validator';
import validate from '../middleware/validateMiddleware.js';

const router = express.Router();

router.get('/', authenticate, authorize('view_assets'), categoryController.getCategories);
router.post(
  '/',
  authenticate,
  authorize('manage_categories'),
  [body('name').isString().trim().notEmpty(), body('description').optional().isString()],
  validate,
  categoryController.createCategory
);
router.put(
  '/:id',
  authenticate,
  authorize('manage_categories'),
  [param('id').isInt()],
  validate,
  categoryController.updateCategory
);
router.delete('/:id', authenticate, authorize('manage_categories'), [param('id').isInt()], validate, categoryController.deleteCategory);

export default router;
