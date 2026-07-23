import { useState, useEffect } from 'react';

const DEFAULT_SETTINGS = {
  companyName: 'AssetSphere Corp',
  locations: ['London Office', 'New York Office', 'Tokyo Tech Lab', 'Munich Hub'],
  contactInfo: 'support@assetsphere.com',
  currency: 'INR',
  dateFormat: 'DD-MM-YYYY',
  idPrefix: 'IT-2026-',
  defaultStatus: 'Available',
  statuses: ['Available', 'Assigned', 'Maintenance', 'Lost', 'Damaged', 'Retired', 'Disposed'],
  maintenanceTypes: ['Preventive Maintenance', 'Corrective Maintenance', 'Software Upgrade', 'Hardware Replacement', 'Annual Inspection'],
  notificationAlerts: {
    warrantyExpiry: true,
    scheduledMaintenance: true,
    assetReturn: true,
    licenseExpiry: true
  },
  departments: ['HR', 'Finance', 'Engineering', 'Marketing', 'Sales'],
  vendors: ['Dell Prime', 'Apple Distribution', 'CDW Government', 'ABC Service Center']
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('it-asset-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [newLocation, setNewLocation] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newMaintType, setNewMaintType] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newVendor, setNewVendor] = useState('');

  useEffect(() => {
    localStorage.setItem('it-asset-settings', JSON.stringify(settings));
  }, [settings]);

  const handleSaveText = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggleAlert = (key) => {
    setSettings((prev) => ({
      ...prev,
      notificationAlerts: {
        ...prev.notificationAlerts,
        [key]: !prev.notificationAlerts[key]
      }
    }));
  };

  const handleAddItem = (listKey, itemValue, setItemValue) => {
    if (!itemValue.trim()) return;
    if (settings[listKey].includes(itemValue.trim())) {
      alert('Item already exists!');
      return;
    }
    setSettings((prev) => ({
      ...prev,
      [listKey]: [...prev[listKey], itemValue.trim()]
    }));
    setItemValue('');
  };

  const handleRemoveItem = (listKey, itemToRemove) => {
    setSettings((prev) => ({
      ...prev,
      [listKey]: prev[listKey].filter((item) => item !== itemToRemove)
    }));
  };

  const resetToDefaults = () => {
    if (window.confirm('Reset all configurations to standard values?')) {
      setSettings(DEFAULT_SETTINGS);
    }
  };

  return (
    <div className="settings-container">
      <div className="top-panel">
        <div>
          <h2>System Administration</h2>
          <p>Configure lifecycle definitions, notification rules, system defaults, and master data settings.</p>
        </div>
        <button className="secondary" onClick={resetToDefaults}>Reset to Defaults</button>
      </div>

      <div className="settings-shell card">
        <div className="settings-tabs">
          <button className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>General & Company</button>
          <button className={`tab-btn ${activeTab === 'defaults' ? 'active' : ''}`} onClick={() => setActiveTab('defaults')}>Defaults & Formats</button>
          <button className={`tab-btn ${activeTab === 'lifecycle' ? 'active' : ''}`} onClick={() => setActiveTab('lifecycle')}>Lifecycle & Repairs</button>
          <button className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`} onClick={() => setActiveTab('roles')}>Roles & Permissions</button>
          <button className={`tab-btn ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>Alert Triggers</button>
          <button className={`tab-btn ${activeTab === 'master' ? 'active' : ''}`} onClick={() => setActiveTab('master')}>Master Data</button>
        </div>

        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="settings-section animate-fade-in">
              <h3>Company Profile Settings</h3>
              <p className="panel-subheader">Global branding credentials stored on primary cloud instance</p>
              
              <div className="form-group">
                <label>Company Name</label>
                <input 
                  type="text" 
                  value={settings.companyName} 
                  onChange={(e) => handleSaveText('companyName', e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Support Contact Email</label>
                <input 
                  type="email" 
                  value={settings.contactInfo} 
                  onChange={(e) => handleSaveText('contactInfo', e.target.value)} 
                />
              </div>

              <div className="form-group list-builder">
                <label>Office Locations</label>
                <div className="tag-list">
                  {settings.locations.map((loc) => (
                    <span key={loc} className="tag-item">
                      {loc}
                      <button className="tag-close" onClick={() => handleRemoveItem('locations', loc)}>&times;</button>
                    </span>
                  ))}
                </div>
                <div className="input-row">
                  <input 
                    type="text" 
                    placeholder="Add location (e.g. Paris Hub)" 
                    value={newLocation} 
                    onChange={(e) => setNewLocation(e.target.value)} 
                  />
                  <button className="primary" onClick={() => handleAddItem('locations', newLocation, setNewLocation)}>Add</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'defaults' && (
            <div className="settings-section animate-fade-in">
              <h3>Default Settings & Format Schemas</h3>
              <p className="panel-subheader">Set fallback values, formatting variables, and naming conventions</p>
              
              <div className="form-group">
                <label>Default Currency</label>
                <select value={settings.currency} onChange={(e) => handleSaveText('currency', e.target.value)}>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Default Date Format</label>
                <select value={settings.dateFormat} onChange={(e) => handleSaveText('dateFormat', e.target.value)}>
                  <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                </select>
              </div>

              <div className="form-group">
                <label>Default Initial Status</label>
                <select value={settings.defaultStatus} onChange={(e) => handleSaveText('defaultStatus', e.target.value)}>
                  {settings.statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Asset ID Naming Rule Prefix</label>
                <input 
                  type="text" 
                  value={settings.idPrefix} 
                  onChange={(e) => handleSaveText('idPrefix', e.target.value)} 
                  placeholder="e.g. IT-2026-"
                />
                <p className="field-hint" style={{ marginTop: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Newly registered assets will use this prefix logic to automatically validate serial formatting.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'lifecycle' && (
            <div className="settings-section animate-fade-in">
              <h3>Lifecycle Statuses & Repair Categories</h3>
              <p className="panel-subheader">Define status state machines and repair classification keywords</p>

              <div className="form-group list-builder">
                <label>Lifecycle Statuses</label>
                <div className="tag-list">
                  {settings.statuses.map((status) => (
                    <span key={status} className="tag-item">
                      {status}
                      <button className="tag-close" onClick={() => handleRemoveItem('statuses', status)}>&times;</button>
                    </span>
                  ))}
                </div>
                <div className="input-row">
                  <input 
                    type="text" 
                    placeholder="New status name" 
                    value={newStatus} 
                    onChange={(e) => setNewStatus(e.target.value)} 
                  />
                  <button className="primary" onClick={() => handleAddItem('statuses', newStatus, setNewStatus)}>Add</button>
                </div>
              </div>

              <div className="form-group list-builder" style={{ marginTop: '2rem' }}>
                <label>Maintenance Service Types</label>
                <div className="tag-list">
                  {settings.maintenanceTypes.map((type) => (
                    <span key={type} className="tag-item">
                      {type}
                      <button className="tag-close" onClick={() => handleRemoveItem('maintenanceTypes', type)}>&times;</button>
                    </span>
                  ))}
                </div>
                <div className="input-row">
                  <input 
                    type="text" 
                    placeholder="New service type" 
                    value={newMaintType} 
                    onChange={(e) => setNewMaintType(e.target.value)} 
                  />
                  <button className="primary" onClick={() => handleAddItem('maintenanceTypes', newMaintType, setNewMaintType)}>Add</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="settings-section animate-fade-in">
              <h3>User Roles & Access Permissions Matrix</h3>
              <p className="panel-subheader">Interactive preview of access levels and system workflow actions</p>

              <div className="table-wrapper" style={{ marginTop: '1rem' }}>
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>Capability / Action</th>
                      <th>Admin</th>
                      <th>Asset Manager</th>
                      <th>Employee</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Register Assets</td>
                      <td><span className="matrix-check">✅</span></td>
                      <td><span className="matrix-check">✅</span></td>
                      <td><span className="matrix-dash">❌</span></td>
                    </tr>
                    <tr>
                      <td>Assign Assets</td>
                      <td><span className="matrix-check">✅</span></td>
                      <td><span className="matrix-check">✅</span></td>
                      <td><span className="matrix-dash">❌</span></td>
                    </tr>
                    <tr>
                      <td>Change Asset Status</td>
                      <td><span className="matrix-check">✅</span></td>
                      <td><span className="matrix-check">✅</span></td>
                      <td><span className="matrix-dash">❌</span></td>
                    </tr>
                    <tr>
                      <td>Log Maintenance Logs</td>
                      <td><span className="matrix-check">✅</span></td>
                      <td><span className="matrix-check">✅</span></td>
                      <td><span className="matrix-dash">❌</span></td>
                    </tr>
                    <tr>
                      <td>View Maintenance History</td>
                      <td><span className="matrix-check">✅</span></td>
                      <td><span className="matrix-check">✅</span></td>
                      <td><span className="matrix-check">✅</span></td>
                    </tr>
                    <tr>
                      <td>Manage Categories (Create/Edit/Delete)</td>
                      <td><span className="matrix-check">✅</span></td>
                      <td><span className="matrix-dash">❌</span></td>
                      <td><span className="matrix-dash">❌</span></td>
                    </tr>
                    <tr>
                      <td>Configure Overall Settings</td>
                      <td><span className="matrix-check">✅</span></td>
                      <td><span className="matrix-dash">❌</span></td>
                      <td><span className="matrix-dash">❌</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="settings-section animate-fade-in">
              <h3>System Alerts & Notification Trigger Settings</h3>
              <p className="panel-subheader">Configure email reminders and real-time topbar notifications</p>

              <div className="alerts-toggles">
                <div className="toggle-item">
                  <div className="toggle-label">
                    <h4>Warranty Expiration Alerts</h4>
                    <p>Alert managers 30 days before hardware warranty expires</p>
                  </div>
                  <label className="switch-input">
                    <input 
                      type="checkbox" 
                      checked={settings.notificationAlerts.warrantyExpiry} 
                      onChange={() => handleToggleAlert('warrantyExpiry')} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-label">
                    <h4>Scheduled Maintenance Reminders</h4>
                    <p>Notify technicians when recurring maintenance is due</p>
                  </div>
                  <label className="switch-input">
                    <input 
                      type="checkbox" 
                      checked={settings.notificationAlerts.scheduledMaintenance} 
                      onChange={() => handleToggleAlert('scheduledMaintenance')} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-label">
                    <h4>Asset Return Requests</h4>
                    <p>Send automatic alerts to users for returning equipment post-assignment</p>
                  </div>
                  <label className="switch-input">
                    <input 
                      type="checkbox" 
                      checked={settings.notificationAlerts.assetReturn} 
                      onChange={() => handleToggleAlert('assetReturn')} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-item">
                  <div className="toggle-label">
                    <h4>License Expiry Warnings</h4>
                    <p>Alert when software package licenses are nearing expiration</p>
                  </div>
                  <label className="switch-input">
                    <input 
                      type="checkbox" 
                      checked={settings.notificationAlerts.licenseExpiry} 
                      onChange={() => handleToggleAlert('licenseExpiry')} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'master' && (
            <div className="settings-section animate-fade-in">
              <h3>Global Master Data Reference Tables</h3>
              <p className="panel-subheader">Configure departments, office locations, vendors, and manufacturers</p>

              <div className="form-group list-builder">
                <label>Company Departments</label>
                <div className="tag-list">
                  {settings.departments.map((dept) => (
                    <span key={dept} className="tag-item">
                      {dept}
                      <button className="tag-close" onClick={() => handleRemoveItem('departments', dept)}>&times;</button>
                    </span>
                  ))}
                </div>
                <div className="input-row">
                  <input 
                    type="text" 
                    placeholder="e.g. HR, IT, Legal" 
                    value={newDept} 
                    onChange={(e) => setNewDept(e.target.value)} 
                  />
                  <button className="primary" onClick={() => handleAddItem('departments', newDept, setNewDept)}>Add</button>
                </div>
              </div>

              <div className="form-group list-builder" style={{ marginTop: '2rem' }}>
                <label>Preferred Manufacturers & Vendors</label>
                <div className="tag-list">
                  {settings.vendors.map((vendor) => (
                    <span key={vendor} className="tag-item">
                      {vendor}
                      <button className="tag-close" onClick={() => handleRemoveItem('vendors', vendor)}>&times;</button>
                    </span>
                  ))}
                </div>
                <div className="input-row">
                  <input 
                    type="text" 
                    placeholder="e.g. Dell Inc." 
                    value={newVendor} 
                    onChange={(e) => setNewVendor(e.target.value)} 
                  />
                  <button className="primary" onClick={() => handleAddItem('vendors', newVendor, setNewVendor)}>Add</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
