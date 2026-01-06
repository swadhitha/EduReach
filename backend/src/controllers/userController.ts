import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import {User} from '../models/User.model';
import { CreateUserInput, UpdateUserInput } from '../validators';

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const userData: CreateUserInput = req.body;
  
  const newUser = await User.create({
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role: userData.role,
  });
  
  logger.info(`User created: ${userData.email}`);
  
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: newUser,
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData: UpdateUserInput = req.body;
  
  const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
  
  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }
  
  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: updatedUser,
  });
});
