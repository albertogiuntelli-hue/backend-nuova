import fs from "fs";
import path from "path";

const dataDir = "/tmp";
const promoFile = path.join(dataDir, "promo.csv");
const promoDatesFile = path.join(dataDir, "promo-dates.json");

const FALLBACK_IMAGE = "/plusmarket-logo.png";

// Normalizza immagine (usa logo se mancante o invalida)
function normalizeImage(img) {
    if (!img) return FALLBACK_IMAGE;

    const cleaned = img.trim().toLowerCase();
    if (
        cleaned === "" ||
        cleaned === "null" ||
        cleaned === "undefined" ||
        cleaned === "-" ||
        cleaned === "n/d"
    ) {
        return FALLBACK_IMAGE;
    }

    return img.trim();
}

// Normalizza prezzo (gestisce virgolette e virgola decimale)
function normalizePrice(value) {
    if (!value) return 0;

    const cleaned = String(value)
        .replace(/"/g, "")   // rimuove virgolette
        .replace(/\s+/g, "") // rimuove spazi
        .trim();

    return Number(cleaned.replace(",", "."));
}

// Split universale , o ;
function smartSplit(row) {
    if (row.includes(";")) return row.split(";").map(x => x.trim());
    return row.split(",").map(x => x.trim());
}

// Garantisce che i file esistano
function ensurePromoFiles() {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(promoFile)) fs.writeFileSync(promoFile, "");
    if (!fs.existsSync(promoDatesFile))
        fs.writeFileSync(
            promoDatesFile,
            JSON.stringify({ start: "", end: "" }, null, 2)
        );
}

// GET /promo
export function getPromo(req, res) {
    try {
        ensurePromoFiles();

        const csv = fs.readFileSync(promoFile, "utf8");
        if (!csv.trim()) return res.json([]);

        const rows = csv
            .split("\n")
            .map(r => r.trim())
            .filter(r => r !== "");

        // salta intestazione
        const dataRows = rows.slice(1);

        const promo = dataRows
            .map(row => {
                const [codice, nome, prezzo, a_peso, immagine] = smartSplit(row);

                if (!codice) return null;

                const nomeFinale = (nome && nome.trim()) || codice.trim();

                return {
                    codice: codice.trim(),
                    descrizione: nomeFinale,
                    prezzo: normalizePrice(prezzo),
                    a_peso:
                        (a_peso || "").trim().toUpperCase() === "S" ? "S" : "N",
                    immagine: normalizeImage(immagine)
                };
            })
            .filter(Boolean);

        return res.json(promo);
    } catch (err) {
        console.error("Errore GET /promo:", err);
        return res.status(500).json({ error: "Errore lettura promo" });
    }
}

// UPLOAD /promo
export function uploadPromo(req, res) {
    try {
        ensurePromoFiles();

        if (!req.file)
            return res.status(400).json({ error: "Nessun file caricato" });

        const csv = fs.readFileSync(req.file.path, "utf8");
        fs.writeFileSync(promoFile, csv);

        fs.unlinkSync(req.file.path);

        return res.json({ message: "Promo caricate correttamente" });
    } catch (err) {
        console.error("Errore UPLOAD /promo:", err);
        return res
            .status(500)
            .json({ error: "Errore caricamento promo" });
    }
}

// GET /promo/dates
export function getPromoDates(req, res) {
    try {
        ensurePromoFiles();
        const data = JSON.parse(fs.readFileSync(promoDatesFile, "utf8"));
        return res.json(data);
    } catch (err) {
        console.error("Errore GET /promo/dates:", err);
        return res
            .status(500)
            .json({ error: "Errore lettura date promo" });
    }
}

// POST /promo/dates
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
        return res
            .status(500)
            .json({ error: "Errore salvataggio date promo" });
    }
}

// DELETE /promo
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
        return res
            .status(500)
            .json({ error: "Errore eliminazione promo" });
    }
}
