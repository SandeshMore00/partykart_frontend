import { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for dashboard image uploads 
const dashboardStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'dashboard');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'dashboard-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const dashboardUpload = multer({ 
  storage: dashboardStorage,
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
interface DashboardImage {
  id: number;
  image_url: string;
  dashboard_image_order: number;
  created_at: string;
}

let dashboardImages: DashboardImage[] = [];
let nextDashboardImageId = 1;

// GET /api/v1/products/dashboard-image/ - Get all dashboard images
export const getAllDashboardImages: RequestHandler = (req, res) => {
  try {
    // Sort by dashboard_image_order
    const sortedImages = [...dashboardImages].sort((a, b) => a.dashboard_image_order - b.dashboard_image_order);
    
    res.json({
      status: 1,
      data: sortedImages,
      message: 'Dashboard images retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching dashboard images:', error);
    res.status(500).json({
      status: 0,
      data: [],
      message: 'Internal server error'
    });
  }
};

// POST /api/v1/products/dashboard-image - Create dashboard image (admin only)
export const createDashboardImage: RequestHandler = async (req, res) => {
  try {
    const { dashboard_image_order } = req.body;
    
    // Validate required fields
    if (!dashboard_image_order) {
      return res.status(400).json({
        status: 0,
        data: null,
        message: 'Missing required field: dashboard_image_order'
      });
    }
    
    // Check if order number already exists
    const existingOrder = dashboardImages.find(img => img.dashboard_image_order === parseInt(dashboard_image_order));
    if (existingOrder) {
      return res.status(400).json({
        status: 0,
        data: null,
        message: 'Dashboard image order already exists'
      });
    }
    
    // Handle file upload
    const file = req.file as Express.Multer.File;
    if (!file) {
      return res.status(400).json({
        status: 0,
        data: null,
        message: 'Image file is required'
      });
    }
    
    // Create new dashboard image
    const newDashboardImage: DashboardImage = {
      id: nextDashboardImageId++,
      image_url: `/uploads/dashboard/${file.filename}`,
      dashboard_image_order: parseInt(dashboard_image_order),
      created_at: new Date().toISOString()
    };
    
    dashboardImages.push(newDashboardImage);
    
    res.status(201).json({
      status: 1,
      data: newDashboardImage,
      message: 'Dashboard image created successfully'
    });
  } catch (error) {
    console.error('Error creating dashboard image:', error);
    res.status(500).json({
      status: 0,
      data: null,
      message: 'Internal server error'
    });
  }
};

// Export multer middleware for dashboard images
export { dashboardUpload };






