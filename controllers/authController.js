import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";

function generateToken(id) {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Credenziali non valide." });
        }

        const user = result.rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Credenziali non valide." });
        }

        res.json({
            id: user.id,
            nome: user.nome,
            email: user.email,
            is_admin: user.is_admin,
            token: generateToken(user.id)
        });

    } catch (error) {
        console.error("Errore login:", error);
        res.status(500).json({ message: "Errore del server." });
    }
};
