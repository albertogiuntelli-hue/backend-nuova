import express from "express";
import multer from "multer";

import {
    getPromo,
    uploadPromo,
    deletePromo
} from "../controllers/promoController.js";

const router = express.Router();
const upload = multer({ dest: "/tmp" });

// GET promo
router.get("/", getPromo);

// UPLOAD promo CSV
router.post("/", upload.single("file"), uploadPromo);

// DELETE promo
router.delete("/", deletePromo);

export default router;
