import express from "express";
import upload from "../middleware/upload.js";
import { getProdotti, uploadProdotti, deleteProdotti } from "../controllers/productController.js";

const router = express.Router();

// GET prodotti
router.get("/", getProdotti);

// UPLOAD prodotti
router.post("/upload", upload.single("file"), uploadProdotti);

// DELETE prodotti
router.delete("/delete", deleteProdotti);

export default router;
