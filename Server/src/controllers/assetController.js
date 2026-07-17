import asyncHandler from '../utils/asyncHandler.js';
import * as assetModel from '../models/assetModel.js';
import * as assetService from '../services/assetService.js';

export const getAssets = asyncHandler(async (req, res) => {
  const assets = await assetModel.getAllAssets(req.query);
  res.json({ success: true, data: assets });
});

export const getAssetById = asyncHandler(async (req, res) => {
  const asset = await assetModel.getAssetById(req.params.id);
  if (!asset) {
    const error = new Error('Asset not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({ success: true, data: asset });
});

export const createAsset = asyncHandler(async (req, res) => {
  const asset = await assetModel.createAsset(req.body);
  res.status(201).json({ success: true, data: asset });
});

export const updateAsset = asyncHandler(async (req, res) => {
  const asset = await assetModel.updateAsset(req.params.id, req.body);
  if (!asset) {
    const error = new Error('Asset not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({ success: true, data: asset });
});

export const deleteAsset = asyncHandler(async (req, res) => {
  const asset = await assetModel.deleteAsset(req.params.id);
  if (!asset) {
    const error = new Error('Asset not found');
    error.statusCode = 404;
    throw error;
  }

  res.json({ success: true, message: 'Asset deleted successfully' });
});

export const getMyAssets = asyncHandler(async (req, res) => {
  const assets = await assetModel.getAssetsByUser(req.user.id);
  res.json({ success: true, data: assets });
});

export const assignAsset = asyncHandler(async (req, res) => {
  const updatedAsset = await assetService.assignAsset(req.params.id, req.body.user_id);
  res.json({ success: true, data: updatedAsset });
});
