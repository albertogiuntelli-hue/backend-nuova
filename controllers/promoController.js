import fs from "fs";
import path from "path";
import readCSV from "../utils/readCSV.js";

const promoFolder = "/tmp/uploads/promo";
const promoDatesFile = "/tmp/promo-dates.json";

// Assicura che la cartella esista
if (!fs.existsSync(promoFolder)) {
    fs.mkdirSync(promoFolder, { recursive: true });
}

// 🔥 Funzione robusta per gestire immagini mancanti o sporche
const normalizeImage = (img) => {
    if (!img) return "/plusmarket-logo.png";

    const cleaned = img.trim().toLowerCase();

    if (
        cleaned === "" ||
        cleaned === "null" ||
        cleaned === "undefined" ||
        cleaned === "n/d" ||
        cleaned === "-" ||
        cleaned === "immagine promo"
    ) {
        return "/plusmarket-logo.png";
    }

    return img;
};

/* ============================================================
   GET PROMO
   ============================================================ */
export const getPromo = async (req, res) => {
    try {
        const files = fs.readdirSync(promoFolder);
        if (files.length === 0) return res.json([]);

        const latestFile = path.join(promoFolder, files[files.length - 1]);
        let promo = await readCSV(latestFile);

        promo = promo.map((p) => ({
            codice: p.codice,
            descrizione: p.nome,
            prezzo: p.prezzo,
            immagine: normalizeImage(p.immagine)
        }));

        res.json(promo);
    } catch (error) {
        console.error("Errore getPromo:", error);
        res.status(500).json({ error: "Errore nel leggere le promo" });
    }
};

/* ============================================================
   UPLOAD PROMO + SALVATAGGIO DATE
   ============================================================ */
export const uploadPromo = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Nessun file caricato" });

        const { data_inizio, data_fine } = req.body;

        if (!data_inizio || !data_fine) {
            return res.status(400).json({ error: "Date mancanti" });
        }

        // 🔥 Salva le date in /tmp/promo-dates.json
        fs.writeFileSync(
            promoDatesFile,
            JSON.stringify({ data_inizio, data_fine }, null, 2)
        );

        const filePath = req.file.path;
        let promo = await readCSV(filePath);

        promo = promo.map((p) => ({
            codice: p.codice,
            descrizione: p.nome,
            prezzo: p.prezzo,
            immagine: normalizeImage(p.immagine)
        }));

        // Cancella vecchi file promo
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

        fs.renameSync(filePath, path.join(promoFolder, req.file.filename));

        res.json({
            message: "Promo caricate con successo",
            data: promo,
            date: { data_inizio, data_fine }
        });

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

        // 🔥 Cancella anche le date
        if (fs.existsSync(promoDatesFile)) {
            fs.unlinkSync(promoDatesFile);
        }

        res.json({ message: "Tutte le promo sono state cancellate." });
    } catch (error) {
        console.error("Errore deletePromo:", error);
        res.status(500).json({ error: "Errore nella cancellazione delle promo" });
    }
};

/* ============================================================
   GET PROMO DATES (NUOVO)
   ============================================================ */
export const getPromoDates = async (req, res) => {
    try {
        if (!fs.existsSync(promoDatesFile)) {
            return res.json({ data_inizio: null, data_fine: null });
        }

        const data = fs.readFileSync(promoDatesFile, "utf8");
        res.json(JSON.parse(data));

    } catch (error) {
        console.error("Errore lettura date promo:", error);
        res.status(500).json({ error: "Errore nel leggere le date promo" });
    }
};
