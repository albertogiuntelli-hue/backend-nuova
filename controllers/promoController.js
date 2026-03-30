import fs from "fs";
import path from "path";
import readCSV from "../utils/readCSV.js";

const promoFolder = "/tmp/uploads/promo";

// Assicura che la cartella esista
if (!fs.existsSync(promoFolder)) {
    fs.mkdirSync(promoFolder, { recursive: true });
}

/* ============================================================
   GET PROMO
   ============================================================ */
export const getPromo = async (req, res) => {
    try {
        const files = fs.readdirSync(promoFolder);
        if (files.length === 0) return res.json([]);

        const latestFile = path.join(promoFolder, files[files.length - 1]);
        let promo = await readCSV(latestFile);

        // 🔥 Fallback immagine identico ai prodotti
        promo = promo.map((p) => {
            const img = p.immagine || p.img || p.foto || "";

            if (!img || img.trim() === "" || img.toLowerCase() === "null") {
                return { ...p, immagine: "/plusmarket-logo.png" };
            }

            return { ...p, immagine: img };
        });

        res.json(promo);
    } catch (error) {
        console.error("Errore getPromo:", error);
        res.status(500).json({ error: "Errore nel leggere le promo" });
    }
};

/* ============================================================
   UPLOAD PROMO
   ============================================================ */
export const uploadPromo = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Nessun file caricato" });

        const filePath = req.file.path;
        let promo = await readCSV(filePath);

        // 🔥 Applichiamo la stessa logica immagine dei prodotti
        promo = promo.map((p) => {
            const img = p.immagine || p.img || p.foto || "";

            if (!img || img.trim() === "" || img.toLowerCase() === "null") {
                return { ...p, immagine: "/plusmarket-logo.png" };
            }

            return { ...p, immagine: img };
        });

        // Cancella file vecchi in modo sicuro
        const files = fs.readdirSync(promoFolder);
        for (const f of files) {
            try {
                if (f !== req.file.filename) {
                    const fullPath = path.join(promoFolder, f);
                    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
                }
            } catch (err) {
                console.warn("Impossibile cancellare file promo:", f, err.message);
            }
        }

        // Sposta il file nella cartella promo
        fs.renameSync(filePath, path.join(promoFolder, req.file.filename));

        res.json({ message: "Promo caricate con successo", data: promo });

    } catch (error) {
        console.error("Errore uploadPromo:", error);
        res.status(500).json({ error: "Errore nel caricamento del file promo" });
    }
};

/* ============================================================
   DELETE PROMO
   ============================================================ */
export const deletePromo = async (req, res) => {
    try {
        const files = fs.readdirSync(promoFolder);
        for (const f of files) {
            try {
                fs.unlinkSync(path.join(promoFolder, f));
            } catch (err) {
                console.warn("Errore cancellazione file promo:", f);
            }
        }

        res.json({ message: "Tutte le promo sono state cancellate." });
    } catch (error) {
        console.error("Errore deletePromo:", error);
        res.status(500).json({ error: "Errore nella cancellazione delle promo" });
    }
};
