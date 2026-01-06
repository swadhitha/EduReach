import { z } from 'zod';

// ============================================================================
// USER SCHEMAS
// ============================================================================

// User creation schema
export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').regex(/^[a-zA-Z]{1,}(\s[a-zA-Z]{1,}){0,2}$/, 'Name can only contain alphabets and single spaces between words (max 3 words)').trim(),
  email: z.string().email('Please provide a valid email address'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['donor', 'volunteer', 'admin', 'school']),
});

// User update schema
export const updateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').regex(/^[a-zA-Z]{1,}(\s[a-zA-Z]{1,}){0,2}$/, 'Name can only contain alphabets and single spaces between words (max 3 words)').trim().optional(),
  email: z.string().email('Please provide a valid email address').optional(),
  phone: z.string().regex(/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number').optional(),
  role: z.enum(['donor', 'volunteer', 'admin', 'school']).optional(),
}).refine(obj => Object.keys(obj).length > 0, 'At least one field must be provided for update');

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ============================================================================
// ADMIN SCHEMAS
// ============================================================================

// School rejection schema
export const rejectSchoolSchema = z.object({
  rejectionReason: z.string().min(5, 'Rejection reason must be at least 5 characters').trim(),
});

// Volunteer rejection schema
export const rejectVolunteerSchema = z.object({
  rejectionReason: z.string().min(5, 'Rejection reason must be at least 5 characters').trim(),
});

export type RejectSchoolInput = z.infer<typeof rejectSchoolSchema>;
export type RejectVolunteerInput = z.infer<typeof rejectVolunteerSchema>;

// ============================================================================
// SCHOOL SCHEMAS
// ============================================================================

// Create school schema
export const createSchoolSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  schoolDetails: z.object({
    name: z.string().min(3, 'School name must be at least 3 characters').trim(),
    address: z.string().min(5, 'Address must be at least 5 characters').trim(),
    city: z.string().min(2, 'City is required').trim(),
    state: z.string().min(2, 'State is required').trim(),
    pincode: z.string().regex(/^[0-9]{6}$/, 'Pincode must be 6 digits'),
    udiseCode: z.string().min(1, 'UDISE code is required').trim(),
    schoolType: z.enum(['government', 'aided', 'private_non_profit']),
  }),
  contactPerson: z.object({
    name: z.string().min(2, 'Contact person name is required').regex(/^[a-zA-Z]{1,}(\s[a-zA-Z]{1,}){0,2}$/, 'Name can only contain alphabets and spaces').trim(),
    role: z.string().min(2, 'Role is required').trim(),
    phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  }),
  verification: z.object({
    documentUrl: z.string().url('Invalid document URL'),
  }),
});

// School profile update schema
export const updateSchoolProfileSchema = z.object({
  schoolDetails: z.object({
    name: z.string().min(3, 'School name must be at least 3 characters').trim().optional(),
    address: z.string().min(5, 'Address must be at least 5 characters').trim().optional(),
    city: z.string().min(2, 'City is required').trim().optional(),
    state: z.string().min(2, 'State is required').trim().optional(),
    pincode: z.string().regex(/^[0-9]{6}$/, 'Pincode must be 6 digits').optional(),
    schoolType: z.enum(['government', 'aided', 'private_non_profit']).optional(),
  }).optional(),
  contactPerson: z.object({
    name: z.string().min(2, 'Contact person name is required').regex(/^[a-zA-Z]{1,}(\s[a-zA-Z]{1,}){0,2}$/, 'Name can only contain alphabets and spaces').trim().optional(),
    role: z.string().min(2, 'Role is required').trim().optional(),
    phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits').optional(),
  }).optional(),
}).refine(obj => Object.keys(obj).length > 0, 'At least one field must be provided for update');

// School requirements schema
export const addSchoolRequirementsSchema = z.object({
  infrastructure: z.array(z.string().min(1, 'Requirement cannot be empty').trim()).optional(),
  booksNeeded: z.boolean().optional(),
  volunteersRoles: z.array(z.string().min(1, 'Role cannot be empty').trim()).optional(),
}).refine(
  obj => obj.infrastructure?.length || obj.booksNeeded || obj.volunteersRoles?.length,
  'At least one requirement must be provided'
);

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
export type UpdateSchoolProfileInput = z.infer<typeof updateSchoolProfileSchema>;
export type AddSchoolRequirementsInput = z.infer<typeof addSchoolRequirementsSchema>;

// ============================================================================
// DONATION SCHEMAS
// ============================================================================

// Book details schema (internal)
const bookDetailsSchema = z.object({
  title: z.string().min(1, 'Book title is required').trim(),
  quantity: z.number().int().positive('Quantity must be a positive number'),
  condition: z.enum(['new', 'gently_used', 'old'], { message: 'Condition must be one of: new, gently_used, or old' }),
  category: z.string().min(1, 'Category is required').trim(),
  imageUrl: z.string().url('Invalid image URL').optional(),
});

// Logistics schema (internal)
const logisticsSchema = z.object({
  method: z.enum(['pickup', 'dropoff'], { message: 'Method must be either pickup or dropoff' }),
  address: z.string().min(5, 'Address must be at least 5 characters').trim(),
  scheduledDate: z.string().datetime().optional(),
});

// Create book donation schema
export const createBookDonationSchema = z.object({
  bookDetails: z.array(bookDetailsSchema).min(1, 'At least one book must be provided'),
  logistics: logisticsSchema,
});

// Update book donation status schema
export const updateDonationStatusSchema = z.object({
  status: z.enum(['submitted', 'approved', 'collected', 'distributed']),
  notes: z.string().optional(),
});

export type CreateBookDonationInput = z.infer<typeof createBookDonationSchema>;
export type UpdateDonationStatusInput = z.infer<typeof updateDonationStatusSchema>;

// ============================================================================
// CASH DONATION SCHEMAS
// ============================================================================

// Cash donation status update schema
export const updateCashDonationStatusSchema = z.object({
  status: z.enum(['pending', 'completed', 'failed']),
  receiptUrl: z.string().optional(),
});

export type UpdateCashDonationStatusInput = z.infer<typeof updateCashDonationStatusSchema>;

// ============================================================================
// EVENT SCHEMAS
// ============================================================================

// Create event schema
export const createEventSchema = z.object({
  title: z.string().min(3, 'Event title must be at least 3 characters').trim(),
  description: z.string().min(10, 'Description must be at least 10 characters').trim(),
  eventType: z.enum(['teaching', 'mentoring', 'workshop', 'infrastructure_help'], {
    message: 'Event type must be one of: teaching, mentoring, workshop, or infrastructure_help'
  }),
  date: z.string().datetime('Invalid date format. Use ISO 8601 format'),
  durationHours: z.number().positive('Duration must be greater than 0'),
  location: z.object({
    address: z.string().min(5, 'Address must be at least 5 characters').trim(),
    city: z.string().min(2, 'City is required').trim(),
  }),
  requirements: z.object({
    skills: z.array(z.string().min(1, 'Skill cannot be empty').trim()).optional(),
    maxVolunteers: z.number().int().positive('Max volunteers must be greater than 0').optional().default(5),
  }).optional(),
});

// Complete event schema
export const completeEventSchema = z.object({
  volunteersAttended: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid volunteer ID format')).optional(),
  completionNotes: z.string().min(5, 'Completion notes must be at least 5 characters').trim().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type CompleteEventInput = z.infer<typeof completeEventSchema>;

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

// Common pagination schema for listing endpoints
export const paginationSchema = z.object({
  page: z.string().transform(Number).refine(n => n > 0, 'Page must be greater than 0').optional().default(1),
  limit: z.string().transform(Number).refine(n => n > 0, 'Limit must be greater than 0').optional().default(10),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
