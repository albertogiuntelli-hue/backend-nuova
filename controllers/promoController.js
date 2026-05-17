import fs from "fs";
import path from "path";

const dataDir = "/mnt/data";
const promoFile = path.join(dataDir, "promo.csv");
const promoDatesFile = path.join(dataDir, "promo-dates.json");

function ensurePromoFiles() {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(promoFile)) fs.writeFileSync(promoFile, "");
    if (!fs.existsSync(promoDatesFile))
        fs.writeFileSync(promoDatesFile, JSON.stringify({ start: "", end: "" }, null, 2));
}

// Funzione che capisce automaticamente se usare virgola o punto e virgola
function smartSplit(row) {
    if (row.includes(";")) return row.split(";");
    return row.split(",");
}

export function getPromo(req, res) {
    try {
        ensurePromoFiles();

        const csv = fs.readFileSync(promoFile, "utf8");
        if (!csv.trim()) return res.json([]);

        const rows = csv.split("\n").map(r => r.trim()).filter(r => r !== "");

        // Salta intestazione
        const dataRows = rows.slice(1);

        const promo = dataRows.map(row => {
            const [
                codiceRaw,
                nomeRaw,
                prezzoRaw,
                prezzoScontatoRaw,
                categoriaRaw,
                immagineRaw
            ] = smartSplit(row);

            if (!codiceRaw || !nomeRaw) return null;

            return {
                codice: codiceRaw.trim(),
                nome: nomeRaw.trim(),
                prezzo: Number((prezzoRaw || "").replace(",", ".")),
                prezzo_scontato: Number((prezzoScontatoRaw || "").replace(",", ".")),
                categoria: (categoriaRaw || "").trim(),
                immagine: (immagineRaw || "").trim()
            };
        }).filter(Boolean);

        return res.json(promo);

    } catch (err) {
        console.error("Errore GET /promo:", err);
        return res.status(500).json({ error: "Errore lettura promo" });
    }
}

export function uploadPromo(req, res) {
    try {
        ensurePromoFiles();

        if (!req.file) return res.status(400).json({ error: "Nessun file caricato" });

        const csv = fs.readFileSync(req.file.path, "utf8");
        fs.writeFileSync(promoFile, csv);

        if (req.body.start || req.body.end) {
            fs.writeFileSync(
                promoDatesFile,
                JSON.stringify({ start: req.body.start || "", end: req.body.end || "" }, null, 2)
            );
        }

        fs.unlinkSync(req.file.path);

        return res.json({ message: "Promo caricate correttamente" });

    } catch (err) {
        console.error("Errore UPLOAD /promo:", err);
        return res.status(500).json({ error: "Errore caricamento promo" });
    }
}

export function deletePromo(req, res) {
    try {
        ensurePromoFiles();
        fs.writeFileSync(promoFile, "");
        fs.writeFileSync(promoDatesFile, JSON.stringify({ start: "", end: "" }, null, 2));
        return res.json({ message: "Promo eliminate" });
    } catch (err) {
        console.error("Errore DELETE /promo:", err);
        return res.status(500).json({ error: "Errore eliminazione promo" });
    }
}
