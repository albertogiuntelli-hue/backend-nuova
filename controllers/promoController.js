import fs from "fs";
import path from "path";

// Cartella persistente Railway
const dataDir = "/mnt/data";
const promoFile = path.join(dataDir, "promo.csv");
const promoDatesFile = path.join(dataDir, "promo-dates.json");

// Assicura che cartella e file esistano
function ensurePromoFiles() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(promoFile)) {
        fs.writeFileSync(promoFile, "");
    }

    if (!fs.existsSync(promoDatesFile)) {
        fs.writeFileSync(promoDatesFile, JSON.stringify({ start: "", end: "" }, null, 2));
    }
}

/* ============================================================
   GET /api/promo
============================================================ */
export function getPromo(req, res) {
    try {
        ensurePromoFiles();

        const csv = fs.readFileSync(promoFile, "utf8");

        if (!csv.trim()) {
            return res.json([]);
        }

        const rows = csv.split("\n").filter(r => r.trim() !== "");
        const promo = rows.map(row => {
            const [codice, nome, prezzo, prezzo_scontato, categoria, immagine] = row.split(";");

            return {
                codice,
                nome,
                prezzo: Number(prezzo),
                prezzo_scontato: Number(prezzo_scontato),
                categoria,
                immagine
            };
        });

        return res.json(promo);
    } catch (error) {
        console.error("Errore GET /promo:", error);
        return res.status(500).json({ error: "Errore lettura promo" });
    }
}

/* ============================================================
   GET /api/promo/dates
============================================================ */
export function getPromoDates(req, res) {
    try {
        ensurePromoFiles();

        const data = fs.readFileSync(promoDatesFile, "utf8");
        return res.json(JSON.parse(data));
    } catch (error) {
        console.error("Errore GET /promo/dates:", error);
        return res.status(500).json({ error: "Errore lettura date promo" });
    }
}

/* ============================================================
   POST /api/promo/upload
============================================================ */
export function uploadPromo(req, res) {
    try {
        ensurePromoFiles();

        if (!req.file) {
            return res.status(400).json({ error: "Nessun file caricato" });
        }

        const tempPath = req.file.path;
        const csv = fs.readFileSync(tempPath, "utf8");

        fs.writeFileSync(promoFile, csv);

        // Se ci sono date nel body, aggiornale
        if (req.body.start || req.body.end) {
            const dates = {
                start: req.body.start || "",
                end: req.body.end || ""
            };
            fs.writeFileSync(promoDatesFile, JSON.stringify(dates, null, 2));
        }

        fs.unlinkSync(tempPath);

        return res.json({ message: "Promo caricate correttamente" });
    } catch (error) {
        console.error("Errore UPLOAD /promo:", error);
        return res.status(500).json({ error: "Errore caricamento promo" });
    }
}

/* ============================================================
   DELETE /api/promo/delete
============================================================ */
export function deletePromo(req, res) {
    try {
        ensurePromoFiles();

        fs.writeFileSync(promoFile, "");
        fs.writeFileSync(promoDatesFile, JSON.stringify({ start: "", end: "" }, null, 2));

        return res.json({ message: "Promo eliminate" });
    } catch (error) {
        console.error("Errore DELETE /promo:", error);
        return res.status(500).json({ error: "Errore eliminazione promo" });
    }
}
