import fs from "fs";
import path from "path";

// Percorsi compatibili con Railway
const dataDir = "/tmp";
const promoFile = path.join(dataDir, "promo.csv");
const promoDatesFile = path.join(dataDir, "promo-dates.json");

// Fallback immagine
const FALLBACK_IMAGE = "/plusmarket-logo.png";

// Normalizza immagine
function normalizeImage(img) {
    if (!img) return FALLBACK_IMAGE;

    const cleaned = img.trim().toLowerCase();

    if (
        cleaned === "" ||
        cleaned === "null" ||
        cleaned === "undefined" ||
        cleaned === "-" ||
        cleaned === "n/d" ||
        cleaned === "immagine promo"
    ) {
        return FALLBACK_IMAGE;
    }

    return img.trim();
}

// Normalizza prezzo → EURO → CENTESIMI
function normalizePrice(value) {
    if (!value) return 0;

    const cleaned = String(value)
        .replace(/"/g, "")
        .replace(/\s+/g, "")
        .trim();

    const euro = Number(cleaned.replace(",", "."));
    if (isNaN(euro)) return 0;

    return Math.round(euro * 100); // 🔥 CONVERSIONE CORRETTA
}

// Assicura che i file esistano
function ensurePromoFiles() {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(promoFile)) fs.writeFileSync(promoFile, "");
    if (!fs.existsSync(promoDatesFile))
        fs.writeFileSync(promoDatesFile, JSON.stringify({ start: "", end: "" }, null, 2));
}

/* ============================================================
   GET PROMO
   ============================================================ */
export const getPromo = (req, res) => {
    try {
        ensurePromoFiles();

        const csv = fs.readFileSync(promoFile, "utf8");
        if (!csv.trim()) return res.json([]);

        const rows = csv.split("\n").map(r => r.trim()).filter(r => r !== "");
        const dataRows = rows.slice(1);

        const promo = dataRows
            .map(row => {
                const parts = row.includes(";") ? row.split(";") : row.split(",");

                const codice = parts[0]?.trim();
                const descrizione = parts[1]?.trim();
                const prezzo = normalizePrice(parts[2]); // 🔥 ORA IN CENTESIMI
                const immagine = normalizeImage(parts[4]);

                if (!codice || !descrizione) return null;

                return {
                    codice,
                    descrizione,
                    prezzo,
                    immagine
                };
            })
            .filter(Boolean);

        return res.json(promo);

    } catch (err) {
        console.error("Errore GET /promo:", err);
        return res.status(500).json({ error: "Errore lettura promo" });
    }
};

/* ============================================================
   UPLOAD PROMO
   ============================================================ */
export const uploadPromo = (req, res) => {
    try {
        ensurePromoFiles();

        if (!req.file) return res.status(400).json({ error: "Nessun file caricato" });

        const csv = fs.readFileSync(req.file.path, "utf8");
        fs.writeFileSync(promoFile, csv);

        fs.unlinkSync(req.file.path);

        return res.json({ message: "Promo caricate correttamente" });

    } catch (err) {
        console.error("Errore UPLOAD /promo:", err);
        return res.status(500).json({ error: "Errore caricamento promo" });
    }
};

/* ============================================================
   GET PROMO DATES
   ============================================================ */
export const getPromoDates = (req, res) => {
    try {
        ensurePromoFiles();
        const data = JSON.parse(fs.readFileSync(promoDatesFile, "utf8"));
        return res.json(data);
    } catch (err) {
        console.error("Errore GET /promo/dates:", err);
        return res.status(500).json({ error: "Errore lettura date promo" });
    }
};

/* ============================================================
   SAVE PROMO DATES
   ============================================================ */
export const savePromoDates = (req, res) => {
    try {
        ensurePromoFiles();

        const { start, end } = req.body;

        fs.writeFileSync(
            promoDatesFile,
            JSON.stringify({ start, end }, null, 2)
        );

        return res.json({ message: "Date promo salvate" });

    } catch (err) {
        console.error("Errore POST /promo/date:", err);
        return res.status(500).json({ error: "Errore salvataggio date promo" });
    }
};

/* ============================================================
   DELETE PROMO
   ============================================================ */
export const deletePromo = (req, res) => {
    try {
        ensurePromoFiles();
        fs.writeFileSync(promoFile, "");
        fs.writeFileSync(promoDatesFile, JSON.stringify({ start: "", end: "" }, null, 2));
        return res.json({ message: "Promo eliminate" });
    } catch (err) {
        console.error("Errore DELETE /promo:", err);
        return res.status(500).json({ error: "Errore eliminazione promo" });
    }
};
