import express from "express";
import fs from "fs";
import path from "path";
import { registerUser } from "../controllers/usersController.js";

const router = express.Router();

// Percorso SICURO e coerente con usersController.js
const dataDir = path.resolve("./data");
const ordersFile = path.join(dataDir, "orders.json");

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
============================================================ */
router.post("/", async (req, res) => {
    try {
        const body = req.body;

        if (!body || !body.cliente || !body.prodotti) {
            return res.status(400).json({ error: "Dati ordine mancanti" });
        }

        const clienteObj = {
            nome: body.cliente.nome || "",
            cognome: body.cliente.cognome || "",
            telefono: body.cliente.telefono || "",
            email: body.cliente.email || "",
            indirizzo: body.cliente.indirizzo || "",
            note: body.cliente.note || "",
        };

        const prodotti = body.prodotti.map((p) => ({
            codice: p.codice,
            nome: p.nome,
            quantita: p.quantita ?? 0,
            peso: p.peso ?? 0,
            tipo: p.tipo,
            prezzo: p.prezzo,
            prezzo_scontato: p.prezzo_scontato ?? 0
        }));

        const nuovoOrdine = {
            cliente: clienteObj,
            prodotti,
            totale: body.totale,
            data: new Date().toISOString(),
            stato: "in attesa",
        };

        // Assicura che la cartella esista
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        let orders = [];
        if (fs.existsSync(ordersFile)) {
            const data = fs.readFileSync(ordersFile, "utf8");
            orders = JSON.parse(data);
        }

        orders.push(nuovoOrdine);

        fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

        await registerUser({
            nome: clienteObj.nome,
            cognome: clienteObj.cognome,
            indirizzo: clienteObj.indirizzo,
            telefono: clienteObj.telefono,
            email: clienteObj.email,
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
