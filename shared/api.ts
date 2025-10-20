/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Product related types
 */
export interface Product {
  product_id: number;
  product_name: string;
  product_price: number;
  product_description?: string;
  sub_category_id: number;
  images?: ProductImage[];
  // Shipping fields
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  origin_location?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_main?: boolean;
  created_at?: string;
}

export interface CreateProductRequest {
  product_name: string;
  product_price: number;
  product_description?: string;
  sub_category_id: number;
  files?: File[];
  // Optional shipping fields
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  origin_location?: string;
}

export interface UpdateProductRequest {
  product_name?: string;
  product_price?: number;
  product_description?: string;
  sub_category_id?: number;
  files?: File[];
  // Optional shipping fields
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  origin_location?: string;
}

export interface ProductResponse {
  status: number;
  data: Product;
  message?: string;
}

export interface ProductsResponse {
  status: number;
  data: Product[];
  message?: string;
}

/**
 * Category related types
 */
export interface Category {
  category_id: number;
  category_name: string;
  created_at?: string;
}

export interface SubCategory {
  sub_category_id: number;
  sub_category_name: string;
  category_id: number;
  created_at?: string;
}
