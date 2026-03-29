import fs from "fs";
import csv from "csv-parser";

// 🔥 Funzione definitiva per gestire virgola, punto, simboli, spazi
function normalizePrice(value) {
    if (!value) return 0;

    // Converti in stringa e togli spazi
    value = value.toString().trim();

    // Sostituisci la virgola con il punto
    value = value.replace(",", ".");

    // Rimuovi simboli non numerici (€, spazi, ecc.)
    value = value.replace(/[^0-9.]/g, "");

    // Se inizia con un punto → 0.xx
    if (value.startsWith(".")) value = "0" + value;

    // Se finisce con un punto → rimuovilo
    if (value.endsWith(".")) value = value.slice(0, -1);

    // Converte in numero
    const num = parseFloat(value);

    // Se non è valido, ritorna 0
    return isNaN(num) ? 0 : num;
}

export default function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];

        fs.createReadStream(filePath)
            .pipe(csv({ separator: ";" }))
            .on("data", (row) => {
                const normalized = {};
                for (const key of Object.keys(row)) {
                    normalized[key.toLowerCase().trim()] = row[key];
                }

                // Supporta sia "codice" che "codice articolo"
                const codice =
                    normalized["codice"]?.trim() ||
                    normalized["codice articolo"]?.trim() ||
                    "";

                // Supporta sia "nome" che "descrizione articolo"
                const descrizione =
                    normalized["nome"]?.trim() ||
                    normalized["descrizione articolo"]?.trim() ||
                    "";

                const prezzoRaw = normalized["prezzo"]?.trim() || "0";

                if (!codice) return;

                const prezzo = normalizePrice(prezzoRaw);

                results.push({
                    codice,
                    nome: descrizione,
                    prezzo,
                    immagine: "/logo.png",
                    categoria: "",
                    disponibile: true
                });
            })
            .on("end", () => resolve(results))
            .on("error", reject);
    });
}
