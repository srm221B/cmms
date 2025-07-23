// API Configuration for Local Development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Assets
  ASSETS: `${API_BASE_URL}/api/assets/assets/`,
  ASSETS_FILTERS: `${API_BASE_URL}/api/assets/assets/filters`,
  ASSETS_FILTERED: `${API_BASE_URL}/api/assets/assets/filtered/`,
  
  // Work Orders
  WORK_ORDERS: `${API_BASE_URL}/api/work-orders/work-orders/`,
  WORK_ORDERS_FILTERS: `${API_BASE_URL}/api/work-orders/work-orders/filters`,
  WORK_ORDER_DETAILS: (id: number) => `${API_BASE_URL}/api/work-orders/work-orders/${id}`,
  WORK_ORDER_TYPES: `${API_BASE_URL}/api/work-orders/work-orders/types/`,
  
  // Inventory
  INVENTORY: `${API_BASE_URL}/api/inventory/inventory/`,
  INVENTORY_FILTERS: `${API_BASE_URL}/api/inventory/inventory/filters`,
  INVENTORY_LOCATIONS: `${API_BASE_URL}/api/inventory/inventory/locations`,
  INVENTORY_DETAILS: (id: number) => `${API_BASE_URL}/api/inventory/inventory/${id}/details`,
  INVENTORY_TRANSFER: `${API_BASE_URL}/api/inventory/inventory/transfer`,
  INVENTORY_RECEIVE: `${API_BASE_URL}/api/inventory/inventory/receive`,
  INVENTORY_TRANSFERS: `${API_BASE_URL}/api/inventory/inventory/transfers`,
  INVENTORY_RECEIPTS: `${API_BASE_URL}/api/inventory/inventory/receipts`,
  INVENTORY_DELETE: (id: number) => `${API_BASE_URL}/api/inventory/inventory/${id}`,
  
  // Users
  USERS: `${API_BASE_URL}/api/users/users/`,
  
  // Locations
  LOCATIONS: `${API_BASE_URL}/api/locations/locations/`,
  LOCATIONS_UNIQUE_ADDRESSES: `${API_BASE_URL}/api/locations/locations/unique-addresses`,
  
  // Asset Categories
  ASSET_CATEGORIES: `${API_BASE_URL}/api/assets/assets/asset-categories/`,
  
  // Inventory Items (for spare parts)
  INVENTORY_ITEMS: `${API_BASE_URL}/api/inventory/inventory/items/`,
  
  // Health Check
  HEALTH: `${API_BASE_URL}/api/health/health`,
};

export default API_ENDPOINTS; 