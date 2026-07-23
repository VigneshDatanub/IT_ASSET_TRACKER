import express from 'express';
import * as assetController from '../controllers/assetController.js';
import authenticate from '../middleware/authMiddleware.js';
import authorize from '../middleware/authorizeMiddleware.js';
import { body, param } from 'express-validator';
import validate from '../middleware/validateMiddleware.js';

const router = express.Router();

router.get('/', authenticate, authorize('view_assets'), assetController.getAssets);
router.get('/:id', authenticate, authorize('view_assets'), [param('id').isInt()], validate, assetController.getAssetById);
router.post(
  '/',
  authenticate,
  authorize('create_asset'),
  [
    body('asset_id').isString().trim().notEmpty(),
    body('name').isString().trim().notEmpty(),
    body('category_id').isInt(),
    body('purchase_date').isISO8601().toDate(),
    body('purchase_cost').isFloat(),
    body('status').optional().isIn(['Available', 'Assigned', 'Maintenance', 'Lost', 'Damaged', 'Retired', 'Disposed'])
  ],
  validate,
  assetController.createAsset
);
router.put(
  '/:id',
  authenticate,
  authorize('edit_asset'),
  [param('id').isInt()],
  validate,
  assetController.updateAsset
);
router.delete('/:id', authenticate, authorize('edit_asset'), [param('id').isInt()], validate, assetController.deleteAsset);
router.post('/:id/assign', authenticate, authorize('assign_asset'), [param('id').isInt(), body('user_id').isInt()], validate, assetController.assignAsset);
router.get('/me/assets', authenticate, authorize('view_my_assets'), assetController.getMyAssets);

export default router;
