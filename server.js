import express from "express";
import cors from "cors";
import productsRoutes from "./routes/productsRoutes.js";
import promoRoutes from "./routes/promoRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", productsRoutes);
app.use("/api/promo", promoRoutes);

// Porta corretta per Railway
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Backend attivo sulla porta ${PORT}`);
});
