import fs from "fs";
import csv from "csv-parser";

export default function csvParser(path) {
    return new Promise((resolve, reject) => {
        const results = [];

        fs.createReadStream(path)
            .pipe(csv({ separator: ";", headers: false }))
            .on("data", (row) => {

                const codice = row[0]?.trim() || "";
                const descrizione = row[1]?.trim() || "";
                const prezzoString = row[2]?.trim().replace(",", ".") || "0";
                const prezzo = parseFloat(prezzoString) || 0;

                results.push({
                    codice,
                    descrizione,
                    nome: descrizione,
                    prezzo,
                    // 🔥 URL immagine SEMPRE FUNZIONANTE
                    immagine: "https://raw.githubusercontent.com/albertodev/plusmarket-assets/main/logo.jpg",
                    categoria: ""
                });
            })
            .on("end", () => resolve(results))
            .on("error", reject);
    });
}
