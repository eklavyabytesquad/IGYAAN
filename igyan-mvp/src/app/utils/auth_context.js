"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// SHA-256 hashing function
async function hashPassword(password) {
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map((byte) => byte.toString(16).padStart(2, "0"))
		.join("");
	return hashHex;
}

// Generate secure random token
function generateToken() {
	return crypto.randomUUID() + "-" + Date.now() + "-" + Math.random().toString(36);
}

// Get device and browser information
function getDeviceInfo() {
	const userAgent = navigator.userAgent;
	let deviceType = "desktop";
	let osName = "Unknown";
	let browserName = "Unknown";

	// Detect device type
	if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
		deviceType = /iPad|Tablet/i.test(userAgent) ? "tablet" : "mobile";
	}

	// Detect OS
	if (/Windows/i.test(userAgent)) osName = "Windows";
	else if (/Mac/i.test(userAgent)) osName = "macOS";
	else if (/Linux/i.test(userAgent)) osName = "Linux";
	else if (/Android/i.test(userAgent)) osName = "Android";
	else if (/iOS|iPhone|iPad/i.test(userAgent)) osName = "iOS";

	// Detect Browser
	if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent))
		browserName = "Chrome";
	else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent))
		browserName = "Safari";
	else if (/Firefox/i.test(userAgent)) browserName = "Firefox";
	else if (/Edg/i.test(userAgent)) browserName = "Edge";

	return {
		deviceType,
		osName,
		browserName,
		userAgent,
	};
}

// Get user's IP address (simplified - in production use a proper service)
async function getUserIP() {
	try {
		const response = await fetch("https://api.ipify.org?format=json");
		const data = await response.json();
		return data.ip;
	} catch (error) {
		console.error("Failed to get IP:", error);
		return "0.0.0.0";
	}
}

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [session, setSession] = useState(null);
	const [loading, setLoading] = useState(true);
	const router = useRouter();

	// Check for existing session on mount
	useEffect(() => {
		checkSession();
	}, []);

	const checkSession = async () => {
		try {
			const sessionToken = localStorage.getItem("session_token");
			if (!sessionToken) {
				setLoading(false);
				return;
			}

			// Verify session in database
			const { data: sessionData, error } = await supabase
				.from("sessions")
				.select("*, users(*)")
				.eq("session_token", sessionToken)
				.eq("is_active", true)
				.single();

			if (error || !sessionData) {
				localStorage.removeItem("session_token");
				setLoading(false);
				return;
			}

			// Check if session expired
			if (new Date(sessionData.expires_at) < new Date()) {
				await logout();
				return;
			}

			// Update last activity
			await supabase
				.from("sessions")
				.update({ last_activity_at: new Date().toISOString() })
				.eq("id", sessionData.id);

			setUser(sessionData.users);
			setSession(sessionData);
		} catch (error) {
			console.error("Session check error:", error);
		} finally {
			setLoading(false);
		}
	};

	const register = async (email, password, fullName, phone = null, imageBase64 = null, role = "student") => {
		try {
			const passwordHash = await hashPassword(password);

			const { data: userData, error: userError } = await supabase
				.from("users")
				.insert([
					{
						email,
						password_hash: passwordHash,
						full_name: fullName,
						phone,
						image_base64: imageBase64,
						role: role, // Role assigned based on registration portal
						school_id: null, // Will be set after school onboarding (for institutional users)
					},
				])
				.select()
				.single();

			if (userError) {
				throw userError;
			}

			// Auto-login after registration (no variant check needed for register)
			await login(email, password);

			return { success: true, data: userData };
		} catch (error) {
			console.error("Registration error:", error);
			return { success: false, error: error.message };
		}
	};

	const login = async (email, password, loginVariant = null) => {
		try {
			const passwordHash = await hashPassword(password);

			// Find user with matching email and password
			const { data: userData, error: userError } = await supabase
				.from("users")
				.select("*")
				.eq("email", email)
				.eq("password_hash", passwordHash)
				.single();

			if (userError || !userData) {
				throw new Error("Invalid email or password");
			}

			// Define allowed roles based on login variant
			const INSTITUTIONAL_ROLES = ['super_admin', 'co_admin', 'student', 'faculty'];
			const LAUNCH_PAD_ROLES = ['b2c_student', 'b2c_mentor'];

			// Validate role based on login variant
			if (loginVariant === "institutionalSuite") {
				if (!INSTITUTIONAL_ROLES.includes(userData.role)) {
					throw new Error("Access denied. This portal is for institutional users (super_admin, co_admin, student, faculty) only. Please use the iGyan AI Launch portal for B2C access.");
				}
			} else if (loginVariant === "igyanAiLaunch") {
				if (!LAUNCH_PAD_ROLES.includes(userData.role)) {
					throw new Error("Access denied. This portal is for B2C users (b2c_student, b2c_mentor) only. Please use the Institutional Suite portal.");
				}
			}

			// Create session
			const deviceInfo = getDeviceInfo();
			const ipAddress = await getUserIP();
			const sessionToken = generateToken();
			const refreshToken = generateToken();
			const expiresAt = new Date();
			expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

			const { data: sessionData, error: sessionError } = await supabase
				.from("sessions")
				.insert([
					{
						user_id: userData.id,
						session_token: sessionToken,
						refresh_token: refreshToken,
						device_type: deviceInfo.deviceType,
						os_name: deviceInfo.osName,
						browser_name: deviceInfo.browserName,
						user_agent: deviceInfo.userAgent,
						ip_address: ipAddress,
						expires_at: expiresAt.toISOString(),
						is_active: true,
					},
				])
				.select()
				.single();

			if (sessionError) {
				throw sessionError;
			}

			// Store session token in localStorage
			localStorage.setItem("session_token", sessionToken);

			setUser(userData);
			setSession(sessionData);

			router.push("/dashboard");

			return { success: true, data: userData };
		} catch (error) {
			console.error("Login error:", error);
			return { success: false, error: error.message };
		}
	};

	const logout = async () => {
		try {
			const sessionToken = localStorage.getItem("session_token");
			if (sessionToken) {
				// Mark session as inactive
				await supabase
					.from("sessions")
					.update({
						is_active: false,
						logout_at: new Date().toISOString(),
					})
					.eq("session_token", sessionToken);
			}

			localStorage.removeItem("session_token");
			setUser(null);
			setSession(null);
			router.push("/login");
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	const value = {
		user,
		session,
		loading,
		register,
		login,
		logout,
		checkSession,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
