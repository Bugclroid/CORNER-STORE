import express from 'express';
import {
    getPendingStores,
    approveStore,
    getAllUsers
} from '../controllers/adminController.js';
import { protect, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stores/pending', protect, checkRole(['ADMIN']), getPendingStores);

// Approve a store
router.put('/stores/approve/:storeId', protect, checkRole(['ADMIN']), approveStore);

// Get all users
router.get('/users', protect, checkRole(['ADMIN']), getAllUsers);


export default router;