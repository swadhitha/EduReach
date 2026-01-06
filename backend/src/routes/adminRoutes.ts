import { Router } from 'express';
import {
  getPendingVerifications,
  approveSchool,
  rejectSchool,
  approveVolunteer,
  rejectVolunteer,
  getAllUsers,
  getDashboardStats,
  updateDonationStatus,
} from '../controllers/adminController';
import { validateRequest, validateQuery } from '../middleware/validationMiddleware';
import { 
  rejectSchoolSchema, 
  rejectVolunteerSchema, 
  updateDonationStatusSchema,
  paginationSchema
} from '../validators';

/* Base Route : /api/admin  */

const router = Router();

router.get('/verifications/pending', getPendingVerifications);
router.patch('/schools/:id/approve', approveSchool);
router.patch('/schools/:id/reject', validateRequest(rejectSchoolSchema), rejectSchool);
router.patch('/volunteers/:id/approve', approveVolunteer);
router.patch('/volunteers/:id/reject', validateRequest(rejectVolunteerSchema), rejectVolunteer);
router.get('/users', validateQuery(paginationSchema), getAllUsers);
router.get('/dashboard', getDashboardStats);
router.patch('/donations/books/:id', validateRequest(updateDonationStatusSchema), updateDonationStatus);

export default router;
