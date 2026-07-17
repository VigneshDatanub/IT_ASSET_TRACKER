import express from 'express';
import * as maintenanceController from '../controllers/maintenanceController.js';
import authenticate from '../middleware/authMiddleware.js';
import authorize from '../middleware/authorizeMiddleware.js';
import { body } from 'express-validator';
import validate from '../middleware/validateMiddleware.js';

const router = express.Router();

router.get('/', authenticate, authorize('view_assets'), maintenanceController.getMaintenance);
router.post(
  '/',
  authenticate,
  authorize('add_maintenance'),
  [
    body('asset_id').isInt(),
    body('maintenance_type').isString().trim().notEmpty(),
    body('description').isString().trim().notEmpty()
  ],
  validate,
  maintenanceController.createMaintenance
);

export default router;
