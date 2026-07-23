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

  _enrichAsset(asset) {
    if (!asset) return null;
    const category = this.categories.find((c) => c.id === Number(asset.category_id));
    const user = this.users.find((u) => u.id === Number(asset.assigned_to));
    return {
      ...asset,
      category_name: category ? category.name : 'Unknown Category',
      assigned_username: user ? user.username : null
    };
  }

  async createUser(payload) {
    if (this.users.some((u) => u.username.toLowerCase() === payload.username.toLowerCase())) {
      const error = new Error(`Key (username)=(${payload.username}) already exists.`);
      error.code = '23505';
      error.constraint = 'users_username_key';
      error.detail = `Key (username)=(${payload.username}) already exists.`;
      throw error;
    }
    if (this.users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) {
      const error = new Error(`Key (email)=(${payload.email}) already exists.`);
      error.code = '23505';
      error.constraint = 'users_email_key';
      error.detail = `Key (email)=(${payload.email}) already exists.`;
      throw error;
    }

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
    if (this.categories.some((c) => c.name.toLowerCase() === payload.name.toLowerCase())) {
      const error = new Error(`Key (name)=(${payload.name}) already exists.`);
      error.code = '23505';
      error.constraint = 'categories_name_key';
      error.detail = `Key (name)=(${payload.name}) already exists.`;
      throw error;
    }

    const category = { id: this.nextCategoryId++, ...payload, is_active: payload.isActive ?? true };
    this.categories.push(category);
    return category;
  }

  async updateCategory(id, payload) {
    if (payload.name && this.categories.some((c) => c.id !== Number(id) && c.name.toLowerCase() === payload.name.toLowerCase())) {
      const error = new Error(`Key (name)=(${payload.name}) already exists.`);
      error.code = '23505';
      error.constraint = 'categories_name_key';
      error.detail = `Key (name)=(${payload.name}) already exists.`;
      throw error;
    }

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
    return this.assets.map((asset) => this._enrichAsset(asset));
  }

  async getAssetById(id) {
    const asset = this.assets.find((asset) => asset.id === Number(id));
    return this._enrichAsset(asset || null);
  }

  async createAsset(payload) {
    if (this.assets.some((a) => a.asset_id === payload.asset_id)) {
      const error = new Error(`Key (asset_id)=(${payload.asset_id}) already exists.`);
      error.code = '23505';
      error.constraint = 'assets_asset_id_key';
      error.detail = `Key (asset_id)=(${payload.asset_id}) already exists.`;
      throw error;
    }

    const now = new Date().toISOString();
    const asset = { id: this.nextAssetId++, ...payload, created_at: now, updated_at: now };
    this.assets.push(asset);
    return this._enrichAsset(asset);
  }

  async updateAsset(id, payload) {
    if (payload.asset_id && this.assets.some((a) => a.id !== Number(id) && a.asset_id === payload.asset_id)) {
      const error = new Error(`Key (asset_id)=(${payload.asset_id}) already exists.`);
      error.code = '23505';
      error.constraint = 'assets_asset_id_key';
      error.detail = `Key (asset_id)=(${payload.asset_id}) already exists.`;
      throw error;
    }

    const index = this.assets.findIndex((asset) => asset.id === Number(id));
    if (index === -1) return null;
    this.assets[index] = { ...this.assets[index], ...payload, updated_at: new Date().toISOString() };
    return this._enrichAsset(this.assets[index]);
  }

  async deleteAsset(id) {
    const index = this.assets.findIndex((asset) => asset.id === Number(id));
    if (index === -1) return null;
    const [removed] = this.assets.splice(index, 1);
    return this._enrichAsset(removed);
  }

  async getAssetsByUser(userId) {
    return this.assets
      .filter((asset) => asset.assigned_to === Number(userId))
      .map((asset) => this._enrichAsset(asset));
  }

  async getMaintenanceHistory() {
    return this.maintenance.map((record) => {
      const asset = this.assets.find((a) => a.id === Number(record.asset_id));
      const user = this.users.find((u) => u.id === Number(record.performed_by));
      return {
        ...record,
        asset_id: asset ? asset.asset_id : record.asset_id,
        performed_by_name: user ? user.username : 'Unknown'
      };
    });
  }

  async createMaintenanceRecord(payload) {
    const record = { id: this.nextMaintenanceId++, ...payload, performed_at: new Date().toISOString() };
    this.maintenance.push(record);
    
    // Also change the asset's status to Maintenance automatically
    const assetIndex = this.assets.findIndex((a) => a.id === Number(payload.asset_id));
    if (assetIndex !== -1) {
      this.assets[assetIndex].status = 'Maintenance';
    }

    return record;
  }
}

export default new MockRepository();
