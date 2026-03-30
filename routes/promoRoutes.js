import express from "express";
import upload from "../middleware/upload.js";
import { getPromo, uploadPromo, deletePromo } from "../controllers/promoController.js";

const router = express.Router();

router.get("/", getPromo);
router.post("/upload", upload.single("file"), uploadPromo);
router.delete("/delete", deletePromo);

export default router;
