import fs from "fs";
import path from "path";
import csvParser from "../utils/csvParser.js";

// Assicura che /mnt/data esista SEMPRE
const dataDir = "/mnt/data";
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const promoFile = path.join(dataDir, "promo.csv");
const promoDatesFile = path.join(dataDir, "promo-dates.json");

const FALLBACK_IMAGE = "/plusmarket-logo.png";

// Normalizza contenuto CSV per confronto
function normalizeCsv(str) {
    return (str || "").replace(/\r\n/g, "\n").trim();
}

function isSameContent(oldContent, newContent) {
    return normalizeCsv(oldContent) === normalizeCsv(newContent);
}

// GET /promo
export async function getPromo(req, res) {
    try {
        if (!fs.existsSync(promoFile)) {
            return res.json([]);
        }

        const stats = fs.statSync(promoFile);
        if (!stats.size) {
            return res.json([]);
        }

        const promo = await csvParser(promoFile);

        const normalized = promo.map((p) => ({
            ...p,
            immagine:
                p.immagine && p.immagine.trim() !== ""
                    ? p.immagine.trim()
                    : FALLBACK_IMAGE,
        }));

        return res.json(normalized);
    } catch (err) {
        console.error("Errore GET /promo:", err);
        return res.status(500).json({ error: "Errore lettura promo" });
    }
}

// POST /promo/upload
export function uploadPromo(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Nessun file caricato" });
        }

        const newCsv = fs.readFileSync(req.file.path, "utf8");
        let shouldWrite = true;

        if (fs.existsSync(promoFile)) {
            const oldCsv = fs.readFileSync(promoFile, "utf8");
            if (isSameContent(oldCsv, newCsv)) {
                shouldWrite = false;
            }
        }

        if (shouldWrite) {
            fs.writeFileSync(promoFile, newCsv);
        }

        fs.unlinkSync(req.file.path);

        return res.json({
            message: shouldWrite
                ? "Promo aggiornate correttamente"
                : "File identico a quello già presente, nessuna modifica applicata",
        });
    } catch (err) {
        console.error("Errore UPLOAD /promo:", err);
        return res.status(500).json({ error: "Errore caricamento promo" });
    }
}

// GET /promo/date
export function getPromoDates(req, res) {
    try {
        if (!fs.existsSync(promoDatesFile)) {
            return res.json({ start: "", end: "" });
        }

        const data = JSON.parse(fs.readFileSync(promoDatesFile, "utf8"));
        return res.json(data);
    } catch (err) {
        console.error("Errore GET /promo/dates:", err);
        return res.status(500).json({ error: "Errore lettura date promo" });
    }
}

// POST /promo/date
export function savePromoDates(req, res) {
    try {
        const { start, end } = req.body;

        fs.writeFileSync(
            promoDatesFile,
            JSON.stringify({ start, end }, null, 2)
        );

        return res.json({ message: "Date promo salvate" });
    } catch (err) {
        console.error("Errore POST /promo/dates:", err);
        return res.status(500).json({ error: "Errore salvataggio date promo" });
    }
}

// DELETE /promo/delete
export function deletePromo(req, res) {
    try {
        fs.writeFileSync(promoFile, "");
        fs.writeFileSync(
            promoDatesFile,
            JSON.stringify({ start: "", end: "" }, null, 2)
        );

        return res.json({ message: "Promo eliminate" });
    } catch (err) {
        console.error("Errore DELETE /promo:", err);
        return res.status(500).json({ error: "Errore eliminazione promo" });
    }
}
