import * as assetModel from '../models/assetModel.js';

async function assignAsset(assetId, userId) {
  const asset = await assetModel.getAssetById(assetId);
  if (!asset) {
    const error = new Error('Asset not found');
    error.statusCode = 404;
    throw error;
  }

  if (asset.status === 'Retired') {
    const error = new Error('Cannot assign retired assets');
    error.statusCode = 400;
    throw error;
  }

  if (asset.status === 'Assigned' && asset.assigned_to) {
    const error = new Error('Asset is already assigned');
    error.statusCode = 400;
    throw error;
  }

  return assetModel.updateAsset(assetId, { assigned_to: userId, status: 'Assigned' });
}

export { assignAsset };
