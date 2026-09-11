import {
    createNotification,
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} from '../models/notificationModel';

export async function sendNotification(
    recipientId: number,
    title: string,
    message: string,
    type: string,
    referenceId?: number
): Promise<void> {

    await createNotification({
        recipientId,
        title,
        message,
        type,
        referenceId
    });
}

export async function getUserNotifications(
    recipientId: number
) {
    return await getNotifications(recipientId);
}

export async function getUserUnreadCount(
    recipientId: number
) {
    return await getUnreadCount(recipientId);
}

export async function readNotification(
    notificationId: number,
    recipientId: number
): Promise<void> {

    await markAsRead(
        notificationId,
        recipientId
    );
}

export async function readAllNotifications(
    recipientId: number
): Promise<void> {

    await markAllAsRead(recipientId);
}

export default {
  sendNotification,
  getUnreadCount,
  getUserNotifications,
  getUserUnreadCount,
  readAllNotifications,
  readNotification

};