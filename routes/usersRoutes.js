// backend/routes/usersRoutes.js
import express from "express";
import {
    getAllUsers,
    registerUser,
    deleteUser
} from "../controllers/usersController.js";

const router = express.Router();

// GET /api/users - lista utenti
router.get("/", async (req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error("Errore getAllUsers:", error);
        res.status(500).json({ error: "Errore nel recupero degli utenti" });
    }
});

// POST /api/users/register - registra un nuovo utente
router.post("/register", async (req, res) => {
    try {
        const user = await registerUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        console.error("Errore registerUser:", error);
        res.status(500).json({ error: "Errore nella registrazione utente" });
    }
});

// DELETE /api/users/:id - elimina un utente
router.delete("/:id", async (req, res) => {
    try {
        await deleteUser(req.params.id);
        res.status(200).json({ message: "Utente eliminato" });
    } catch (error) {
        console.error("Errore deleteUser:", error);
        res.status(500).json({ error: "Errore nell'eliminazione utente" });
    }
});

export default router;
