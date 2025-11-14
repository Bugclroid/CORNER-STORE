import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './config/db.js'; 
import authRoutes from './routes/authRoutes.js'
import storeRoutes from './routes/storeRoutes.js';
import productRoutes from './routes/productRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
    res.send('Corner Store API is running... 🚀');
});


app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});