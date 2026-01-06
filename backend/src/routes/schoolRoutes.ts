import { Router } from 'express';
import {
  createSchool,
  getSchoolProfile,
  updateSchoolProfile,
  addSchoolRequirements,
} from '../controllers/schoolController';
import { verifySchool } from '../middleware/schoolAuth';
import { validateRequest } from '../middleware/validationMiddleware';
import {
  createSchoolSchema,
  updateSchoolProfileSchema,
  addSchoolRequirementsSchema,
} from '../validators';

/* Base Route: /api/school */

const router = Router();

/**
 * POST /register
 * Create a new school account (submit registration for verification)
 */
router.post('/register', validateRequest(createSchoolSchema), createSchool);

// Apply verifySchool middleware to all routes below
router.use(verifySchool);

/**
 * GET /profile
 * View own school details
 */
router.get('/profile', getSchoolProfile);

/**
 * PUT /profile
 * Update school profile (contact info, general details)
 */
router.put('/profile', validateRequest(updateSchoolProfileSchema), updateSchoolProfile);

/**
 * POST /requirements
 * Add infrastructure needs, book requirements, volunteer roles
 */
router.post('/requirements', validateRequest(addSchoolRequirementsSchema), addSchoolRequirements);

export default router;
