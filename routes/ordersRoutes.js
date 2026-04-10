// backend/routes/ordersRoutes.js
import express from "express";
import fs from "fs";
import path from "path";
import { registerUser } from "../controllers/usersController.js";

const router = express.Router();
const ordersFile = path.resolve("data/orders.json");

/* ============================================================
   GET /api/orders
============================================================ */
router.get("/", (req, res) => {
    try {
        if (!fs.existsSync(ordersFile)) return res.json([]);

        const data = fs.readFileSync(ordersFile, "utf8");
        const orders = JSON.parse(data);

        return res.json(orders);
    } catch (error) {
        console.error("Errore GET /orders:", error);
        return res.status(500).json({ error: "Errore lettura ordini" });
    }
});

/* ============================================================
   POST /api/orders
   Salva un nuovo ordine + registra automaticamente l’utente
============================================================ */
router.post("/", async (req, res) => {
    try {
        const body = req.body;

        if (!body || !body.cliente || !body.prodotti) {
            return res.status(400).json({ error: "Dati ordine mancanti" });
        }

        // Cliente corretto
        const clienteObj = {
            nome: body.cliente.nome || "",
            telefono: body.cliente.telefono || "",
            indirizzo: body.cliente.indirizzo || "",
            note: body.cliente.note || "",
        };

        // Prodotti corretti
        const prodotti = body.prodotti.map((p) => ({
            codice: p.codice,
            nome: p.nome,
            quantita: p.quantity || p.quantita,
            prezzo: p.prezzo_scontato > 0 ? p.prezzo_scontato : p.prezzo,
            tipo: p.productType,
            peso: p.weight || 0
        }));

        const nuovoOrdine = {
            cliente: clienteObj,
            prodotti,
            totale: body.totale,
            data: new Date().toISOString(),
            stato: "in attesa",
        };

        let orders = [];
        if (fs.existsSync(ordersFile)) {
            const data = fs.readFileSync(ordersFile, "utf8");
            orders = JSON.parse(data);
        }

        orders.push(nuovoOrdine);

        fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

        // 🔥 REGISTRAZIONE CLIENTE COMPLETA
        await registerUser({
            nome: clienteObj.nome,
            cognome: "",
            indirizzo: clienteObj.indirizzo,
            telefono: clienteObj.telefono,
            note: clienteObj.note || "",
        });

        res.status(201).json({ message: "Ordine salvato e utente registrato" });
    } catch (error) {
        console.error("Errore POST /orders:", error);
        res.status(500).json({ error: "Errore durante il salvataggio dell’ordine" });
    }
});

/* ============================================================
   PUT /api/orders/:index
   Aggiorna lo stato dell’ordine
============================================================ */
router.put("/:index", (req, res) => {
    try {
        const { index } = req.params;
        const { stato } = req.body;

        if (!fs.existsSync(ordersFile)) {
            return res.status(404).json({ error: "Nessun ordine trovato" });
        }

        const data = fs.readFileSync(ordersFile, "utf8");
        const orders = JSON.parse(data);

        if (!orders[index]) {
            return res.status(404).json({ error: "Ordine non trovato" });
        }

        orders[index].stato = stato;

        fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

        res.json({ message: "Stato aggiornato" });
    } catch (error) {
        console.error("Errore PUT /orders:", error);
        res.status(500).json({ error: "Errore aggiornamento stato ordine" });
    }
});

export default router;
