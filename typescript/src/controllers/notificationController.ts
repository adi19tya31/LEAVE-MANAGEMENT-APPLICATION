import { Request, Response } from 'express';
import {
    getUserNotifications,
    getUserUnreadCount,
    readNotification,
    readAllNotifications
} from '../services/notificationServices';

export async function getNotifications(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const empId = req.user?.id;

        if (!empId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        const notifications = await getUserNotifications(empId);

        res.status(200).json({
            success: true,
            data: notifications
        });
    } catch (error) {
        console.error('Get notifications error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications'
        });
    }
}

export async function getUnreadCount(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const empId = req.user?.id;

        if (!empId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        const count = await getUserUnreadCount(empId);

        res.status(200).json({
            success: true,
            data: {
                count
            }
        });
    } catch (error) {
        console.error('Get unread count error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch unread notification count'
        });
    }
}

export async function markAsRead(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const empId = req.user?.id;
        const notificationId = Number(req.params.id);

        if (!empId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        if (!Number.isInteger(notificationId) || notificationId <= 0) {
            res.status(400).json({
                success: false,
                message: 'Invalid notification ID'
            });
            return;
        }

        await readNotification(notificationId, empId);

        res.status(200).json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Mark notification as read error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read'
        });
    }
}

export async function markAllAsRead(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const empId = req.user?.id;

        if (!empId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        await readAllNotifications(empId);

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Mark all notifications as read error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read'
        });
    }
}