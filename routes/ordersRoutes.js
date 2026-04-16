import express from "express";
import fs from "fs";
import path from "path";
import { registerUser } from "../controllers/usersController.js";

const router = express.Router();

// Percorso SICURO e coerente con usersController.js
const dataDir = path.resolve("./data");
const ordersFile = path.join(dataDir, "orders.json");

// Assicura che la cartella /data e il file orders.json esistano
function ensureOrdersFile() {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(ordersFile)) {
        fs.writeFileSync(ordersFile, JSON.stringify([], null, 2));
    }
}

/* ============================================================
   GET /api/orders
============================================================ */
router.get("/", (req, res) => {
    try {
        ensureOrdersFile();

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
        ensureOrdersFile();

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
            note: clienteObj.note || "",
            data: new Date().toISOString(),
            stato: "in attesa",
        };

        // Legge ordini esistenti
        let orders = JSON.parse(fs.readFileSync(ordersFile, "utf8"));

        // Aggiunge nuovo ordine
        orders.push(nuovoOrdine);

        // Salva ordini
        fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

        // Registra o aggiorna cliente
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
        ensureOrdersFile();

        const { index } = req.params;
        const { stato } = req.body;

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
