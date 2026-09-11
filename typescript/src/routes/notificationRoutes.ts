import { Router } from 'express';
import * as authMiddleware from '../middleware/authMiddleware';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} from '../controllers/notificationController';

const router = Router();

router.get('/notification', authMiddleware.requireAuth, getNotifications);

router.get('/notification/unread-count', authMiddleware.requireAuth, getUnreadCount);

router.patch('/notification/:id/read', authMiddleware.requireAuth, markAsRead);

router.patch('/notification/read-all', authMiddleware.requireAuth, markAllAsRead);

export default router;