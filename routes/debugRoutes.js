import express from "express";

const router = express.Router();

// Route di debug minimale
router.get("/", (req, res) => {
    res.json({ message: "Debug OK" });
});

export default router;
