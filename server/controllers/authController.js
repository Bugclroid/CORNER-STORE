import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';

export const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        const userCheck = await pool.query("SELECT * FROM Users WHERE email = $1", [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ msg: "User with this email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        
        const newUser = await pool.query(
            "INSERT INTO Users (first_name, last_name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, role",
            [firstName, lastName, email, passwordHash, 'BUYER']
        );

        const userId = newUser.rows[0].id;
        const userRole = newUser.rows[0].role;

        const token = generateToken(userId, userRole);

        res.status(201).json({
            token,
            user: { id: userId, email, role: userRole }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await pool.query("SELECT * FROM Users WHERE email = $1", [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const dbUser = user.rows[0];

        const isMatch = await bcrypt.compare(password, dbUser.password_hash);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const token = generateToken(dbUser.id, dbUser.role);

        res.status(200).json({
            token,
            user: {
                id: dbUser.id,
                email: dbUser.email,
                firstName: dbUser.first_name,
                role: dbUser.role
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};