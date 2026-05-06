import express from "express";
import multer from "multer";
import {
    getPromo,
    uploadPromo,
    deletePromo,
    getPromoDates
} from "../controllers/promoController.js";

const router = express.Router();
const upload = multer({ dest: "/tmp/uploads/promo" });

// GET promo
router.get("/", getPromo);

// GET promo dates
router.get("/dates", getPromoDates);

// UPLOAD promo + dates
router.post("/upload", upload.single("file"), uploadPromo);

// DELETE promo
router.delete("/delete", deletePromo);

export default router;
