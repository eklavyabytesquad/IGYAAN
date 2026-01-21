import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase";

/**
 * App Notification Service API
 * 
 * Handles in-app notifications for all user roles
 * Stores notifications in database for persistence
 */

/**
 * POST /api/notifications/app
 * 
 * Body:
 * {
 *   type: 'absence_alert' | 'weekly_report' | 'homework' | 'report_card' | 'general',
 *   userIds: [string], // Array of user IDs to notify
 *   title: string,
 *   message: string,
 *   priority: 'low' | 'medium' | 'high' | 'urgent',
 *   actionUrl?: string, // Optional link for action
 *   data?: any // Additional metadata
 * }
 */
export async function POST(request) {
	try {
		const supabase = createClient();
		const body = await request.json();
		const { type, userIds, title, message, priority = 'medium', actionUrl, data } = body;

		if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
			return NextResponse.json(
				{ success: false, error: 'User IDs array is required' },
				{ status: 400 }
			);
		}

		if (!title || !message) {
			return NextResponse.json(
				{ success: false, error: 'Title and message are required' },
				{ status: 400 }
			);
		}

		// Create notifications for each user
		const notifications = userIds.map(userId => ({
			user_id: userId,
			type: type || 'general',
			title,
			message,
			priority,
			action_url: actionUrl,
			data: data ? JSON.stringify(data) : null,
			is_read: false,
			created_at: new Date().toISOString(),
		}));

		const { data: insertedData, error } = await supabase
			.from('notifications')
			.insert(notifications)
			.select();

		if (error) {
			throw error;
		}

		// TODO: Implement real-time push notifications via WebSocket/Service Worker
		// await sendPushNotifications(userIds, { title, message, actionUrl });

		return NextResponse.json({
			success: true,
			message: `Created ${notifications.length} notifications`,
			data: insertedData,
		});

	} catch (error) {
		console.error('App Notification API Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error.message || 'Failed to create notifications',
			},
			{ status: 500 }
		);
	}
}

/**
 * GET /api/notifications/app?userId=xxx&limit=50&unreadOnly=true
 * 
 * Get notifications for a user
 */
export async function GET(request) {
	try {
		const supabase = createClient();
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get('userId');
		const limit = parseInt(searchParams.get('limit') || '50');
		const unreadOnly = searchParams.get('unreadOnly') === 'true';

		if (!userId) {
			return NextResponse.json(
				{ success: false, error: 'User ID is required' },
				{ status: 400 }
			);
		}

		let query = supabase
			.from('notifications')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false })
			.limit(limit);

		if (unreadOnly) {
			query = query.eq('is_read', false);
		}

		const { data, error } = await query;

		if (error) {
			throw error;
		}

		return NextResponse.json({
			success: true,
			notifications: data,
			count: data.length,
		});

	} catch (error) {
		console.error('Notification Fetch Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error.message || 'Failed to fetch notifications',
			},
			{ status: 500 }
		);
	}
}

/**
 * PATCH /api/notifications/app
 * 
 * Mark notification(s) as read
 * 
 * Body:
 * {
 *   notificationIds: [string], // or
 *   userId: string, // to mark all as read
 *   markAllAsRead: boolean
 * }
 */
export async function PATCH(request) {
	try {
		const supabase = createClient();
		const body = await request.json();
		const { notificationIds, userId, markAllAsRead } = body;

		if (markAllAsRead && userId) {
			// Mark all notifications as read for user
			const { error } = await supabase
				.from('notifications')
				.update({ is_read: true, read_at: new Date().toISOString() })
				.eq('user_id', userId)
				.eq('is_read', false);

			if (error) throw error;

			return NextResponse.json({
				success: true,
				message: 'All notifications marked as read',
			});
		}

		if (notificationIds && Array.isArray(notificationIds)) {
			// Mark specific notifications as read
			const { error } = await supabase
				.from('notifications')
				.update({ is_read: true, read_at: new Date().toISOString() })
				.in('id', notificationIds);

			if (error) throw error;

			return NextResponse.json({
				success: true,
				message: `${notificationIds.length} notification(s) marked as read`,
			});
		}

		return NextResponse.json(
			{ success: false, error: 'Invalid request parameters' },
			{ status: 400 }
		);

	} catch (error) {
		console.error('Notification Update Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error.message || 'Failed to update notifications',
			},
			{ status: 500 }
		);
	}
}

/**
 * DELETE /api/notifications/app
 * 
 * Delete notification(s)
 * 
 * Body:
 * {
 *   notificationIds: [string]
 * }
 */
export async function DELETE(request) {
	try {
		const supabase = createClient();
		const body = await request.json();
		const { notificationIds } = body;

		if (!notificationIds || !Array.isArray(notificationIds)) {
			return NextResponse.json(
				{ success: false, error: 'Notification IDs array is required' },
				{ status: 400 }
			);
		}

		const { error } = await supabase
			.from('notifications')
			.delete()
			.in('id', notificationIds);

		if (error) throw error;

		return NextResponse.json({
			success: true,
			message: `${notificationIds.length} notification(s) deleted`,
		});

	} catch (error) {
		console.error('Notification Delete Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error.message || 'Failed to delete notifications',
			},
			{ status: 500 }
		);
	}
}
