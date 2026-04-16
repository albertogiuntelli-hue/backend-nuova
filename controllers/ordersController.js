import fs from "fs";
import path from "path";

const ordersJsonPath = path.resolve("data/orders.json");

/* ============================================================
   GET /api/orders — restituisce TUTTI i dati dell’ordine
============================================================ */
export async function getAllOrders() {
    try {
        if (!fs.existsSync(ordersJsonPath)) {
            return [];
        }

        const data = fs.readFileSync(ordersJsonPath, "utf8");
        const orders = JSON.parse(data);

        // 🔥 RESTITUISCE TUTTI I CAMPI REALI SALVATI
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
console.error("Errore lettura ordini JSON:", error);
throw error;
    }
}
