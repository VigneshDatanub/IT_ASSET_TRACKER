import { mockUsers, mockCategories, mockAssets, mockMaintenance } from './mockData.js';

class MockRepository {
  constructor() {
    this.users = [...mockUsers];
    this.categories = [...mockCategories];
    this.assets = [...mockAssets];
    this.maintenance = [...mockMaintenance];
    this.nextCategoryId = Math.max(...this.categories.map((category) => Number(category.id) || 0), 0) + 1;
    this.nextAssetId = Math.max(...this.assets.map((asset) => Number(asset.id) || 0), 0) + 1;
    this.nextMaintenanceId = Math.max(...this.maintenance.map((record) => Number(record.id) || 0), 0) + 1;
  }

  async getUserByUsername(username) {
    return this.users.find((user) => user.username === username) || null;
  }

  async getUserById(id) {
    return this.users.find((user) => user.id === Number(id)) || null;
  }

  async getUserByEmail(email) {
    return this.users.find((user) => user.email.toLowerCase() === String(email).toLowerCase()) || null;
  }

  async createUser(payload) {
    const user = {
      id: Date.now(),
      username: payload.username,
      email: payload.email,
      role: payload.role || 'user',
      password_hash: payload.passwordHash,
      is_active: true
    };
    this.users.push(user);
    return user;
  }

  async getAllCategories() {
    return this.categories;
  }

  async createCategory(payload) {
    const category = { id: this.nextCategoryId++, ...payload, is_active: payload.isActive ?? true };
    this.categories.push(category);
    return category;
  }

  async updateCategory(id, payload) {
    const index = this.categories.findIndex((category) => category.id === Number(id));
    if (index === -1) return null;
    this.categories[index] = {
      ...this.categories[index],
      ...payload,
      is_active: payload.isActive ?? this.categories[index].is_active
    };
    return this.categories[index];
  }

  async deleteCategory(id) {
    const index = this.categories.findIndex((category) => category.id === Number(id));
    if (index === -1) return null;
    const [removed] = this.categories.splice(index, 1);
    return removed;
  }

  async getAllAssets() {
    return this.assets;
  }

  async getAssetById(id) {
    return this.assets.find((asset) => asset.id === Number(id)) || null;
  }

  async createAsset(payload) {
    const asset = { id: this.nextAssetId++, ...payload };
    this.assets.push(asset);
    return asset;
  }

  async updateAsset(id, payload) {
    const index = this.assets.findIndex((asset) => asset.id === Number(id));
    if (index === -1) return null;
    this.assets[index] = { ...this.assets[index], ...payload };
    return this.assets[index];
  }

  async deleteAsset(id) {
    const index = this.assets.findIndex((asset) => asset.id === Number(id));
    if (index === -1) return null;
    const [removed] = this.assets.splice(index, 1);
    return removed;
  }

  async getAssetsByUser(userId) {
    return this.assets.filter((asset) => asset.assigned_to === Number(userId));
  }

  async getMaintenanceHistory() {
    return this.maintenance;
  }

  async createMaintenanceRecord(payload) {
    const record = { id: this.nextMaintenanceId++, ...payload };
    this.maintenance.push(record);
    return record;
  }
}

export default new MockRepository();
