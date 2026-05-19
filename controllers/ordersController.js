import fs from "fs";
import path from "path";

const dataDir = "/mnt/data";
const ordersJsonPath = path.join(dataDir, "orders.json");

// Assicura che la cartella persistente esista
function ensureOrdersFile() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(ordersJsonPath)) {
        fs.writeFileSync(ordersJsonPath, "[]");
    }
}

/* ============================================================
   GET /api/orders — restituisce TUTTI i dati dell’ordine
============================================================ */
export async function getAllOrders() {
    try {
        ensureOrdersFile();

        const data = fs.readFileSync(ordersJsonPath, "utf8");
        const orders = JSON.parse(data);

        return orders.map((o, index) => ({
            id: index + 1,

            cliente: {
                nome: o.cliente?.nome || "",
                cognome: o.cliente?.cognome || "",
                telefono: o.cliente?.telefono || "",
                indirizzo: o.cliente?.indirizzo || "",
                note: o.cliente?.note || "",
            },

            prodotti: o.prodotti || [],

            totale: o.totale || 0,
            data: o.data || "",
            stato: o.stato || "in attesa",
        }));
    } catch (error) {
        console.error("Errore lettura ordini JSON:", error);
        throw error;
    }
}
