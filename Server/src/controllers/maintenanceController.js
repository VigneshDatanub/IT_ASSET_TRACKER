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
  // Update asset status depending on completion date
  const compDate = req.body.completion_date ? new Date(req.body.completion_date) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (compDate) {
    compDate.setHours(0, 0, 0, 0);
  }
  const isCompleted = compDate && compDate <= today;
  const nextStatus = isCompleted ? 'Available' : 'Maintenance';
  await assetModel.updateAsset(req.body.asset_id, { status: nextStatus });
  res.status(201).json({ success: true, data: record });
});
