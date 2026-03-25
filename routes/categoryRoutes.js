import express from "express";
import { getAllCategories } from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const categories = await getAllCategories();
        res.status(200).json(categories);
    } catch (error) {
        console.error("Errore getAllCategories:", error);
        res.status(500).json({ error: "Errore nel recupero categorie" });
    }
});

export default router;
