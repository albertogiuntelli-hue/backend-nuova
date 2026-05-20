// backend/controllers/promoController.js
import fs from "fs";
import path from "path";
import csvParser from "../utils/csvParser.js";

const dataDir = "/mnt/data";
const promoFile = path.join(dataDir, "promo.csv");
const promoDatesFile = path.join(dataDir, "promo-dates.json");

// Fallback immagine
const FALLBACK_IMAGE = "/plusmarket-logo.png";

function ensurePromoFiles() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(promoFile)) {
        fs.writeFileSync(promoFile, "");
    }
    if (!fs.existsSync(promoDatesFile)) {
        fs.writeFileSync(
            promoDatesFile,
            JSON.stringify({ start: "", end: "" }, null, 2)
        );
    }
}

// 🔍 Confronta due stringhe CSV: se identiche, non serve riscrivere
function isSameContent(oldContent, newContent) {
    const normalize = (s) =>
        (s || "")
            .replace(/\r\n/g, "\n")
            .trim();
    return normalize(oldContent) === normalize(newContent);
}

// GET /promo
export async function getPromo(req, res) {
    try {
        ensurePromoFiles();

        const csvStat = fs.statSync(promoFile);
        if (!csvStat.size) {
            return res.json([]);
        }

        // Usa lo stesso parser del client-mobile
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
        ensurePromoFiles();

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
        ensurePromoFiles();
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
        ensurePromoFiles();

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
        ensurePromoFiles();
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
