import express from "express";
import multer from "multer";

import {
    getProducts,
    uploadProducts,
    deleteProducts
} from "../controllers/productController.js";

const router = express.Router();

// multer salva i file temporanei in /tmp
const upload = multer({ dest: "/tmp" });

// GET /api/products
router.get("/", getProducts);

// POST /api/products/upload
router.post("/upload", upload.single("file"), uploadProducts);

// DELETE /api/products/delete
router.delete("/delete", deleteProducts);

export default router;
