// backend/controllers/ordersController.js

import fs from "fs";
import path from "path";

const ordersJsonPath = path.resolve("data/orders.json");

export async function getAllOrders() {
    try {
        if (!fs.existsSync(ordersJsonPath)) {
            return [];
        }

        const data = fs.readFileSync(ordersJsonPath, "utf8");
        const orders = JSON.parse(data);

        // Normalizza formato per la dashboard
        return orders.map((o, index) => ({
            id: index + 1,
            cliente: o.cliente,
            totale: o.totale,
            data: o.data,
            stato: o.stato || "in attesa"
        }));
    } catch (error) {
        console.error("Errore lettura ordini JSON:", error);
        throw error;
    }
}
