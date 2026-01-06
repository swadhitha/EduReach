import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { User } from '../models/User.model';
import { School } from '../models/school.model';
import { Volunteer } from '../models/volunteer.model';
import { BookDonation } from '../models/book_donation.model';
import { Donation } from '../models/donation.model';
import { Event } from '../models/events.model';
import { RejectSchoolInput, RejectVolunteerInput, UpdateDonationStatusInput } from '../validators';

export const getPendingVerifications = asyncHandler(async (req: Request, res: Response) => {
  const pendingSchools = await School.find({ 'verification.isVerified': false });
  const pendingVolunteers = await Volunteer.find({ 'verification.isVerified': false });

  res.status(200).json({
    success: true,
    message: 'Pending verifications retrieved successfully',
    data: {
      schools: pendingSchools,
      volunteers: pendingVolunteers,
      totalPending: pendingSchools.length + pendingVolunteers.length,
    },
  });
});

export const approveSchool = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const school = await School.findByIdAndUpdate(
    id,
    {
      isVerified: true,
      'verification.isVerified': true,
      'verification.verifiedAt': new Date(),
    },
    { new: true, runValidators: true }
  );

  if (!school) {
    return res.status(404).json({
      success: false,
      message: 'School not found',
    });
  }

  logger.info(`School approved. ID: ${id}`);

  res.status(200).json({
    success: true,
    message: 'School approved successfully',
    data: school,
  });
});

export const rejectSchool = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const rejectData: RejectSchoolInput = req.body;
  const { rejectionReason } = rejectData;

  const school = await School.findByIdAndUpdate(
    id,
    {
      isVerified: false,
      'verification.isVerified': false,
      rejectionReason,
    },
    { new: true, runValidators: true }
  );

  if (!school) {
    return res.status(404).json({
      success: false,
      message: 'School not found',
    });
  }

  logger.info(`School rejected. ID: ${id}. Reason: ${rejectionReason}`);

  res.status(200).json({
    success: true,
    message: 'School rejected successfully',
    data: school,
  });
});

export const approveVolunteer = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const volunteer = await Volunteer.findByIdAndUpdate(
    id,
    {
      isVerified: true,
      'verification.isVerified': true,
      'verification.verifiedAt': new Date(),
    },
    { new: true, runValidators: true }
  );

  if (!volunteer) {
    return res.status(404).json({
      success: false,
      message: 'Volunteer not found',
    });
  }

  logger.info(`Volunteer approved. ID: ${id}`);

  res.status(200).json({
    success: true,
    message: 'Volunteer approved successfully',
    data: volunteer,
  });
});

export const rejectVolunteer = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const rejectData: RejectVolunteerInput = req.body;
  const { rejectionReason } = rejectData;

  if (!rejectionReason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required',
    });
  }

  const volunteer = await Volunteer.findByIdAndUpdate(
    id,
    {
      isVerified: false,
      'verification.isVerified': false,
      rejectionReason,
    },
    { new: true, runValidators: true }
  );

  if (!volunteer) {
    return res.status(404).json({
      success: false,
      message: 'Volunteer not found',
    });
  }

  logger.info(`Volunteer rejected. ID: ${id}. Reason: ${rejectionReason}`);

  res.status(200).json({
    success: true,
    message: 'Volunteer rejected successfully',
    data: volunteer,
  });
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find().skip(skip).limit(limit);
  const total = await User.countDocuments();

  res.status(200).json({
    success: true,
    message: 'All users retrieved successfully',
    data: users,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
    },
  });
});

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const totalUsers = await User.countDocuments();
  const totalVolunteers = await Volunteer.countDocuments();
  const totalSchools = await School.countDocuments();
  const verifiedSchools = await School.countDocuments({ 'verification.isVerified': true });
  const verifiedVolunteers = await Volunteer.countDocuments({ 'verification.isVerified': true });
  const totalEvents = await Event.countDocuments();
  const totalBookDonations = await BookDonation.countDocuments();
  const totalCashDonations = await Donation.countDocuments();
  const cashDonationData = await Donation.aggregate([
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);
  const totalCashAmount = cashDonationData[0]?.totalAmount || 0;

  // Calculate total volunteer hours
  const volunteerHoursData = await Volunteer.aggregate([
    {
      $group: {
        _id: null,
        totalHours: { $sum: { $ifNull: ['$totalHours', 0] } },
      },
    },
  ]);
  const totalHours = volunteerHoursData[0]?.totalHours || 0;

  res.status(200).json({
    success: true,
    message: 'Dashboard stats retrieved successfully',
    data: {
      users: {
        total: totalUsers,
      },
      volunteers: {
        total: totalVolunteers,
        verified: verifiedVolunteers,
        pending: totalVolunteers - verifiedVolunteers,
      },
      schools: {
        total: totalSchools,
        verified: verifiedSchools,
        pending: totalSchools - verifiedSchools,
      },
      donations: {
        bookDonations: {
          total: totalBookDonations,
        },
        cashDonations: {
          total: totalCashDonations,
          totalAmount: totalCashAmount,
        },
      },
      events: {
        total: totalEvents,
      },
      engagement: {
        totalVolunteerHours: totalHours,
      },
    },
  });
});

export const updateDonationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const statusData: UpdateDonationStatusInput = req.body;
  const { status, notes } = statusData;

  const donation = await BookDonation.findByIdAndUpdate(
    id,
    {
      status,
      ...(notes && { notes }),
      updatedAt: new Date(),
    },
    { new: true, runValidators: true }
  );

  if (!donation) {
    return res.status(404).json({
      success: false,
      message: 'Book donation not found',
    });
  }

  logger.info(`Donation status updated for ID: ${id}, New Status: ${status}`);

  res.status(200).json({
    success: true,
    message: 'Donation status updated successfully',
    data: donation,
  });
});
