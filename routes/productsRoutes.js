import express from "express";
import multer from "multer";

// ❌ Disattiviamo completamente i prodotti
// import {
//     getProducts,
//     uploadProducts,
//     deleteProducts
// } from "../controllers/productController.js";

const router = express.Router();

// ❌ Disattiviamo multer per i prodotti
// const upload = multer({ dest: "/tmp" });

// ❌ Disattiviamo tutte le rotte
// router.get("/", getProducts);
// router.post("/upload", upload.single("file"), uploadProducts);
// router.delete("/delete", deleteProducts);

// ❌ Disattiviamo l’export del router
export default router;
