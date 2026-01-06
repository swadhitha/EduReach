import { Router } from 'express';
import {
  createEvent,
  getMyEvents,
  completeEvent,
} from '../controllers/eventController';
import { verifySchool } from '../middleware/schoolAuth';
import { validateRequest, validateQuery } from '../middleware/validationMiddleware';
import {
  createEventSchema,
  completeEventSchema,
  paginationSchema,
} from '../validators';

/* Base Route: /api/events */

const router = Router();

// Apply verifySchool middleware to all routes
router.use(verifySchool);

router.post('/', validateRequest(createEventSchema), createEvent);
router.get('/my-events', validateQuery(paginationSchema), getMyEvents);
router.patch('/:id/complete', validateRequest(completeEventSchema), completeEvent);

export default router;
