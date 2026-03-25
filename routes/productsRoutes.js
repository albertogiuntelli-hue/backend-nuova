import express from "express";
import upload from "../middleware/upload.js";
import { getProducts, uploadProducts, deleteProducts } from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/upload", upload.single("file"), uploadProducts);
router.delete("/delete", deleteProducts);

export default router;
