import { Router } from 'express';
import dataController from '../controllers/data.controller';

const router = Router();

router.get('/datasensor', (req, res) => dataController.getAllData(req, res));
router.post('/datasensor', (req, res) => dataController.saveData(req, res));

export default router;
