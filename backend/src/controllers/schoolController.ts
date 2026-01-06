import { Response } from 'express';
import { IRequest } from '../types';
import { asyncHandler } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { School } from '../models/school.model';
import { User } from '../models/User.model';
import { Auth } from '../models/Auth.model';
import { CreateSchoolInput, UpdateSchoolProfileInput, AddSchoolRequirementsInput } from '../validators';
import bcrypt from 'bcryptjs';


export const createSchool = asyncHandler(async (req: IRequest, res: Response) => {
  const createData: CreateSchoolInput = req.body;

  // Check if email already exists
  const existingEmail = await User.findOne({ email: createData.email });
  if (existingEmail) {
    return res.status(409).json({
      success: false,
      message: 'Email already registered',
    });
  }

  // Create user first
  const user = new User({
    email: createData.email,
    name: createData.schoolDetails.name,
    phone: createData.contactPerson.phone,
    role: 'school',
  });
  
  const savedUser = await user.save();

  // Create auth record
  const passwordHash = await bcrypt.hash(createData.password, 10);
  
  const auth = new Auth({
    user_id: savedUser._id,
    passwordHash,
    role: 'school',
  });

  await auth.save();

  // Check if school with UDISE code already exists
  const existingUdiseCode = await School.findOne({ 'schoolDetails.udiseCode': createData.schoolDetails.udiseCode });
  if (existingUdiseCode) {
    return res.status(409).json({
      success: false,
      message: 'School with this UDISE code already exists',
    });
  }

  // Create new school
  const school = new School({
    user_id: savedUser._id,
    schoolDetails: createData.schoolDetails,
    contactPerson: createData.contactPerson,
    verification: {
      documentUrl: createData.verification.documentUrl,
      isVerified: false,
    },
    requirements: {
      infrastructure: [],
      booksNeeded: false,
      volunteerRoles: [],
    },
  });

  await school.save();

  logger.info(`School created successfully. ID: ${school._id}, Email: ${createData.email}`);

  res.status(201).json({
    success: true,
    message: 'School registration request submitted successfully. Admin will verify your documents.',
    data: {
      id: school._id,
      email: createData.email,
      name: school.schoolDetails.name,
      isVerified: school.verification.isVerified,
    },
  });
});

export const getSchoolProfile = asyncHandler(async (req: IRequest, res: Response) => {
  const schoolId = req.user?.id; // From authentication middleware

  const school = await School.findById(schoolId);

  if (!school) {
    return res.status(404).json({
      success: false,
      message: 'School profile not found',
    });
  }

  res.status(200).json({
    success: true,
    message: 'School profile retrieved successfully',
    data: school,
  });
});

export const updateSchoolProfile = asyncHandler(async (req: IRequest, res: Response) => {
  const schoolId = req.user?.id;
  const updateData: UpdateSchoolProfileInput = req.body;

  const updatedSchool = await School.findByIdAndUpdate(
    schoolId,
    { ...updateData },
    { new: true, runValidators: true }
  );

  if (!updatedSchool) {
    return res.status(404).json({
      success: false,
      message: 'School not found',
    });
  }

  logger.info(`School profile updated. ID: ${schoolId}`);

  res.status(200).json({
    success: true,
    message: 'School profile updated successfully',
    data: updatedSchool,
  });
});

export const addSchoolRequirements = asyncHandler(async (req: IRequest, res: Response) => {
  const schoolId = req.user?.id;
  const requirementData: AddSchoolRequirementsInput = req.body;

  const school = await School.findByIdAndUpdate(
    schoolId,
    {
      $set: {
        'requirements.infrastructure': requirementData.infrastructure || [],
        'requirements.booksNeeded': requirementData.booksNeeded || false,
        'requirements.volunteersRoles': requirementData.volunteersRoles || [],
      },
    },
    { new: true, runValidators: true }
  );

  if (!school) {
    return res.status(404).json({
      success: false,
      message: 'School not found',
    });
  }

  logger.info(`School requirements added. ID: ${schoolId}`);

  res.status(201).json({
    success: true,
    message: 'Requirements added successfully',
    data: school.requirements,
  });
});
