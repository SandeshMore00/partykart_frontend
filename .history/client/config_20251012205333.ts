// API Configuration - Clean, centralized endpoint management
// Switch between local and production with a single BASE_URL change

// const BASE_URL = "http://localhost"; // Change to "https://thepartykart.com" for production

// const BASE_URL =  "http://13.83.89.57"

const BASE_URL = "http://20.253.178.184";


// Helper function to create API endpoints
const createEndpoint = (path: string) => `${BASE_URL}${path}`;

// API object with grouped endpoints and helper functions
const API = {
  // User Authentication & Management
  user: {
    login: createEndpoint('/v1/user/auth/login'),
    register: createEndpoint('/v1/user/register'),
    info: createEndpoint('/v1/user/information/'),
    // Helper functions for dynamic endpoints
    details: (userId: number) => createEndpoint(`/v1/user/${userId}`),
    update: (userId: number) => createEndpoint(`/v1/user/${userId}`),
  },

  // Categories Management
  category: {
    all: createEndpoint('/v1/category/'),
    create: createEndpoint('/v1/category/create'),
    // Helper functions
    details: (categoryId: number) => createEndpoint(`/v1/category/details/${categoryId}`),
    update: (categoryId: number) => createEndpoint(`/v1/category/update/${categoryId}`),
    delete: (categoryId: number) => createEndpoint(`/v1/category/delete/${categoryId}`),
    subCategories: (categoryId?: number) => 
      categoryId 
        ? createEndpoint(`/v1/category/sub-category/${categoryId}`)
        : createEndpoint('/v1/category/sub-category/'),
    subCategoryCreate: createEndpoint('/v1/category/sub-category/create'),
    subCategoryUpdate: (subCategoryId: number) => createEndpoint(`/v1/category/sub-category/update/${subCategoryId}`),
    subCategoryDelete: (subCategoryId: number) => createEndpoint(`/v1/category/sub-category/delete/${subCategoryId}`),
  },

  // Products Management
  products: {
    all: createEndpoint('/v1/products'),
    create: createEndpoint('/v1/products'),
    // Helper functions
    details: (productId: number) => createEndpoint(`/v1/products/${productId}`),
    update: (productId: number) => createEndpoint(`/v1/products/update/${productId}`),
    delete: (productId: number) => createEndpoint(`/v1/products/${productId}/delete`),
    bySubCategory: (subCategoryId: number) => createEndpoint(`/v1/products/sub_category/${subCategoryId}`),
    dashboardImage: createEndpoint('/v1/products/dashboard-image/'),
    dashboardImageDelete: createEndpoint(`/v1/products/delete/dashboard-image/`),
  },

  // Offers Management
  offers: {
    all: createEndpoint('/v1/offers'),
    create: createEndpoint('/v1/offers'),
    // Helper functions
    details: (offerId: number) => createEndpoint(`/v1/offers/${offerId}`),
    update: (offerId: number) => createEndpoint(`/v1/offers/${offerId}`),
    delete: (offerId: number) => createEndpoint(`/v1/offers/${offerId}`),
  },

  // Promocodes Management
  promocodes: {
    all: createEndpoint('/v1/promocodes'),
    create: createEndpoint('/v1/promocodes'),
    // Helper functions
    details: (promocodeId: number) => createEndpoint(`/v1/promocodes/${promocodeId}`),
    update: (promocodeId: number) => createEndpoint(`/v1/promocodes/${promocodeId}`),
    delete: (promocodeId: number) => createEndpoint(`/v1/promocodes/${promocodeId}`),
  },

  // Order Management
  orders: {
    all: createEndpoint('/v1/order_alert/'),
    allOrders: createEndpoint('/v1/order_alert/all-order'),
    // Helper functions
    details: (orderId: number | string) => createEndpoint(`/v1/order_alert/details/${orderId}`),
    create: createEndpoint('/v1/order_alert/'),
    update: (orderId: number | string) => createEndpoint(`/v1/order_alert/${orderId}`),
    delete: (orderId: number | string) => createEndpoint(`/v1/order_alert/${orderId}`),
  },

  // Buyed Products Management
  buyedProducts: {
    all: createEndpoint('/v1/buyed_product'),
    create: createEndpoint('/v1/buy-product/'),
    // Helper functions
    details: (buyedProductId: number) => createEndpoint(`/v1/buyed_product/${buyedProductId}`),
    update: (buyedProductId: number) => createEndpoint(`/v1/buyed_product/${buyedProductId}`),
    delete: (buyedProductId: number) => createEndpoint(`/v1/buyed_product/${buyedProductId}`),
  },
};

// Legacy compatibility - keeping old names for backward compatibility
// These will be deprecated in future versions
const legacyConfig = {
  // Base services (old names, kept for compatibility)
  USERS_SERVICE_URL: API.user.info.replace('/information/', ''),
  PROMOCODES_SERVICE_URL: API.promocodes.all,
  PRODUCTS_SERVICE_URL: API.products.all,
  OFFERS_SERVICE_URL: API.offers.all,
  CATEGORY_SERVICE_URL: API.category.all,
  BUYED_PRODUCT_SERVICE_URL: API.buyedProducts.all,
  ORDER_ALERT_SERVICE_URL: API.orders.all,

  // Legacy endpoint names
  LOGIN: API.user.login,
  REGISTER: API.user.register,
  USER_INFO: API.user.info,
  FETCH_CATEGORY: API.category.all,
  CATEGORY_SUBCATEGORY: API.category.subCategories,
  CATEGORY_SUBCATEGORY_CREATE: API.category.subCategoryCreate,
  CATEGORY_DETAILS: API.category.details,
  PRODUCTS: API.products.all,
  PRODUCTS_BY_SUBCATEGORY: API.products.bySubCategory,
  PRODUCT_DETAIL: API.products.details,
  PRODUCT_DASHBOARD_IMAGE: API.products.dashboardImage,
  PRODUCT_DASHBOARD_IMAGE_DELETE: API.products.dashboardImageDelete,
  OFFERS: API.offers.all,
  PROMOCODES: API.promocodes.all,
  BUYED_PRODUCTS: API.buyedProducts.all,
  ORDER_ALERT: API.orders.all,
  ORDER_ALERT_DETAIL: API.orders.details,
};

// Export both new API structure and legacy config for backward compatibility
export default {
  ...legacyConfig,
  // New clean API structure
  API,
};