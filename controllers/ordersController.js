import fs from "fs";
import path from "path";
import readCSV from "../utils/readCSV.js";

export async function getAllOrders() {
    try {
        const uploadsDir = path.join(process.cwd(), "uploads");

        const files = fs.readdirSync(uploadsDir)
            .filter(f =>
                f.toLowerCase().includes("order") ||
                f.toLowerCase().includes("ordini")
            )
            .sort((a, b) =>
                fs.statSync(path.join(uploadsDir, b)).mtime -
                fs.statSync(path.join(uploadsDir, a)).mtime
            );

        if (files.length === 0) return [];

        const csvPath = path.join(uploadsDir, files[0]);
        const rows = await readCSV(csvPath);

        return rows.map(row => ({
            id: row.id || row.id_ordine || "",
            cliente: row.cliente || row.nome_cliente || "",
            totale: parseFloat((row.totale || "0").replace(",", ".")),
            data: row.data || row.data_ordine || "",
            stato: (row.stato || "In attesa").trim()
        }));
    } catch (error) {
        console.error("Errore lettura ordini:", error);
        throw error;
    }
}
