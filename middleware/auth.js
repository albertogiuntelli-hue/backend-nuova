import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

export default async function protect(req, res, next) {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "Accesso negato. Token mancante." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const result = await pool.query(
            "SELECT id, nome, email, is_admin FROM users WHERE id = $1",
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Utente non trovato." });
        }

        req.user = result.rows[0];
        next();
    } catch (error) {
        console.error("Errore middleware protect:", error);
        res.status(401).json({ message: "Token non valido." });
    }
}
