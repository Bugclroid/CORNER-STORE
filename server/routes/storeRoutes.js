import express from 'express';
import { applyForStore, getMyStore } from '../controllers/storeController.js';
import { protect, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply to become a store
// Only a logged-in user ('protect') with the 'BUYER' role can access this.
router.post('/apply', protect, checkRole(['BUYER']), applyForStore);

// Get my own store dashboard
// Only a logged-in user ('protect') with the 'STORE' role can access this.
router.get('/me', protect, checkRole(['STORE']), getMyStore);

export default router;