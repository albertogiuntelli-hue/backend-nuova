import fs from "fs";
import csv from "csv-parser";

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

                const codice = normalized["codice articolo"]?.trim() || "";
                const descrizione = normalized["descrizione articolo"]?.trim() || "";
                const prezzoRaw = normalized["prezzo"]?.trim() || "0";

                if (!codice) return;

                const prezzo = parseFloat(prezzoRaw.replace(",", ".")) || 0;

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
