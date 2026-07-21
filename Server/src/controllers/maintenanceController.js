import asyncHandler from '../utils/asyncHandler.js';
import * as maintenanceModel from '../models/maintenanceModel.js';
import * as assetModel from '../models/assetModel.js';

export const getMaintenance = asyncHandler(async (req, res) => {
  const records = await maintenanceModel.getMaintenanceHistory(req.query);
  res.json({ success: true, data: records });
});

export const createMaintenance = asyncHandler(async (req, res) => {
  const record = await maintenanceModel.createMaintenanceRecord({
    ...req.body,
    performed_by: req.user.id
  });
  // Update asset status to Maintenance in both mock and postgres mode
  await assetModel.updateAsset(req.body.asset_id, { status: 'Maintenance' });
  res.status(201).json({ success: true, data: record });
});
