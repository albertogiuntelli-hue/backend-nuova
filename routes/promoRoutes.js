import express from "express";
import upload from "../middleware/upload.js";
import {
    getPromo,
    uploadPromo,
    deletePromo,
    getPromoDates
} from "../controllers/promoController.js";

const router = express.Router();

// GET promo
router.get("/", getPromo);

// GET promo dates
router.get("/dates", getPromoDates);

// UPLOAD promo + dates
router.post("/upload", upload.single("file"), uploadPromo);

// DELETE promo
router.delete("/delete", deletePromo);

export default router;
