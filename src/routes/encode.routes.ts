import { Router } from 'express';
import { encodeAisData,encodeAisData2 } from '../controllers/encode.controller';


const router = Router();

router.get('/encode', encodeAisData);
router.post('/encoded', encodeAisData2);

export default router;
