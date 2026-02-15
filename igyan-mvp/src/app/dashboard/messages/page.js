"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/app/utils/auth_context";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/utils/supabase";
import Link from "next/link";
import SessionRequestModal from "./SessionRequestModal";
import SessionRequestsPanel from "./SessionRequestsPanel";
import StudentRequestsPanel from "./StudentRequestsPanel";

// Component that handles search params
function SearchParamsHandler({ setShowRequestsPanel, userRole }) {
	const searchParams = useSearchParams();

	useEffect(() => {
		const openRequests = searchParams.get('openRequests');
		if (openRequests === 'true' && userRole === 'b2c_mentor') {
			setShowRequestsPanel(true);
		}
	}, [searchParams, userRole, setShowRequestsPanel]);

	return null;
}

function DashboardMessagesContent() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [users, setUsers] = useState([]);
	const [loadingUsers, setLoadingUsers] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [showRequestsPanel, setShowRequestsPanel] = useState(false);
	const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
	const [totalStudentRequests, setTotalStudentRequests] = useState(0);

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	useEffect(() => {
		if (!loading && user) {
			fetchUsers();
			if (user.role === "b2c_mentor") {
				fetchPendingRequestsCount();
			} else if (user.role === "b2c_student") {
				fetchStudentRequestsCount();
			}
		}
	}, [user, loading]);

	const fetchUsers = async () => {
		try {
			// Determine which users to fetch based on current user's role
			let targetRole = null;
			if (user.role === "b2c_student") {
				targetRole = "b2c_mentor";
			} else if (user.role === "b2c_mentor") {
				targetRole = "b2c_student";
			}

			// If not a B2C user, don't fetch anything
			if (!targetRole) {
				setLoadingUsers(false);
				return;
			}

			// Fetch users with the target role
			const { data: usersData, error: usersError } = await supabase
				.from("users")
				.select("id, email, full_name, image_base64, role, created_at")
				.eq("role", targetRole)
				.order("created_at", { ascending: false });

			if (usersError) throw usersError;

			// Fetch profile details for all users
			const userIds = usersData.map((u) => u.id);
			const { data: profilesData, error: profilesError } = await supabase
				.from("launch_pad_users_details")
				.select("*")
				.in("user_id", userIds);

			if (profilesError && profilesError.code !== "PGRST116") {
				console.error("Error fetching profiles:", profilesError);
			}

			// Merge user data with profile data
			const mergedUsers = usersData.map((user) => {
				const profile = profilesData?.find((p) => p.user_id === user.id);
				return {
					...user,
					profile: profile || null,
				};
			});

			setUsers(mergedUsers);
		} catch (error) {
			console.error("Error fetching users:", error);
		} finally {
			setLoadingUsers(false);
		}
	};

	const fetchPendingRequestsCount = async () => {
		try {
			const { count, error } = await supabase
				.from("session_requests")
				.select("*", { count: "exact", head: true })
				.eq("mentor_user_id", user.id)
				.eq("status", "pending");

			if (error) throw error;
			setPendingRequestsCount(count || 0);
		} catch (error) {
			console.error("Error fetching pending requests count:", error);
		}
	};

	const fetchStudentRequestsCount = async () => {
		try {
			const { count, error } = await supabase
				.from("session_requests")
				.select("*", { count: "exact", head: true })
				.eq("student_user_id", user.id);

			if (error) throw error;
			setTotalStudentRequests(count || 0);
		} catch (error) {
			console.error("Error fetching student requests count:", error);
		}
	};

	const filteredUsers = users.filter((u) => {
		const searchLower = searchQuery.toLowerCase();
		return (
			u.full_name.toLowerCase().includes(searchLower) ||
			u.email.toLowerCase().includes(searchLower) ||
			u.profile?.title_on_account?.toLowerCase().includes(searchLower) ||
			u.profile?.interest?.some((i) => i.toLowerCase().includes(searchLower))
		);
	});

	if (loading || loadingUsers) {
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

	if (!user) return null;

	// If not a B2C user, show original coming soon page
	if (user.role !== "b2c_student" && user.role !== "b2c_mentor") {
		return <OriginalMessagesPage />;
	}

	const userTypeLabel = user.role === "b2c_student" ? "Mentors" : "Students";
	const userTypeDescription =
		user.role === "b2c_student"
			? "Connect with experienced mentors to guide your learning journey"
			: "Connect with students seeking guidance and mentorship";

	return (
		<div className="p-6 lg:p-8">
			<Suspense fallback={null}>
				<SearchParamsHandler 
					setShowRequestsPanel={setShowRequestsPanel} 
					userRole={user?.role} 
				/>
			</Suspense>
			{/* Header */}
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
						{userTypeLabel}
					</h1>
					<p className="mt-2 text-zinc-600 dark:text-zinc-400">
						{userTypeDescription}
					</p>
				</div>
				
				{/* Requests Button for Mentors */}
				{user.role === "b2c_mentor" && (
					<button
						type="button"
						onClick={() => setShowRequestsPanel(true)}
						className="relative flex items-center gap-2 rounded-xl border border-indigo-600 bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className="h-5 w-5"
						>
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
							<line x1="16" y1="2" x2="16" y2="6" />
							<line x1="8" y1="2" x2="8" y2="6" />
							<line x1="3" y1="10" x2="21" y2="10" />
						</svg>
						Session Requests
						{pendingRequestsCount > 0 && (
							<span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
								{pendingRequestsCount}
							</span>
						)}
					</button>
				)}
				
				{/* My Requests Button for Students */}
				{user.role === "b2c_student" && (
					<button
						type="button"
						onClick={() => setShowRequestsPanel(true)}
						className="relative flex items-center gap-2 rounded-xl border border-indigo-600 bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							className="h-5 w-5"
						>
							<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
						My Requests
						{totalStudentRequests > 0 && (
							<span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
								{totalStudentRequests}
							</span>
						)}
					</button>
				)}
			</div>

			{/* Search Bar */}
			<div className="mb-8">
				<div className="relative">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
					>
						<circle cx="11" cy="11" r="8" />
						<path d="m21 21-4.35-4.35" />
					</svg>
					<input
						type="text"
						placeholder={`Search ${userTypeLabel.toLowerCase()} by name, email, title, or interests...`}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full rounded-xl border border-zinc-300 bg-white py-3 pl-12 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
					/>
				</div>
			</div>

			{/* Stats */}
			<div className="mb-6 flex items-center gap-4">
				<div className="rounded-xl border border-zinc-200 bg-white px-4 py-2">
					<p className="text-sm font-semibold text-zinc-900">
						{filteredUsers.length} {userTypeLabel} Available
					</p>
				</div>
			</div>

			{/* Users Grid */}
			{filteredUsers.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
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
							d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
						/>
					</svg>
					<h3 className="mt-4 text-lg font-semibold text-zinc-900">
						No {userTypeLabel} Found
					</h3>
					<p className="mt-2 text-sm text-zinc-600">
						{searchQuery
							? "Try adjusting your search criteria"
							: `No ${userTypeLabel.toLowerCase()} are currently available`}
					</p>
				</div>
			) : (
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{filteredUsers.map((targetUser) => (
						<UserCard 
							key={targetUser.id} 
							user={targetUser} 
							currentUserRole={user.role}
							currentUserId={user.id}
						/>
					))}
				</div>
			)}

			{/* Session Requests Panel */}
			{showRequestsPanel && user.role === "b2c_mentor" && (
				<SessionRequestsPanel
					mentorUserId={user.id}
					onClose={() => {
						setShowRequestsPanel(false);
						fetchPendingRequestsCount();
					}}
				/>
			)}
			
			{/* Student Requests Panel */}
			{showRequestsPanel && user.role === "b2c_student" && (
				<StudentRequestsPanel
					studentUserId={user.id}
					onClose={() => {
						setShowRequestsPanel(false);
						fetchStudentRequestsCount();
					}}
				/>
			)}
		</div>
	);
}

// Wrapper component with Suspense
export default function DashboardMessagesPage() {
	return (
		<Suspense fallback={
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
					<p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
						Loading...
					</p>
				</div>
			</div>
		}>
			<DashboardMessagesContent />
		</Suspense>
	);
}

function UserCard({ user, currentUserRole, currentUserId }) {
	const [showRequestModal, setShowRequestModal] = useState(false);

	return (
		<>
			<div className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
			{/* Profile Image/Avatar */}
			<div className="mb-4 flex items-start justify-between">
				{user.image_base64 ? (
					<img
						src={user.image_base64}
						alt={user.full_name}
						className="h-16 w-16 rounded-full border-2 border-zinc-200 object-cover"
					/>
				) : (
					<div
						className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-zinc-200 text-lg font-bold text-white"
						style={{
							background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
						}}
					>
						{user.full_name
							?.split(" ")
							.map((n) => n[0])
							.join("")
							.toUpperCase() || "U"}
					</div>
				)}
				<span
					className="rounded-full px-3 py-1 text-xs font-semibold"
					style={{
						backgroundColor:
							user.role === "b2c_mentor"
								? "rgb(16, 185, 129, 0.1)"
								: "rgb(59, 130, 246, 0.1)",
						color: user.role === "b2c_mentor" ? "#10b981" : "#3b82f6",
					}}
				>
					{user.role === "b2c_mentor" ? "Mentor" : "Student"}
				</span>
			</div>

			{/* Name and Title */}
			<div className="mb-4">
				<h3 className="text-lg font-bold text-zinc-900">{user.full_name}</h3>
				{user.profile?.title_on_account && (
					<p className="mt-1 text-sm font-medium text-zinc-600">
						{user.profile.title_on_account}
					</p>
				)}
			</div>

			{/* About Me Preview */}
			{user.profile?.about_me && (
				<p className="mb-4 line-clamp-3 text-sm text-zinc-600">
					{user.profile.about_me}
				</p>
			)}

			{/* Interests */}
			{user.profile?.interest && user.profile.interest.length > 0 && (
				<div className="mb-4">
					<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
						Interests
					</p>
					<div className="flex flex-wrap gap-2">
						{user.profile.interest.slice(0, 3).map((interest, index) => (
							<span
								key={index}
								className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
							>
								{interest}
							</span>
						))}
						{user.profile.interest.length > 3 && (
							<span className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600">
								+{user.profile.interest.length - 3} more
							</span>
						)}
					</div>
				</div>
			)}

			{/* Action Buttons */}
			<div className="mt-6 flex gap-2">
				{currentUserRole === "b2c_student" && user.role === "b2c_mentor" ? (
					<>
						<button
							type="button"
							onClick={() => setShowRequestModal(true)}
							className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className="h-4 w-4"
							>
								<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
								<line x1="16" y1="2" x2="16" y2="6" />
								<line x1="8" y1="2" x2="8" y2="6" />
								<line x1="3" y1="10" x2="21" y2="10" />
							</svg>
							Request Session
						</button>
						<Link
							href={`/about/${user.id}`}
							target="_blank"
							className="flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className="h-4 w-4"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
								/>
							</svg>
						</Link>
					</>
				) : (
					<>
						<Link
							href={`/about/${user.id}`}
							target="_blank"
							className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className="h-4 w-4"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
								/>
							</svg>
							View Profile
						</Link>
						<button
							type="button"
							className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
							title="Messaging coming soon"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className="h-4 w-4"
							>
								<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
							</svg>
						</button>
					</>
				)}
			</div>
		</div>

		{showRequestModal && (
			<SessionRequestModal
				mentorUser={user}
				studentUserId={currentUserId}
				onClose={() => setShowRequestModal(false)}
			/>
		)}
	</>
	);
}

// Original coming soon page for non-B2C users
function OriginalMessagesPage() {
	return (
		<div className="min-h-full p-6 lg:p-10">
			<div
				className="relative mb-8 overflow-hidden rounded-3xl border p-12 text-center"
				style={{
					borderColor: "var(--dashboard-border)",
					backgroundColor: "var(--dashboard-surface-solid)",
					background:
						"linear-gradient(135deg, var(--dashboard-surface-solid) 0%, var(--dashboard-surface-muted) 100%)",
				}}
			>
				<div
					className="absolute left-0 top-0 h-64 w-64 rounded-full opacity-20 blur-3xl"
					style={{
						background:
							"radial-gradient(circle, var(--dashboard-primary) 0%, transparent 70%)",
					}}
				></div>
				<div
					className="absolute bottom-0 right-0 h-96 w-96 rounded-full opacity-20 blur-3xl"
					style={{
						background:
							"radial-gradient(circle, #a855f7 0%, transparent 70%)",
					}}
				></div>

				<div className="relative z-10">
					<div
						className="mb-6 inline-flex items-center gap-2 rounded-full px-6 py-2 text-sm font-semibold"
						style={{
							backgroundColor:
								"color-mix(in srgb, var(--dashboard-primary) 15%, transparent)",
							color: "var(--dashboard-primary)",
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="currentColor"
							className="h-5 w-5 animate-bounce"
						>
							<path
								fillRule="evenodd"
								d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-4.131A15.838 15.838 0 016.382 15H2.25a.75.75 0 01-.75-.75 6.75 6.75 0 017.815-6.666zM15 6.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z"
								clipRule="evenodd"
							/>
							<path d="M5.26 17.242a.75.75 0 10-.897-1.203 5.243 5.243 0 00-2.05 5.022.75.75 0 00.625.627 5.243 5.243 0 005.022-2.051.75.75 0 10-1.202-.897 3.744 3.744 0 01-3.008 1.51c0-1.23.592-2.323 1.51-3.008z" />
						</svg>
						Coming Soon
					</div>

					<h1
						className="mb-4 text-5xl font-bold"
						style={{ color: "var(--dashboard-heading)" }}
					>
						Messages & Communication Hub
					</h1>
					<p
						className="mx-auto mb-8 max-w-3xl text-xl"
						style={{ color: "var(--dashboard-muted)" }}
					>
						Connect with your school community. Messaging features will be
						available soon.
					</p>
				</div>
			</div>
		</div>
	);
}
