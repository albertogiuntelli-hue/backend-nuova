import fs from "fs";
import path from "path";
import readCSV from "../utils/readCSV.js";

const productsFolder = "/tmp/uploads/products";

// Assicura che la cartella esista
if (!fs.existsSync(productsFolder)) {
    fs.mkdirSync(productsFolder, { recursive: true });
}

/* ============================================================
   GET PRODOTTI
   ============================================================ */
export const getProducts = async (req, res) => {
    try {
        const files = fs.readdirSync(productsFolder);
        if (files.length === 0) return res.json([]);

        const latestFile = path.join(productsFolder, files[files.length - 1]);
        const products = await readCSV(latestFile);

        res.json(products);
    } catch (error) {
        console.error("Errore getProducts:", error);
        res.status(500).json({ error: "Errore nel leggere i prodotti" });
    }
};

/* ============================================================
   UPLOAD PRODOTTI
   ============================================================ */
export const uploadProducts = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Nessun file caricato" });

        const filePath = req.file.path;
        const products = await readCSV(filePath);

        // Cancella file vecchi
        const files = fs.readdirSync(productsFolder);
        for (const f of files) {
            try {
                if (f !== req.file.filename) {
                    const fullPath = path.join(productsFolder, f);
                    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
                }
            } catch (err) {
                console.warn("Impossibile cancellare file prodotti:", f, err.message);
            }
        }

        // Sposta il file nella cartella prodotti
        fs.renameSync(filePath, path.join(productsFolder, req.file.filename));

        res.json({ message: "Prodotti caricati con successo", data: products });

    } catch (error) {
        console.error("Errore uploadProducts:", error);
        res.status(500).json({ error: "Errore nel caricamento del file prodotti" });
    }
};

/* ============================================================
   DELETE PRODOTTI
   ============================================================ */
export const deleteProducts = async (req, res) => {
    try {
        const files = fs.readdirSync(productsFolder);
        for (const f of files) {
            try {
                fs.unlinkSync(path.join(productsFolder, f));
            } catch (err) {
                console.warn("Errore cancellazione file prodotti:", f);
            }
        }

        res.json({ message: "Tutti i prodotti sono stati cancellati." });
    } catch (error) {
        console.error("Errore deleteProducts:", error);
        res.status(500).json({ error: "Errore nella cancellazione dei prodotti" });
    }
};
