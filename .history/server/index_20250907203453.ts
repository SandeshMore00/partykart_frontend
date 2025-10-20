import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  loginUser,
  getUserInformation,
  getCategories,
  getSubcategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getProducts,
  getProduct,
  getProductsBySubcategory,
  createProduct,
  updateProduct,
  deleteProduct,
  buyProduct
} from "./routes/proxy";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Proxy routes for external APIs
  // Auth endpoints
  app.post("/api/auth/login", loginUser);

  // User information endpoints
  app.get("/api/user/information", getUserInformation);

  // Category endpoints
  app.get("/api/categories", getCategories);
  app.get("/api/categories/:categoryId/subcategories", getSubcategories);
  app.post("/api/categories", createCategory);
  app.patch("/api/categories/:id", updateCategory);
  app.put("/api/categories/:id/delete", deleteCategory);

  // Subcategory endpoints
  app.post("/api/subcategories", createSubcategory);
  app.patch("/api/subcategories/:id", updateSubcategory);
  app.put("/api/subcategories/:id/delete", deleteSubcategory);

  // Product endpoints
  app.get("/api/products", getProducts);
  app.get("/api/products/:id", getProduct);
  app.get("/api/products/subcategory/:subCategoryId", getProductsBySubcategory);
  app.post("/api/products", createProduct);
  app.patch("/api/products/:id", updateProduct);
  app.put("/api/products/:id/delete", deleteProduct);
  app.post("/api/buy-product", buyProduct);

  return app;
}
