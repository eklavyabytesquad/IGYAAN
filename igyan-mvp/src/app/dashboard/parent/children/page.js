"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../utils/auth_context";
import { supabase } from "../../../utils/supabase";

export default function ParentChildrenPage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();
	const [children, setChildren] = useState([]);
	const [attendance, setAttendance] = useState({});
	const [loading, setLoading] = useState(true);
	const [selectedChild, setSelectedChild] = useState(null);

	useEffect(() => {
		if (!authLoading && (!user || user.role !== "parent")) {
			router.push("/dashboard");
		}
	}, [user, authLoading, router]);

	const fetchChildren = useCallback(async () => {
		if (!user?.id) return;
		setLoading(true);
		try {
			// Fetch parent-student assignments with student details
			const { data: assignments, error } = await supabase
				.from("parent_student_assignments")
				.select(`
					id,
					relationship,
					is_primary,
					student:student_id (
						id,
						full_name,
						email,
						phone,
						image_base64,
						created_at
					)
				`)
				.eq("parent_id", user.id);

			if (error) throw error;

			const kids = (assignments || []).map((a) => ({
				...a.student,
				relationship: a.relationship,
				is_primary: a.is_primary,
				assignment_id: a.id,
			}));

			setChildren(kids);
			if (kids.length > 0 && !selectedChild) {
				setSelectedChild(kids[0].id);
			}

			// Fetch recent attendance for all children
			const studentIds = kids.map((k) => k.id);
			if (studentIds.length > 0) {
				const today = new Date().toISOString().split("T")[0];
				const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

				const { data: attendanceData } = await supabase
					.from("student_attendance_v2")
					.select("student_id, status, date")
					.in("student_id", studentIds)
					.gte("date", weekAgo)
					.lte("date", today)
					.order("date", { ascending: false });

				// Group by student
				const grouped = {};
				(attendanceData || []).forEach((rec) => {
					if (!grouped[rec.student_id]) grouped[rec.student_id] = [];
					grouped[rec.student_id].push(rec);
				});
				setAttendance(grouped);
			}
		} catch (err) {
			console.error("Failed to fetch children:", err);
		} finally {
			setLoading(false);
		}
	}, [user, selectedChild]);

	useEffect(() => {
		if (user?.id) fetchChildren();
	}, [user, fetchChildren]);

	// Get class enrollment for a student
	const getAttendanceStats = (studentId) => {
		const records = attendance[studentId] || [];
		const present = records.filter((r) => r.status === "present").length;
		const absent = records.filter((r) => r.status === "absent").length;
		const late = records.filter((r) => r.status === "late").length;
		const total = records.length;
		const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
		return { present, absent, late, total, percentage };
	};

	const getTodayStatus = (studentId) => {
		const records = attendance[studentId] || [];
		const today = new Date().toISOString().split("T")[0];
		const todayRec = records.find((r) => r.date === today);
		return todayRec?.status || null;
	};

	const statusColors = {
		present: { background: 'color-mix(in srgb, #10b981 15%, transparent)', color: '#10b981' },
		absent: { background: 'color-mix(in srgb, #ef4444 15%, transparent)', color: '#ef4444' },
		late: { background: 'color-mix(in srgb, #f59e0b 15%, transparent)', color: '#f59e0b' },
	};

	if (authLoading || loading) {
		return (
			<div className="flex h-[60vh] items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--dashboard-border)', borderTopColor: 'transparent' }} />
					<p className="text-sm font-medium" style={{ color: 'var(--dashboard-muted)' }}>Loading your children&apos;s info...</p>
				</div>
			</div>
		);
	}

	if (!user) return null;

	return (
		<div className="min-h-screen" style={{ background: 'var(--dashboard-background)' }}>
			{/* Hero */}
			<div className="relative overflow-hidden px-6 py-8 sm:px-8" style={{ background: 'var(--dashboard-surface-muted)', borderBottom: '1px solid var(--dashboard-border)' }}>
				<div className="relative z-10">
					<h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl" style={{ color: 'var(--dashboard-heading)' }}>
						👨‍👩‍👧‍👦 My Children
					</h1>
					<p className="mt-1.5 text-sm" style={{ color: 'var(--dashboard-muted)' }}>Track your children&apos;s attendance, academics, and school activities</p>
					<div className="mt-5 flex flex-wrap gap-3">
						{[
							{ icon: "🧒🏻", label: "Children", value: children.length },
							{ icon: "✅", label: "Present Today", value: children.filter((c) => getTodayStatus(c.id) === "present").length },
							{ icon: "📊", label: "This Week", value: Object.values(attendance).flat().length + " records" },
						].map((s, i) => (
							<div key={i} className="flex items-center gap-3 rounded-xl px-4 py-2.5" style={{ border: '1px solid var(--dashboard-border)', background: 'var(--dashboard-surface-solid)' }}>
								<span className="text-lg">{s.icon}</span>
								<div>
									<p className="text-xs font-medium" style={{ color: 'var(--dashboard-muted)' }}>{s.label}</p>
									<p className="text-lg font-bold" style={{ color: 'var(--dashboard-heading)' }}>{s.value}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="p-6 sm:p-8">
				{children.length === 0 ? (
					<div className="mx-auto max-w-md rounded-2xl p-8 text-center shadow-xl" style={{ border: '1px solid var(--dashboard-border)', background: 'var(--dashboard-surface-solid)' }}>
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl" style={{ background: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)' }}>🧒🏻</div>
						<h2 className="text-xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>No Children Linked</h2>
						<p className="mt-2 text-sm" style={{ color: 'var(--dashboard-muted)' }}>
							Your account has not been linked to any student yet. Please contact your school administrator to link your children to your parent account.
						</p>
					</div>
				) : (
					<div className="space-y-6">
						{/* Children Cards */}
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
							{children.map((child) => {
								const stats = getAttendanceStats(child.id);
								const todayStatus = getTodayStatus(child.id);
								const initials = child.full_name?.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

								return (
									<div
										key={child.id}
										onClick={() => setSelectedChild(child.id)}
										className={`cursor-pointer rounded-2xl p-6 shadow-sm transition-all hover:shadow-md`}
										style={selectedChild === child.id
											? { border: '2px solid var(--dashboard-primary)', background: 'color-mix(in srgb, var(--dashboard-primary) 5%, transparent)' }
											: { border: '1px solid var(--dashboard-border)', background: 'var(--dashboard-surface-solid)' }
										}
									>
										{/* Child Header */}
										<div className="flex items-start gap-4">
											<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white shadow-lg" style={{ background: 'var(--dashboard-primary)' }}>
												{initials}
											</div>
											<div className="min-w-0 flex-1">
												<h3 className="truncate text-lg font-bold" style={{ color: 'var(--dashboard-heading)' }}>{child.full_name}</h3>
												<p className="truncate text-sm" style={{ color: 'var(--dashboard-muted)' }}>{child.email}</p>
												<div className="mt-1.5 flex flex-wrap gap-1.5">
													<span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)', color: 'var(--dashboard-primary)' }}>
														{child.relationship || "Child"}
													</span>
													{child.is_primary && (
														<span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: 'color-mix(in srgb, #f59e0b 15%, transparent)', color: '#f59e0b' }}>
															⭐ Primary
														</span>
													)}
												</div>
											</div>
										</div>

										{/* Today's Status */}
										<div className="mt-5 rounded-xl p-3.5" style={{ border: '1px solid var(--dashboard-border)', background: 'var(--dashboard-surface-muted)' }}>
											<div className="flex items-center justify-between">
												<span className="text-xs font-medium" style={{ color: 'var(--dashboard-muted)' }}>Today&apos;s Attendance</span>
												{todayStatus ? (
													<span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize" style={statusColors[todayStatus] || {}}>
														{todayStatus === "present" && "✅ "}{todayStatus === "absent" && "❌ "}{todayStatus === "late" && "⏰ "}
														{todayStatus}
													</span>
												) : (
													<span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: 'var(--dashboard-surface-muted)', color: 'var(--dashboard-muted)' }}>
														No record
													</span>
												)}
											</div>
										</div>

										{/* Weekly Stats */}
										<div className="mt-4 grid grid-cols-3 gap-2 text-center">
											<div className="rounded-lg p-2" style={{ background: 'color-mix(in srgb, #10b981 10%, transparent)' }}>
												<p className="text-lg font-bold" style={{ color: '#10b981' }}>{stats.present}</p>
												<p className="text-[10px] font-medium" style={{ color: '#10b981', opacity: 0.7 }}>Present</p>
											</div>
											<div className="rounded-lg p-2" style={{ background: 'color-mix(in srgb, #ef4444 10%, transparent)' }}>
												<p className="text-lg font-bold" style={{ color: '#ef4444' }}>{stats.absent}</p>
												<p className="text-[10px] font-medium" style={{ color: '#ef4444', opacity: 0.7 }}>Absent</p>
											</div>
											<div className="rounded-lg p-2" style={{ background: 'color-mix(in srgb, #f59e0b 10%, transparent)' }}>
												<p className="text-lg font-bold" style={{ color: '#f59e0b' }}>{stats.late}</p>
												<p className="text-[10px] font-medium" style={{ color: '#f59e0b', opacity: 0.7 }}>Late</p>
											</div>
										</div>

										{/* Attendance Progress */}
										{stats.total > 0 && (
											<div className="mt-4">
												<div className="flex items-center justify-between text-xs">
													<span className="font-medium" style={{ color: 'var(--dashboard-muted)' }}>Weekly Attendance</span>
													<span className="font-bold" style={{ color: 'var(--dashboard-heading)' }}>{stats.percentage}%</span>
												</div>
												<div className="mt-1.5 h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--dashboard-border)' }}>
													<div
														className="h-full rounded-full transition-all"
														style={{
															width: `${stats.percentage}%`,
															background: stats.percentage >= 75 ? '#10b981' : stats.percentage >= 50 ? '#f59e0b' : '#ef4444'
														}}
													/>
												</div>
											</div>
										)}

										{child.phone && (
											<p className="mt-3 text-xs" style={{ color: 'var(--dashboard-muted)' }}>📞 {child.phone}</p>
										)}
									</div>
								);
							})}
						</div>

						{/* Selected Child Detail */}
						{selectedChild && (() => {
							const child = children.find((c) => c.id === selectedChild);
							if (!child) return null;
							const records = (attendance[child.id] || []).slice(0, 7);

							return (
								<div className="rounded-2xl shadow-sm" style={{ border: '1px solid var(--dashboard-border)', background: 'var(--dashboard-surface-solid)' }}>
									<div className="px-6 py-4" style={{ borderBottom: '1px solid var(--dashboard-border)', background: 'var(--dashboard-surface-muted)' }}>
										<h3 className="text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
											📅 Recent Attendance — {child.full_name}
										</h3>
									</div>
									{records.length === 0 ? (
										<div className="px-6 py-10 text-center">
											<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full text-xl" style={{ background: 'var(--dashboard-surface-muted)' }}>📅</div>
											<p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>No attendance records found for the past week.</p>
										</div>
									) : (
										<div className="overflow-x-auto">
											<table className="w-full">
												<thead style={{ borderBottom: '1px solid var(--dashboard-border)', background: 'var(--dashboard-surface-muted)' }}>
													<tr>
														<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--dashboard-muted)' }}>Date</th>
														<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--dashboard-muted)' }}>Day</th>
														<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--dashboard-muted)' }}>Status</th>
													</tr>
												</thead>
												<tbody>
													{records.map((rec, i) => {
														const d = new Date(rec.date);
														const day = d.toLocaleDateString("en-US", { weekday: "long" });
														const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
														return (
															<tr key={i} className="transition-colors hover:opacity-80" style={{ borderBottom: '1px solid var(--dashboard-border)' }}>
																<td className="whitespace-nowrap px-6 py-3.5 text-sm" style={{ color: 'var(--dashboard-heading)' }}>{dateStr}</td>
																<td className="whitespace-nowrap px-6 py-3.5 text-sm" style={{ color: 'var(--dashboard-muted)' }}>{day}</td>
																<td className="whitespace-nowrap px-6 py-3.5">
																	<span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize" style={statusColors[rec.status] || {}}>
																		{rec.status === "present" && "✅ "}{rec.status === "absent" && "❌ "}{rec.status === "late" && "⏰ "}
																		{rec.status}
																	</span>
																</td>
															</tr>
														);
													})}
												</tbody>
											</table>
										</div>
									)}
								</div>
							);
						})()}

						{/* Quick Info Cards */}
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							<div className="rounded-2xl p-5 shadow-sm" style={{ border: '1px solid var(--dashboard-border)', background: 'var(--dashboard-surface-solid)' }}>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ background: 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)' }}>💬</div>
									<div>
										<h4 className="text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>Messages</h4>
										<p className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>Contact class teacher</p>
									</div>
								</div>
								<button onClick={() => router.push("/dashboard/parent/messages")} className="mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90" style={{ background: 'var(--dashboard-primary)' }}>
									Open Messages
								</button>
							</div>

							<div className="rounded-2xl p-5 shadow-sm" style={{ border: '1px solid var(--dashboard-border)', background: 'var(--dashboard-surface-solid)' }}>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ background: 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)' }}>📋</div>
									<div>
										<h4 className="text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>Report Cards</h4>
										<p className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>View academic reports</p>
									</div>
								</div>
								<button onClick={() => router.push("/dashboard/parent/report-cards")} className="mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90" style={{ background: 'var(--dashboard-primary)' }}>
									View Reports
								</button>
							</div>

							<div className="rounded-2xl p-5 shadow-sm" style={{ border: '1px solid var(--dashboard-border)', background: 'var(--dashboard-surface-solid)' }}>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl text-lg" style={{ background: 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)' }}>🎫</div>
									<div>
										<h4 className="text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>School Events</h4>
										<p className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>Upcoming activities</p>
									</div>
								</div>
								<button onClick={() => router.push("/dashboard/parent/events")} className="mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90" style={{ background: 'var(--dashboard-primary)' }}>
									View Events
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
