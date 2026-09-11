import pool from '../config/db';

export interface CreateNotificationInput {
    recipientId: number;
    title: string;
    message: string;
    type: string;
    referenceId?: number;
}

export async function createNotification(
    data: CreateNotificationInput
): Promise<void> {

    await pool.execute(
        `
        INSERT INTO notifications
        (
            recipient_id,
            title,
            message,
            type,
            reference_id
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            data.recipientId,
            data.title,
            data.message,
            data.type,
            data.referenceId ?? null
        ]
    );
}

export async function getNotifications(
    recipientId: number
) {
    const [rows] = await pool.execute(
        `
        SELECT
            notification_id,
            title,
            message,
            type,
            reference_id,
            is_read,
            created_at
        FROM notifications
        WHERE recipient_id = ?
        ORDER BY created_at DESC
        `,
        [recipientId]
    );

    return rows;
}

export async function getUnreadCount(
    recipientId: number
): Promise<number> {

    const [rows]: any = await pool.execute(
        `
        SELECT COUNT(*) AS count
        FROM notifications
        WHERE recipient_id = ?
          AND is_read = FALSE
        `,
        [recipientId]
    );

    return Number(rows[0].count);
}

export async function markAsRead(
    notificationId: number,
    recipientId: number
): Promise<void> {

    await pool.execute(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE notification_id = ?
          AND recipient_id = ?
        `,
        [notificationId, recipientId]
    );
}

export async function markAllAsRead(
    recipientId: number
): Promise<void> {

    await pool.execute(
        `
        UPDATE notifications
        SET is_read = TRUE
        WHERE recipient_id = ?
          AND is_read = FALSE
        `,
        [recipientId]
    );
}