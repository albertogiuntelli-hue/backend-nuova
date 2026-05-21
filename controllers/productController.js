import fs from "fs";
import path from "path";

const dataDir = "/tmp";
const productsFile = path.join(dataDir, "prodotti.csv");

function normalizePrice(value) {
    if (!value) return 0;
    return Number(value.replace(",", "."));
}

function smartSplit(row) {
    if (row.includes(";")) return row.split(";");
    return row.split(",");
}

function ensureProductsFile() {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(productsFile)) fs.writeFileSync(productsFile, "");
}

export function getProducts(req, res) {
    try {
        ensureProductsFile();

        const csv = fs.readFileSync(productsFile, "utf8");
        if (!csv.trim()) return res.json([]);

        const rows = csv.split("\n").map(r => r.trim()).filter(r => r !== "");
        const dataRows = rows.slice(1);

        const products = dataRows
            .map(row => {
                const [codice, descrizione, prezzo] = smartSplit(row);

                if (!codice || !descrizione) return null;

                return {
                    codice: codice.trim(),
                    descrizione: descrizione.trim(),
                    prezzo: normalizePrice(prezzo),
                    a_peso: "N" // i prodotti non hanno peso
                };
            })
            .filter(Boolean);

        return res.json(products);

    } catch (err) {
        console.error("Errore GET /prodotti:", err);
        return res.status(500).json({ error: "Errore lettura prodotti" });
    }
}
