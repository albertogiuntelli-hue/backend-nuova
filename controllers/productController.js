import fs from "fs";
import path from "path";
import csvParser from "../utils/csvParser.js";

// Usa /tmp perché Railway non permette più di scrivere in /mnt/data
const dataDir = "/tmp";
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const prodottiFile = path.join(dataDir, "prodotti.csv");

// Normalizza contenuto CSV per confronto
function normalizeCsv(str) {
    return (str || "").replace(/\r\n/g, "\n").trim();
}

function isSameContent(oldContent, newContent) {
    return normalizeCsv(oldContent) === normalizeCsv(newContent);
}

// GET /prodotti
export async function getProdotti(req, res) {
    try {
        if (!fs.existsSync(prodottiFile)) {
            return res.json([]);
        }

        const stats = fs.statSync(prodottiFile);
        if (!stats.size) {
            return res.json([]);
        }

        const prodotti = await csvParser(prodottiFile);
        return res.json(prodotti);
    } catch (err) {
        console.error("Errore GET /prodotti:", err);
        return res.status(500).json({ error: "Errore lettura prodotti" });
    }
}

// POST /prodotti/upload
export function uploadProdotti(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Nessun file caricato" });
        }

        const newCsv = fs.readFileSync(req.file.path, "utf8");
        let shouldWrite = true;

        if (fs.existsSync(prodottiFile)) {
            const oldCsv = fs.readFileSync(prodottiFile, "utf8");
            if (isSameContent(oldCsv, newCsv)) {
                shouldWrite = false;
            }
        }

        if (shouldWrite) {
            fs.writeFileSync(prodottiFile, newCsv);
        }

        fs.unlinkSync(req.file.path);

        return res.json({
            message: shouldWrite
                ? "Prodotti aggiornati correttamente"
                : "File identico a quello già presente, nessuna modifica applicata",
        });
    } catch (err) {
        console.error("Errore UPLOAD /prodotti:", err);
        return res.status(500).json({ error: "Errore caricamento prodotti" });
    }
}

// DELETE /prodotti/delete
export function deleteProdotti(req, res) {
    try {
        fs.writeFileSync(prodottiFile, "");
        return res.json({ message: "Prodotti eliminati" });
    } catch (err) {
        console.error("Errore DELETE /prodotti:", err);
        return res.status(500).json({ error: "Errore eliminazione prodotti" });
    }
}
