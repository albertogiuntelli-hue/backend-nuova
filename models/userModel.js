import fs from "fs";
import path from "path";
import readCSV from "../utils/readCSV.js";

export async function getAllUsers() {
    try {
        const uploadsDir = path.join(process.cwd(), "uploads");

        const files = fs.readdirSync(uploadsDir)
            .filter(f =>
                f.toLowerCase().includes("user") ||
                f.toLowerCase().includes("utenti")
            )
            .sort((a, b) =>
                fs.statSync(path.join(uploadsDir, b)).mtime -
                fs.statSync(path.join(uploadsDir, a)).mtime
            );

        if (files.length === 0) return [];

        const csvPath = path.join(uploadsDir, files[0]);
        const rows = await readCSV(csvPath);

        return rows.map(row => ({
            id: row.id || "",
            nome: row.nome || row.nome_cognome || "",
            email: row.email || "",
            telefono: row.telefono || row.phone || "",
            data_registrazione: row.data_registrazione || row.created_at || ""
        }));
    } catch (error) {
        console.error("Errore lettura utenti:", error);
        throw error;
    }
}
