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
			if (!user.school_id) {
				setUsers([]);
				setLoadingUsers(false);
				return;
			}

			// Only fetch users belonging to the super admin's school
			const { data, error } = await supabase
				.from("users")
				.select("id, email, full_name, role, phone, school_id, created_at")
				.eq("school_id", user.school_id)
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
			<div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: 'var(--dashboard-background)' }}>
				<div className="text-center">
					<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--dashboard-primary)', borderTopColor: 'transparent' }}></div>
					<p className="mt-4 text-sm" style={{ color: 'var(--dashboard-muted)' }}>
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
				<h1 className="text-3xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
					User Access Management
				</h1>
				<p className="mt-2" style={{ color: 'var(--dashboard-muted)' }}>
					Control module access permissions for all users
				</p>
			</div>

			{/* Stats */}
			<div className="mb-6 grid gap-4 sm:grid-cols-3">
				<div className="rounded-xl border p-4" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)' }}>
					<div className="flex items-center gap-3">
						<div className="rounded-lg p-3" style={{ backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)' }}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-6 w-6"
								style={{ color: 'var(--dashboard-primary)' }}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
								/>
							</svg>
						</div>
						<div>
							<p className="text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
								{users.length}
							</p>
							<p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>
								Total Users
							</p>
						</div>
					</div>
				</div>

				<div className="rounded-xl border p-4" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)' }}>
					<div className="flex items-center gap-3">
						<div className="rounded-lg p-3" style={{ backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)' }}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-6 w-6"
								style={{ color: 'var(--dashboard-primary)' }}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
								/>
							</svg>
						</div>
						<div>
							<p className="text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
								{availableModules.length}
							</p>
							<p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>
								Available Modules
							</p>
						</div>
					</div>
				</div>

				<div className="rounded-xl border p-4" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)' }}>
					<div className="flex items-center gap-3">
						<div className="rounded-lg p-3" style={{ backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)' }}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-6 w-6"
								style={{ color: 'var(--dashboard-primary)' }}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
								/>
							</svg>
						</div>
						<div>
							<p className="text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
								{users.filter((u) => u.role === "super_admin").length}
							</p>
							<p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>
								Super Admins
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Users Table */}
			<div className="rounded-xl border" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)' }}>
				{users.length === 0 ? (
					<div className="p-12 text-center">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="mx-auto h-16 w-16"
							style={{ color: 'var(--dashboard-muted)' }}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
							/>
						</svg>
						<p className="mt-4 text-lg font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
							No users found
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="border-b" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-muted)' }}>
								<tr>
									<th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
										User
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
										Email
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
										Role
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
										Phone
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
										Joined
									</th>
									<th className="px-6 py-4 text-right text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y" style={{ borderColor: 'var(--dashboard-border)' }}>
								{users.map((u) => (
									<tr
										key={u.id}
										className="transition-colors hover:opacity-80"
									>
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ background: 'var(--dashboard-primary)' }}>
													{(u.full_name || u.email)
														.split(" ")
														.map((n) => n[0])
														.join("")
														.toUpperCase()
														.slice(0, 2)}
												</div>
												<div>
													<p className="font-medium" style={{ color: 'var(--dashboard-heading)' }}>
														{u.full_name || "No Name"}
													</p>
													<p className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>
														ID: {u.id.slice(0, 8)}...
													</p>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 text-sm" style={{ color: 'var(--dashboard-text)' }}>
											{u.email}
										</td>
										<td className="px-6 py-4">
											<span
												className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
												style={{ backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)', color: 'var(--dashboard-primary)' }}
											>
												{u.role}
											</span>
										</td>
										<td className="px-6 py-4 text-sm" style={{ color: 'var(--dashboard-text)' }}>
											{u.phone || "N/A"}
										</td>
										<td className="px-6 py-4 text-sm" style={{ color: 'var(--dashboard-text)' }}>
											{new Date(u.created_at).toLocaleDateString()}
										</td>
										<td className="px-6 py-4 text-right">
											<button
												onClick={() => handleManageAccess(u)}
												className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
												style={{ background: 'var(--dashboard-primary)' }}
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
				<div className="fixed inset-0 z-50 flex items-center justify-center overlay-scrim p-4">
					<div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)' }}>
						<div className="mb-6 flex items-center justify-between">
							<div>
								<h2 className="text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
									Manage Access Permissions
								</h2>
								<p className="mt-1 text-sm" style={{ color: 'var(--dashboard-muted)' }}>
									User: {selectedUser.full_name || selectedUser.email} (
									{selectedUser.role})
								</p>
							</div>
							<button
								onClick={() => {
									setShowModal(false);
									setSelectedUser(null);
								}}
								className="rounded-lg p-2 transition-colors hover:opacity-70"
								style={{ color: 'var(--dashboard-muted)' }}
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
						<div className="mb-6 flex flex-wrap gap-2 rounded-xl border p-4" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-muted)' }}>
							<span className="text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
								Quick Set:
							</span>
							<button
								onClick={() => setAllAccess("all")}
								className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:opacity-90"
								style={{ background: 'var(--dashboard-primary)' }}
							>
								All Access
							</button>
							<button
								onClick={() => setAllAccess("view")}
								className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:opacity-90"
								style={{ background: 'color-mix(in srgb, var(--dashboard-primary) 80%, #3b82f6)' }}
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
									className="flex items-center justify-between rounded-xl border p-4 transition-all hover:shadow-md"
									style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)' }}
								>
									<div className="flex items-center gap-4 flex-1">
										<div className="text-2xl">{module.icon}</div>
										<div className="flex-1">
											<h4 className="font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
												{module.name}
											</h4>
											<p className="text-xs" style={{ color: 'var(--dashboard-text)' }}>
												{module.path}
											</p>
											<p className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>
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
											className="rounded-lg px-3 py-2 text-xs font-semibold transition-colors"
											style={userAccess[module.name] === "none"
												? { backgroundColor: 'var(--dashboard-surface-muted)', color: 'var(--dashboard-text)' }
												: { backgroundColor: '#ef4444', color: '#fff' }
											}
										>
											{userAccess[module.name] === "none" ? "No Access" : "✕"}
										</button>
										<button
											onClick={() => handleAccessChange(module.name, "view")}
											className="rounded-lg px-3 py-2 text-xs font-semibold transition-colors"
											style={userAccess[module.name] === "view"
												? { background: 'var(--dashboard-primary)', color: '#fff' }
												: { backgroundColor: 'var(--dashboard-surface-muted)', color: 'var(--dashboard-text)' }
											}
										>
											👁️ View
										</button>
										<button
											onClick={() => handleAccessChange(module.name, "edit")}
											className="rounded-lg px-3 py-2 text-xs font-semibold transition-colors"
											style={userAccess[module.name] === "edit"
												? { backgroundColor: '#eab308', color: '#fff' }
												: { backgroundColor: 'var(--dashboard-surface-muted)', color: 'var(--dashboard-text)' }
											}
										>
											✏️ Edit
										</button>
										<button
											onClick={() => handleAccessChange(module.name, "delete")}
											className="rounded-lg px-3 py-2 text-xs font-semibold transition-colors"
											style={userAccess[module.name] === "delete"
												? { backgroundColor: '#f97316', color: '#fff' }
												: { backgroundColor: 'var(--dashboard-surface-muted)', color: 'var(--dashboard-text)' }
											}
										>
											🗑️ Delete
										</button>
										<button
											onClick={() => handleAccessChange(module.name, "all")}
											className="rounded-lg px-3 py-2 text-xs font-semibold transition-colors"
											style={userAccess[module.name] === "all"
												? { backgroundColor: '#22c55e', color: '#fff' }
												: { backgroundColor: 'var(--dashboard-surface-muted)', color: 'var(--dashboard-text)' }
											}
										>
											✓ All
										</button>
									</div>
								</div>
							))}
						</div>

						{/* Save Button */}
						<div className="mt-6 flex gap-3 border-t pt-6" style={{ borderColor: 'var(--dashboard-border)' }}>
							<button
								onClick={handleSaveAccess}
								disabled={saving}
								className="flex-1 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
								style={{ background: 'var(--dashboard-primary)' }}
							>
								{saving ? "Saving..." : "💾 Save Changes"}
							</button>
							<button
								onClick={() => {
									setShowModal(false);
									setSelectedUser(null);
								}}
								className="rounded-lg border px-6 py-3 text-sm font-semibold transition-colors hover:opacity-80"
								style={{ borderColor: 'var(--dashboard-border)', color: 'var(--dashboard-text)' }}
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
