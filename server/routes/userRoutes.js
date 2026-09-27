import express from 'express';
import { getEmployees } from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/employees', protect, authorize('manager'), getEmployees);

export default router;
