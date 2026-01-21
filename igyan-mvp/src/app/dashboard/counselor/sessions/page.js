"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/app/utils/auth_context";
import { createClient } from "@/app/utils/supabase";
import { useRouter, useSearchParams } from "next/navigation";

function CounselorSessionsContent() {
	const { user } = useAuth();
	const router = useRouter();
	const searchParams = useSearchParams();
	const supabase = createClient();

	const [loading, setLoading] = useState(true);
	const [sessions, setSessions] = useState([]);
	const [students, setStudents] = useState([]);
	const [filter, setFilter] = useState("upcoming"); // upcoming, completed, all
	const [showNewSessionModal, setShowNewSessionModal] = useState(false);
	const [selectedStudent, setSelectedStudent] = useState("");
	const [sessionDate, setSessionDate] = useState("");
	const [sessionTime, setSessionTime] = useState("");
	const [sessionType, setSessionType] = useState("individual");
	const [sessionNotes, setSessionNotes] = useState("");

	// Check if there's a student parameter from URL (coming from safety alerts)
	useEffect(() => {
		const studentParam = searchParams.get("student");
		if (studentParam) {
			setSelectedStudent(studentParam);
			setShowNewSessionModal(true);
		}
	}, [searchParams]);

	// Role validation
	useEffect(() => {
		if (!user) {
			router.push("/login");
			return;
		}

		const ALLOWED_ROLES = ["super_admin", "co_admin", "counselor"];
		if (!ALLOWED_ROLES.includes(user.role)) {
			router.push("/dashboard");
			return;
		}

		fetchSessions();
		fetchStudents();
	}, [user]);

	const fetchSessions = async () => {
		try {
			setLoading(true);
			// TODO: Replace with actual database query
			// const { data, error } = await supabase
			// 	.from("counseling_sessions")
			// 	.select(`
			// 		*,
			// 		student:students(id, name, roll_number, class, section, parent_phone),
			// 		counselor:users(name, email)
			// 	`)
			// 	.eq("school_id", user.school_id)
			// 	.eq("counselor_id", user.id)
			// 	.order("session_date", { ascending: true });

			// if (error) throw error;
			// setSessions(data || []);

			// MOCK DATA for UI demonstration
			const mockSessions = [
				{
					id: 1,
					student_id: "S001",
					student_name: "Rahul Kumar",
					student_class: "Class 10-A",
					student_roll: "10A-001",
					session_date: "2024-01-20",
					session_time: "10:00 AM",
					session_type: "individual",
					status: "scheduled",
					reason: "Cyberbullying concerns - Follow-up from AI alert",
					notes: "",
					parent_notified: true,
				},
				{
					id: 2,
					student_id: "S002",
					student_name: "Priya Sharma",
					student_class: "Class 9-B",
					student_roll: "9B-012",
					session_date: "2024-01-20",
					session_time: "02:30 PM",
					session_type: "individual",
					status: "scheduled",
					reason: "Self-harm ideation - Urgent intervention",
					notes: "",
					parent_notified: true,
				},
				{
					id: 3,
					student_id: "S003",
					student_name: "Amit Patel",
					student_class: "Class 11-C",
					student_roll: "11C-025",
					session_date: "2024-01-19",
					session_time: "11:00 AM",
					session_type: "individual",
					status: "completed",
					reason: "Exam anxiety management",
					notes: "Student responded well to relaxation techniques. Recommended daily meditation practice. Parents informed about progress. Follow-up scheduled for next week.",
					parent_notified: true,
				},
				{
					id: 4,
					student_id: "S005",
					student_name: "Vikram Singh",
					student_class: "Class 12-B",
					student_roll: "12B-018",
					session_date: "2024-01-18",
					session_time: "03:00 PM",
					session_type: "individual",
					status: "completed",
					reason: "Career counseling - Peer pressure concerns",
					notes: "Discussed career options in arts field. Student showed clarity about personal goals. Recommended conversation with parents to address their expectations.",
					parent_notified: false,
				},
				{
					id: 5,
					student_id: "GROUP",
					student_name: "Class 10-A Group",
					student_class: "Class 10-A",
					student_roll: "Multiple",
					session_date: "2024-01-22",
					session_time: "09:00 AM",
					session_type: "group",
					status: "scheduled",
					reason: "Anti-bullying workshop",
					notes: "",
					parent_notified: false,
				},
			];

			setSessions(mockSessions);
		} catch (error) {
			console.error("Error fetching sessions:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchStudents = async () => {
		try {
			// TODO: Replace with actual database query
			// const { data, error } = await supabase
			// 	.from("students")
			// 	.select("id, name, roll_number, class, section")
			// 	.eq("school_id", user.school_id)
			// 	.order("name");

			// if (error) throw error;
			// setStudents(data || []);

			// MOCK DATA
			setStudents([
				{ id: "S001", name: "Rahul Kumar", roll_number: "10A-001", class: "Class 10-A" },
				{ id: "S002", name: "Priya Sharma", roll_number: "9B-012", class: "Class 9-B" },
				{ id: "S003", name: "Amit Patel", roll_number: "11C-025", class: "Class 11-C" },
				{ id: "S004", name: "Sneha Reddy", roll_number: "8A-007", class: "Class 8-A" },
				{ id: "S005", name: "Vikram Singh", roll_number: "12B-018", class: "Class 12-B" },
			]);
		} catch (error) {
			console.error("Error fetching students:", error);
		}
	};

	const handleCreateSession = async () => {
		if (!selectedStudent || !sessionDate || !sessionTime) {
			alert("Please fill in all required fields");
			return;
		}

		try {
			// TODO: Create session in database
			// const { data, error } = await supabase
			// 	.from("counseling_sessions")
			// 	.insert({
			// 		school_id: user.school_id,
			// 		counselor_id: user.id,
			// 		student_id: selectedStudent,
			// 		session_date: sessionDate,
			// 		session_time: sessionTime,
			// 		session_type: sessionType,
			// 		reason: sessionNotes,
			// 		status: "scheduled",
			// 		parent_notified: false,
			// 	})
			// 	.select();

			// if (error) throw error;

			// For now, just show success message and refresh
			alert("Session scheduled successfully!");
			setShowNewSessionModal(false);
			setSelectedStudent("");
			setSessionDate("");
			setSessionTime("");
			setSessionNotes("");
			fetchSessions();
		} catch (error) {
			console.error("Error creating session:", error);
			alert("Failed to schedule session. Please try again.");
		}
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "scheduled":
				return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20";
			case "completed":
				return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
			case "cancelled":
				return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
			default:
				return "text-zinc-600 bg-zinc-50 dark:text-zinc-400 dark:bg-zinc-800";
		}
	};

	const filteredSessions = sessions.filter((session) => {
		if (filter === "upcoming") {
			return session.status === "scheduled";
		} else if (filter === "completed") {
			return session.status === "completed";
		}
		return true;
	});

	const SessionCard = ({ session }) => (
		<div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1">
					<div className="mb-3 flex items-center gap-2">
						<span
							className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
								session.status
							)}`}
						>
							{session.status.toUpperCase()}
						</span>
						<span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
							{session.session_type.toUpperCase()}
						</span>
						{session.parent_notified && (
							<span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									className="h-3 w-3"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
										clipRule="evenodd"
									/>
								</svg>
								Parent Notified
							</span>
						)}
					</div>

					<h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
						{session.student_name}
					</h3>

					<p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
						{session.student_class} • Roll: {session.student_roll}
					</p>

					<div className="mb-3">
						<h4 className="mb-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
							Reason:
						</h4>
						<p className="text-sm text-zinc-600 dark:text-zinc-400">{session.reason}</p>
					</div>

					{session.notes && (
						<div className="mb-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
							<h4 className="mb-1 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
								Session Notes:
							</h4>
							<p className="text-sm text-zinc-600 dark:text-zinc-400">{session.notes}</p>
						</div>
					)}

					<div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-500">
						<span className="flex items-center gap-1">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								className="h-4 w-4"
							>
								<path
									fillRule="evenodd"
									d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
									clipRule="evenodd"
								/>
							</svg>
							{new Date(session.session_date).toLocaleDateString()}
						</span>
						<span className="flex items-center gap-1">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								className="h-4 w-4"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
									clipRule="evenodd"
								/>
							</svg>
							{session.session_time}
						</span>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					{session.status === "scheduled" && (
						<>
							<button
								onClick={() => router.push(`/dashboard/counselor/sessions/${session.id}`)}
								className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
							>
								View Details
							</button>
							<button
								onClick={() => {
									// TODO: Complete session
									alert("Session completion form will open here");
								}}
								className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
							>
								Complete
							</button>
						</>
					)}
					{session.status === "completed" && (
						<button
							onClick={() => router.push(`/dashboard/counselor/sessions/${session.id}`)}
							className="rounded-lg bg-zinc-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-600"
						>
							View Report
						</button>
					)}
				</div>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3 shadow-lg">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="h-8 w-8 text-white"
							>
								<path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
							</svg>
						</div>
						<div>
							<h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
								Counseling Sessions
							</h1>
							<p className="text-sm text-zinc-600 dark:text-zinc-400">
								Manage and track student counseling sessions
							</p>
						</div>
					</div>

					<button
						onClick={() => setShowNewSessionModal(true)}
						className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:shadow-xl"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							className="h-5 w-5"
						>
							<path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
						</svg>
						Schedule Session
					</button>
				</div>

				{/* Stats Cards */}
				<div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
					<div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-900/20">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-blue-600 dark:text-blue-400">
									Upcoming
								</p>
								<p className="mt-2 text-3xl font-bold text-blue-700 dark:text-blue-300">
									{sessions.filter((s) => s.status === "scheduled").length}
								</p>
							</div>
							<div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/40">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="h-6 w-6 text-blue-600 dark:text-blue-400"
								>
									<path
										fillRule="evenodd"
										d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
						</div>
					</div>

					<div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-900/20">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-green-600 dark:text-green-400">
									Completed
								</p>
								<p className="mt-2 text-3xl font-bold text-green-700 dark:text-green-300">
									{sessions.filter((s) => s.status === "completed").length}
								</p>
							</div>
							<div className="rounded-full bg-green-100 p-3 dark:bg-green-900/40">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="h-6 w-6 text-green-600 dark:text-green-400"
								>
									<path
										fillRule="evenodd"
										d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
						</div>
					</div>

					<div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-900 dark:bg-indigo-900/20">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
									Total Students
								</p>
								<p className="mt-2 text-3xl font-bold text-indigo-700 dark:text-indigo-300">
									{students.length}
								</p>
							</div>
							<div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900/40">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
								>
									<path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
								</svg>
							</div>
						</div>
					</div>
				</div>

				{/* Filters */}
				<div className="mb-6 flex flex-wrap gap-2">
					{["upcoming", "completed", "all"].map((filterOption) => (
						<button
							key={filterOption}
							onClick={() => setFilter(filterOption)}
							className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
								filter === filterOption
									? "bg-indigo-500 text-white shadow-md"
									: "bg-white text-zinc-700 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
							}`}
						>
							{filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
						</button>
					))}
				</div>

				{/* Sessions List */}
				{loading ? (
					<div className="flex h-64 items-center justify-center">
						<div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-900 dark:border-t-indigo-400"></div>
					</div>
				) : filteredSessions.length === 0 ? (
					<div className="rounded-xl border border-zinc-200 bg-white p-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="mx-auto h-16 w-16 text-zinc-400"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
							/>
						</svg>
						<h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
							No sessions found
						</h3>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
							Schedule your first counseling session to get started
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{filteredSessions.map((session) => (
							<SessionCard key={session.id} session={session} />
						))}
					</div>
				)}
			</div>

			{/* New Session Modal */}
			{showNewSessionModal && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
					onClick={() => setShowNewSessionModal(false)}
				>
					<div
						className="max-w-2xl w-full rounded-2xl border border-zinc-200 bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="mb-6 flex items-start justify-between">
							<div>
								<h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
									Schedule New Session
								</h2>
								<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
									Create a counseling session with a student
								</p>
							</div>
							<button
								onClick={() => setShowNewSessionModal(false)}
								className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="h-6 w-6"
								>
									<path
										fillRule="evenodd"
										d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"
										clipRule="evenodd"
									/>
								</svg>
							</button>
						</div>

						<div className="space-y-4">
							<div>
								<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
									Select Student *
								</label>
								<select
									value={selectedStudent}
									onChange={(e) => setSelectedStudent(e.target.value)}
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
								>
									<option value="">Choose a student...</option>
									{students.map((student) => (
										<option key={student.id} value={student.id}>
											{student.name} - {student.roll_number} ({student.class})
										</option>
									))}
								</select>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
										Session Date *
									</label>
									<input
										type="date"
										value={sessionDate}
										onChange={(e) => setSessionDate(e.target.value)}
										className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
									/>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
										Session Time *
									</label>
									<input
										type="time"
										value={sessionTime}
										onChange={(e) => setSessionTime(e.target.value)}
										className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
									/>
								</div>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
									Session Type
								</label>
								<select
									value={sessionType}
									onChange={(e) => setSessionType(e.target.value)}
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
								>
									<option value="individual">Individual</option>
									<option value="group">Group</option>
									<option value="family">Family</option>
								</select>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
									Reason / Notes
								</label>
								<textarea
									value={sessionNotes}
									onChange={(e) => setSessionNotes(e.target.value)}
									rows={4}
									placeholder="Enter the reason for the session or any initial notes..."
									className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
								/>
							</div>

							<div className="flex gap-3 pt-4">
								<button
									onClick={handleCreateSession}
									className="flex-1 rounded-lg bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
								>
									Schedule Session
								</button>
								<button
									onClick={() => setShowNewSessionModal(false)}
									className="rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
export default function CounselorSessionsPage() {
	return (
		<Suspense fallback={
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-500 border-r-transparent"></div>
					<p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Loading sessions...</p>
				</div>
			</div>
		}>
			<CounselorSessionsContent />
		</Suspense>
	);
}