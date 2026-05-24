import API from './api';

// ──────────────── Auth ────────────────
export const authService = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
};

// ──────────────── Products ────────────────
export const productService = {
  getAll: (params) => API.get('/products', { params }),
  getById: (id) => API.get(`/products/${id}`),
  create: (data) => API.post('/products', data),
  update: (id, data) => API.put(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`),
};

// ──────────────── Categories ────────────────
export const categoryService = {
  getAll: () => API.get('/categories'),
  create: (data) => API.post('/categories', data),
};

// ──────────────── Cart ────────────────
export const cartService = {
  get: () => API.get('/cart'),
  add: (data) => API.post('/cart/add', data),
  update: (data) => API.put('/cart/update', data),
  remove: (productId) => API.delete(`/cart/remove/${productId}`),
};

// ──────────────── Wishlist ────────────────
export const wishlistService = {
  get: () => API.get('/wishlist'),
  add: (data) => API.post('/wishlist/add', data),
  remove: (productId) => API.delete(`/wishlist/remove/${productId}`),
};

// ──────────────── Coupons ────────────────
export const couponService = {
  getAll: () => API.get('/coupon'),
  create: (data) => API.post('/coupon/create', data),
  apply: (data) => API.post('/coupon/apply', data),
  delete: (id) => API.delete(`/coupon/${id}`),
};

// ──────────────── Orders ────────────────
export const orderService = {
  create: (data) => API.post('/orders/create', data),
  getAll: () => API.get('/orders'),
  getById: (id) => API.get(`/orders/${id}`),
  updateStatus: (id, data) => API.put(`/orders/${id}/status`, data),
};

// ──────────────── Invoice ────────────────
export const invoiceService = {
  download: (orderId) => API.get(`/invoice/${orderId}`, { responseType: 'blob' }),
};

// ──────────────── Admin ────────────────
export const adminService = {
  getStats: () => API.get('/admin/stats'),
  getUsers: () => API.get('/admin/users'),
  getOrders: () => API.get('/admin/orders'),
};
