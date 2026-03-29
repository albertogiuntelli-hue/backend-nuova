import fs from "fs";
import path from "path";
import readCSV from "../utils/readCSV.js";

// Cartelle
const productsFolder = path.resolve("uploads/products");
const promoFolder = path.resolve("uploads/promo");

// Assicura che le cartelle esistano
if (!fs.existsSync(productsFolder)) fs.mkdirSync(productsFolder, { recursive: true });
if (!fs.existsSync(promoFolder)) fs.mkdirSync(promoFolder, { recursive: true });

/* ============================================================
   📌 GET PRODOTTI NORMALI
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
   📌 UPLOAD PRODOTTI NORMALI
   ============================================================ */
export const uploadProducts = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Nessun file caricato" });

        const filePath = req.file.path;

        const products = await readCSV(filePath);

        // Cancella file vecchi
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

/* ============================================================
   📌 DELETE PRODOTTI NORMALI
   ============================================================ */
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

/* ============================================================
   📌 GET PROMO
   ============================================================ */
export const getPromoProducts = async (req, res) => {
    try {
        const files = fs.readdirSync(promoFolder);
        if (files.length === 0) return res.json([]);

        const latestFile = path.join(promoFolder, files[files.length - 1]);
        const promo = await readCSV(latestFile);

        res.json(promo);
    } catch (error) {
        console.error("Errore getPromoProducts:", error);
        res.status(500).json({ error: "Errore nel leggere le promo" });
    }
};

/* ============================================================
   📌 UPLOAD PROMO
   ============================================================ */
export const uploadPromoProducts = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "Nessun file caricato" });

        const filePath = req.file.path;

        const promo = await readCSV(filePath);

        // Cancella file vecchi
        const files = fs.readdirSync(promoFolder);
        files.forEach(f => {
            if (f !== req.file.filename) {
                fs.unlinkSync(path.join(promoFolder, f));
            }
        });

        res.json({ message: "Promo caricate con successo", data: promo });

    } catch (error) {
        console.error("Errore uploadPromoProducts:", error);
        res.status(500).json({ error: "Errore nel caricamento del file promo" });
    }
};

/* ============================================================
   📌 DELETE PROMO
   ============================================================ */
export const deletePromoProducts = async (req, res) => {
    try {
        const files = fs.readdirSync(promoFolder);
        files.forEach(f => fs.unlinkSync(path.join(promoFolder, f)));

        res.json({ message: "Tutte le promo sono state cancellate." });
    } catch (error) {
        console.error("Errore deletePromoProducts:", error);
        res.status(500).json({ error: "Errore nella cancellazione delle promo" });
    }
};
