"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import { supabase } from "../../utils/supabase";

export default function AttendancePage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [students, setStudents] = useState([]);
	const [attendance, setAttendance] = useState([]);
	const [selectedClass, setSelectedClass] = useState("");
	const [selectedSection, setSelectedSection] = useState("");
	const [selectedSubject, setSelectedSubject] = useState("");
	const [selectedDate, setSelectedDate] = useState(
		new Date().toISOString().split("T")[0]
	);
	const [attendanceData, setAttendanceData] = useState({});
	const [showStats, setShowStats] = useState(false);
	const [absenteeAlerts, setAbsenteeAlerts] = useState([]);
	const [view, setView] = useState("mark"); // 'mark' or 'history'
	const [isLoading, setIsLoading] = useState(false);

	const subjects = [
		{ id: "mathematics", name: "Mathematics", icon: "🔢" },
		{ id: "science", name: "Science", icon: "🔬" },
		{ id: "social-studies", name: "Social Studies", icon: "🌍" },
		{ id: "english", name: "English", icon: "📚" },
		{ id: "hindi", name: "Hindi", icon: "🇮🇳" },
		{ id: "computer-science", name: "Computer Science", icon: "💻" },
		{ id: "physical-education", name: "Physical Education", icon: "⚽" },
		{ id: "art", name: "Art & Craft", icon: "🎨" },
	];

	// Redirect if not authenticated or not faculty
	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		} else if (!loading && user && user.role !== "faculty") {
			router.push("/dashboard");
		}
	}, [user, loading, router]);

	// Load students from Supabase - only from same school
	useEffect(() => {
		if (user && user.role === "faculty") {
			fetchStudents();
			fetchAttendance();
		}
	}, [user]);

	// Fetch students from Supabase filtered by school_id
	const fetchStudents = async () => {
		try {
			setIsLoading(true);
			let query = supabase
				.from("users")
				.select(`
					*,
					student_profiles (*)
				`)
				.eq("role", "student");

			// Filter by school_id - only show students from same school
			if (user.school_id) {
				query = query.eq("school_id", user.school_id);
			}

			query = query.order("created_at", { ascending: false });

			const { data, error } = await query;

			if (error) throw error;

			// Map to attendance-compatible format
			const mappedStudents = data.map((student) => {
				const profile = Array.isArray(student.student_profiles)
					? student.student_profiles[0]
					: student.student_profiles;

				return {
					id: student.id,
					profileId: profile?.id || null,
					regNo: student.email.split("@")[0],
					name: student.full_name,
					email: student.email,
					class: profile?.class || "",
					section: profile?.section || "",
				};
			});

			setStudents(mappedStudents);
		} catch (error) {
			console.error("Error fetching students:", error);
			alert("Failed to load students: " + error.message);
		} finally {
			setIsLoading(false);
		}
	};

	// Fetch attendance records from Supabase
	const fetchAttendance = async () => {
		try {
			// First, get attendance records
			let query = supabase
				.from("student_attendance")
				.select("*");

			// Filter by school_id
			if (user.school_id) {
				query = query.eq("school_id", user.school_id);
			}

			query = query.order("attendance_date", { ascending: false });

			const { data: attendanceData, error: attendanceError } = await query;

			if (attendanceError) throw attendanceError;

			// Get all unique student_profile_ids
			const profileIds = [...new Set(attendanceData.map(a => a.student_profile_id).filter(Boolean))];

			// Fetch student profiles separately
			const { data: profiles, error: profileError } = await supabase
				.from("student_profiles")
				.select("id, user_id, class, section")
				.in("id", profileIds);

			if (profileError) throw profileError;

			// Fetch marked_by users separately
			const markedByIds = [...new Set(attendanceData.map(a => a.marked_by).filter(Boolean))];
			const { data: users, error: usersError } = await supabase
				.from("users")
				.select("id, full_name, email")
				.in("id", markedByIds);

			if (usersError) throw usersError;

			// Create lookup maps
			const profileMap = {};
			profiles.forEach(p => {
				profileMap[p.id] = p;
			});

			const userMap = {};
			users.forEach(u => {
				userMap[u.id] = u;
			});

			// Group attendance by date, class, section, subject
			const groupedAttendance = {};
			
			attendanceData.forEach((record) => {
				const profile = profileMap[record.student_profile_id];
				if (!profile) return; // Skip if profile not found
				
				const subject = record.subject || 'general';
				const key = `${record.attendance_date}_${profile.class}_${profile.section}_${subject}`;
				
				if (!groupedAttendance[key]) {
					const markedByUser = userMap[record.marked_by];
					groupedAttendance[key] = {
						id: record.id,
						date: record.attendance_date,
						class: profile.class,
						section: profile.section,
						subject: subject,
						records: {},
						timestamp: record.created_at,
						markedBy: markedByUser?.full_name || markedByUser?.email || 'Unknown',
					};
				}
				
				groupedAttendance[key].records[profile.user_id] = record.status;
			});

			setAttendance(Object.values(groupedAttendance));
		} catch (error) {
			console.error("Error fetching attendance:", error);
			alert("Failed to load attendance: " + error.message);
		}
	};

	// Initialize attendance data when class/section/subject changes
	useEffect(() => {
		if (selectedClass && selectedSection && selectedSubject) {
			loadAttendanceForDate();
		}
	}, [selectedClass, selectedSection, selectedSubject, selectedDate, students]);

	// Load attendance for selected date
	const loadAttendanceForDate = async () => {
		try {
			const filteredStudents = students.filter(
				(s) => s.class === selectedClass && s.section === selectedSection
			);

			// Get attendance records for this date
			const { data: attendanceRecords, error: attendanceError } = await supabase
				.from("student_attendance")
				.select("*")
				.eq("attendance_date", selectedDate)
				.eq("school_id", user.school_id);

			if (attendanceError) throw attendanceError;

			// Get profile IDs from attendance records
			const profileIds = attendanceRecords.map(r => r.student_profile_id).filter(Boolean);

			if (profileIds.length > 0) {
				// Fetch profiles to map student_profile_id to user_id
				const { data: profiles, error: profileError } = await supabase
					.from("student_profiles")
					.select("id, user_id, class, section")
					.in("id", profileIds);

				if (profileError) throw profileError;

				// Create map of profile_id to user_id
				const profileMap = {};
				profiles.forEach(p => {
					profileMap[p.id] = p;
				});

				// Filter for selected class/section and map to user_id: status
				const attendanceMap = {};
				attendanceRecords.forEach((record) => {
					const profile = profileMap[record.student_profile_id];
					if (profile?.class === selectedClass && profile?.section === selectedSection) {
						attendanceMap[profile.user_id] = record.status;
					}
				});

				// Initialize with existing or default to present
				const initialData = {};
				filteredStudents.forEach((student) => {
					initialData[student.id] = attendanceMap[student.id] || "present";
				});
				setAttendanceData(initialData);
			} else {
				// No records found, initialize with all present
				const initialData = {};
				filteredStudents.forEach((student) => {
					initialData[student.id] = "present";
				});
				setAttendanceData(initialData);
			}
		} catch (error) {
			console.error("Error loading attendance:", error);
			// Initialize with all present on error
			const filteredStudents = students.filter(
				(s) => s.class === selectedClass && s.section === selectedSection
			);
			const initialData = {};
			filteredStudents.forEach((student) => {
				initialData[student.id] = "present";
			});
			setAttendanceData(initialData);
		}
	};

	// Check for absentee alerts
	useEffect(() => {
		if (attendance.length > 0 && students.length > 0) {
			const alerts = [];
			const today = new Date();
			const threeDaysAgo = new Date(today);
			threeDaysAgo.setDate(today.getDate() - 3);

			students.forEach((student) => {
				const studentAttendance = attendance.filter(
					(a) =>
						a.records[student.id] === "absent" &&
						new Date(a.date) >= threeDaysAgo &&
						new Date(a.date) <= today
				);

				if (studentAttendance.length >= 3) {
					alerts.push({
						student,
						absentDays: studentAttendance.length,
						lastAbsent: studentAttendance[studentAttendance.length - 1].date,
					});
				}
			});

			setAbsenteeAlerts(alerts);
		}
	}, [attendance, students]);

	// Get unique classes and sections
	const uniqueClasses = [...new Set(students.map((s) => s.class))].sort();
	const uniqueSections = selectedClass
		? [
				...new Set(
					students.filter((s) => s.class === selectedClass).map((s) => s.section)
				),
		  ].sort()
		: [];

	// Get filtered students
	const filteredStudents = students.filter(
		(s) =>
			s.class === selectedClass &&
			s.section === selectedSection &&
			selectedSubject
	);

	// Save attendance to Supabase
	const handleSaveAttendance = async () => {
		if (!selectedClass || !selectedSection || !selectedSubject) {
			alert("Please select class, section, and subject");
			return;
		}

		try {
			setIsLoading(true);

			// Get all students for this class/section
			const studentsToMark = students.filter(
				(s) => s.class === selectedClass && s.section === selectedSection
			);

			// Delete existing attendance for this date/class/section
			await supabase
				.from("student_attendance")
				.delete()
				.eq("attendance_date", selectedDate)
				.eq("school_id", user.school_id)
				.in(
					"student_profile_id",
					studentsToMark.map((s) => s.profileId).filter(Boolean)
				);

			// Prepare new attendance records
			const attendanceRecords = studentsToMark
				.filter((student) => student.profileId) // Only students with profiles
				.map((student) => ({
					student_profile_id: student.profileId,
					school_id: user.school_id,
					attendance_date: selectedDate,
					status: attendanceData[student.id] || "present",
					subject: selectedSubject,
					remarks: null,
					marked_by: user.id,
				}));

			// Insert new attendance records
			const { error } = await supabase
				.from("student_attendance")
				.insert(attendanceRecords);

			if (error) throw error;

			alert("Attendance saved successfully!");
			setShowStats(true);
			setTimeout(() => setShowStats(false), 3000);
			
			// Refresh attendance list
			await fetchAttendance();
		} catch (error) {
			console.error("Error saving attendance:", error);
			alert("Failed to save attendance: " + error.message);
		} finally {
			setIsLoading(false);
		}
	};

	// Toggle attendance status
	const toggleAttendance = (studentId) => {
		setAttendanceData((prev) => {
			const current = prev[studentId] || "present";
			return {
				...prev,
				[studentId]:
					current === "present"
						? "absent"
						: current === "absent"
						? "late"
						: "present",
			};
		});
	};

	// Send reminder to parents
	const sendReminderToParents = (studentId) => {
		const student = students.find((s) => s.id === studentId);
		if (student) {
			// Simulate sending email/SMS
			alert(
				`📧 Reminder sent to parents of ${student.name}\n\nEmail: ${student.email}\n\nMessage: Your child has been absent for multiple consecutive days. Please contact the school.`
			);
		}
	};

	// Calculate statistics
	const calculateStats = () => {
		if (!selectedClass || !selectedSection || !selectedSubject) return null;

		const present = Object.values(attendanceData).filter(
			(status) => status === "present"
		).length;
		const absent = Object.values(attendanceData).filter(
			(status) => status === "absent"
		).length;
		const late = Object.values(attendanceData).filter(
			(status) => status === "late"
		).length;
		const total = filteredStudents.length;

		return { present, absent, late, total };
	};

	const stats = calculateStats();

	// Get attendance history
	const getAttendanceHistory = () => {
		return attendance
			.filter(
				(a) =>
					(!selectedClass || a.class === selectedClass) &&
					(!selectedSection || a.section === selectedSection) &&
					(!selectedSubject || a.subject === selectedSubject)
			)
			.sort((a, b) => new Date(b.date) - new Date(a.date));
	};

	const attendanceHistory = getAttendanceHistory();

	if (loading || isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
					<p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
						Loading...
					</p>
				</div>
			</div>
		);
	}

	if (!user || user.role !== "faculty") return null;

	return (
		<div className="p-6 lg:p-8">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
					Smart Attendance System
				</h1>
				<p className="mt-2 text-zinc-600 dark:text-zinc-400">
					Mark attendance, track patterns, and send alerts to parents
				</p>
			</div>

			{/* Absentee Alerts */}
			{absenteeAlerts.length > 0 && (
				<div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
					<div className="flex items-start gap-3">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="h-6 w-6 shrink-0 text-red-600 dark:text-red-400"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
							/>
						</svg>
						<div className="flex-1">
							<h3 className="font-semibold text-red-900 dark:text-red-200">
								Absentee Alerts ({absenteeAlerts.length})
							</h3>
							<p className="mt-1 text-sm text-red-800 dark:text-red-300">
								These students have been absent for 3+ consecutive days
							</p>
							<div className="mt-3 space-y-2">
								{absenteeAlerts.map((alert) => (
									<div
										key={alert.student.id}
										className="flex items-center justify-between rounded-lg border border-red-300 bg-white p-3 dark:border-red-800 dark:bg-red-950/50"
									>
										<div className="flex items-center gap-3">
											<div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
												<span className="text-sm font-semibold text-red-700 dark:text-red-300">
													{alert.student.name
														.split(" ")
														.map((n) => n[0])
														.join("")
														.toUpperCase()}
												</span>
											</div>
											<div>
												<p className="font-medium text-zinc-900 dark:text-white">
													{alert.student.name}
												</p>
												<p className="text-xs text-zinc-600 dark:text-zinc-400">
													Class {alert.student.class}-{alert.student.section} •
													Absent {alert.absentDays} days • Last:{" "}
													{new Date(alert.lastAbsent).toLocaleDateString()}
												</p>
											</div>
										</div>
										<button
											onClick={() => sendReminderToParents(alert.student.id)}
											className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="1.5"
												className="h-4 w-4"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
												/>
											</svg>
											Send Reminder
										</button>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* View Tabs */}
			<div className="mb-6 flex gap-2 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
				<button
					onClick={() => setView("mark")}
					className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
						view === "mark"
							? "bg-indigo-500 text-white shadow-md"
							: "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
					}`}
				>
					📝 Mark Attendance
				</button>
				<button
					onClick={() => setView("history")}
					className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
						view === "history"
							? "bg-indigo-500 text-white shadow-md"
							: "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
					}`}
				>
					📊 Attendance History
				</button>
			</div>

			{view === "mark" ? (
				<>
					{/* Filters */}
					<div className="mb-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
						<h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
							Select Class Details
						</h3>
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<div>
								<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
									Date
								</label>
								<input
									type="date"
									value={selectedDate}
									onChange={(e) => setSelectedDate(e.target.value)}
									max={new Date().toISOString().split("T")[0]}
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								/>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
									Class
								</label>
								<select
									value={selectedClass}
									onChange={(e) => {
										setSelectedClass(e.target.value);
										setSelectedSection("");
										setSelectedSubject("");
									}}
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								>
									<option value="">Select Class</option>
									{uniqueClasses.map((cls) => (
										<option key={cls} value={cls}>
											Class {cls}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
									Section
								</label>
								<select
									value={selectedSection}
									onChange={(e) => {
										setSelectedSection(e.target.value);
										setSelectedSubject("");
									}}
									disabled={!selectedClass}
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								>
									<option value="">Select Section</option>
									{uniqueSections.map((sec) => (
										<option key={sec} value={sec}>
											Section {sec}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
									Subject
								</label>
								<select
									value={selectedSubject}
									onChange={(e) => setSelectedSubject(e.target.value)}
									disabled={!selectedSection}
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								>
									<option value="">Select Subject</option>
									{subjects.map((subject) => (
										<option key={subject.id} value={subject.id}>
											{subject.icon} {subject.name}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* Statistics */}
					{stats && filteredStudents.length > 0 && (
						<div className="mb-6 grid gap-4 sm:grid-cols-4">
							<div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
								<div className="flex items-center gap-3">
									<div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											className="h-6 w-6 text-blue-600 dark:text-blue-400"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
											/>
										</svg>
									</div>
									<div>
										<p className="text-2xl font-bold text-zinc-900 dark:text-white">
											{stats.total}
										</p>
										<p className="text-sm text-zinc-600 dark:text-zinc-400">
											Total Students
										</p>
									</div>
								</div>
							</div>

							<div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
								<div className="flex items-center gap-3">
									<div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											className="h-6 w-6 text-green-600 dark:text-green-400"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									</div>
									<div>
										<p className="text-2xl font-bold text-zinc-900 dark:text-white">
											{stats.present}
										</p>
										<p className="text-sm text-zinc-600 dark:text-zinc-400">
											Present (
											{stats.total > 0
												? ((stats.present / stats.total) * 100).toFixed(0)
												: 0}
											%)
										</p>
									</div>
								</div>
							</div>

							<div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
								<div className="flex items-center gap-3">
									<div className="rounded-lg bg-red-100 p-3 dark:bg-red-900/30">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											className="h-6 w-6 text-red-600 dark:text-red-400"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									</div>
									<div>
										<p className="text-2xl font-bold text-zinc-900 dark:text-white">
											{stats.absent}
										</p>
										<p className="text-sm text-zinc-600 dark:text-zinc-400">
											Absent (
											{stats.total > 0
												? ((stats.absent / stats.total) * 100).toFixed(0)
												: 0}
											%)
										</p>
									</div>
								</div>
							</div>

							<div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
								<div className="flex items-center gap-3">
									<div className="rounded-lg bg-yellow-100 p-3 dark:bg-yellow-900/30">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									</div>
									<div>
										<p className="text-2xl font-bold text-zinc-900 dark:text-white">
											{stats.late}
										</p>
										<p className="text-sm text-zinc-600 dark:text-zinc-400">
											Late (
											{stats.total > 0
												? ((stats.late / stats.total) * 100).toFixed(0)
												: 0}
											%)
										</p>
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Success Message */}
					{showStats && (
						<div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900/50 dark:bg-green-900/20">
							<div className="flex items-center gap-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									className="h-6 w-6 text-green-600 dark:text-green-400"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<p className="font-semibold text-green-900 dark:text-green-200">
									Attendance saved successfully!
								</p>
							</div>
						</div>
					)}

					{/* Attendance Table */}
					{filteredStudents.length > 0 ? (
						<div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
							<div className="border-b border-zinc-200 p-6 dark:border-zinc-800">
								<div className="flex items-center justify-between">
									<div>
										<h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
											Mark Attendance
										</h3>
										<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
											Class {selectedClass}-{selectedSection} •{" "}
											{subjects.find((s) => s.id === selectedSubject)?.name} •{" "}
											{new Date(selectedDate).toLocaleDateString("en-US", {
												weekday: "long",
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</p>
									</div>
									<div className="flex gap-2">
										<button
											onClick={() => {
												const newData = {};
												filteredStudents.forEach((student) => {
													newData[student.id] = "present";
												});
												setAttendanceData(newData);
											}}
											className="rounded-lg border border-green-500 px-4 py-2 text-sm font-semibold text-green-600 transition-colors hover:bg-green-50 dark:hover:bg-green-900/20"
										>
											✓ Mark All Present
										</button>
										<button
											onClick={handleSaveAttendance}
											className="rounded-lg bg-indigo-500 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
										>
											💾 Save Attendance
										</button>
									</div>
								</div>
							</div>

							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
										<tr>
											<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
												Roll No
											</th>
											<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
												Student Name
											</th>
											<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
												Email
											</th>
											<th className="px-6 py-4 text-center text-sm font-semibold text-zinc-900 dark:text-white">
												Status
											</th>
											<th className="px-6 py-4 text-center text-sm font-semibold text-zinc-900 dark:text-white">
												Quick Mark
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
										{filteredStudents.map((student, index) => {
											const status = attendanceData[student.id] || "present";
											return (
												<tr
													key={student.id}
													className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
												>
													<td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-white">
														{student.regNo}
													</td>
													<td className="px-6 py-4">
														<div className="flex items-center gap-3">
															<div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-500 text-sm font-semibold text-white">
																{student.name
																	.split(" ")
																	.map((n) => n[0])
																	.join("")
																	.toUpperCase()}
															</div>
															<span className="font-medium text-zinc-900 dark:text-white">
																{student.name}
															</span>
														</div>
													</td>
													<td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
														{student.email}
													</td>
													<td className="px-6 py-4">
														<div className="flex justify-center">
															<span
																className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
																	status === "present"
																		? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
																		: status === "absent"
																		? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
																		: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
																}`}
															>
																{status === "present" && "✓"}
																{status === "absent" && "✕"}
																{status === "late" && "⏰"}
																{status.charAt(0).toUpperCase() + status.slice(1)}
															</span>
														</div>
													</td>
													<td className="px-6 py-4">
														<div className="flex justify-center gap-2">
															<button
																onClick={() => toggleAttendance(student.id)}
																className="rounded-lg bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
															>
																Toggle
															</button>
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>
					) : (
						<div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="mx-auto h-16 w-16 text-zinc-400"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
								/>
							</svg>
							<p className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
								Select Class Details
							</p>
							<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
								Choose date, class, section, and subject to mark attendance
							</p>
						</div>
					)}
				</>
			) : (
				<>
					{/* History Filters */}
					<div className="mb-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
						<h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
							Filter History
						</h3>
						<div className="grid gap-4 sm:grid-cols-3">
							<div>
								<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
									Class
								</label>
								<select
									value={selectedClass}
									onChange={(e) => setSelectedClass(e.target.value)}
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								>
									<option value="">All Classes</option>
									{uniqueClasses.map((cls) => (
										<option key={cls} value={cls}>
											Class {cls}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
									Section
								</label>
								<select
									value={selectedSection}
									onChange={(e) => setSelectedSection(e.target.value)}
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								>
									<option value="">All Sections</option>
									{[...new Set(students.map((s) => s.section))].map((sec) => (
										<option key={sec} value={sec}>
											Section {sec}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
									Subject
								</label>
								<select
									value={selectedSubject}
									onChange={(e) => setSelectedSubject(e.target.value)}
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
								>
									<option value="">All Subjects</option>
									{subjects.map((subject) => (
										<option key={subject.id} value={subject.id}>
											{subject.icon} {subject.name}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* History List */}
					<div className="space-y-4">
						{attendanceHistory.length === 0 ? (
							<div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									className="mx-auto h-16 w-16 text-zinc-400"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<p className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
									No Attendance Records
								</p>
								<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
									Start marking attendance to see history
								</p>
							</div>
						) : (
							attendanceHistory.map((record) => {
								const recordStats = {
									present: Object.values(record.records).filter(
										(s) => s === "present"
									).length,
									absent: Object.values(record.records).filter(
										(s) => s === "absent"
									).length,
									late: Object.values(record.records).filter((s) => s === "late")
										.length,
									total: Object.keys(record.records).length,
								};

								const subject = subjects.find((s) => s.id === record.subject);

								return (
									<div
										key={record.id}
										className="rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
									>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center gap-3">
													<div className="text-3xl">{subject?.icon}</div>
													<div>
														<h4 className="text-lg font-semibold text-zinc-900 dark:text-white">
															{subject?.name}
														</h4>
														<p className="text-sm text-zinc-600 dark:text-zinc-400">
															Class {record.class}-{record.section} •{" "}
															{new Date(record.date).toLocaleDateString(
																"en-US",
																{
																	weekday: "short",
																	year: "numeric",
																	month: "short",
																	day: "numeric",
																}
															)}
														</p>
													</div>
												</div>

												<div className="mt-4 flex gap-6">
													<div>
														<p className="text-2xl font-bold text-green-600 dark:text-green-400">
															{recordStats.present}
														</p>
														<p className="text-xs text-zinc-600 dark:text-zinc-400">
															Present
														</p>
													</div>
													<div>
														<p className="text-2xl font-bold text-red-600 dark:text-red-400">
															{recordStats.absent}
														</p>
														<p className="text-xs text-zinc-600 dark:text-zinc-400">
															Absent
														</p>
													</div>
													<div>
														<p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
															{recordStats.late}
														</p>
														<p className="text-xs text-zinc-600 dark:text-zinc-400">
															Late
														</p>
													</div>
												</div>
											</div>

											<div className="text-right">
												<div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-800">
													<svg
														xmlns="http://www.w3.org/2000/svg"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="1.5"
														className="h-5 w-5 text-zinc-600 dark:text-zinc-400"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
														/>
													</svg>
													<span className="text-sm font-semibold text-zinc-900 dark:text-white">
														{recordStats.total} Students
													</span>
												</div>
												<p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
													By {record.markedBy}
												</p>
											</div>
										</div>

										{/* Progress Bar */}
										<div className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
											<div className="flex h-full">
												<div
													className="bg-green-500"
													style={{
														width: `${
															(recordStats.present / recordStats.total) * 100
														}%`,
													}}
												></div>
												<div
													className="bg-yellow-500"
													style={{
														width: `${
															(recordStats.late / recordStats.total) * 100
														}%`,
													}}
												></div>
												<div
													className="bg-red-500"
													style={{
														width: `${
															(recordStats.absent / recordStats.total) * 100
														}%`,
													}}
												></div>
											</div>
										</div>
									</div>
								);
							})
						)}
					</div>
				</>
			)}
		</div>
	);
}
