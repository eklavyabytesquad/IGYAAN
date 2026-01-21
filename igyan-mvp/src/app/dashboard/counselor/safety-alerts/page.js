"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/utils/auth_context";
import { createClient } from "@/app/utils/supabase";
import { useRouter } from "next/navigation";

export default function SafetyAlertsPage() {
	const { user } = useAuth();
	const router = useRouter();

	const [loading, setLoading] = useState(true);
	const [alerts, setAlerts] = useState([]);
	const [filter, setFilter] = useState("all"); // all, high, medium, low, resolved
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedAlert, setSelectedAlert] = useState(null);
	const [showDetailModal, setShowDetailModal] = useState(false);

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

		fetchAlerts();
	}, [user]);

	const fetchAlerts = async () => {
		try {
			setLoading(true);
			// TODO: Replace with actual database query
			// const supabase = createClient();
			// const { data, error } = await supabase
			// 	.from("safety_alerts")
			// 	.select(`
			// 		*,
			// 		student:students(id, name, roll_number, class, section),
			// 		detected_by:users(name, role)
			// 	`)
			// 	.eq("school_id", user.school_id)
			// 	.order("created_at", { ascending: false });

			// if (error) throw error;
			// setAlerts(data || []);

			// MOCK DATA for UI demonstration
			const mockAlerts = [
				{
					id: 1,
					student_id: "S001",
					student_name: "Rahul Kumar",
					student_class: "Class 10-A",
					alert_type: "cyberbullying",
					severity: "high",
					detected_at: "2024-01-15T10:30:00Z",
					source: "ai_buddy_chat",
					summary: "Student expressed concern about receiving threatening messages from classmates",
					status: "open",
					priority: "urgent",
					keywords: ["threat", "scared", "bullying"],
					conversation_snippet: "I'm scared to come to school... they keep sending me messages...",
				},
				{
					id: 2,
					student_id: "S002",
					student_name: "Priya Sharma",
					student_class: "Class 9-B",
					alert_type: "self_harm",
					severity: "high",
					detected_at: "2024-01-15T09:15:00Z",
					source: "ai_buddy_chat",
					summary: "Student conversation indicates potential self-harm ideation",
					status: "in_review",
					priority: "urgent",
					keywords: ["hurt", "pain", "alone"],
					conversation_snippet: "I don't want to feel this pain anymore...",
				},
				{
					id: 3,
					student_id: "S003",
					student_name: "Amit Patel",
					student_class: "Class 11-C",
					alert_type: "anxiety",
					severity: "medium",
					detected_at: "2024-01-14T14:20:00Z",
					source: "ai_buddy_chat",
					summary: "Student showing signs of exam-related anxiety",
					status: "open",
					priority: "normal",
					keywords: ["stress", "exam", "worried"],
					conversation_snippet: "I can't sleep thinking about the upcoming exams...",
				},
				{
					id: 4,
					student_id: "S004",
					student_name: "Sneha Reddy",
					student_class: "Class 8-A",
					alert_type: "family_issues",
					severity: "medium",
					detected_at: "2024-01-14T11:45:00Z",
					source: "ai_buddy_chat",
					summary: "Student mentioned family conflict affecting concentration",
					status: "open",
					priority: "normal",
					keywords: ["parents", "fighting", "distracted"],
					conversation_snippet: "My parents keep fighting and I can't focus on studies...",
				},
				{
					id: 5,
					student_id: "S005",
					student_name: "Vikram Singh",
					student_class: "Class 12-B",
					alert_type: "peer_pressure",
					severity: "low",
					detected_at: "2024-01-13T16:30:00Z",
					source: "ai_buddy_chat",
					summary: "Student feeling pressure from friends regarding career choices",
					status: "resolved",
					priority: "low",
					keywords: ["friends", "pressure", "career"],
					conversation_snippet: "Everyone wants me to choose engineering but I want to pursue arts...",
				},
			];

			setAlerts(mockAlerts);
		} catch (error) {
			console.error("Error fetching alerts:", error);
		} finally {
			setLoading(false);
		}
	};

	const getSeverityColor = (severity) => {
		switch (severity) {
			case "high":
				return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
			case "medium":
				return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20";
			case "low":
				return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20";
			default:
				return "text-zinc-600 bg-zinc-50 dark:text-zinc-400 dark:bg-zinc-800";
		}
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "open":
				return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20";
			case "in_review":
				return "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20";
			case "resolved":
				return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
			default:
				return "text-zinc-600 bg-zinc-50 dark:text-zinc-400 dark:bg-zinc-800";
		}
	};

	const handleUpdateStatus = async (alertId, newStatus) => {
		try {
			// TODO: Update alert status in database
			// const supabase = createClient();
			// const { error } = await supabase
			// 	.from("safety_alerts")
			// 	.update({ status: newStatus, updated_at: new Date().toISOString() })
			// 	.eq("id", alertId);

			// if (error) throw error;

			// Update local state
			setAlerts(
				alerts.map((alert) =>
					alert.id === alertId ? { ...alert, status: newStatus } : alert
				)
			);

			// Close modal if open
			if (selectedAlert?.id === alertId) {
				setSelectedAlert({ ...selectedAlert, status: newStatus });
			}
		} catch (error) {
			console.error("Error updating status:", error);
			alert("Failed to update alert status. Please try again.");
		}
	};

	const filteredAlerts = alerts.filter((alert) => {
		// Apply severity filter
		if (filter !== "all" && alert.severity !== filter && alert.status !== filter) {
			return false;
		}

		// Apply search filter
		if (searchQuery) {
			const searchLower = searchQuery.toLowerCase();
			return (
				alert.student_name.toLowerCase().includes(searchLower) ||
				alert.student_class.toLowerCase().includes(searchLower) ||
				alert.alert_type.toLowerCase().includes(searchLower) ||
				alert.summary.toLowerCase().includes(searchLower)
			);
		}

		return true;
	});

	const AlertCard = ({ alert }) => (
		<div
			className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 cursor-pointer"
			onClick={() => {
				setSelectedAlert(alert);
				setShowDetailModal(true);
			}}
		>
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1">
					<div className="mb-3 flex items-center gap-2">
						<span
							className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${getSeverityColor(
								alert.severity
							)}`}
						>
							{alert.severity === "high" && (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									className="h-4 w-4"
								>
									<path
										fillRule="evenodd"
										d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
										clipRule="evenodd"
									/>
								</svg>
							)}
							{alert.severity.toUpperCase()}
						</span>
						<span
							className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
								alert.status
							)}`}
						>
							{alert.status.replace("_", " ").toUpperCase()}
						</span>
					</div>

					<h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
						{alert.student_name} - {alert.student_class}
					</h3>

					<p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
						{alert.summary}
					</p>

					<div className="mb-3 flex flex-wrap items-center gap-2">
						<span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
							{alert.alert_type.replace("_", " ").toUpperCase()}
						</span>
						{alert.keywords.map((keyword, idx) => (
							<span
								key={idx}
								className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
							>
								#{keyword}
							</span>
						))}
					</div>

					<div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-500">
						<span className="flex items-center gap-1">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								className="h-4 w-4"
							>
								<path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
							</svg>
							{alert.student_id}
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
							{new Date(alert.detected_at).toLocaleString()}
						</span>
						<span className="flex items-center gap-1">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								className="h-4 w-4"
							>
								<path d="M3.505 2.365A41.369 41.369 0 019 2c1.863 0 3.697.124 5.495.365 1.247.167 2.18 1.108 2.435 2.268a4.45 4.45 0 00-.577-.069 43.141 43.141 0 00-4.706 0C9.229 4.696 7.5 6.727 7.5 8.998v2.24c0 1.413.67 2.735 1.76 3.562l-2.98 2.98A.75.75 0 015 17.25v-3.443c-.501-.048-1-.106-1.495-.172C2.033 13.438 1 12.162 1 10.72V5.28c0-1.441 1.033-2.717 2.505-2.914z" />
								<path d="M14 6c-.762 0-1.52.02-2.271.062C10.157 6.148 9 7.472 9 8.998v2.24c0 1.519 1.147 2.839 2.71 2.935.214.013.428.024.642.034.2.009.385.09.518.224l2.35 2.35a.75.75 0 001.28-.531v-2.07c1.453-.195 2.5-1.463 2.5-2.915V8.998c0-1.526-1.157-2.85-2.729-2.936A41.645 41.645 0 0014 6z" />
							</svg>
							{alert.source.replace("_", " ")}
						</span>
					</div>
				</div>

				<div className="flex flex-col gap-2">
					{alert.status !== "resolved" && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								handleUpdateStatus(alert.id, "resolved");
							}}
							className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
						>
							Mark Resolved
						</button>
					)}
					{alert.status === "open" && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								handleUpdateStatus(alert.id, "in_review");
							}}
							className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-600"
						>
							Take Action
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
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-2">
						<div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3 shadow-lg">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="h-8 w-8 text-white"
							>
								<path
									fillRule="evenodd"
									d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<div>
							<h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
								AI Safety Alerts
							</h1>
							<p className="text-sm text-zinc-600 dark:text-zinc-400">
								Monitor and respond to student wellbeing concerns detected by AI Buddy
							</p>
						</div>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					<div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-900/20">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-red-600 dark:text-red-400">
									High Priority
								</p>
								<p className="mt-2 text-3xl font-bold text-red-700 dark:text-red-300">
									{alerts.filter((a) => a.severity === "high" && a.status !== "resolved").length}
								</p>
							</div>
							<div className="rounded-full bg-red-100 p-3 dark:bg-red-900/40">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="h-6 w-6 text-red-600 dark:text-red-400"
								>
									<path
										fillRule="evenodd"
										d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
						</div>
					</div>

					<div className="rounded-xl border border-orange-200 bg-orange-50 p-6 dark:border-orange-900 dark:bg-orange-900/20">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-orange-600 dark:text-orange-400">
									Medium Priority
								</p>
								<p className="mt-2 text-3xl font-bold text-orange-700 dark:text-orange-300">
									{alerts.filter((a) => a.severity === "medium" && a.status !== "resolved").length}
								</p>
							</div>
							<div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/40">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="h-6 w-6 text-orange-600 dark:text-orange-400"
								>
									<path
										fillRule="evenodd"
										d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
						</div>
					</div>

					<div className="rounded-xl border border-purple-200 bg-purple-50 p-6 dark:border-purple-900 dark:bg-purple-900/20">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-purple-600 dark:text-purple-400">
									In Review
								</p>
								<p className="mt-2 text-3xl font-bold text-purple-700 dark:text-purple-300">
									{alerts.filter((a) => a.status === "in_review").length}
								</p>
							</div>
							<div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/40">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="h-6 w-6 text-purple-600 dark:text-purple-400"
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

					<div className="rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-900/20">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-green-600 dark:text-green-400">
									Resolved Today
								</p>
								<p className="mt-2 text-3xl font-bold text-green-700 dark:text-green-300">
									{alerts.filter((a) => a.status === "resolved").length}
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
										d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>

				{/* Filters and Search */}
				<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-wrap gap-2">
						{["all", "high", "medium", "low", "resolved"].map((filterOption) => (
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

					<div className="relative">
						<input
							type="text"
							placeholder="Search alerts..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 pl-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white sm:w-64"
						/>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 20 20"
							fill="currentColor"
							className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
						>
							<path
								fillRule="evenodd"
								d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
				</div>

				{/* Alerts List */}
				{loading ? (
					<div className="flex h-64 items-center justify-center">
						<div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-900 dark:border-t-indigo-400"></div>
					</div>
				) : filteredAlerts.length === 0 ? (
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
								d="M9 12.75L11.25 15 15 9.75M21 12c0 4.971-4.03 9-9 9s-9-4.029-9-9 4.03-9 9-9 9 4.029 9 9z"
							/>
						</svg>
						<h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
							No alerts found
						</h3>
						<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
							{searchQuery
								? "Try adjusting your search query"
								: "All clear! No safety alerts at the moment."}
						</p>
					</div>
				) : (
					<div className="space-y-4">
						{filteredAlerts.map((alert) => (
							<AlertCard key={alert.id} alert={alert} />
						))}
					</div>
				)}
			</div>

			{/* Detail Modal */}
			{showDetailModal && selectedAlert && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
					onClick={() => setShowDetailModal(false)}
				>
					<div
						className="max-w-2xl w-full rounded-2xl border border-zinc-200 bg-white p-8 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="mb-6 flex items-start justify-between">
							<div>
								<h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
									Alert Details
								</h2>
								<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
									{selectedAlert.student_name} - {selectedAlert.student_class}
								</p>
							</div>
							<button
								onClick={() => setShowDetailModal(false)}
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

						<div className="space-y-6">
							<div>
								<h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
									Alert Type
								</h3>
								<span className="inline-block rounded-md bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
									{selectedAlert.alert_type.replace("_", " ").toUpperCase()}
								</span>
							</div>

							<div>
								<h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
									Summary
								</h3>
								<p className="text-sm text-zinc-600 dark:text-zinc-400">
									{selectedAlert.summary}
								</p>
							</div>

							<div>
								<h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
									Conversation Snippet
								</h3>
								<div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
									<p className="text-sm italic text-zinc-700 dark:text-zinc-300">
										"{selectedAlert.conversation_snippet}"
									</p>
								</div>
							</div>

							<div>
								<h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
									Detected Keywords
								</h3>
								<div className="flex flex-wrap gap-2">
									{selectedAlert.keywords.map((keyword, idx) => (
										<span
											key={idx}
											className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
										>
											#{keyword}
										</span>
									))}
								</div>
							</div>

							<div className="flex gap-3 pt-4">
								{selectedAlert.status !== "resolved" && (
									<button
										onClick={() => {
											handleUpdateStatus(selectedAlert.id, "resolved");
										}}
										className="flex-1 rounded-lg bg-green-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-green-600"
									>
										Mark as Resolved
									</button>
								)}
								{selectedAlert.status === "open" && (
									<button
										onClick={() => {
											handleUpdateStatus(selectedAlert.id, "in_review");
										}}
										className="flex-1 rounded-lg bg-purple-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-600"
									>
										Take Action
									</button>
								)}
								<button
									onClick={() => router.push(`/dashboard/counselor/sessions?student=${selectedAlert.student_id}`)}
									className="flex-1 rounded-lg bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
								>
									Schedule Session
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
