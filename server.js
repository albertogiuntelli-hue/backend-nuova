import express from "express";
import cors from "cors";

import productsRoutes from "./routes/productsRoutes.js";
import promoRoutes from "./routes/promoRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rotte API
app.use("/api/products", productsRoutes);
app.use("/api/promo", promoRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/users", usersRoutes);

// Porta per Railway
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Backend attivo sulla porta ${PORT}`);
});
