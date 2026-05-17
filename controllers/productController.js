import fs from "fs";
import path from "path";

// Cartella persistente Railway
const dataDir = "/mnt/data";
const productsFile = path.join(dataDir, "products.csv");

// Assicura che cartella e file esistano
function ensureProductsFile() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(productsFile)) {
        fs.writeFileSync(productsFile, "");
    }
}

/* ============================================================
   GET /api/products
============================================================ */
export function getProducts(req, res) {
    try {
        ensureProductsFile();

        const csv = fs.readFileSync(productsFile, "utf8");

        if (!csv.trim()) {
            return res.json([]);
        }

        const rows = csv
            .split("\n")
            .map(r => r.trim())
            .filter(r => r !== "");

        // 🔥 salta la prima riga (intestazione)
        const dataRows = rows.slice(1);

        const products = dataRows.map(row => {
            const [codiceRaw, nomeRaw, prezzoRaw, categoriaRaw, immagineRaw] = row.split(";");

            const codice = (codiceRaw || "").trim();
            const nome = (nomeRaw || "").trim();
            const prezzo = Number((prezzoRaw || "").replace(",", "."));
            const categoria = (categoriaRaw || "").trim().toUpperCase();
            const immagine = (immagineRaw || "").trim();

            if (!codice || !nome) return null;

            return {
                codice,
                nome,
                prezzo: isNaN(prezzo) ? 0 : prezzo,
                categoria,
                immagine
            };
        }).filter(p => p !== null);

        return res.json(products);
    } catch (error) {
        console.error("Errore GET /products:", error);
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

        const tempPath = req.file.path;
        const csv = fs.readFileSync(tempPath, "utf8");

        fs.writeFileSync(productsFile, csv);

        fs.unlinkSync(tempPath);

        return res.json({ message: "Prodotti caricati correttamente" });
    } catch (error) {
        console.error("Errore UPLOAD /products:", error);
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
    } catch (error) {
        console.error("Errore DELETE /products:", error);
        return res.status(500).json({ error: "Errore eliminazione prodotti" });
    }
}
