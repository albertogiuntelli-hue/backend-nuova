// backend/server.js
import express from "express";
import cors from "cors";

// ROUTES (corretto: la cartella si chiama Itinerari)
import productsRoutes from "./Itinerari/productsRoutes.js";
import promoRoutes from "./Itinerari/promoRoutes.js";
import ordersRoutes from "./Itinerari/ordersRoutes.js";
import usersRoutes from "./Itinerari/usersRoutes.js";

const app = express();

app.use(cors());
app.use(express.json()); // Necessario per req.body

// HEALTH CHECK (necessario per Railway)
app.get("/", (req, res) => {
    res.send("Backend online");
});

// API ROUTES
app.use("/api/products", productsRoutes);
app.use("/api/promo", promoRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/users", usersRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend attivo sulla porta ${PORT}`);
});

