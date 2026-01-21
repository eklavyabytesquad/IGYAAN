import { NextResponse } from "next/server";
import { createClient } from "../../../utils/supabase";

/**
 * Automated Attendance Notification Trigger
 * 
 * This API should be called:
 * 1. When teacher confirms attendance (1-minute trigger for absence alerts)
 * 2. Via cron job every Friday at 5 PM (weekly reports)
 * 
 * POST /api/notifications/trigger-attendance
 * 
 * Body:
 * {
 *   type: 'absence_alert' | 'weekly_report',
 *   schoolId: string,
 *   classId?: string, // For absence alerts
 *   sectionId?: string, // For absence alerts
 *   date?: string, // For absence alerts (YYYY-MM-DD)
 * }
 */
export async function POST(request) {
	try {
		const supabase = createClient();
		const body = await request.json();
		const { type, schoolId, classId, sectionId, date } = body;

		if (!type || !schoolId) {
			return NextResponse.json(
				{ success: false, error: 'Type and schoolId are required' },
				{ status: 400 }
			);
		}

		if (type === 'absence_alert') {
			return await sendAbsenceAlerts(supabase, { schoolId, classId, sectionId, date });
		} else if (type === 'weekly_report') {
			return await sendWeeklyReports(supabase, { schoolId });
		} else {
			return NextResponse.json(
				{ success: false, error: 'Invalid notification type' },
				{ status: 400 }
			);
		}

	} catch (error) {
		console.error('Trigger Notification Error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error.message || 'Failed to trigger notifications',
			},
			{ status: 500 }
		);
	}
}

/**
 * Send absence alerts to parents (within 1 minute)
 */
async function sendAbsenceAlerts(supabase, { schoolId, classId, sectionId, date }) {
	const targetDate = date || new Date().toISOString().split('T')[0];

	// Fetch today's absent students
	const { data: attendanceRecords, error: attendanceError } = await supabase
		.from('attendance')
		.select(`
			*,
			students (
				id,
				full_name,
				class,
				section,
				parent_phone,
				parent_email,
				parent_user_id
			)
		`)
		.eq('date', targetDate)
		.eq('status', 'absent')
		.eq('school_id', schoolId);

	if (attendanceError) throw attendanceError;

	if (!attendanceRecords || attendanceRecords.length === 0) {
		return NextResponse.json({
			success: true,
			message: 'No absent students found',
			sent: 0,
		});
	}

	// Filter by class/section if provided
	let absentStudents = attendanceRecords;
	if (classId) {
		absentStudents = absentStudents.filter(r => r.students?.class === classId);
	}
	if (sectionId) {
		absentStudents = absentStudents.filter(r => r.students?.section === sectionId);
	}

	// Get school details
	const { data: school } = await supabase
		.from('schools')
		.select('school_name')
		.eq('id', schoolId)
		.single();

	// Prepare SMS and app notifications
	const smsRecipients = [];
	const appNotificationUserIds = [];

	for (const record of absentStudents) {
		const student = record.students;
		
		// Add to SMS list if parent phone exists
		if (student.parent_phone) {
			smsRecipients.push({
				phone: student.parent_phone,
				name: 'Parent',
				studentName: student.full_name,
			});
		}

		// Add to app notification list if parent has user account
		if (student.parent_user_id) {
			appNotificationUserIds.push(student.parent_user_id);
		}
	}

	const results = {
		sms: null,
		app: null,
	};

	// Send SMS notifications
	if (smsRecipients.length > 0) {
		const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/sms`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				type: 'absence_alert',
				recipients: smsRecipients,
				data: {
					schoolName: school?.school_name || 'School',
					date: targetDate,
				},
			}),
		});
		results.sms = await smsResponse.json();
	}

	// Send app notifications
	if (appNotificationUserIds.length > 0) {
		const appResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/app`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				type: 'absence_alert',
				userIds: appNotificationUserIds,
				title: 'Absence Alert',
				message: `Your child was marked absent today. If this is an error, please contact the class teacher.`,
				priority: 'high',
				actionUrl: '/dashboard/parent/attendance/alerts',
				data: {
					date: targetDate,
				},
			}),
		});
		results.app = await appResponse.json();
	}

	return NextResponse.json({
		success: true,
		message: `Sent ${absentStudents.length} absence alerts`,
		details: {
			totalAbsent: absentStudents.length,
			smsSent: smsRecipients.length,
			appNotifications: appNotificationUserIds.length,
		},
		results,
	});
}

/**
 * Send weekly attendance reports to all parents (every Friday)
 */
async function sendWeeklyReports(supabase, { schoolId }) {
	const today = new Date();
	const lastFriday = new Date(today);
	lastFriday.setDate(today.getDate() - 7);

	const endDate = today.toISOString().split('T')[0];
	const startDate = lastFriday.toISOString().split('T')[0];

	// Fetch all students in school
	const { data: students, error: studentsError } = await supabase
		.from('students')
		.select('*')
		.eq('school_id', schoolId);

	if (studentsError) throw studentsError;

	if (!students || students.length === 0) {
		return NextResponse.json({
			success: true,
			message: 'No students found',
		});
	}

	// Get school details
	const { data: school } = await supabase
		.from('schools')
		.select('school_name')
		.eq('id', schoolId)
		.single();

	const smsRecipients = [];
	const appNotificationUserIds = [];

	// Calculate attendance for each student
	for (const student of students) {
		const { data: attendanceData } = await supabase
			.from('attendance')
			.select('status')
			.eq('student_id', student.id)
			.gte('date', startDate)
			.lte('date', endDate);

		const totalDays = attendanceData?.length || 0;
		const presentDays = attendanceData?.filter(a => a.status === 'present').length || 0;
		const absentDays = totalDays - presentDays;
		const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

		// Add to SMS list
		if (student.parent_phone) {
			smsRecipients.push({
				phone: student.parent_phone,
				name: 'Parent',
				studentName: student.full_name,
			});
		}

		// Add to app notification list
		if (student.parent_user_id) {
			appNotificationUserIds.push(student.parent_user_id);
		}
	}

	const results = {
		sms: null,
		app: null,
	};

	// Send SMS notifications
	if (smsRecipients.length > 0) {
		// Note: For weekly reports, you might want to batch these or send fewer details
		const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/sms`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				type: 'weekly_report',
				recipients: smsRecipients.slice(0, 100), // Limit for safety
				data: {
					schoolName: school?.school_name || 'School',
				},
			}),
		});
		results.sms = await smsResponse.json();
	}

	// Send app notifications (all parents)
	if (appNotificationUserIds.length > 0) {
		const appResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/app`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				type: 'weekly_report',
				userIds: appNotificationUserIds,
				title: 'Weekly Attendance Report',
				message: `Your child's attendance report for the week is now available.`,
				priority: 'medium',
				actionUrl: '/dashboard/parent/attendance/weekly',
				data: {
					startDate,
					endDate,
				},
			}),
		});
		results.app = await appResponse.json();
	}

	return NextResponse.json({
		success: true,
		message: `Sent ${students.length} weekly reports`,
		details: {
			totalStudents: students.length,
			smsSent: Math.min(smsRecipients.length, 100),
			appNotifications: appNotificationUserIds.length,
			period: `${startDate} to ${endDate}`,
		},
		results,
	});
}
