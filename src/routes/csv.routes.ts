// routes/csv.routes.ts
import { Router, Request, Response } from 'express'; // Import Request and Response
import { saveCSV, resetCSV } from '../controllers/csv.controller';

const router = Router();

router.post('/save-csv', saveCSV);
router.delete('/reset-csv', resetCSV);

export default router;
