import path from "path";
import readCSV from "../utils/readCSV.js";
import fs from "fs";

const productsFolder = path.resolve("uploads/products");

// GET PRODOTTI
export const getProducts = async (req, res) => {
    try {
        const files = fs.readdirSync(productsFolder);
        if (files.length === 0) return res.json([]);

        const latestFile = path.join(productsFolder, files[files.length - 1]);
        const products = await readCSV(latestFile);

        products.forEach(p => {
            // 1️⃣ Se il CSV ha "immagine", usiamo quello
            let img = p.immagine || "";

            // 2️⃣ Se contiene testo NON valido (descrizione, nome, ecc.)
            //    lo ignoriamo
            if (img.length < 5 || img.includes(" ")) {
                img = "";
            }

            // 3️⃣ Se non c’è immagine → logo PlusMarket
            if (!img) {
                img = "/images/plusmarket-logo.png";
            }

            // 4️⃣ Impostiamo il campo corretto che il frontend usa
            p.image = img;
        });

        res.json(products);

    } catch (error) {
        console.error("Errore getProducts:", error);
        res.status(500).json({ error: "Errore nel leggere i prodotti" });
    }
};

// UPLOAD PRODOTTI
export const uploadProducts = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Nessun file caricato" });

        const filePath = req.file.path;
        const products = await readCSV(filePath);

        const files = fs.readdirSync(productsFolder);
        files.forEach(f => {
            if (f !== req.file.filename) {
                fs.unlinkSync(path.join(productsFolder, f));
            }
        });

        res.json({ message: "Prodotti caricati con successo", data: products });

    } catch (error) {
        console.error("Errore uploadProducts:", error);
        res.status(500).json({ error: "Errore nel caricamento del file prodotti" });
    }
};

// CANCELLA TUTTI I PRODOTTI
export const deleteProducts = async (req, res) => {
    try {
        const files = fs.readdirSync(productsFolder);
        files.forEach(f => fs.unlinkSync(path.join(productsFolder, f)));

        res.json({ message: "Tutti i prodotti sono stati cancellati." });
    } catch (error) {
        console.error("Errore deleteProducts:", error);
        res.status(500).json({ error: "Errore nella cancellazione dei prodotti" });
    }
};
