import fs from "fs";
import path from "path";

const dataDir = "/tmp";
const productsFile = path.join(dataDir, "prodotti.csv");

// Normalizza prezzo
function normalizePrice(value) {
    if (!value) return 0;

    const cleaned = String(value)
        .replace(/"/g, "")
        .replace(/\s+/g, "")
        .trim();

    const num = Number(cleaned.replace(",", "."));
    return isNaN(num) ? 0 : num;
}

// Normalizza immagine
function normalizeImage(img) {
    if (!img) return "/plusmarket-logo.png";

    const cleaned = img.trim().toLowerCase();

    if (
        cleaned === "" ||
        cleaned === "null" ||
        cleaned === "undefined" ||
        cleaned === "-" ||
        cleaned === "n/d"
    ) {
        return "/plusmarket-logo.png";
    }

    return img.trim();
}

// Split intelligente (TAB, ; oppure ,)
function smartSplit(row) {
    if (row.includes("\t")) return row.split("\t"); // CSV con TAB
    if (row.includes(";")) return row.split(";");   // CSV con ;
    return row.split(",");                          // CSV con ,
}

// Assicura che il file esista
function ensureProductsFile() {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(productsFile)) fs.writeFileSync(productsFile, "");
}

/* ============================================================
   GET /products
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

        const dataRows = rows.slice(1); // salta intestazione

        const products = dataRows
            .map(row => {
                const parts = smartSplit(row);

                const codice = parts[0]?.trim();
                const descrizione = (parts[1] || "").trim();
                const prezzo = normalizePrice(parts[2]);
                const a_peso = (parts[3] || "N").trim() || "N";
                const immagine = normalizeImage(parts[4]);

                // ❗ ORA BASTA IL CODICE, NON BUTTIAMO VIA LA RIGA SE LA DESCRIZIONE È VUOTA
                if (!codice) return null;

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
   POST /products/upload
   ============================================================ */
export function uploadProducts(req, res) {
    try {
        ensureProductsFile();

        if (!req.file) {
            return res.status(400).json({ error: "Nessun file caricato" });
        }

        const csv = fs.readFileSync(req.file.path, "utf8");
        fs.writeFileSync(productsFile, csv);

        // elimina il file temporaneo
        fs.unlinkSync(req.file.path);

        return res.json({ message: "Prodotti caricati correttamente" });

    } catch (err) {
        console.error("Errore UPLOAD /products:", err);
        return res.status(500).json({ error: "Errore caricamento prodotti" });
    }
}

/* ============================================================
   DELETE /products/delete
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
