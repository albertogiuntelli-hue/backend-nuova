import fs from "fs";
import path from "path";
import csv from "csv-parser";

const uploadDir = path.join(process.cwd(), "uploads");
const promoFile = path.join(uploadDir, "promo-latest.csv");

export const getPromo = () => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(promoFile)) {
            return resolve([]);
        }

        const results = [];

        fs.createReadStream(promoFile)
            .pipe(csv({ separator: ";" }))
            .on("data", (row) => {
                const codice = row["CODICE ARTICOLO"] || "";
                const descrizione = row["DESCRIZIONE ARTICOLO"] || "";

                // Converti prezzo da "12,57" a 12.57
                let prezzo = row["PREZZO"] || "0";
                prezzo = parseFloat(prezzo.replace(",", "."));

                results.push({
                    codice,
                    descrizione,
                    prezzo,
                    immagine: "", // placeholder
                    logo: ""      // placeholder
                });
            })
            .on("end", () => resolve(results))
            .on("error", (err) => reject(err));
    });
};
