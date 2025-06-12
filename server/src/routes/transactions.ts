import { Router } from 'express';
import { getTransactions, createTransaction } from '../controllers/transactionController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
router.use(authMiddleware);
router.get('/', getTransactions);
router.post('/', createTransaction);
export default router;