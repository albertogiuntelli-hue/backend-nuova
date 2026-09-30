import fs from "fs";
import path from "path";

// Cartella persistente (NON /tmp)
const dataDir = "/app/data/products";
const productsFile = path.join(dataDir, "products.csv");

/* ============================================================
   PULIZIA CAMPI — RIMUOVE VIRGOLETTE E SPAZI
   ============================================================ */
function cleanField(value) {
    if (!value) return "";
    return String(value)
        .replace(/^"+|"+$/g, "")   // rimuove virgolette inizio/fine
        .replace(/"/g, "")         // rimuove virgolette interne
        .trim();
}

/* ============================================================
   SPLIT CORRETTO — PRIORITÀ AL TAB
   ============================================================ */
function smartSplit(row) {
    // 1. CSV del tuo programma → usa TAB
    if (row.includes("\t")) {
        return row.split("\t").map(p => cleanField(p));
    }

    // 2. Punto e virgola
    if (row.includes(";")) {
        return row.split(";").map(p => cleanField(p));
    }

    // 3. Virgola → MA attenzione al prezzo "2,75"
    const parts = row.split(",");
    if (parts.length === 2) {
        // caso prezzo
        return [cleanField(parts[0] + "," + parts[1])];
    }

    return parts.map(p => cleanField(p));
}

/* ============================================================
   NORMALIZZA PREZZO
   ============================================================ */
function normalizePrice(value) {
    if (!value) return 0;

    let cleaned = cleanField(value).replace(",", ".");

    if (cleaned.includes(".")) {
        const euro = parseFloat(cleaned);
        return Math.round(euro * 100);
    }

    const num = parseInt(cleaned, 10);
    return isNaN(num) ? 0 : num;
}

/* ============================================================
   NORMALIZZA IMMAGINE
   ============================================================ */
function normalizeImage(img) {
    const cleaned = cleanField(img);

    if (
        cleaned === "" ||
        cleaned === "null" ||
        cleaned === "undefined" ||
        cleaned === "-" ||
        cleaned === "n/d"
    ) {
        return "/images/plusmarket-logo.png";
    }

    return cleaned;
}

/* ============================================================
   ASSICURA CARTELLA
   ============================================================ */
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

                const codice = cleanField(parts[0]);
                if (!codice) return null;

                const descrizione =
                    cleanField(parts[1]) ||
                    cleanField(parts[header.indexOf("descrizione")]) ||
                    "";

                const prezzoRaw =
                    cleanField(parts[2]) ||
                    cleanField(parts[header.indexOf("prezzo")]) ||
                    "0";

                const prezzo = normalizePrice(prezzoRaw);

                let a_peso =
                    cleanField(parts[3]) ||
                    cleanField(parts[header.indexOf("a_peso")]) ||
                    "N";

                a_peso = a_peso.toUpperCase() === "S" ? "S" : "N";

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
