import { RequestHandler } from "express";

// Base URLs for external services
const USER_SERVICE_URL = 'http://localhost:9000';
const PRODUCT_SERVICE_URL = 'http://localhost:9004';
const CATEGORY_SERVICE_URL = 'http://localhost:9008';

// Helper function to make proxy requests
async function proxyRequest(
  targetUrl: string,
  method: string = 'GET',
  body?: any,
  headers?: Record<string, string>,
  isFormData: boolean = false
) {
  const requestOptions: RequestInit = {
    method,
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...headers
    }
  };

  if (body && method !== 'GET') {
    if (isFormData) {
      const formData = new FormData();
      Object.keys(body).forEach(key => {
        formData.append(key, body[key]);
      });
      requestOptions.body = formData;
    } else {
      requestOptions.body = JSON.stringify(body);
    }
  }

  try {
    const response = await fetch(targetUrl, requestOptions);
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    return {
      status: response.status,
      data: data
    };
  } catch (error) {
    console.error('Proxy request error:', error);
    return {
      status: 500,
      data: { error: 'Service unavailable' }
    };
  }
}

// Auth endpoints
export const loginUser: RequestHandler = async (req, res) => {
  try {
    const result = await proxyRequest(
      `${USER_SERVICE_URL}/v1/user/auth/login`,
      'POST',
      req.body
    );
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Login proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// User information endpoints
export const getUserInformation: RequestHandler = async (req, res) => {
  try {
    const result = await proxyRequest(`${USER_SERVICE_URL}/v1/user/information/`);
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('User info proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Category endpoints
export const getCategories: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const headers = authHeader ? { 'Authorization': authHeader } : {};
    
    const result = await proxyRequest(
      `${CATEGORY_SERVICE_URL}/v1/category/`,
      'GET',
      undefined,
      headers
    );
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Categories proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSubcategories: RequestHandler = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const authHeader = req.headers.authorization;
    const headers = authHeader ? { 'Authorization': authHeader } : {};
    
    const result = await proxyRequest(
      `${CATEGORY_SERVICE_URL}/v1/category/sub-category/${categoryId}`,
      'GET',
      undefined,
      headers
    );
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Subcategories proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCategory: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const headers = authHeader ? { 'Authorization': authHeader } : {};
    
    const result = await proxyRequest(
      `${CATEGORY_SERVICE_URL}/v1/category/create`,
      'POST',
      req.body,
      headers,
      true // Use form data
    );
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Create category proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCategory: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    const headers = authHeader ? { 'Authorization': authHeader } : {};
    
    const result = await proxyRequest(
      `${CATEGORY_SERVICE_URL}/v1/category/update/${id}`,
      'PATCH',
      req.body,
      headers,
      true
    );
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Update category proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCategory: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    const headers = authHeader ? { 'Authorization': authHeader } : {};
    
    const result = await proxyRequest(
      `${CATEGORY_SERVICE_URL}/v1/category/delete/${id}`,
      'PUT',
      undefined,
      headers
    );
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Delete category proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Subcategory management
export const createSubcategory: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const headers = authHeader ? { 'Authorization': authHeader } : {};
    
    const result = await proxyRequest(
      `${CATEGORY_SERVICE_URL}/v1/category/sub-category/create`,
      'POST',
      req.body,
      headers,
      true
    );
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Create subcategory proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSubcategory: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    const headers = authHeader ? { 'Authorization': authHeader } : {};
    
    const result = await proxyRequest(
      `${CATEGORY_SERVICE_URL}/v1/category/sub-category/update/${id}`,
      'PATCH',
      req.body,
      headers,
      true
    );
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Update subcategory proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSubcategory: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    const headers = authHeader ? { 'Authorization': authHeader } : {};
    
    const result = await proxyRequest(
      `${CATEGORY_SERVICE_URL}/v1/category/sub-category/delete/${id}`,
      'PUT',
      undefined,
      headers
    );
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Delete subcategory proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Product endpoints
export const getProducts: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const headers = authHeader ? { 'Authorization': authHeader } : {};
    
    const result = await proxyRequest(
      `${PRODUCT_SERVICE_URL}/v1/products`,
      'GET',
      undefined,
      headers
    );
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Products proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProduct: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await proxyRequest(`${PRODUCT_SERVICE_URL}/v1/products/${id}`);
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Product proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProductsBySubcategory: RequestHandler = async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    const authHeader = req.headers.authorization;
    const headers = authHeader ? { 'Authorization': authHeader } : {};
    
    const result = await proxyRequest(
      `${PRODUCT_SERVICE_URL}/v1/products/sub_category/${subCategoryId}`,
      'GET',
      undefined,
      headers
    );
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Products by subcategory proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProduct: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    const headers = authHeader ? { 'Authorization': authHeader } : {};
    
    const result = await proxyRequest(
      `${PRODUCT_SERVICE_URL}/v1/products/update/${id}`,
      'PATCH',
      req.body,
      headers,
      true
    );
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Update product proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProduct: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers.authorization;
    const headers = authHeader ? { 'Authorization': authHeader } : {};
    
    const result = await proxyRequest(
      `${PRODUCT_SERVICE_URL}/v1/products/delete/${id}`,
      'PUT',
      undefined,
      headers
    );
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Delete product proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProduct: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const headers = authHeader ? { 'Authorization': authHeader } : {};

    const result = await proxyRequest(
      `${PRODUCT_SERVICE_URL}/v1/products`,
      'POST',
      req.body,
      headers,
      true // Use form data
    );
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Create product proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const buyProduct: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const headers = authHeader ? { 'Authorization': authHeader } : {};

    const result = await proxyRequest(
      `${PRODUCT_SERVICE_URL}/v1/buy_product`,
      'POST',
      req.body,
      headers
    );
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Buy product proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Order Alert endpoints
export const getOrderAlerts: RequestHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const headers = authHeader ? { 'Authorization': authHeader } : {};
    const result = await proxyRequest(
      'http://0.0.0.0:9024/v1/order_alert/',
      'GET',
      undefined,
      headers
    );
    res.status(result.status).json(result.data);
  } catch (error) {
    console.error('Order alert proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
