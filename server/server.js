import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import voucherRoutes from './routes/voucherRoutes.js';
import userRoutes from './routes/userRoutes.js';
import historyRoutes from './routes/historyRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/users', userRoutes);
app.use('/api/history', historyRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Employee Certification Portal API is operational' });
});

// Centralized Error Handling
app.use(errorHandler);

// Start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  });
}

export default app;
