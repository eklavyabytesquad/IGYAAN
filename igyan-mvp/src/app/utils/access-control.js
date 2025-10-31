/**
 * User Access Control Utilities
 * Helper functions to check user permissions for modules
 */

import { supabase } from "./supabase";

/**
 * Fetch user access permissions from database
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Access map with module names as keys
 */
export async function getUserAccess(userId) {
	try {
		const { data, error } = await supabase
			.from("user_access")
			.select("*")
			.eq("user_id", userId);

		if (error) throw error;

		// Create access map
		const accessMap = {};
		data?.forEach((access) => {
			accessMap[access.module_name] = access.access_type;
		});

		return accessMap;
	} catch (error) {
		console.error("Error fetching user access:", error);
		return {};
	}
}

/**
 * Check if user has access to a module
 * @param {Object} user - User object with role
 * @param {string} moduleName - Name of the module
 * @param {Object} userAccess - User access map
 * @returns {boolean} True if user has access
 */
export function hasModuleAccess(user, moduleName, userAccess = {}) {
	if (!user) return false;
	
	// Super admins have access to everything
	if (user.role === "super_admin") return true;
	
	// Check if user has any access (not 'none' and not undefined)
	const accessType = userAccess[moduleName];
	return accessType && accessType !== "none";
}

/**
 * Check if user can edit a module
 * @param {Object} user - User object with role
 * @param {string} moduleName - Name of the module
 * @param {Object} userAccess - User access map
 * @returns {boolean} True if user can edit
 */
export function canEdit(user, moduleName, userAccess = {}) {
	if (!user) return false;
	
	// Super admins can edit everything
	if (user.role === "super_admin") return true;
	
	const accessType = userAccess[moduleName];
	return accessType === "edit" || accessType === "all";
}

/**
 * Check if user can delete in a module
 * @param {Object} user - User object with role
 * @param {string} moduleName - Name of the module
 * @param {Object} userAccess - User access map
 * @returns {boolean} True if user can delete
 */
export function canDelete(user, moduleName, userAccess = {}) {
	if (!user) return false;
	
	// Super admins can delete everything
	if (user.role === "super_admin") return true;
	
	const accessType = userAccess[moduleName];
	return accessType === "delete" || accessType === "all";
}

/**
 * Check if user has full access to a module
 * @param {Object} user - User object with role
 * @param {string} moduleName - Name of the module
 * @param {Object} userAccess - User access map
 * @returns {boolean} True if user has all permissions
 */
export function hasFullAccess(user, moduleName, userAccess = {}) {
	if (!user) return false;
	
	// Super admins have full access to everything
	if (user.role === "super_admin") return true;
	
	return userAccess[moduleName] === "all";
}

/**
 * Get access level for a module
 * @param {Object} user - User object with role
 * @param {string} moduleName - Name of the module
 * @param {Object} userAccess - User access map
 * @returns {string} Access level: 'all', 'edit', 'delete', 'view', or 'none'
 */
export function getAccessLevel(user, moduleName, userAccess = {}) {
	if (!user) return "none";
	
	// Super admins have all access
	if (user.role === "super_admin") return "all";
	
	return userAccess[moduleName] || "none";
}

/**
 * Update user access for a module
 * @param {string} userId - User ID
 * @param {string} moduleName - Module name
 * @param {string} accessType - Access type (view, edit, delete, all)
 * @param {string|null} subDomain - Optional subdomain/path
 * @returns {Promise<Object>} Result object with success status
 */
export async function updateUserAccess(
	userId,
	moduleName,
	accessType,
	subDomain = null
) {
	try {
		// First, try to find existing record
		const { data: existing, error: fetchError } = await supabase
			.from("user_access")
			.select("id")
			.eq("user_id", userId)
			.eq("module_name", moduleName)
			.maybeSingle();

		if (fetchError) throw fetchError;

		if (existing) {
			// Update existing record
			const { error: updateError } = await supabase
				.from("user_access")
				.update({ access_type: accessType, sub_domain: subDomain })
				.eq("id", existing.id);

			if (updateError) throw updateError;
		} else {
			// Insert new record
			const { error: insertError } = await supabase.from("user_access").insert([
				{
					user_id: userId,
					module_name: moduleName,
					access_type: accessType,
					sub_domain: subDomain,
				},
			]);

			if (insertError) throw insertError;
		}

		return { success: true };
	} catch (error) {
		console.error("Error updating user access:", error);
		return { success: false, error: error.message };
	}
}

/**
 * Remove user access for a module
 * @param {string} userId - User ID
 * @param {string} moduleName - Module name
 * @returns {Promise<Object>} Result object with success status
 */
export async function removeUserAccess(userId, moduleName) {
	try {
		const { error } = await supabase
			.from("user_access")
			.delete()
			.eq("user_id", userId)
			.eq("module_name", moduleName);

		if (error) throw error;

		return { success: true };
	} catch (error) {
		console.error("Error removing user access:", error);
		return { success: false, error: error.message };
	}
}

/**
 * Grant all access to all modules for a user
 * @param {string} userId - User ID
 * @param {Array<string>} moduleNames - Array of module names
 * @returns {Promise<Object>} Result object with success status
 */
export async function grantFullAccess(userId, moduleNames) {
	try {
		const accessRecords = moduleNames.map((moduleName) => ({
			user_id: userId,
			module_name: moduleName,
			access_type: "all",
		}));

		// Delete existing access first
		await supabase.from("user_access").delete().eq("user_id", userId);

		// Insert new access records
		const { error } = await supabase.from("user_access").insert(accessRecords);

		if (error) throw error;

		return { success: true };
	} catch (error) {
		console.error("Error granting full access:", error);
		return { success: false, error: error.message };
	}
}

/**
 * Revoke all access for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Result object with success status
 */
export async function revokeAllAccess(userId) {
	try {
		const { error } = await supabase
			.from("user_access")
			.delete()
			.eq("user_id", userId);

		if (error) throw error;

		return { success: true };
	} catch (error) {
		console.error("Error revoking all access:", error);
		return { success: false, error: error.message };
	}
}
