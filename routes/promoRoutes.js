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

// Multer salva i file temporanei in una cartella PERSISTENTE su Railway
const upload = multer({ dest: "/mnt/data/promo" });

// GET /api/promo → restituisce tutte le promo
router.get("/", getPromo);

// POST /api/promo/upload → carica CSV promo
router.post("/upload", upload.single("file"), uploadPromo);

// DELETE /api/promo/delete → elimina tutte le promo
router.delete("/delete", deletePromo);

// GET /api/promo/dates → restituisce date promo
router.get("/dates", getPromoDates);

// POST /api/promo/date → salva date promo
router.post("/date", savePromoDates);

export default router;
