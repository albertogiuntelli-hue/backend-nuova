import fs from "fs";
import csv from "csv-parser";

function cleanValue(value) {
    if (!value) return "";
    return value
        .toString()
        .replace(/\uFEFF/g, "")
        .replace(/\u00A0/g, "")
        .replace(/\t/g, "")
        .trim();
}

function normalizePrice(value) {
    if (!value) return 0;
    value = cleanValue(value);
    value = value.replace(",", ".");
    value = value.replace(/[^0-9.]/g, "");
    if (value.startsWith(".")) value = "0" + value;
    if (value.endsWith(".")) value = value.slice(0, -1);
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
}

export default function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];

        let detectedSeparator = ";";

        try {
            const firstLine = fs.readFileSync(filePath, "utf8").split("\n")[0];
            if (firstLine.includes("\t")) detectedSeparator = "\t";
            else if (firstLine.includes(",")) detectedSeparator = ",";
        } catch (err) {
            console.error("Errore lettura prima riga CSV:", err);
        }

        fs.createReadStream(filePath)
            .pipe(csv({ separator: detectedSeparator }))
            .on("data", (row) => {
                const normalized = {};

                for (const key of Object.keys(row)) {
                    const cleanKey = cleanValue(key).toLowerCase();
                    normalized[cleanKey] = cleanValue(row[key]);
                }

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

                const a_peso_raw =
                    normalized["a_peso"] ||
                    normalized["a peso"] ||
                    normalized["peso"] ||
                    normalized["al peso"] ||
                    "N";

                const a_peso = a_peso_raw.toUpperCase() === "S" ? "S" : "N";

                if (!codice) return;

                const prezzo = normalizePrice(prezzoRaw);

                // 🔥 QUI LA CORREZIONE
                const immagine =
                    normalized["immagine"] && normalized["immagine"] !== ""
                        ? normalized["immagine"]
                        : "/logo.png";

                results.push({
                    codice,
                    nome,
                    prezzo,
                    a_peso,
                    immagine,
                    categoria: "",
                    disponibile: true
                });
            })
            .on("end", () => resolve(results))
            .on("error", reject);
    });
}
