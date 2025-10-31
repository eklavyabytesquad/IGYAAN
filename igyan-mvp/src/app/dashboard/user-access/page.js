"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import { supabase } from "../../utils/supabase";

export default function UserAccessPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [users, setUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState(null);
	const [userAccess, setUserAccess] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [saving, setSaving] = useState(false);
	const [loadingUsers, setLoadingUsers] = useState(true);

	// Available modules matching sidenav
	const availableModules = [
		{
			name: "Dashboard",
			path: "/dashboard",
			icon: "🏠",
			description: "Main dashboard overview",
		},
		{
			name: "My Courses",
			path: "/dashboard/courses",
			icon: "📚",
			description: "Course management",
		},
		{
			name: "AI Copilot",
			path: "/dashboard/copilot",
			icon: "✨",
			description: "AI assistant features",
		},
		{
			name: "Viva AI",
			path: "/dashboard/viva-ai",
			icon: "🎤",
			description: "Voice-based AI assistant",
		},
		{
			name: "Assignments",
			path: "/dashboard/assignments",
			icon: "📝",
			description: "Assignment management",
		},
		{
			name: "Performance",
			path: "/dashboard/performance",
			icon: "📊",
			description: "Performance analytics",
		},
		{
			name: "Calendar",
			path: "/dashboard/calendar",
			icon: "📅",
			description: "Event calendar",
		},
		{
			name: "Messages",
			path: "/dashboard/messages",
			icon: "💬",
			description: "Messaging system",
		},
		{
			name: "User Management",
			path: "/dashboard/users",
			icon: "👥",
			description: "Manage users",
		},
		{
			name: "Student Management",
			path: "/dashboard/student-management",
			icon: "🎓",
			description: "Student records",
		},
		{
			name: "Attendance",
			path: "/dashboard/attendance",
			icon: "✅",
			description: "Attendance tracking",
		},
		{
			name: "Settings",
			path: "/dashboard/settings",
			icon: "⚙️",
			description: "System settings",
		},
		{
			name: "Profile",
			path: "/dashboard/profile",
			icon: "👤",
			description: "User profile",
		},
		{
			name: "School Profile",
			path: "/dashboard/school-profile",
			icon: "🏫",
			description: "School information",
		},
	];

	// Redirect if not authenticated or not super_admin
	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		} else if (!loading && user && user.role !== "super_admin") {
			router.push("/dashboard");
		}
	}, [user, loading, router]);

	// Fetch all users
	useEffect(() => {
		if (user && user.role === "super_admin") {
			fetchUsers();
		}
	}, [user]);

	const fetchUsers = async () => {
		setLoadingUsers(true);
		try {
			const { data, error } = await supabase
				.from("users")
				.select("id, email, full_name, role, phone, school_id, created_at")
				.order("created_at", { ascending: false });

			if (error) throw error;
			setUsers(data || []);
		} catch (error) {
			console.error("Error fetching users:", error);
			alert("Failed to load users");
		} finally {
			setLoadingUsers(false);
		}
	};

	// Fetch user access
	const fetchUserAccess = async (userId) => {
		try {
			const { data, error } = await supabase
				.from("user_access")
				.select("*")
				.eq("user_id", userId);

			if (error) throw error;

			// Initialize access for all modules
			const accessMap = {};
			availableModules.forEach((module) => {
				const existingAccess = data?.find((a) => a.module_name === module.name);
				accessMap[module.name] = existingAccess?.access_type || "none";
			});

			setUserAccess(accessMap);
		} catch (error) {
			console.error("Error fetching user access:", error);
			alert("Failed to load user access");
		}
	};

	// Open modal for user
	const handleManageAccess = (user) => {
		setSelectedUser(user);
		fetchUserAccess(user.id);
		setShowModal(true);
	};

	// Update access for a module
	const handleAccessChange = (moduleName, accessType) => {
		setUserAccess((prev) => ({
			...prev,
			[moduleName]: accessType,
		}));
	};

	// Save access changes
	const handleSaveAccess = async () => {
		if (!selectedUser) return;

		setSaving(true);
		try {
			// Delete all existing access for this user
			await supabase
				.from("user_access")
				.delete()
				.eq("user_id", selectedUser.id);

			// Insert new access records (only non-none)
			const accessRecords = Object.entries(userAccess)
				.filter(([_, accessType]) => accessType !== "none")
				.map(([moduleName, accessType]) => {
					const module = availableModules.find((m) => m.name === moduleName);
					return {
						user_id: selectedUser.id,
						module_name: moduleName,
						sub_domain: module?.path || null,
						access_type: accessType,
					};
				});

			if (accessRecords.length > 0) {
				const { error } = await supabase
					.from("user_access")
					.insert(accessRecords);

				if (error) throw error;
			}

			alert("Access permissions saved successfully!");
			setShowModal(false);
			setSelectedUser(null);
		} catch (error) {
			console.error("Error saving access:", error);
			alert("Failed to save access permissions: " + error.message);
		} finally {
			setSaving(false);
		}
	};

	// Quick access buttons
	const setAllAccess = (accessType) => {
		const newAccess = {};
		availableModules.forEach((module) => {
			newAccess[module.name] = accessType;
		});
		setUserAccess(newAccess);
	};

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

	if (!user || user.role !== "super_admin") return null;

	return (
		<div className="p-6 lg:p-8">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
					User Access Management
				</h1>
				<p className="mt-2 text-zinc-600 dark:text-zinc-400">
					Control module access permissions for all users
				</p>
			</div>

			{/* Stats */}
			<div className="mb-6 grid gap-4 sm:grid-cols-3">
				<div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/30">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
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
								{users.length}
							</p>
							<p className="text-sm text-zinc-600 dark:text-zinc-400">
								Total Users
							</p>
						</div>
					</div>
				</div>

				<div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
					<div className="flex items-center gap-3">
						<div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-6 w-6 text-purple-600 dark:text-purple-400"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
								/>
							</svg>
						</div>
						<div>
							<p className="text-2xl font-bold text-zinc-900 dark:text-white">
								{availableModules.length}
							</p>
							<p className="text-sm text-zinc-600 dark:text-zinc-400">
								Available Modules
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
									d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
								/>
							</svg>
						</div>
						<div>
							<p className="text-2xl font-bold text-zinc-900 dark:text-white">
								{users.filter((u) => u.role === "super_admin").length}
							</p>
							<p className="text-sm text-zinc-600 dark:text-zinc-400">
								Super Admins
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Users Table */}
			<div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
				{users.length === 0 ? (
					<div className="p-12 text-center">
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
						<p className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
							No users found
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
								<tr>
									<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
										User
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
										Email
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
										Role
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
										Phone
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
										Joined
									</th>
									<th className="px-6 py-4 text-right text-sm font-semibold text-zinc-900 dark:text-white">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
								{users.map((u) => (
									<tr
										key={u.id}
										className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
									>
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-500 text-sm font-semibold text-white">
													{(u.full_name || u.email)
														.split(" ")
														.map((n) => n[0])
														.join("")
														.toUpperCase()
														.slice(0, 2)}
												</div>
												<div>
													<p className="font-medium text-zinc-900 dark:text-white">
														{u.full_name || "No Name"}
													</p>
													<p className="text-xs text-zinc-500 dark:text-zinc-400">
														ID: {u.id.slice(0, 8)}...
													</p>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
											{u.email}
										</td>
										<td className="px-6 py-4">
											<span
												className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
													u.role === "super_admin"
														? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
														: u.role === "co_admin"
														? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
														: u.role === "faculty"
														? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
														: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
												}`}
											>
												{u.role}
											</span>
										</td>
										<td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
											{u.phone || "N/A"}
										</td>
										<td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
											{new Date(u.created_at).toLocaleDateString()}
										</td>
										<td className="px-6 py-4 text-right">
											<button
												onClick={() => handleManageAccess(u)}
												className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-600"
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
														d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
													/>
												</svg>
												Manage Access
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Access Management Modal */}
			{showModal && selectedUser && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
					<div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
						<div className="mb-6 flex items-center justify-between">
							<div>
								<h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
									Manage Access Permissions
								</h2>
								<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
									User: {selectedUser.full_name || selectedUser.email} (
									{selectedUser.role})
								</p>
							</div>
							<button
								onClick={() => {
									setShowModal(false);
									setSelectedUser(null);
								}}
								className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									className="h-6 w-6"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						{/* Quick Actions */}
						<div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
							<span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
								Quick Set:
							</span>
							<button
								onClick={() => setAllAccess("all")}
								className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-600"
							>
								All Access
							</button>
							<button
								onClick={() => setAllAccess("view")}
								className="rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-600"
							>
								View Only
							</button>
							<button
								onClick={() => setAllAccess("edit")}
								className="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-yellow-600"
							>
								View + Edit
							</button>
							<button
								onClick={() => setAllAccess("none")}
								className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600"
							>
								No Access
							</button>
						</div>

						{/* Modules List */}
						<div className="space-y-3">
							{availableModules.map((module) => (
								<div
									key={module.name}
									className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
								>
									<div className="flex items-center gap-4 flex-1">
										<div className="text-2xl">{module.icon}</div>
										<div className="flex-1">
											<h4 className="font-semibold text-zinc-900 dark:text-white">
												{module.name}
											</h4>
											<p className="text-xs text-zinc-600 dark:text-zinc-400">
												{module.path}
											</p>
											<p className="text-xs text-zinc-500 dark:text-zinc-500">
												{module.description}
											</p>
										</div>
									</div>

									<div className="flex gap-2">
										<button
											onClick={() =>
												handleAccessChange(
													module.name,
													userAccess[module.name] === "none" ? "view" : "none"
												)
											}
											className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
												userAccess[module.name] === "none"
													? "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
													: "bg-red-500 text-white hover:bg-red-600"
											}`}
										>
											{userAccess[module.name] === "none" ? "No Access" : "✕"}
										</button>
										<button
											onClick={() => handleAccessChange(module.name, "view")}
											className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
												userAccess[module.name] === "view"
													? "bg-blue-500 text-white"
													: "bg-zinc-100 text-zinc-700 hover:bg-blue-100 dark:bg-zinc-800 dark:text-zinc-300"
											}`}
										>
											👁️ View
										</button>
										<button
											onClick={() => handleAccessChange(module.name, "edit")}
											className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
												userAccess[module.name] === "edit"
													? "bg-yellow-500 text-white"
													: "bg-zinc-100 text-zinc-700 hover:bg-yellow-100 dark:bg-zinc-800 dark:text-zinc-300"
											}`}
										>
											✏️ Edit
										</button>
										<button
											onClick={() => handleAccessChange(module.name, "delete")}
											className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
												userAccess[module.name] === "delete"
													? "bg-orange-500 text-white"
													: "bg-zinc-100 text-zinc-700 hover:bg-orange-100 dark:bg-zinc-800 dark:text-zinc-300"
											}`}
										>
											🗑️ Delete
										</button>
										<button
											onClick={() => handleAccessChange(module.name, "all")}
											className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
												userAccess[module.name] === "all"
													? "bg-green-500 text-white"
													: "bg-zinc-100 text-zinc-700 hover:bg-green-100 dark:bg-zinc-800 dark:text-zinc-300"
											}`}
										>
											✓ All
										</button>
									</div>
								</div>
							))}
						</div>

						{/* Save Button */}
						<div className="mt-6 flex gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-700">
							<button
								onClick={handleSaveAccess}
								disabled={saving}
								className="flex-1 rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{saving ? "Saving..." : "💾 Save Changes"}
							</button>
							<button
								onClick={() => {
									setShowModal(false);
									setSelectedUser(null);
								}}
								className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
