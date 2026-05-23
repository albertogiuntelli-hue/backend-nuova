import fs from "fs";
import path from "path";

const dataDir = "/tmp";
const promoFile = path.join(dataDir, "promo.csv");

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
        cleaned === "n/d"
    ) {
        return FALLBACK_IMAGE;
    }

    return img.trim();
}

// Normalizza prezzo
function normalizePrice(value) {
    if (!value) return 0;

    const cleaned = String(value)
        .replace(/"/g, "")
        .replace(/\s+/g, "")
        .trim();

    return Number(cleaned.replace(",", "."));
}

// Split CSV
function smartSplit(row) {
    if (row.includes(";")) return row.split(";").map(x => x.trim());
    return row.split(",").map(x => x.trim());
}

export const getPromo = () => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(promoFile)) {
            return resolve([]);
        }

        const csv = fs.readFileSync(promoFile, "utf8");
        if (!csv.trim()) return resolve([]);

        const rows = csv.split("\n").map(r => r.trim()).filter(r => r !== "");
        const dataRows = rows.slice(1); // salta intestazione

        const results = dataRows.map(row => {
            const [codice, nome, prezzo, a_peso, immagine] = smartSplit(row);

            if (!codice) return null;

            const nomeFinale = nome && nome.trim() ? nome.trim() : codice.trim();

            return {
                codice: codice.trim(),
                descrizione: nomeFinale,
                prezzo: normalizePrice(prezzo),
                a_peso: (a_peso || "").trim().toUpperCase() === "S" ? "S" : "N",
                immagine: normalizeImage(immagine)
            };
        }).filter(Boolean);

        resolve(results);
    });
};
