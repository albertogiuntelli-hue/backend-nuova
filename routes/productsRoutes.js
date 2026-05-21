import express from "express";
import { getProducts } from "../controllers/productController.js";

const router = express.Router();

// GET prodotti
router.get("/", getProducts);

export default router;
