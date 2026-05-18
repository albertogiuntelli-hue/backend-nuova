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
const upload = multer({ dest: "/tmp" });

// LISTA PROMO
router.get("/", getPromo);

// UPLOAD PROMO (CSV)
router.post("/", upload.single("file"), uploadPromo);

// DELETE PROMO
router.delete("/", deletePromo);

// DATE PROMO
router.get("/dates", getPromoDates);
router.post("/dates", savePromoDates);

export default router;
