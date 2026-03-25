import express from "express";

const router = express.Router();

// Rotta dashboard base (placeholder)
router.get("/", (req, res) => {
    res.json({ message: "Dashboard OK" });
});

export default router;
