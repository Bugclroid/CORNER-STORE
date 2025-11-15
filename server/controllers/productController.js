import pool from '../config/db.js';

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (STORE only)
export const createProduct = async (req, res) => {
    try {
        const { name, description, priceInr, condition, size, measurements } = req.body;
        const userId = req.user.id; // From 'protect' middleware

        // 1. Find the store associated with this user
        const storeResult = await pool.query("SELECT id, status FROM Stores WHERE user_id = $1", [userId]);
        
        if (storeResult.rows.length === 0) {
            return res.status(403).json({ msg: "User does not have a store." });
        }
        
        const store = storeResult.rows[0];
        
        // 2. IMPORTANT: Check if the store is 'APPROVED' by an admin
        if (store.status !== 'APPROVED') {
            return res.status(403).json({ msg: "Your store is not yet approved to add products." });
        }

        // 3. Create the new product
        const newProduct = await pool.query(
            `INSERT INTO Products (store_id, name, description, price_inr, condition, size, measurements, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE') RETURNING *`,
            [store.id, name, description, priceInr, condition, size, measurements]
        );

        res.status(201).json(newProduct.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// @desc    Get all products (public)
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
    try {
        // We only show 'ACTIVE' products from 'APPROVED' stores
        const products = await pool.query(
            `SELECT p.*, s.store_name FROM Products p
             JOIN Stores s ON p.store_id = s.id
             WHERE p.status = 'ACTIVE' AND s.status = 'APPROVED'`
        );
        
        res.status(200).json(products.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// @desc    Get a single product by ID (public)
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await pool.query(
            `SELECT p.*, s.store_name, s.bio, s.is_verified FROM Products p
             JOIN Stores s ON p.store_id = s.id
             WHERE p.id = $1 AND p.status = 'ACTIVE'`,
            [id]
        );

        if (product.rows.length === 0) {
            return res.status(404).json({ msg: "Product not found" });
        }

        res.status(200).json(product.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// @desc    Update your own product
// @route   PUT /api/products/:id
// @access  Private (STORE only)
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, priceInr, condition, size, measurements, status } = req.body;
        const userId = req.user.id;

        // 1. Find the store associated with this user
        const storeResult = await pool.query("SELECT id FROM Stores WHERE user_id = $1", [userId]);
        if (storeResult.rows.length === 0) {
            return res.status(403).json({ msg: "User does not have a store." });
        }
        const storeId = storeResult.rows[0].id;

        // 2. Find the product
        const productResult = await pool.query("SELECT * FROM Products WHERE id = $1", [id]);
        if (productResult.rows.length === 0) {
            return res.status(404).json({ msg: "Product not found" });
        }
        
        // 3. Check if this store OWNS this product
        if (productResult.rows[0].store_id !== storeId) {
             return res.status(403).json({ msg: "Not authorized to update this product" });
        }
        
        // 4. Update the product
        const updatedProduct = await pool.query(
            `UPDATE Products SET
             name = COALESCE($1, name),
             description = COALESCE($2, description),
             price_inr = COALESCE($3, price_inr),
             condition = COALESCE($4, condition),
             size = COALESCE($5, size),
             measurements = COALESCE($6, measurements),
             status = COALESCE($7, status)
             WHERE id = $8 RETURNING *`,
            [name, description, priceInr, condition, size, measurements, status, id]
        );
        
        res.status(200).json(updatedProduct.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// @desc    Delete your own product
// @route   DELETE /api/products/:id
// @access  Private (STORE only)
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // 1. Find the store associated with this user
        const storeResult = await pool.query("SELECT id FROM Stores WHERE user_id = $1", [userId]);
        if (storeResult.rows.length === 0) {
            return res.status(403).json({ msg: "User does not have a store." });
        }
        const storeId = storeResult.rows[0].id;

        // 2. Find the product
        const productResult = await pool.query("SELECT * FROM Products WHERE id = $1", [id]);
        if (productResult.rows.length === 0) {
            return res.status(404).json({ msg: "Product not found" });
        }
        
        // 3. Check if this store OWNS this product
        if (productResult.rows[0].store_id !== storeId) {
             return res.status(403).json({ msg: "Not authorized to delete this product" });
        }
        
        // 4. Delete the product
        await pool.query("DELETE FROM Products WHERE id = $1", [id]);
        
        res.status(200).json({ msg: "Product removed" });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};