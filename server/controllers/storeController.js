import pool from '../config/db.js';

// @desc    Apply to become a store
// @route   POST /api/stores/apply
// @access  Private (BUYER only)
export const applyForStore = async (req, res) => {
    try {
        const { storeName, bio, storeType, payoutDetails } = req.body;
        const userId = req.user.id; // From 'protect' middleware

        // 1. Check if user already has a store
        const existingStore = await pool.query("SELECT * FROM Stores WHERE user_id = $1", [userId]);
        if (existingStore.rows.length > 0) {
            return res.status(400).json({ msg: "You have already applied for a store." });
        }

        // 2. Check if store name is taken
        const existingName = await pool.query("SELECT * FROM Stores WHERE store_name = $1", [storeName]);
        if (existingName.rows.length > 0) {
            return res.status(400).json({ msg: "This store name is already taken." });
        }

        // 3. Create the new store with 'PENDING' status
        const newStore = await pool.query(
            `INSERT INTO Stores (user_id, store_name, bio, store_type, payout_details, status)
             VALUES ($1, $2, $3, $4, $5, 'PENDING') RETURNING *`,
            [userId, storeName, bio, storeType, payoutDetails]
        );
        
        // 4. Update the user's role to 'STORE'
        // This gives them access to the store dashboard immediately
        await pool.query("UPDATE Users SET role = 'STORE' WHERE id = $1", [userId]);

        res.status(201).json(newStore.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};


export const getMyStore = async (req, res) => {
    try {
        const store = await pool.query("SELECT * FROM Stores WHERE user_id = $1", [req.user.id]);
        
        if (store.rows.length === 0) {
            return res.status(404).json({ msg: "Store not found for this user." });
        }
        
        res.status(200).json(store.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};