import express from 'express';
import { getAuditHistory } from '../controllers/historyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAuditHistory);

export default router;
