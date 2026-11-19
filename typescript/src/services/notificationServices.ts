import { notificationModel } from '../models'

export async function sendNotification(
  recipientId: number,
  title: string,
  message: string,
  type: string,
  referenceId?: number
): Promise<void> {
  await notificationModel.createNotification({
    recipientId,
    title,
    message,
    type,
    referenceId,
  })
}

export async function getUserNotifications(recipientId: number) {
  return await notificationModel.getNotifications(recipientId)
}

export async function getUserUnreadCount(recipientId: number) {
  return await notificationModel.getUnreadCount(recipientId)
}

export async function readNotification(
  notificationId: number,
  recipientId: number
): Promise<void> {
  await notificationModel.markAsRead(notificationId, recipientId)
}

export async function readAllNotifications(recipientId: number): Promise<void> {
  await notificationModel.markAllAsRead(recipientId)
}

export async function removeNotification(
  notificationId: number,
  recipientId: number
): Promise<void> {
  await notificationModel.deleteNotification(notificationId, recipientId)
}

export async function removeAllNotifications(
  recipientId: number
): Promise<void> {
  await notificationModel.deleteAllNotifications(recipientId)
}


