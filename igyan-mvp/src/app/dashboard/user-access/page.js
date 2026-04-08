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
	const [enabledModules, setEnabledModules] = useState(new Set());
	const [showModal, setShowModal] = useState(false);
	const [saving, setSaving] = useState(false);
	const [loadingUsers, setLoadingUsers] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");

	// ── Complete module list — EVERY dashboard page/option in the system ──
	// key must match the nav item `key` in sidenav-config.js
	const availableModules = [
		// ─── Core (always visible but listed for completeness) ───
		{ key: "dashboard", name: "Dashboard", path: "/dashboard", icon: "🏠", description: "Main dashboard overview", roles: ["super_admin", "co_admin", "faculty", "student", "counselor", "parent"], category: "Core" },
		{ key: "settings", name: "Settings", path: "/dashboard/settings", icon: "⚙️", description: "System settings", roles: ["super_admin", "co_admin", "faculty", "student", "counselor", "parent"], category: "Core" },

		// ─── AI Suite ───
		{ key: "copilot", name: "Co-pilot (Sudarshan AI)", path: "/dashboard/copilot", icon: "✨", description: "AI co-pilot assistant", roles: ["super_admin", "co_admin", "faculty", "student"], category: "AI Suite" },
		{ key: "gyanisage", name: "Buddy AI", path: "/dashboard/gyanisage", icon: "🤖", description: "AI counsellor & buddy", roles: ["super_admin", "co_admin", "faculty", "student", "counselor"], category: "AI Suite" },
		{ key: "sharkAi", name: "AI Shark", path: "/dashboard/shark-ai", icon: "🦈", description: "AI Shark pitch evaluator", roles: ["super_admin", "co_admin", "faculty", "student", "counselor"], category: "AI Suite" },
		{ key: "tools", name: "AI Tools / Teaching Tools Kit", path: "/dashboard/tools", icon: "🔧", description: "AI-powered teaching & learning tools", roles: ["super_admin", "co_admin", "faculty", "student"], category: "AI Suite" },
		{ key: "liveClassroom", name: "Omni Sight (Live Classroom)", path: "/dashboard/live-classroom", icon: "📹", description: "Live video classroom", roles: ["super_admin", "co_admin", "faculty", "student"], category: "AI Suite" },

		// ─── Faculty Specific ───
		{ key: "parentChat", name: "Parent Connect (Faculty)", path: "/dashboard/faculty-chat", icon: "💬", description: "Chat with parents", roles: ["super_admin", "co_admin", "faculty"], category: "Faculty" },
		{ key: "facultySubstitution", name: "Smart Substitution System", path: "/dashboard/faculty-substitution", icon: "🔄", description: "Faculty substitution management", roles: ["super_admin", "co_admin", "faculty"], category: "Faculty" },

		// ─── Homework & Assessment ───
		{ key: "homework", name: "AI Viva Evaluator / Homework", path: "/dashboard/homework", icon: "🎤", description: "Homework & viva evaluation", roles: ["super_admin", "co_admin", "faculty", "student"], category: "Homework & Assessment" },
		{ key: "vivaResults", name: "Viva Evaluation Result", path: "/dashboard/homework/reports", icon: "📊", description: "Viva evaluation results & reports", roles: ["super_admin", "co_admin", "faculty", "student"], category: "Homework & Assessment" },
		{ key: "aiReport", name: "AI Report / Report Cards", path: "/dashboard/report-cards", icon: "📋", description: "AI-generated report cards", roles: ["super_admin", "co_admin", "faculty", "student", "parent"], category: "Homework & Assessment" },
		{ key: "gamifiedAssignments", name: "Gamified Assignments", path: "/dashboard/gamified-assignments", icon: "🎮", description: "Gamified assignment creation", roles: ["super_admin", "co_admin", "faculty"], category: "Homework & Assessment" },
		{ key: "vivaLab", name: "AI Viva Lab", path: "/dashboard/viva-ai", icon: "🎙️", description: "Practice viva with AI", roles: ["super_admin", "co_admin", "faculty", "student"], category: "Homework & Assessment" },
		{ key: "gamified", name: "Gamified Homework", path: "/dashboard/gamified", icon: "🧩", description: "Play & learn through gamified homework", roles: ["super_admin", "co_admin", "faculty", "student"], category: "Homework & Assessment" },
		{ key: "questionPaper", name: "Question Paper Generator", path: "/dashboard/question-paper", icon: "📝", description: "AI-powered question paper creation", roles: ["super_admin", "co_admin", "faculty"], category: "Homework & Assessment" },
		{ key: "assignments", name: "Assignments", path: "/dashboard/assignments", icon: "📑", description: "Create & manage assignments", roles: ["super_admin", "co_admin", "faculty", "student"], category: "Homework & Assessment" },

		// ─── Academic Operations ───
		{ key: "skillTracks", name: "Skill Tracks / Courses", path: "/dashboard/courses", icon: "🎓", description: "Courses & skill tracking", roles: ["super_admin", "co_admin", "faculty", "student"], category: "Academic Operations" },
		{ key: "attendance", name: "Attendance", path: "/dashboard/attendance", icon: "✅", description: "Attendance tracking & management", roles: ["super_admin", "co_admin", "faculty", "parent"], category: "Academic Operations" },
		{ key: "timetable", name: "Timetable", path: "/dashboard/timetable", icon: "🕐", description: "Class timetable management", roles: ["super_admin", "co_admin", "faculty"], category: "Academic Operations" },
		{ key: "reports", name: "Reports & Analytics", path: "/dashboard/reports", icon: "📈", description: "Reports & data analytics", roles: ["super_admin", "co_admin", "faculty"], category: "Academic Operations" },
		{ key: "performance", name: "Performance", path: "/dashboard/performance", icon: "📊", description: "Student performance tracking", roles: ["super_admin", "co_admin", "faculty", "student", "parent"], category: "Academic Operations" },
		{ key: "contentGenerator", name: "Content Generator", path: "/dashboard/content-generator", icon: "🎨", description: "AI content & slide generator", roles: ["super_admin", "co_admin", "faculty", "student"], category: "Academic Operations" },

		// ─── Student Tools ───
		{ key: "aiGround", name: "AI Ground", path: "/dashboard/tools", icon: "🛠️", description: "AI playground for students", roles: ["super_admin", "co_admin", "student"], category: "Student Tools" },
		{ key: "buddyAi", name: "Buddy AI (Student)", path: "/dashboard/gyanisage", icon: "😊", description: "Student AI buddy", roles: ["super_admin", "co_admin", "student"], category: "Student Tools" },

		// ─── Innovation Cell ───
		{ key: "ideaSpark", name: "IDEA SPARK", path: "/dashboard/tools/idea-generation", icon: "💡", description: "AI idea generation tool", roles: ["super_admin", "co_admin", "faculty", "student"], category: "Innovation Cell" },
		{ key: "pitchCraft", name: "Pitch Craft / Slide Creator", path: "/dashboard/content-generator", icon: "🎨", description: "Pitch deck & slide generator", roles: ["super_admin", "co_admin", "faculty", "student"], category: "Innovation Cell" },
		{ key: "incubation", name: "Incubation Hub", path: "/dashboard/incubation-hub", icon: "🚀", description: "Startup incubation hub", roles: ["super_admin", "co_admin", "faculty", "student"], category: "Innovation Cell" },

		// ─── Administration ───
		{ key: "schoolManagement", name: "School Management", path: "/dashboard/school-management", icon: "🏫", description: "School management dashboard", roles: ["super_admin", "co_admin"], category: "Administration" },
		{ key: "schoolProfile", name: "School Profile", path: "/dashboard/school-profile", icon: "🌐", description: "School profile & settings", roles: ["super_admin", "co_admin"], category: "Administration" },
		{ key: "studentManagement", name: "Student Management", path: "/dashboard/student-management", icon: "🧑‍🎓", description: "Manage student records", roles: ["super_admin", "co_admin", "faculty"], category: "Administration" },
		{ key: "userManagement", name: "User Management", path: "/dashboard/users", icon: "👥", description: "Manage all users", roles: ["super_admin", "co_admin"], category: "Administration" },
		{ key: "userAccess", name: "Access & Roles", path: "/dashboard/user-access", icon: "🔐", description: "Module access control", roles: ["super_admin"], category: "Administration" },

		// ─── Events ───
		{ key: "eventsManagement", name: "Events Management", path: "/dashboard/events", icon: "📅", description: "Create & manage events", roles: ["super_admin", "co_admin"], category: "Events" },
		{ key: "events", name: "Campus / School Events", path: "/dashboard/events/student", icon: "🎉", description: "Browse campus events", roles: ["super_admin", "co_admin", "faculty", "student", "parent"], category: "Events" },

		// ─── Counselor Specific ───
		{ key: "activeAlerts", name: "Active Safety Alerts", path: "/dashboard/counselor/safety-alerts", icon: "⚠️", description: "AI-flagged safety alerts", roles: ["super_admin", "co_admin", "counselor"], category: "Counselor" },
		{ key: "riskTickets", name: "Risk Tickets", path: "/dashboard/counselor/risk-tickets", icon: "🎫", description: "Student risk assessment tickets", roles: ["super_admin", "co_admin", "counselor"], category: "Counselor" },
		{ key: "alertHistory", name: "Alert History", path: "/dashboard/counselor/alert-history", icon: "📜", description: "Past alert records", roles: ["super_admin", "co_admin", "counselor"], category: "Counselor" },
		{ key: "activeSessions", name: "Active Counseling Sessions", path: "/dashboard/counselor/sessions", icon: "💭", description: "Ongoing counseling sessions", roles: ["super_admin", "co_admin", "counselor"], category: "Counselor" },
		{ key: "studentDir", name: "Student Directory", path: "/dashboard/counselor/students", icon: "📇", description: "Browse student directory", roles: ["super_admin", "co_admin", "counselor"], category: "Counselor" },
		{ key: "chatHistory", name: "AI Chat History", path: "/dashboard/counselor/chat-history", icon: "🤖", description: "Review AI chat logs", roles: ["super_admin", "co_admin", "counselor"], category: "Counselor" },
		{ key: "sessionNotes", name: "Session Notes", path: "/dashboard/counselor/notes", icon: "📝", description: "Counseling session notes", roles: ["super_admin", "co_admin", "counselor"], category: "Counselor" },

		// ─── Parent Specific ───
		{ key: "myChildren", name: "My Children", path: "/dashboard/parent/children", icon: "👨‍👩‍👧‍👦", description: "View children profiles & progress", roles: ["super_admin", "co_admin", "parent"], category: "Parent" },
		{ key: "teacherConnect", name: "Class Teacher Connect", path: "/dashboard/parent/teacher-chat", icon: "📞", description: "Message & call class teacher", roles: ["super_admin", "co_admin", "parent"], category: "Parent" },
	];

	// Get distinct categories
	const categories = [...new Set(availableModules.map(m => m.category))];

	// Get modules applicable to a specific role
	const getModulesForRole = (role) => {
		if (!role) return [];
		// super_admin can grant any module to anyone, so show all
		if (role === 'super_admin') return availableModules;
		return availableModules.filter(m => m.roles.includes(role));
	};

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

	// Fetch user access whitelist from user_access table
	const fetchUserModules = async (userId) => {
		try {
			const { data, error } = await supabase
				.from("user_access")
				.select("module_name")
				.eq("user_id", userId);

			if (error) {
				console.error("[UserAccess] Fetch error:", error.message, error.details, error.hint);
				alert("Error loading user access: " + error.message);
				setEnabledModules(new Set());
				return;
			}

			console.log("[UserAccess] Loaded modules for", userId, ":", data);
			const moduleSet = new Set(data?.map(d => d.module_name) || []);
			setEnabledModules(moduleSet);
		} catch (error) {
			console.error("[UserAccess] Fetch exception:", error);
			setEnabledModules(new Set());
		}
	};

	// Open modal for user
	const handleManageAccess = (u) => {
		setSelectedUser(u);
		fetchUserModules(u.id);
		setShowModal(true);
	};

	// Toggle a module on/off
	const toggleModule = (moduleKey) => {
		setEnabledModules(prev => {
			const next = new Set(prev);
			if (next.has(moduleKey)) {
				next.delete(moduleKey);
			} else {
				next.add(moduleKey);
			}
			return next;
		});
	};

	// Save module access (whitelist approach using user_access table)
	const handleSaveAccess = async () => {
		if (!selectedUser) return;

		setSaving(true);
		try {
			// Delete all existing access for this user
			const { error: deleteError } = await supabase
				.from("user_access")
				.delete()
				.eq("user_id", selectedUser.id);

			if (deleteError) {
				console.error("[UserAccess] Delete error:", deleteError.message, deleteError.details, deleteError.hint);
				throw deleteError;
			}

			// Insert enabled modules with access_type 'all'
			const records = [...enabledModules].map(moduleKey => {
				const mod = availableModules.find(m => m.key === moduleKey);
				return {
					user_id: selectedUser.id,
					module_name: moduleKey,
					sub_domain: mod?.path || null,
					access_type: 'all',
				};
			});

			console.log("[UserAccess] Inserting", records.length, "records for", selectedUser.id);

			if (records.length > 0) {
				const { error: insertError } = await supabase
					.from("user_access")
					.insert(records);

				if (insertError) {
					console.error("[UserAccess] Insert error:", insertError.message, insertError.details, insertError.hint);
					throw insertError;
				}
			}

			// Verify the save by re-reading
			const { data: verifyData } = await supabase
				.from("user_access")
				.select("module_name")
				.eq("user_id", selectedUser.id);
			console.log("[UserAccess] Verification — saved", verifyData?.length, "modules:", verifyData?.map(d => d.module_name));

			alert(`Access permissions saved! ${records.length} modules granted. User must refresh their page to see changes.`);
			setShowModal(false);
			setSelectedUser(null);
		} catch (error) {
			console.error("Error saving access:", error);
			alert("Failed to save access permissions: " + error.message);
		} finally {
			setSaving(false);
		}
	};

	// Quick actions: enable all or disable all for the selected user's role
	const enableAllForRole = () => {
		if (!selectedUser) return;
		const roleModules = getModulesForRole(selectedUser.role);
		setEnabledModules(new Set(roleModules.map(m => m.key)));
	};

	const disableAll = () => {
		setEnabledModules(new Set());
	};

	// Filtered users
	const filteredUsers = users.filter(u => {
		const matchesSearch = !searchQuery || 
			(u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
			(u.email || "").toLowerCase().includes(searchQuery.toLowerCase());
		const matchesRole = roleFilter === "all" || u.role === roleFilter;
		return matchesSearch && matchesRole;
	});

	const institutionalRoles = ["super_admin", "co_admin", "faculty", "student", "counselor", "parent"];

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
					Control module access for institutional users. Toggle modules on/off per user.
				</p>
			</div>

			{/* Stats */}
			<div className="mb-6 grid gap-4 sm:grid-cols-3">
				<div className="rounded-xl border p-4" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)' }}>
					<div className="flex items-center gap-3">
						<div className="rounded-lg p-3" style={{ backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)' }}>
							<span className="text-2xl">👥</span>
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
							<span className="text-2xl">📦</span>
						</div>
						<div>
							<p className="text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
								{availableModules.length}
							</p>
							<p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>
								Total Modules
							</p>
						</div>
					</div>
				</div>
				<div className="rounded-xl border p-4" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)' }}>
					<div className="flex items-center gap-3">
						<div className="rounded-lg p-3" style={{ backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)' }}>
							<span className="text-2xl">🏷️</span>
						</div>
						<div>
							<p className="text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
								{categories.length}
							</p>
							<p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>
								Categories
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="mb-4 flex flex-wrap gap-3">
				<input
					type="text"
					placeholder="Search users..."
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
					className="rounded-lg border px-4 py-2 text-sm"
					style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)', color: 'var(--dashboard-text)' }}
				/>
				<select
					value={roleFilter}
					onChange={e => setRoleFilter(e.target.value)}
					className="rounded-lg border px-4 py-2 text-sm"
					style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)', color: 'var(--dashboard-text)' }}
				>
					<option value="all">All Roles</option>
					{institutionalRoles.map(r => (
						<option key={r} value={r}>{r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
					))}
				</select>
			</div>

			{/* Users Table */}
			<div className="rounded-xl border" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)' }}>
				{filteredUsers.length === 0 ? (
					<div className="p-12 text-center">
						<span className="text-5xl">👥</span>
						<p className="mt-4 text-lg font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
							No users found
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="border-b" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-muted)' }}>
								<tr>
									<th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>User</th>
									<th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>Email</th>
									<th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>Role</th>
									<th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>Phone</th>
									<th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>Joined</th>
									<th className="px-6 py-4 text-right text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y" style={{ borderColor: 'var(--dashboard-border)' }}>
								{filteredUsers.map((u) => (
									<tr key={u.id} className="transition-colors hover:opacity-80">
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ background: 'var(--dashboard-primary)' }}>
													{(u.full_name || u.email).split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
												</div>
												<div>
													<p className="font-medium" style={{ color: 'var(--dashboard-heading)' }}>{u.full_name || "No Name"}</p>
													<p className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>ID: {u.id.slice(0, 8)}...</p>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 text-sm" style={{ color: 'var(--dashboard-text)' }}>{u.email}</td>
										<td className="px-6 py-4">
											<span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
												style={{ backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)', color: 'var(--dashboard-primary)' }}>
												{u.role?.replace(/_/g, ' ')}
											</span>
										</td>
										<td className="px-6 py-4 text-sm" style={{ color: 'var(--dashboard-text)' }}>{u.phone || "N/A"}</td>
										<td className="px-6 py-4 text-sm" style={{ color: 'var(--dashboard-text)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
										<td className="px-6 py-4 text-right">
											<button
												onClick={() => handleManageAccess(u)}
												className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
												style={{ background: 'var(--dashboard-primary)' }}
											>
												🔐 Manage Access
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
					<div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)' }}>
						<div className="mb-6 flex items-center justify-between">
							<div>
								<h2 className="text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
									Manage Access Permissions
								</h2>
								<p className="mt-1 text-sm" style={{ color: 'var(--dashboard-muted)' }}>
									User: <strong>{selectedUser.full_name || selectedUser.email}</strong> &bull; Role: <strong>{selectedUser.role?.replace(/_/g, ' ')}</strong>
								</p>
								<p className="mt-1 text-xs" style={{ color: 'var(--dashboard-muted)' }}>
									Toggle modules on/off. Enabled modules appear in the user&apos;s sidebar. If no modules are enabled, user sees all default modules for their role.
								</p>
							</div>
							<button
								onClick={() => { setShowModal(false); setSelectedUser(null); }}
								className="rounded-lg p-2 transition-colors hover:opacity-70"
								style={{ color: 'var(--dashboard-muted)' }}
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
									<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Quick Actions */}
						<div className="mb-6 flex flex-wrap gap-2 rounded-xl border p-4" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-muted)' }}>
							<span className="text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>Quick Actions:</span>
							<button
								onClick={enableAllForRole}
								className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:opacity-90"
								style={{ background: 'var(--dashboard-primary)' }}
							>
								✅ Enable All for Role
							</button>
							<button
								onClick={disableAll}
								className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600"
							>
								❌ Disable All
							</button>
							<span className="ml-auto text-xs font-medium" style={{ color: 'var(--dashboard-muted)' }}>
								{enabledModules.size} modules enabled
							</span>
						</div>

						{/* Modules grouped by category */}
						<div className="space-y-6">
							{categories.map(category => {
								const categoryModules = getModulesForRole(selectedUser.role).filter(m => m.category === category);
								if (categoryModules.length === 0) return null;
								return (
									<div key={category}>
										<h3 className="mb-3 text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--dashboard-primary)' }}>
											{category}
										</h3>
										<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
											{categoryModules.map(mod => {
												const isEnabled = enabledModules.has(mod.key);
												return (
													<button
														key={mod.key}
														onClick={() => toggleModule(mod.key)}
														className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-md ${isEnabled ? 'ring-2' : ''}`}
														style={{
															borderColor: isEnabled ? 'var(--dashboard-primary)' : 'var(--dashboard-border)',
															backgroundColor: isEnabled ? 'color-mix(in srgb, var(--dashboard-primary) 8%, var(--dashboard-surface-solid))' : 'var(--dashboard-surface-solid)',
															ringColor: isEnabled ? 'var(--dashboard-primary)' : 'transparent',
														}}
													>
														<div className="text-2xl shrink-0">{mod.icon}</div>
														<div className="flex-1 min-w-0">
															<p className="font-semibold text-sm truncate" style={{ color: 'var(--dashboard-heading)' }}>{mod.name}</p>
															<p className="text-xs truncate" style={{ color: 'var(--dashboard-muted)' }}>{mod.description}</p>
														</div>
														<div className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${isEnabled ? 'text-white' : ''}`}
															style={{ backgroundColor: isEnabled ? 'var(--dashboard-primary)' : 'var(--dashboard-surface-muted)', color: isEnabled ? '#fff' : 'var(--dashboard-muted)' }}>
															{isEnabled ? '✓' : ''}
														</div>
													</button>
												);
											})}
										</div>
									</div>
								);
							})}
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
								onClick={() => { setShowModal(false); setSelectedUser(null); }}
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
