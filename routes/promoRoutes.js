import express from "express";
import upload from "../middleware/upload.js";
import {
    getPromo,
    uploadPromo,
    deletePromo,
    savePromoDates
} from "../controllers/promoController.js";

const router = express.Router();

router.get("/", getPromo);
router.post("/upload", upload.single("file"), uploadPromo);
router.delete("/delete", deletePromo);

// ⭐ NUOVA ROUTE SICURA PER LE DATE
router.post("/date", savePromoDates);

export default router;
