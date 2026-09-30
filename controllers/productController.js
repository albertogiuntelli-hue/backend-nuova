import fs from "fs";
import path from "path";

// Cartella corretta e persistente su Railway
const dataDir = "/tmp/uploads/products";
const productsFile = path.join(dataDir, "products.csv");

// Normalizza prezzo (accetta 1,99 – 1.99 – 199 – " 1,99 ")
function normalizePrice(value) {
    if (!value) return 0;

    let cleaned = String(value)
        .replace(/"/g, "")
        .replace(/\s+/g, "")
        .trim();

    // Se contiene virgola → sostituisci con punto
    cleaned = cleaned.replace(",", ".");

    // Se è un numero con decimali → converti in centesimi
    if (cleaned.includes(".")) {
        const euro = parseFloat(cleaned);
        return Math.round(euro * 100);
    }

    // Se è già un numero intero → centesimi
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? 0 : num;
}

// Normalizza immagine
function normalizeImage(img) {
    if (!img) return "/images/plusmarket-logo.png";

    const cleaned = img.trim().toLowerCase();

    if (
        cleaned === "" ||
        cleaned === "null" ||
        cleaned === "undefined" ||
        cleaned === "-" ||
        cleaned === "n/d"
    ) {
        return "/images/plusmarket-logo.png";
    }

    return img.trim();
}

/* ============================================================
   SPLIT INTELLIGENTE — FUNZIONA CON VIRGOLA, ;, TAB
   ============================================================ */
function smartSplit(row) {
    const separators = [";", "\t", ","];

    let bestSeparator = ",";
    let bestCount = 0;

    for (const sep of separators) {
        const count = row.split(sep).length;
        if (count > bestCount) {
            bestCount = count;
            bestSeparator = sep;
        }
    }

    let parts = row.split(bestSeparator).map(p => p.trim());

    // Caso CSV con virgola e prezzo tipo "2,75"
    if (bestSeparator === "," && parts.length > 5) {
        const codice = parts[0];
        const descrizione = parts[1];
        const prezzo = parts[2] + "," + parts[3];
        const a_peso = parts[4] || "N";
        const immagine = parts[5] || "";

        return [codice, descrizione, prezzo, a_peso, immagine];
    }

    return parts;
}

// Assicura che la cartella esista
function ensureProductsFile() {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(productsFile)) fs.writeFileSync(productsFile, "");
}

/* ============================================================
   GET /api/products
   ============================================================ */
export function getProducts(req, res) {
    try {
        ensureProductsFile();

        const csv = fs.readFileSync(productsFile, "utf8");
        if (!csv.trim()) return res.json([]);

        const rows = csv
            .split("\n")
            .map(r => r.trim())
            .filter(r => r !== "");

        const header = smartSplit(rows[0]).map(h => h.toLowerCase());
        const dataRows = rows.slice(1);

        const products = dataRows
            .map(row => {
                const parts = smartSplit(row);

                const codice = parts[0]?.trim();
                if (!codice) return null;

                // Colonna descrizione (nome o descrizione)
                const descrizione =
                    parts[1]?.trim() ||
                    parts[header.indexOf("nome")] ||
                    parts[header.indexOf("descrizione")] ||
                    "";

                // Colonna prezzo
                const prezzoRaw =
                    parts[2] ||
                    parts[header.indexOf("prezzo")] ||
                    parts[header.indexOf("a prezzo")] ||
                    "0";

                const prezzo = normalizePrice(prezzoRaw);

                // Colonna a_peso
                let a_peso =
                    parts[3] ||
                    parts[header.indexOf("a_peso")] ||
                    "N";

                a_peso = a_peso.trim().toUpperCase() === "S" ? "S" : "N";

                // Colonna immagine
                const immagine = normalizeImage(parts[4]);

                return {
                    codice,
                    descrizione,
                    prezzo,
                    a_peso,
                    immagine
                };
            })
            .filter(Boolean);

        return res.json(products);

    } catch (err) {
        console.error("Errore GET /products:", err);
        return res.status(500).json({ error: "Errore lettura prodotti" });
    }
}

/* ============================================================
   POST /api/products/upload
   ============================================================ */
export function uploadProducts(req, res) {
    try {
        ensureProductsFile();

        if (!req.file) {
            return res.status(400).json({ error: "Nessun file caricato" });
        }

        const csv = fs.readFileSync(req.file.path, "utf8");
        fs.writeFileSync(productsFile, csv);

        fs.unlinkSync(req.file.path);

        return res.json({ message: "Prodotti caricati correttamente" });

    } catch (err) {
        console.error("Errore UPLOAD /products:", err);
        return res.status(500).json({ error: "Errore caricamento prodotti" });
    }
}

/* ============================================================
   DELETE /api/products/delete
   ============================================================ */
export function deleteProducts(req, res) {
    try {
        ensureProductsFile();
        fs.writeFileSync(productsFile, "");
        return res.json({ message: "Prodotti eliminati" });
    } catch (err) {
        console.error("Errore DELETE /products:", err);
        return res.status(500).json({ error: "Errore eliminazione prodotti" });
    }
}
