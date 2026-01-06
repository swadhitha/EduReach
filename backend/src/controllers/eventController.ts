import { Response } from 'express';
import { IRequest } from '../types';
import { asyncHandler } from '../utils/errorHandler';
import { logger } from '../utils/logger';
import { Event } from '../models/events.model';
import { Volunteer } from '../models/volunteer.model';
import { CreateEventInput, CompleteEventInput } from '../validators';

export const createEvent = asyncHandler(async (req: IRequest, res: Response) => {
  const schoolId = req.user?.id;
  const eventData: CreateEventInput = req.body;

  // Convert date string to Date object
  const eventDate = new Date(eventData.date);

  const newEvent = await Event.create({
    title: eventData.title,
    description: eventData.description,
    eventType: eventData.eventType,
    date: eventDate,
    durationHours: eventData.durationHours,
    location: {
      address: eventData.location.address,
      city: eventData.location.city,
      schoolId: schoolId,
    },
    requirements: eventData.requirements || { skills: [], maxVolunteers: 5 },
    volunteersRegistered: [],
    volunteersAttended: [],
    status: 'upcoming',
    createdBy: schoolId,
  });

  logger.info(`Event created. ID: ${newEvent._id}, School ID: ${schoolId}`);

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: newEvent,
  });
});

export const getMyEvents = asyncHandler(async (req: IRequest, res: Response) => {
  const schoolId = req.user?.id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Optional filters
  const status = req.query.status as string;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;

  // Build filter query
  const filter: any = { createdBy: schoolId };

  if (status) {
    filter.status = status;
  }

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) {
      filter.date.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.date.$lte = new Date(endDate);
    }
  }

  const events = await Event.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ date: -1 })
    .populate('volunteersRegistered', 'name email')
    .populate('volunteersAttended', 'name email');

  const total = await Event.countDocuments(filter);

  res.status(200).json({
    success: true,
    message: 'Events retrieved successfully',
    data: events,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalEvents: total,
    },
  });
});

export const completeEvent = asyncHandler(async (req: IRequest, res: Response) => {
  const { id } = req.params;
  const completeData: CompleteEventInput = req.body;

  // Find the event
  const event = await Event.findById(id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found',
    });
  }

  // Verify this school created the event
  if (event.createdBy.toString() !== req.user?.id) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to complete this event',
    });
  }

  // Get the attended volunteers (from request or use registered)
  const attendedVolunteerIds = completeData.volunteersAttended || event.volunteersRegistered;

  // Update volunteer hours for attended volunteers
  for (const volunteerId of attendedVolunteerIds) {
    await Volunteer.findOneAndUpdate(
      { user: volunteerId },
      { $inc: { hoursContributed: event.durationHours } },
      { new: true }
    );
  }

  // Update event status and attended volunteers
  const updatedEvent = await Event.findByIdAndUpdate(
    id,
    {
      status: 'completed',
      volunteersAttended: attendedVolunteerIds,
    },
    { new: true, runValidators: true }
  ).populate('volunteersRegistered', 'name email').populate('volunteersAttended', 'name email');

  logger.info(`Event completed. ID: ${id}, Attended Volunteers: ${attendedVolunteerIds.length}`);

  res.status(200).json({
    success: true,
    message: 'Event completed successfully. Volunteer hours updated.',
    data: {
      event: updatedEvent,
      attendedVolunteersCount: attendedVolunteerIds.length,
      hoursAwarded: event.durationHours,
    },
  });
});
