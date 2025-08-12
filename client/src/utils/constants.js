// Application constants
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  GOOGLE_AUTH: '/auth/google',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_TOKEN: '/auth/verify-token',
  
  // Drone endpoints
  DRONES: '/drones',
  DRONE_BY_ID: (id) => `/drones/${id}`,
  DRONE_MEDIA: (id) => `/drones/${id}/media`,
  
  // Order endpoints
  ORDERS: '/orders',
  ORDER_BY_ID: (id) => `/orders/${id}`,
  USER_ORDERS: (userId) => `/orders/user/${userId}`,
  UPDATE_ORDER_STATUS: (id) => `/orders/${id}/status`,
  
  // Payment endpoints
  CREATE_PAYMENT_INTENT: '/payments/create-intent',
  CONFIRM_PAYMENT: '/payments/confirm',
  PAYMENT_STATUS: (orderId) => `/payments/${orderId}/status`,
};

export const ROUTES = {
  HOME: '/',
  DRONES: '/drones',
  ORDER: '/order',
  ORDER_WITH_ID: (droneId) => `/order/${droneId}`,
  PAYMENT: '/payment',
  LOGIN: '/login',
  REGISTER: '/register',
  OAUTH_CALLBACK: '/auth/callback',
  ADMIN: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
};

export const DRONE_CATEGORIES = {
  CAMERA: 'camera',
  HANDHELD: 'handheld',
  POWER: 'power',
  SPECIALIZED: 'specialized',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  CART: 'cart',
};