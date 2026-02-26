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
		present: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
		absent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
		late: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
	};

	if (authLoading || loading) {
		return (
			<div className="flex h-[60vh] items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-500 border-t-transparent" />
					<p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading your children&apos;s info...</p>
				</div>
			</div>
		);
	}

	if (!user) return null;

	return (
		<div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950">
			{/* Hero */}
			<div className="relative overflow-hidden bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-6 py-8 sm:px-8">
				<div className="relative z-10">
					<h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
						👨‍👩‍👧‍👦 My Children
					</h1>
					<p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">Track your children&apos;s attendance, academics, and school activities</p>
					<div className="mt-5 flex flex-wrap gap-3">
						{[
							{ icon: "🧒🏻", label: "Children", value: children.length },
							{ icon: "✅", label: "Present Today", value: children.filter((c) => getTodayStatus(c.id) === "present").length },
							{ icon: "📊", label: "This Week", value: Object.values(attendance).flat().length + " records" },
						].map((s, i) => (
							<div key={i} className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-4 py-2.5">
								<span className="text-lg">{s.icon}</span>
								<div>
									<p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{s.label}</p>
									<p className="text-lg font-bold text-zinc-900 dark:text-white">{s.value}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="p-6 sm:p-8">
				{children.length === 0 ? (
					<div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
						<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-3xl dark:bg-zinc-800">🧒🏻</div>
						<h2 className="text-xl font-bold text-zinc-900 dark:text-white">No Children Linked</h2>
						<p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
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
										className={`cursor-pointer rounded-2xl border p-6 shadow-sm transition-all hover:shadow-md ${
											selectedChild === child.id
												? "border-zinc-400 bg-zinc-50 ring-2 ring-zinc-300/50 dark:border-zinc-600 dark:bg-zinc-800/50 dark:ring-zinc-600/30"
												: "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
										}`}
									>
										{/* Child Header */}
										<div className="flex items-start gap-4">
											<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white shadow-lg shadow-blue-500/25">
												{initials}
											</div>
											<div className="min-w-0 flex-1">
												<h3 className="truncate text-lg font-bold text-zinc-900 dark:text-white">{child.full_name}</h3>
												<p className="truncate text-sm text-zinc-500 dark:text-zinc-400">{child.email}</p>
												<div className="mt-1.5 flex flex-wrap gap-1.5">
													<span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
														{child.relationship || "Child"}
													</span>
													{child.is_primary && (
														<span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
															⭐ Primary
														</span>
													)}
												</div>
											</div>
										</div>

										{/* Today's Status */}
										<div className="mt-5 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3.5 dark:border-zinc-800 dark:bg-zinc-800/50">
											<div className="flex items-center justify-between">
												<span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Today&apos;s Attendance</span>
												{todayStatus ? (
													<span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusColors[todayStatus] || ""}`}>
														{todayStatus === "present" && "✅ "}{todayStatus === "absent" && "❌ "}{todayStatus === "late" && "⏰ "}
														{todayStatus}
													</span>
												) : (
													<span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
														No record
													</span>
												)}
											</div>
										</div>

										{/* Weekly Stats */}
										<div className="mt-4 grid grid-cols-3 gap-2 text-center">
											<div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-900/20">
												<p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.present}</p>
												<p className="text-[10px] font-medium text-emerald-600/70 dark:text-emerald-400/70">Present</p>
											</div>
											<div className="rounded-lg bg-red-50 p-2 dark:bg-red-900/20">
												<p className="text-lg font-bold text-red-600 dark:text-red-400">{stats.absent}</p>
												<p className="text-[10px] font-medium text-red-600/70 dark:text-red-400/70">Absent</p>
											</div>
											<div className="rounded-lg bg-amber-50 p-2 dark:bg-amber-900/20">
												<p className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats.late}</p>
												<p className="text-[10px] font-medium text-amber-600/70 dark:text-amber-400/70">Late</p>
											</div>
										</div>

										{/* Attendance Progress */}
										{stats.total > 0 && (
											<div className="mt-4">
												<div className="flex items-center justify-between text-xs">
													<span className="font-medium text-zinc-500 dark:text-zinc-400">Weekly Attendance</span>
													<span className="font-bold text-zinc-900 dark:text-white">{stats.percentage}%</span>
												</div>
												<div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
													<div
														className={`h-full rounded-full transition-all ${
															stats.percentage >= 75 ? "bg-emerald-500" : stats.percentage >= 50 ? "bg-amber-500" : "bg-red-500"
														}`}
														style={{ width: `${stats.percentage}%` }}
													/>
												</div>
											</div>
										)}

										{child.phone && (
											<p className="mt-3 text-xs text-zinc-400">📞 {child.phone}</p>
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
								<div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
									<div className="border-b border-zinc-200 bg-zinc-50/80 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-800/50">
										<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
											📅 Recent Attendance — {child.full_name}
										</h3>
									</div>
									{records.length === 0 ? (
										<div className="px-6 py-10 text-center">
											<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-xl dark:bg-zinc-800">📅</div>
											<p className="text-sm text-zinc-500 dark:text-zinc-400">No attendance records found for the past week.</p>
										</div>
									) : (
										<div className="overflow-x-auto">
											<table className="w-full">
												<thead className="border-b border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-800/30">
													<tr>
														<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Date</th>
														<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Day</th>
														<th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Status</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
													{records.map((rec, i) => {
														const d = new Date(rec.date);
														const day = d.toLocaleDateString("en-US", { weekday: "long" });
														const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
														return (
															<tr key={i} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
																<td className="whitespace-nowrap px-6 py-3.5 text-sm text-zinc-900 dark:text-white">{dateStr}</td>
																<td className="whitespace-nowrap px-6 py-3.5 text-sm text-zinc-500 dark:text-zinc-400">{day}</td>
																<td className="whitespace-nowrap px-6 py-3.5">
																	<span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusColors[rec.status] || ""}`}>
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
							<div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg dark:bg-blue-900/30">💬</div>
									<div>
										<h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Messages</h4>
										<p className="text-xs text-zinc-500 dark:text-zinc-400">Contact class teacher</p>
									</div>
								</div>
								<button onClick={() => router.push("/dashboard/parent/messages")} className="mt-4 w-full rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-600">
									Open Messages
								</button>
							</div>

							<div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-lg dark:bg-purple-900/30">📋</div>
									<div>
										<h4 className="text-sm font-semibold text-zinc-900 dark:text-white">Report Cards</h4>
										<p className="text-xs text-zinc-500 dark:text-zinc-400">View academic reports</p>
									</div>
								</div>
								<button onClick={() => router.push("/dashboard/parent/report-cards")} className="mt-4 w-full rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-600">
									View Reports
								</button>
							</div>

							<div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-lg dark:bg-amber-900/30">🎫</div>
									<div>
										<h4 className="text-sm font-semibold text-zinc-900 dark:text-white">School Events</h4>
										<p className="text-xs text-zinc-500 dark:text-zinc-400">Upcoming activities</p>
									</div>
								</div>
								<button onClick={() => router.push("/dashboard/parent/events")} className="mt-4 w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-600">
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
