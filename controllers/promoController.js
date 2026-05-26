import fs from "fs";
import path from "path";

const dataDir = "/tmp";
const promoFile = path.join(dataDir, "promo.csv");
const promoDatesFile = path.join(dataDir, "promo-dates.json");

const FALLBACK_IMAGE = "/plusmarket-logo.png";

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

// 🔥 PREZZO PROMO = GIÀ IN CENTESIMI → NON MOLTIPLICARE
function normalizePrice(value) {
    if (!value) return 0;

    const cleaned = String(value)
        .replace(/"/g, "")
        .replace(/\s+/g, "")
        .trim();

    const num = Number(cleaned.replace(",", "."));
    return isNaN(num) ? 0 : num; // 🔥 NON moltiplichiamo
}

function ensurePromoFiles() {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(promoFile)) fs.writeFileSync(promoFile, "");
    if (!fs.existsSync(promoDatesFile))
        fs.writeFileSync(promoDatesFile, JSON.stringify({ start: "", end: "" }, null, 2));
}

function smartSplit(row) {
    if (row.includes("\t")) return row.split("\t");
    if (row.includes(";")) return row.split(";");
    return row.split(",");
}

export const getPromo = (req, res) => {
    try {
        ensurePromoFiles();

        const csv = fs.readFileSync(promoFile, "utf8");
        if (!csv.trim()) return res.json([]);

        const rows = csv
            .split("\n")
            .map(r => r.trim())
            .filter(r => r !== "");

        const dataRows = rows.slice(1);

        const promo = dataRows
            .map(row => {
                const parts = smartSplit(row);

                const codice = (parts[0] || "").trim();
                const descrizione = (parts[1] || "").trim();
                const prezzo = normalizePrice(parts[2] || "0");
                const immagine = normalizeImage(parts[4] || ""); // 🔥 FIX IMMAGINE

                if (!codice) return null;

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

export const savePromoDates = (req, res) => {
    try {
        ensurePromoFiles();
        const { start, end } = req.body;
        fs.writeFileSync(promoDatesFile, JSON.stringify({ start, end }, null, 2));
        return res.json({ message: "Date promo salvate" });
    } catch (err) {
        console.error("Errore POST /promo/date:", err);
        return res.status(500).json({ error: "Errore salvataggio date promo" });
    }
};

export const deletePromo = (req, res) => {
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
};
