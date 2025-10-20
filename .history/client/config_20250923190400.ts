// API configuration for endpoints
const USERS_SERVICE_URL = "http://localhost:9000";
const PROMOCODES_SERVICE_URL = "http://localhost:9016";
const PRODUCTS_SERVICE_URL = "http://localhost:9004";
const OFFERS_SERVICE_URL = "http://localhost:9012";
const CATEGORY_SERVICE_URL = "http://localhost:9008";
const BUYED_PRODUCT_SERVICE_URL = "http://localhost:9020";
const ORDER_ALERT_SERVICE_URL = "http://localhost:9024";

export default {
  USERS_SERVICE_URL,
  PROMOCODES_SERVICE_URL,
  PRODUCTS_SERVICE_URL,
  OFFERS_SERVICE_URL,
  CATEGORY_SERVICE_URL,
  BUYED_PRODUCT_SERVICE_URL,
  ORDER_ALERT_SERVICE_URL,
  CATEGORY_SUBCATEGORY: `${CATEGORY_SERVICE_URL}/v1/category/sub-category/`,
  CATEGORY_SUBCATEGORY_CREATE: `${CATEGORY_SERVICE_URL}/v1/category/sub-category/create`,
  PRODUCTS: `${PRODUCTS_SERVICE_URL}/v1/products`,
  LOGIN: `${USERS_SERVICE_URL}/v1/user/auth/login`,
  REGISTER: `${USERS_SERVICE_URL}/v1/user/register`,
  USER_INFO: `${USERS_SERVICE_URL}/v1/user/information/`,
  PROMOCODES: `${PROMOCODES_SERVICE_URL}/v1/promocodes`,
  OFFERS: `${OFFERS_SERVICE_URL}/v1/offers`,
  BUYED_PRODUCTS: `${BUYED_PRODUCT_SERVICE_URL}/v1/buyed-products`,

  CATEGORY_DETAILS: (categoryId: number) => `${CATEGORY_SERVICE_URL}/v1/category/details/${categoryId}`,
  FETCH_CATEGORY: `${CATEGORY_SERVICE_URL}/v1/category/`,
  PRODUCTS_BY_SUBCATEGORY: (subCategoryId: number) => `${PRODUCTS_SERVICE_URL}/v1/products/sub_category/${subCategoryId}`,
  ORDER_ALERT: 'http://localhost:9024/v1/order_alert/',
  ORDER_ALERT_DETAIL: (orderId: number | string) => `http://localhost:9024/v1/order_alert/${orderId}`,

  // Add more endpoints as needed
};



// // API configuration for endpoints
// const USERS_SERVICE_URL = "http://16.171.28.160:9000";
// const PROMOCODES_SERVICE_URL = "http://16.171.28.160:9016";
// const PRODUCTS_SERVICE_URL = "http://16.171.28.160:9004";
// const OFFERS_SERVICE_URL = "http://16.171.28.160:9012";
// const CATEGORY_SERVICE_URL = "http://16.171.28.160:9008";
// const BUYED_PRODUCT_SERVICE_URL = "http://16.171.28.160:9020";
// const ORDER_ALERT_SERVICE_URL = "http://16.171.28.160:9024";

// export default {
//   USERS_SERVICE_URL,
//   PROMOCODES_SERVICE_URL,
//   PRODUCTS_SERVICE_URL,
//   OFFERS_SERVICE_URL,
//   CATEGORY_SERVICE_URL,
//   BUYED_PRODUCT_SERVICE_URL,
//   ORDER_ALERT_SERVICE_URL,

//   CATEGORY_SUBCATEGORY: `${CATEGORY_SERVICE_URL}/v1/category/sub-category/`,
//   CATEGORY_SUBCATEGORY_CREATE: `${CATEGORY_SERVICE_URL}/v1/category/sub-category/create`,
//   PRODUCTS: `${PRODUCTS_SERVICE_URL}/v1/products`,
//   LOGIN: `${USERS_SERVICE_URL}/v1/user/auth/login`,
//   REGISTER: `${USERS_SERVICE_URL}/v1/user/register`,
//   USER_INFO: `${USERS_SERVICE_URL}/v1/user/information/`,
//   PROMOCODES: `${PROMOCODES_SERVICE_URL}/v1/promocodes`,
//   OFFERS: `${OFFERS_SERVICE_URL}/v1/offers`,
//   BUYED_PRODUCTS: `${BUYED_PRODUCT_SERVICE_URL}/v1/buyed-products`,

//   CATEGORY_DETAILS: (categoryId: number) =>
//     `${CATEGORY_SERVICE_URL}/v1/category/details/${categoryId}`,
//   FETCH_CATEGORY: `${CATEGORY_SERVICE_URL}/v1/category/`,
//   PRODUCTS_BY_SUBCATEGORY: (subCategoryId: number) =>
//     `${PRODUCTS_SERVICE_URL}/v1/products/sub_category/${subCategoryId}`,
//   ORDER_ALERT: "http://16.171.28.160:9024/v1/order_alert/",
//   ORDER_ALERT_DETAIL: (orderId: number | string) =>
//     `http://16.171.28.160:9024/v1/order_alert/${orderId}`,

//   // Add more endpoints as needed
// };
