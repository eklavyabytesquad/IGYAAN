import { createClient } from "./supabase";

/**
 * Check if a user has access to a specific module
 * @param {string} userId - The user's ID
 * @param {string} moduleName - The module name to check
 * @param {string} requiredAccess - Required access type (view, edit, delete, all)
 * @returns {Promise<boolean>} - Whether user has access
 */
export async function checkUserAccess(userId, moduleName, requiredAccess = "view") {
	const supabase = createClient();

	try {
		// First check if user is super_admin
		const { data: userData, error: userError } = await supabase
			.from("users")
			.select("role")
			.eq("id", userId)
			.single();

		if (userError) throw userError;

		// Super admin has access to everything
		if (userData.role === "super_admin") {
			return true;
		}

		// Check user_access table
		const { data: accessData, error: accessError } = await supabase
			.from("user_access")
			.select("access_type")
			.eq("user_id", userId)
			.eq("module_name", moduleName)
			.single();

		if (accessError) {
			// No access record found
			return false;
		}

		// Check if user has required access
		const accessType = accessData.access_type;

		if (accessType === "all") return true;
		if (accessType === "none") return false;

		// Check specific access levels
		const accessHierarchy = {
			view: 1,
			edit: 2,
			delete: 3,
			all: 4,
		};

		return accessHierarchy[accessType] >= accessHierarchy[requiredAccess];
	} catch (error) {
		console.error("Error checking user access:", error);
		return false;
	}
}

/**
 * Get all accessible modules for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} - Array of accessible modules with their access types
 */
export async function getUserAccessibleModules(userId) {
	const supabase = createClient();

	try {
		// First check if user is super_admin
		const { data: userData, error: userError } = await supabase
			.from("users")
			.select("role")
			.eq("id", userId)
			.single();

		if (userError) throw userError;

		// Super admin has access to everything
		if (userData.role === "super_admin") {
			return {
				isSuperAdmin: true,
				modules: [],
			};
		}

		// Get user's accessible modules
		const { data: accessData, error: accessError } = await supabase
			.from("user_access")
			.select("*")
			.eq("user_id", userId)
			.neq("access_type", "none");

		if (accessError) throw accessError;

		return {
			isSuperAdmin: false,
			modules: accessData || [],
		};
	} catch (error) {
		console.error("Error getting user accessible modules:", error);
		return {
			isSuperAdmin: false,
			modules: [],
		};
	}
}

/**
 * Check if user can perform a specific action on a module
 * @param {string} userId - The user's ID
 * @param {string} moduleName - The module name
 * @param {string} action - Action to check (view, edit, delete)
 * @returns {Promise<boolean>} - Whether user can perform the action
 */
export async function canUserPerformAction(userId, moduleName, action) {
	const supabase = createClient();

	try {
		// First check if user is super_admin
		const { data: userData, error: userError } = await supabase
			.from("users")
			.select("role")
			.eq("id", userId)
			.single();

		if (userError) throw userError;

		// Super admin can do everything
		if (userData.role === "super_admin") {
			return true;
		}

		// Check user_access table
		const { data: accessData, error: accessError } = await supabase
			.from("user_access")
			.select("access_type")
			.eq("user_id", userId)
			.eq("module_name", moduleName)
			.single();

		if (accessError) {
			// No access record found
			return false;
		}

		const accessType = accessData.access_type;

		// If user has 'all' access, they can do everything
		if (accessType === "all") return true;
		if (accessType === "none") return false;

		// Check specific actions
		switch (action) {
			case "view":
				return ["view", "edit", "delete", "all"].includes(accessType);
			case "edit":
				return ["edit", "delete", "all"].includes(accessType);
			case "delete":
				return ["delete", "all"].includes(accessType);
			default:
				return false;
		}
	} catch (error) {
		console.error("Error checking user action:", error);
		return false;
	}
}

/**
 * Grant default access to a new user based on their role
 * @param {string} userId - The user's ID
 * @param {string} role - The user's role
 * @returns {Promise<void>}
 */
export async function grantDefaultAccess(userId, role) {
	const supabase = createClient();

	// Define default access for each role
	const defaultAccess = {
		student: [
			{ module: "Dashboard", access: "view" },
			{ module: "My Courses", access: "view" },
			{ module: "AI Copilot", access: "all" },
			{ module: "Viva AI", access: "all" },
			{ module: "Assignments", access: "view" },
			{ module: "Performance", access: "view" },
			{ module: "Calendar", access: "view" },
			{ module: "Messages", access: "all" },
			{ module: "Profile", access: "edit" },
		],
		faculty: [
			{ module: "Dashboard", access: "view" },
			{ module: "My Courses", access: "all" },
			{ module: "AI Copilot", access: "all" },
			{ module: "Viva AI", access: "all" },
			{ module: "Assignments", access: "all" },
			{ module: "Performance", access: "view" },
			{ module: "Calendar", access: "all" },
			{ module: "Messages", access: "all" },
			{ module: "Student Management", access: "all" },
			{ module: "Attendance", access: "all" },
			{ module: "Profile", access: "edit" },
			{ module: "School Profile", access: "view" },
		],
		co_admin: [
			{ module: "Dashboard", access: "all" },
			{ module: "My Courses", access: "all" },
			{ module: "AI Copilot", access: "all" },
			{ module: "Viva AI", access: "all" },
			{ module: "Assignments", access: "all" },
			{ module: "Performance", access: "all" },
			{ module: "Calendar", access: "all" },
			{ module: "Messages", access: "all" },
			{ module: "User Management", access: "view" },
			{ module: "Student Management", access: "all" },
			{ module: "Attendance", access: "all" },
			{ module: "Settings", access: "edit" },
			{ module: "Profile", access: "edit" },
			{ module: "School Profile", access: "edit" },
		],
	};

	const accessList = defaultAccess[role] || [];

	if (accessList.length === 0) return; // Super admin doesn't need default access

	try {
		const accessRecords = accessList.map((item) => ({
			user_id: userId,
			module_name: item.module,
			access_type: item.access,
		}));

		const { error } = await supabase.from("user_access").insert(accessRecords);

		if (error) throw error;
	} catch (error) {
		console.error("Error granting default access:", error);
	}
}
