// backend/server.js
import express from "express";
import cors from "cors";

// ROUTES
import productsRoutes from "./routes/productsRoutes.js";
import promoRoutes from "./routes/promoRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import usersRoutes from "./routes/usersRoutes.js"; // ✅ AGGIUNTO

const app = express();

app.use(cors());
app.use(express.json()); // Necessario per req.body

// API ROUTES
app.use("/api/products", productsRoutes);
app.use("/api/promo", promoRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/users", usersRoutes); // ✅ AGGIUNTO

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend attivo sulla porta ${PORT}`);
});
