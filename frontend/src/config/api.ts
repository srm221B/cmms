// src/services/api-endpoints.ts
/* ------------------------------------------------------------------
   API base-URL strategy
   ------------------------------------------------------------------
   • In **production** the React bundle is served by FastAPI itself
     under the same origin, so we only need the /api prefix.
   • In **development** we usually run FastAPI on :8000 and CRA/Vite
     on :3000 with a proxy – but if you prefer hitting the backend
     directly, set REACT_APP_API_URL=http://localhost:8000
   ----------------------------------------------------------------- */

   const ORIGIN =
   process.env.REACT_APP_API_URL ||                 // ① explicit override
   (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000'); // ② fallback
 
 // Every call ultimately hits `${ORIGIN}/api/...`
 export const API_BASE_URL = `${ORIGIN}/api`;
 
 /* ---------------------------  Endpoints  -------------------------- */
 
 export const API_ENDPOINTS = {
   /* ──────────── Assets ──────────── */
   ASSETS:                `${API_BASE_URL}/assets`,
   ASSETS_FILTERS:        `${API_BASE_URL}/assets/filters`,
   ASSETS_FILTERED:       `${API_BASE_URL}/assets/filtered`,
   ASSET_CATEGORIES:      `${API_BASE_URL}/assets/asset-categories`,
   /* helper for /assets/{id} */
   assetDetails: (id: number) => `${API_BASE_URL}/assets/${id}`,
 
   /* ─────────── Work Orders ──────── */
   WORK_ORDERS:           `${API_BASE_URL}/work-orders`,
   WORK_ORDERS_FILTERS:   `${API_BASE_URL}/work-orders/filters`,
   WORK_ORDER_TYPES:      `${API_BASE_URL}/work-orders/types`,
   workOrderDetails: (id: number) => `${API_BASE_URL}/work-orders/${id}`,
 
   /* ─────────── Inventory ────────── */
   INVENTORY:             `${API_BASE_URL}/inventory`,
   INVENTORY_FILTERS:     `${API_BASE_URL}/inventory/filters`,
   INVENTORY_LOCATIONS:   `${API_BASE_URL}/inventory/locations`,
   INVENTORY_ITEMS:       `${API_BASE_URL}/inventory/items`,
   INVENTORY_TRANSFERS:   `${API_BASE_URL}/inventory/transfers`,
   INVENTORY_RECEIPTS:    `${API_BASE_URL}/inventory/receipts`,
   inventoryDetails: (id: number) => `${API_BASE_URL}/inventory/${id}/details`,
   inventoryDelete:  (id: number) => `${API_BASE_URL}/inventory/${id}`,
   INVENTORY_TRANSFER:    `${API_BASE_URL}/inventory/transfer`,
   INVENTORY_RECEIVE:     `${API_BASE_URL}/inventory/receive`,
 
   /* ─────────── Users / Locations ── */
   USERS:                 `${API_BASE_URL}/users`,
   LOCATIONS:             `${API_BASE_URL}/locations`,
   LOCATIONS_UNIQUE_ADDR: `${API_BASE_URL}/locations/unique-addresses`,
 
   /* ─────────── Health ───────────── */
   HEALTH:                `${API_BASE_URL}/health`,
 };
 
 export default API_ENDPOINTS;