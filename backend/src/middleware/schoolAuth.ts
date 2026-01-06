import { Request, Response, NextFunction } from 'express';
import { IRequest } from '../types';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Middleware to verify that the authenticated user is a school
 * Assumes authentication middleware has already added user info to req.user
 */
export const verifySchool = (req: IRequest, res: Response, next: NextFunction) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Cast user to authenticated user type
    const user = req.user as unknown as AuthenticatedUser;

    // Check if user role is 'school'
    if (user.role !== 'school') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only schools can access this resource',
      });
    }

    // If both checks pass, proceed to next middleware/controller
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
    });
  }
};
