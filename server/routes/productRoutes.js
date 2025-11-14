import express from 'express';
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';
import { protect, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Public Routes ---
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// --- Private Store Routes ---
// Only a logged-in user ('protect') with the 'STORE' role can access these
router.post('/', protect, checkRole(['STORE']), createProduct);
router.put('/:id', protect, checkRole(['STORE']), updateProduct);
router.delete('/:id', protect, checkRole(['STORE']), deleteProduct);

export default router;