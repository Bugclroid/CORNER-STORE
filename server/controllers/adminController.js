import pool from '../config/db.js';

// @desc    Get all stores that are 'PENDING'
// @route   GET /api/admin/stores/pending
// @access  Private (Admin only)
export const getPendingStores = async (req, res) => {
    try {
        const pendingStores = await pool.query(
            "SELECT * FROM Stores WHERE status = 'PENDING'"
        );
        res.status(200).json(pendingStores.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// @desc    Approve a store
// @route   PUT /api/admin/stores/approve/:storeId
// @access  Private (Admin only)
export const approveStore = async (req, res) => {
    try {
        const { storeId } = req.params;

        // 1. Check if the store exists and is pending
        const storeResult = await pool.query(
            "SELECT * FROM Stores WHERE id = $1 AND status = 'PENDING'",
            [storeId]
        );

        if (storeResult.rows.length === 0) {
            return res.status(404).json({ msg: "Pending store not found." });
        }

        // 2. Update the store's status to 'APPROVED'
        const approvedStore = await pool.query(
            "UPDATE Stores SET status = 'APPROVED', is_verified = TRUE WHERE id = $1 RETURNING *",
            [storeId]
        );

        // 3. We already set the user's role to 'STORE' when they applied.
        //    So now, they are a 'STORE' user with an 'APPROVED' store.

        res.status(200).json({ 
            msg: "Store approved successfully", 
            store: approvedStore.rows[0] 
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// @desc    Get all users (for admin management)
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await pool.query("SELECT id, email, role, first_name, last_name, created_at FROM Users");
        res.status(200).json(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};