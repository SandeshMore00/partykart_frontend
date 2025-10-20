import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  getProductsBySubcategory,
  upload 
} from "./routes/products";
import { 
  getAllDashboardImages, 
  createDashboardImage, 
  dashboardUpload 
} from "./routes/dashboard-images";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Serve static files from public directory
  app.use('/uploads', express.static('public/uploads'));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Dashboard Image API routes (must be before product routes to avoid conflict)
  app.get("/api/v1/products/dashboard-image/", getAllDashboardImages);
  app.post("/api/v1/products/dashboard-image", dashboardUpload.single('file'), createDashboardImage);

  // Product API routes
  app.get("/api/v1/products", getAllProducts);
  app.get("/api/v1/products/:id", getProductById);
  app.post("/api/v1/products", upload.array('files', 10), createProduct); // Allow up to 10 files
  app.put("/api/v1/products/update/:id", upload.array('files', 10), updateProduct);
  app.delete("/api/v1/products/:id/delete", deleteProduct);
  app.get("/api/v1/products/sub_category/:subCategoryId", getProductsBySubcategory);

  return app;
}


