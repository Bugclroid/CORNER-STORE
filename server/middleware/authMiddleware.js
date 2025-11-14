import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const protect = async (req, res, next) => {
    let token;

    // We get the token from the "Bearer <token>" header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token's ID (and exclude the password)
            // We attach this user to the request object
            const userResult = await pool.query(
                "SELECT id, email, role, first_name FROM Users WHERE id = $1", 
                [decoded.id]
            );

            if (userResult.rows.length === 0) {
                return res.status(401).json({ msg: "Not authorized, user not found" });
            }

            req.user = userResult.rows[0];
            next(); // Move to the next function

        } catch (error) {
            console.error(error);
            return res.status(401).json({ msg: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ msg: "Not authorized, no token" });
    }
};

// This is a simple role-checking middleware
// We can pass 'ADMIN', 'STORE', etc.
export const checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ msg: "Forbidden: You do not have the required role" });
    }
    next();
};