import fs from "fs";
import csv from "csv-parser";

// 🔥 Rimuove BOM, tab, NBSP, spazi e caratteri invisibili
function cleanValue(value) {
    if (!value) return "";
    return value
        .toString()
        .replace(/\uFEFF/g, "")   // BOM
        .replace(/\u00A0/g, "")   // NBSP
        .replace(/\t/g, "")       // TAB
        .trim();
}

// 🔥 Normalizza i prezzi: "13,17", "13.17", "13,17 €" → 13.17
function normalizePrice(value) {
    if (!value) return 0;

    value = cleanValue(value);

    // Sostituisce virgola con punto
    value = value.replace(",", ".");

    // Rimuove simboli non numerici
    value = value.replace(/[^0-9.]/g, "");

    if (value.startsWith(".")) value = "0" + value;
    if (value.endsWith(".")) value = value.slice(0, -1);

    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
}

export default function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];

        // 🔥 Rileva automaticamente il separatore
        let detectedSeparator = ";";

        try {
            const firstLine = fs.readFileSync(filePath, "utf8").split("\n")[0];

            if (firstLine.includes("\t")) {
                detectedSeparator = "\t";
            } else if (firstLine.includes(",")) {
                detectedSeparator = ",";
            } else if (firstLine.includes(";")) {
                detectedSeparator = ";";
            }
        } catch (err) {
            console.error("Errore lettura prima riga CSV:", err);
        }

        fs.createReadStream(filePath)
            .pipe(csv({ separator: detectedSeparator }))
            .on("data", (row) => {
                const normalized = {};

                // 🔥 Normalizza tutte le chiavi e valori
                for (const key of Object.keys(row)) {
                    const cleanKey = cleanValue(key).toLowerCase();
                    normalized[cleanKey] = cleanValue(row[key]);
                }

                // 🔥 Supporta colonne diverse
                const codice =
                    normalized["codice"] ||
                    normalized["codice articolo"] ||
                    normalized["articolo"] ||
                    "";

                const nome =
                    normalized["nome"] ||
                    normalized["descrizione"] ||
                    normalized["descrizione articolo"] ||
                    "";

                const prezzoRaw =
                    normalized["prezzo"] ||
                    normalized["prezzo ivato"] ||
                    normalized["prezzo unitario"] ||
                    "0";

                // 🔥 COLONNA A PESO — AGGIUNTA COMPATIBILITÀ CON a_peso
                const a_peso_raw =
                    normalized["a peso"] ||
                    normalized["a_peso"] ||     // ← AGGIUNTO, NON ROMPE NULLA
                    normalized["peso"] ||
                    normalized["al peso"] ||
                    "N";

                const a_peso = a_peso_raw.toUpperCase() === "S";

                if (!codice) return; // salta righe vuote

                const prezzo = normalizePrice(prezzoRaw);

                results.push({
                    codice,
                    nome,
                    prezzo,
                    a_peso, // 🔥 campo già esistente, non toccato
                    immagine: "/logo.png",
                    categoria: "",
                    disponibile: true
                });
            })
            .on("end", () => resolve(results))
            .on("error", reject);
    });
}
