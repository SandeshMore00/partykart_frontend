import { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Product, ProductResponse, ProductsResponse, CreateProductRequest, UpdateProductRequest } from "@shared/api";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Preserve original filename with timestamp to avoid conflicts
    const timestamp = Date.now();
    const originalName = path.parse(file.originalname).name;
    const ext = path.extname(file.originalname);
    const filename = `${originalName}-${timestamp}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// In-memory storage for demo purposes (replace with actual database)
let products: Product[] = [];
let nextProductId = 1;
let nextImageId = 1;

// Helper function to get all products
export const getAllProducts: RequestHandler = (req, res) => {
  try {
    const response: ProductsResponse = {
      status: 1,
      data: products,
      message: 'Products retrieved successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      status: 0,
      data: [],
      message: 'Internal server error'
    });
  }
};

// Helper function to get product by ID
export const getProductById: RequestHandler = (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.product_id === productId);
    
    if (!product) {
      return res.status(404).json({
        status: 0,
        data: null,
        message: 'Product not found'
      });
    }
    
    const response: ProductResponse = {
      status: 1,
      data: product,
      message: 'Product retrieved successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      status: 0,
      data: null,
      message: 'Internal server error'
    });
  }
};

// Helper function to create a new product
export const createProduct: RequestHandler = async (req, res) => {
  try {
    const { 
      product_name, 
      product_price, 
      product_description, 
      sub_category_id,
      weight,
      length,
      width,
      height,
      origin_location
    } = req.body;
    
    // Validate required fields
    if (!product_name || !product_price) {
      return res.status(400).json({
        status: 0,
        data: null,
        message: 'Missing required fields: product_name, product_price'
      });
    }
    
    // Create new product
    const newProduct: Product = {
      product_id: nextProductId++,
      product_name,
      product_price: parseInt(product_price), // Ensure integer price
      product_description: product_description || 'No information available for this product',
      sub_category_id: sub_category_id ? parseInt(sub_category_id) : 0,
      // Optional shipping fields
      weight: weight ? parseFloat(weight) : undefined,
      length: length ? parseFloat(length) : undefined,
      width: width ? parseFloat(width) : undefined,
      height: height ? parseFloat(height) : undefined,
      origin_location: origin_location || undefined,
      images: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Handle multiple file uploads (like FastAPI example)
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      console.log('Uploaded files metadata:', files.map(file => ({
        originalname: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        fieldname: file.fieldname
      })));
      
      newProduct.images = files.map((file, index) => ({
        id: nextImageId++,
        product_id: newProduct.product_id,
        image_url: `/uploads/products/${file.filename}`,
        is_main: index === 0, // First image is main
        created_at: new Date().toISOString()
      }));
    }
    
    products.push(newProduct);
    
    const response: ProductResponse = {
      status: 1,
      data: newProduct,
      message: 'Product created successfully'
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      status: 0,
      data: null,
      message: 'Internal server error'
    });
  }
};

  // Helper function to update a product
export const updateProduct: RequestHandler = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.product_id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({
        status: 0,
        data: null,
        message: 'Product not found'
      });
    }
    
    const existingProduct = products[productIndex];
    const { 
      product_name, 
      product_price, 
      product_description, 
      sub_category_id, 
      images_to_delete,
      weight,
      length,
      width,
      height,
      origin_location
    } = req.body;
    
    // Update product fields
    const updatedProduct: Product = {
      ...existingProduct,
      product_name: product_name || existingProduct.product_name,
      product_price: product_price ? parseInt(product_price) : existingProduct.product_price, // Ensure integer price
      product_description: product_description !== undefined ? product_description : existingProduct.product_description,
      sub_category_id: sub_category_id ? parseInt(sub_category_id) : existingProduct.sub_category_id,
      // Update shipping fields
      weight: weight !== undefined ? (weight ? parseFloat(weight) : undefined) : existingProduct.weight,
      length: length !== undefined ? (length ? parseFloat(length) : undefined) : existingProduct.length,
      width: width !== undefined ? (width ? parseFloat(width) : undefined) : existingProduct.width,
      height: height !== undefined ? (height ? parseFloat(height) : undefined) : existingProduct.height,
      origin_location: origin_location !== undefined ? origin_location : existingProduct.origin_location,
      updated_at: new Date().toISOString()
    };
    
    // Handle image deletions
    let remainingImages = existingProduct.images || [];
    if (images_to_delete) {
      const imagesToDeleteArray = Array.isArray(images_to_delete) ? images_to_delete : [images_to_delete];
      imagesToDeleteArray.forEach(imageIdStr => {
        const imageId = parseInt(imageIdStr);
        const imageToDelete = remainingImages.find(img => img.id === imageId);
        if (imageToDelete) {
          // Delete the actual file
          const imagePath = path.join(process.cwd(), 'public', imageToDelete.image_url);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
        remainingImages = remainingImages.filter(img => img.id !== imageId);
      });
    }
    
    // Handle new file uploads
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const newImages = files.map((file, index) => ({
        id: nextImageId++,
        product_id: updatedProduct.product_id,
        image_url: `/uploads/products/${file.filename}`,
        is_main: index === 0 && remainingImages.length === 0,
        created_at: new Date().toISOString()
      }));
      
      remainingImages = [...remainingImages, ...newImages];
    }
    
    updatedProduct.images = remainingImages;
    products[productIndex] = updatedProduct;
    
    const response: ProductResponse = {
      status: 1,
      data: updatedProduct,
      message: 'Product updated successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      status: 0,
      data: null,
      message: 'Internal server error'
    });
  }
};

// Helper function to delete a product
export const deleteProduct: RequestHandler = (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.product_id === productId);
    
    if (productIndex === -1) {
      return res.status(404).json({
        status: 0,
        data: null,
        message: 'Product not found'
      });
    }
    
    // Delete associated image files
    const product = products[productIndex];
    if (product.images) {
      product.images.forEach(image => {
        const imagePath = path.join(process.cwd(), 'public', image.image_url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }
    
    products.splice(productIndex, 1);
    
    res.json({
      status: 1,
      data: null,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      status: 0,
      data: null,
      message: 'Internal server error'
    });
  }
};

// Helper function to get products by subcategory
export const getProductsBySubcategory: RequestHandler = (req, res) => {
  try {
    const subCategoryId = parseInt(req.params.subCategoryId);
    const filteredProducts = products.filter(p => p.sub_category_id === subCategoryId);
    
    const response: ProductsResponse = {
      status: 1,
      data: filteredProducts,
      message: 'Products retrieved successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error fetching products by subcategory:', error);
    res.status(500).json({
      status: 0,
      data: [],
      message: 'Internal server error'
    });
  }
};

// Export multer middleware for use in routes
export { upload };
