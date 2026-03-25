import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

// cartella uploads
const uploadDir = path.join(process.cwd(), "backend", "uploads");

// assicura che la cartella esista
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// multer: salva file temporanei
const upload = multer({ dest: uploadDir });

// POST /api/upload
router.post("/", upload.single("csv"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Nessun file caricato" });
        }

        const original = req.file.originalname.toLowerCase();

        let targetName = null;

        // riconoscimento intelligente
        if (original.includes("product") || original.includes("prodotti")) {
            targetName = "products-latest.csv";
        } else if (original.includes("promo") || original.includes("offerte")) {
            targetName = "promo-latest.csv";
        } else if (original.includes("order") || original.includes("ordini")) {
            targetName = "orders-latest.csv";
        } else if (original.includes("user") || original.includes("utenti")) {
            targetName = "users-latest.csv";
        } else if (original.includes("categor")) {
            targetName = "categories-latest.csv";
        } else {
            return res.status(400).json({
                message: "Nome file non riconosciuto. Usa: products, promo, orders, users, categories."
            });
        }

        const finalPath = path.join(uploadDir, targetName);

        // sovrascrive il file precedente
        fs.renameSync(req.file.path, finalPath);

        return res.json({
            message: `CSV aggiornato correttamente: ${targetName}`
        });

    } catch (error) {
        console.error("Errore upload CSV:", error);
        return res.status(500).json({ message: "Errore durante l'upload" });
    }
});

export default router;
