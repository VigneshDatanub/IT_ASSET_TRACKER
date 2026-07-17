const ROLE_LEVELS = {
  user: 1,
  asset_manager: 2,
  admin: 3
};

export function hasPermission(role, permission) {
  const normalizedRole = (role || 'user').toLowerCase();
  const roleLevel = ROLE_LEVELS[normalizedRole] || 1;

  const permissions = {
    user: ['view_assets', 'filter_assets', 'view_my_assets', 'login'],
    asset_manager: ['view_assets', 'filter_assets', 'view_my_assets', 'create_asset', 'edit_asset', 'assign_asset', 'change_asset_status', 'add_maintenance'],
    admin: ['view_assets', 'filter_assets', 'view_my_assets', 'create_asset', 'edit_asset', 'assign_asset', 'change_asset_status', 'add_maintenance', 'manage_categories', 'system_configuration']
  };

  return permissions[normalizedRole]?.includes(permission) || false;
}

export function isAtLeast(role, minimumRole) {
  return (ROLE_LEVELS[role] || 1) >= (ROLE_LEVELS[minimumRole] || 1);
}

export { ROLE_LEVELS };
