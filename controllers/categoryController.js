import fs from "fs";
import path from "path";
import readCSV from "../utils/readCSV.js";

export async function getAllCategories() {
    try {
        const uploadsDir = path.join(process.cwd(), "uploads");

        const files = fs.readdirSync(uploadsDir)
            .filter(f => f.toLowerCase().includes("categor"))
            .sort((a, b) =>
                fs.statSync(path.join(uploadsDir, b)).mtime -
                fs.statSync(path.join(uploadsDir, a)).mtime
            );

        if (files.length === 0) return [];

        const csvPath = path.join(uploadsDir, files[0]);
        const rows = await readCSV(csvPath);

        return rows.map(row => ({
            id: row.id || "",
            nome: row.nome || row.nome_categoria || "",
            descrizione: row.descrizione || ""
        }));
    } catch (error) {
        console.error("Errore lettura categorie:", error);
        throw error;
    }
}
