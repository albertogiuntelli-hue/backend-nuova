import fs from "fs";
import csv from "csv-parser";

export default function csvParser(path) {
    return new Promise((resolve, reject) => {
        const results = [];
        let isFirstRow = true; // 🔥 salta intestazione

        fs.createReadStream(path)
            .pipe(csv({ separator: ";", headers: false }))
            .on("data", (row) => {

                // 🔥 SALTA LA PRIMA RIGA (intestazione)
                if (isFirstRow) {
                    isFirstRow = false;
                    return;
                }

                const rawCodice = row[0] || "";
                const rawDescrizione = row[1] || "";
                const rawPrezzo = row[2] || "";
                const rawPeso = row[3] || "";
                const rawImmagine = row[4] || "";

                const codice = rawCodice.trim();
                const nome = rawDescrizione.trim();

                const prezzo = parseFloat(
                    rawPrezzo.trim().replace(",", ".")
                ) || 0;

                // 🔥 a_peso → categoria S/N
                const categoria = rawPeso.trim().toUpperCase() === "S" ? "S" : "N";

                // 🔥 evita righe vuote
                if (!codice || !nome) return;

                const immagine = rawImmagine.trim() || "";

                results.push({
                    codice,
                    nome,
                    prezzo,
                    categoria,
                    immagine,
                });
            })
            .on("end", () => resolve(results))
            .on("error", reject);
    });
}
