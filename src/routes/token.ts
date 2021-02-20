import { Router } from 'express';
import { verifyToken } from 'middleware';

const router = Router();
import { Response, Request } from 'express';

const successResponse = async (req: Request, res: Response) => {
  return res.send({ success: 'success' });
};
router.get('/', verifyToken, successResponse);
export { router as tokenRouter };
