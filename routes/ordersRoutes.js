import express from "express";
import fs from "fs";
import path from "path";
import { registerUser } from "../controllers/usersController.js";

const router = express.Router();

// Percorsi file
const dataDir = path.resolve("./data");
const ordersFile = path.join(dataDir, "orders.json");
const archiveFile = path.join(dataDir, "orders_archive.json");

// Assicura che i file esistano
function ensureFiles() {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(ordersFile)) fs.writeFileSync(ordersFile, "[]");
    if (!fs.existsSync(archiveFile)) fs.writeFileSync(archiveFile, "[]");
}

/* ============================================================
   GET /api/orders  → ORDINI ATTIVI
============================================================ */
router.get("/", (req, res) => {
    try {
        ensureFiles();
        const data = fs.readFileSync(ordersFile, "utf8");
        return res.json(JSON.parse(data));
    } catch (error) {
        console.error("Errore GET /orders:", error);
        return res.status(500).json({ error: "Errore lettura ordini" });
    }
});

/* ============================================================
   GET /api/orders/archive  → ARCHIVIO ORDINI EVASI
============================================================ */
router.get("/archive", (req, res) => {
    try {
        ensureFiles();
        const data = fs.readFileSync(archiveFile, "utf8");
        return res.json(JSON.parse(data));
    } catch (error) {
        console.error("Errore GET /orders/archive:", error);
        return res.status(500).json({ error: "Errore lettura archivio" });
    }
});

/* ============================================================
   POST /api/orders  → CREA NUOVO ORDINE
============================================================ */
router.post("/", async (req, res) => {
    try {
        ensureFiles();

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
            createdAt: new Date().toISOString(),   // ✔️ compatibile con dashboard
            stato: "in attesa",
        };

        let orders = JSON.parse(fs.readFileSync(ordersFile, "utf8"));
        orders.push(nuovoOrdine);

        fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

        // Registra utente
        await registerUser(clienteObj);

        res.status(201).json({ message: "Ordine salvato e utente registrato" });
    } catch (error) {
        console.error("Errore POST /orders:", error);
        res.status(500).json({ error: "Errore durante il salvataggio dell’ordine" });
    }
});

/* ============================================================
   PUT /api/orders/:index  → CAMBIA STATO ORDINE
============================================================ */
router.put("/:index", (req, res) => {
    try {
        ensureFiles();

        const { index } = req.params;
        const { stato } = req.body;

        let orders = JSON.parse(fs.readFileSync(ordersFile, "utf8"));
        let archive = JSON.parse(fs.readFileSync(archiveFile, "utf8"));

        if (!orders[index]) {
            return res.status(404).json({ error: "Ordine non trovato" });
        }

        // Aggiorna stato
        orders[index].stato = stato;

        // Se evaso → sposta in archivio
        if (stato === "evaso") {
            archive.push(orders[index]);
            orders.splice(index, 1);

            fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
            fs.writeFileSync(archiveFile, JSON.stringify(archive, null, 2));

            return res.json({ message: "Ordine spostato in archivio" });
        }

        // Salva solo aggiornamento stato
        fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));

        res.json({ message: "Stato aggiornato" });
    } catch (error) {
        console.error("Errore PUT /orders:", error);
        res.status(500).json({ error: "Errore aggiornamento stato ordine" });
    }
});

export default router;
