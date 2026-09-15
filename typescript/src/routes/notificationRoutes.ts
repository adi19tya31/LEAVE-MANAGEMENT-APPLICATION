import { Router } from 'express';
import * as authMiddleware from '../middleware/authMiddleware';
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteOne,
    deleteAll
} from '../controllers/notificationController';

const router = Router();

router.get('/notification', authMiddleware.requireAuth, getNotifications);

router.get('/notification/unread-count', authMiddleware.requireAuth, getUnreadCount);

router.patch('/notification/:id/read', authMiddleware.requireAuth, markAsRead);

router.delete('/notification/read-all', authMiddleware.requireAuth, deleteAll);

router.delete('/notification/:id', authMiddleware.requireAuth, deleteOne);

router.patch('/notification/read-all', authMiddleware.requireAuth, markAllAsRead);

export default router;