import express from "express";
import upload from "../middleware/upload.js";
import {
    getPromo,
    uploadPromo,
    deletePromo
} from "../controllers/promoController.js";

const router = express.Router();

// GET promo
router.get("/", getPromo);

// UPLOAD promo
router.post("/upload", upload.single("file"), uploadPromo);

// DELETE promo
router.delete("/delete", deletePromo);

export default router;
