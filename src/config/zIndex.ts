/**
 * Z-Index Scale for Pyet Doktorin Platform
 * 
 * Usage: Import these constants and use with Tailwind's z-[value] syntax
 * or standard z-{value} classes where applicable.
 * 
 * Principles:
 * - Higher values = closer to user (on top)
 * - Each layer has a 50-value gap for future expansion
 * - Never use arbitrary values outside this scale
 */

export const Z_INDEX = {
  // Base content (0-49)
  CONTENT: 0,
  ABSOLUTE_CONTENT: 10,
  
  // Sticky/Floating elements (50-99)
  STICKY: 50,
  NAVBAR: 100,
  SIDEBAR: 150,
  
  // Dropdowns and menus (200-299)
  DROPDOWN: 200,
  SELECT_MENU: 250,
  
  // Overlays (300-399)
  OVERLAY: 300,
  BACKDROP: 350,
  
  // Modals and dialogs (400-499)
  MODAL: 400,
  MODAL_CONTENT: 410,
  DRAWER: 450,
  
  // Popovers and tooltips (500-599)
  POPOVER: 500,
  TOOLTIP: 550,
  
  // Notifications and alerts (600-699)
  TOAST: 600,
  NOTIFICATION: 650,
  
  // Full-screen overlays (700-799)
  FULLSCREEN_MODAL: 700,
  LOADING_OVERLAY: 750,
  
  // Critical system overlays (800-899)
  SYSTEM_OVERLAY: 800,
  BLOCKING_LOADER: 850,
  
  // Maximum priority (900-999)
  MAXIMUM: 900,
  DEVTOOLS: 999,
} as const;

/**
 * Tailwind class helpers
 * Use these functions to get the correct class name
 */
export const z = {
  content: 'z-0',
  absoluteContent: 'z-10',
  sticky: 'z-[50]',
  navbar: 'z-[100]',
  sidebar: 'z-[150]',
  dropdown: 'z-[200]',
  selectMenu: 'z-[250]',
  overlay: 'z-[300]',
  backdrop: 'z-[350]',
  modal: 'z-[400]',
  modalContent: 'z-[410]',
  drawer: 'z-[450]',
  popover: 'z-[500]',
  tooltip: 'z-[550]',
  toast: 'z-[600]',
  notification: 'z-[650]',
  fullscreenModal: 'z-[700]',
  loadingOverlay: 'z-[750]',
  systemOverlay: 'z-[800]',
  blockingLoader: 'z-[850]',
  maximum: 'z-[900]',
} as const;

export default Z_INDEX;
