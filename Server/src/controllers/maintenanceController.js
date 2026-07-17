import asyncHandler from '../utils/asyncHandler.js';
import * as maintenanceModel from '../models/maintenanceModel.js';

export const getMaintenance = asyncHandler(async (req, res) => {
  const records = await maintenanceModel.getMaintenanceHistory(req.query);
  res.json({ success: true, data: records });
});

export const createMaintenance = asyncHandler(async (req, res) => {
  const record = await maintenanceModel.createMaintenanceRecord({
    ...req.body,
    performed_by: req.user.id
  });
  res.status(201).json({ success: true, data: record });
});
