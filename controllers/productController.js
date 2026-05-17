import fs from "fs";
import path from "path";

const dataDir = "/mnt/data";
const productsFile = path.join(dataDir, "products.csv");

function ensureProductsFile() {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(productsFile)) fs.writeFileSync(productsFile, "");
}

// Funzione che capisce automaticamente se usare virgola o punto e virgola
function smartSplit(row) {
    if (row.includes(";")) return row.split(";");
    return row.split(",");
}

export function getProducts(req, res) {
    try {
        ensureProductsFile();

        const csv = fs.readFileSync(productsFile, "utf8");
        if (!csv.trim()) return res.json([]);

        const rows = csv.split("\n").map(r => r.trim()).filter(r => r !== "");

        // Salta intestazione
        const dataRows = rows.slice(1);

        const products = dataRows.map(row => {
            const [codiceRaw, nomeRaw, prezzoRaw, categoriaRaw, immagineRaw] = smartSplit(row);

            if (!codiceRaw || !nomeRaw) return null;

            return {
                codice: codiceRaw.trim(),
                nome: nomeRaw.trim(),
                prezzo: Number((prezzoRaw || "").replace(",", ".")),
                categoria: (categoriaRaw || "").trim(),
                immagine: (immagineRaw || "").trim()
            };
        }).filter(Boolean);

        return res.json(products);

    } catch (err) {
        console.error("Errore GET /products:", err);
        return res.status(500).json({ error: "Errore lettura prodotti" });
    }
}

export function uploadProducts(req, res) {
    try {
        ensureProductsFile();

        if (!req.file) return res.status(400).json({ error: "Nessun file caricato" });

        const csv = fs.readFileSync(req.file.path, "utf8");
        fs.writeFileSync(productsFile, csv);
        fs.unlinkSync(req.file.path);

        return res.json({ message: "Prodotti caricati correttamente" });

    } catch (err) {
        console.error("Errore UPLOAD /products:", err);
        return res.status(500).json({ error: "Errore caricamento prodotti" });
    }
}

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
