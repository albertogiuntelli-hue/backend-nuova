// backend/server.js
import express from "express";
import cors from "cors";

// ROUTES (cartella reale: routes)
import productsRoutes from "./routes/productsRoutes.js";
import promoRoutes from "./routes/promoRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// HEALTH CHECK per Railway
app.get("/", (req, res) => {
    res.send("Backend online");
});

// API ROUTES
app.use("/api/products", productsRoutes);
app.use("/api/promo", promoRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/users", usersRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend attivo sulla porta ${PORT}`);
});
