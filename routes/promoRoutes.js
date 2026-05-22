import express from "express";
import multer from "multer";

import {
    getPromo,
    uploadPromo,
    deletePromo,
    getPromoDates,
    savePromoDates
} from "../controllers/promoController.js";

const router = express.Router();

// multer salva i file temporanei in /tmp
const upload = multer({ dest: "/tmp" });

// GET /promo
router.get("/", getPromo);

// POST /promo/upload
router.post("/upload", upload.single("file"), uploadPromo);

// DELETE /promo/delete
router.delete("/delete", deletePromo);

// GET /promo/dates
router.get("/dates", getPromoDates);

// POST /promo/dates
router.post("/dates", savePromoDates);

export default router;
