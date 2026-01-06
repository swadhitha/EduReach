import { Router } from 'express';
import {
  createUser,
  updateUser,
} from '../controllers/userController';
import { validateRequest } from '../middleware/validationMiddleware';
import { createUserSchema, updateUserSchema } from '../validators';

const router = Router();

router.post('/', validateRequest(createUserSchema), createUser);
router.put('/:id', validateRequest(updateUserSchema), updateUser);

export default router;
