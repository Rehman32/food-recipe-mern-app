import { Router, Request, Response } from 'express';
import Notification from '../models/Notification';
import { protect } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { ApiResponse } from '../types';

const router = Router();

/**
 * @route   GET /api/notifications
 * @desc    Get current user's notifications
 * @access  Private
 */
router.get(
  '/',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [notifications, totalItems] = await Promise.all([
      Notification.find({ recipient: req.user!._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Notification.countDocuments({ recipient: req.user!._id }),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1,
        },
      },
    });
  })
);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get(
  '/unread-count',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const count = await Notification.countDocuments({
      recipient: req.user!._id,
      read: false,
    });

    res.json({
      success: true,
      data: { count },
    });
  })
);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.put(
  '/:id/read',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user!._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    res.json({
      success: true,
      message: 'Marked as read',
    });
  })
);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put(
  '/read-all',
  protect,
  asyncHandler(async (req: Request, res: Response<ApiResponse>) => {
    await Notification.updateMany(
      { recipient: req.user!._id, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  })
);

export default router;
