import { pool } from "../config/db.js";

// Recupera tutti i prodotti
export const getAllProducts = async () => {
    const result = await pool.query("SELECT * FROM products ORDER BY id ASC");
    return result.rows;
};

// Recupera un prodotto per ID
export const getProductById = async (id) => {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    return result.rows[0];
};

// Inserisce più prodotti (usato per CSV)
export const insertProductsBulk = async (products) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Cancella tutti i prodotti esistenti
        await client.query("DELETE FROM products");

        // Inserisce i nuovi prodotti
        for (const p of products) {
            await client.query(
                `INSERT INTO products (name, description, price, category, image, stock, promo)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    p.name,
                    p.description || "",
                    p.price || 0,
                    p.category || "",
                    p.image || "",
                    p.stock || 0,
                    p.promo === "true" || false
                ]
            );
        }

        await client.query("COMMIT");
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

// Aggiunge un singolo prodotto
export const addProduct = async (product) => {
    const result = await pool.query(
        `INSERT INTO products (name, description, price, category, image, stock, promo)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [
            product.name,
            product.description,
            product.price,
            product.category,
            product.image,
            product.stock,
            product.promo
        ]
    );
    return result.rows[0];
};

// Aggiorna un prodotto
export const updateProduct = async (id, product) => {
    const result = await pool.query(
        `UPDATE products SET
            name=$1, description=$2, price=$3, category=$4, image=$5, stock=$6, promo=$7
         WHERE id=$8 RETURNING *`,
        [
            product.name,
            product.description,
            product.price,
            product.category,
            product.image,
            product.stock,
            product.promo,
            id
        ]
    );
    return result.rows[0];
};

// Elimina un prodotto
export const deleteProduct = async (id) => {
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
};
