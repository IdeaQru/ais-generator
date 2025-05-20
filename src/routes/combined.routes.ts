// routes/combined.routes.ts
import { Router } from 'express';
import { handleCombinedData } from '../controllers/combined.controller';

const router = Router();
router.post('/combined-csv', handleCombinedData);

export default router;
