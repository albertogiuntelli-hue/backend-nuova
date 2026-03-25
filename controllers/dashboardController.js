// backend/controllers/dashboardController.js

import { countOrders } from "./ordersController.js";
import { countProducts } from "./productController.js";
import { countCategories } from "./categoryController.js";

export const getStats = async (req, res) => {
    try {
        const orders = await countOrders();
        const products = await countProducts();
        const categories = await countCategories();

        res.json({ orders, products, categories });
    } catch (error) {
        console.error("Errore dashboard:", error);
        res.status(500).json({ message: "Errore nel recupero delle statistiche" });
    }
};
