"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../utils/auth_context";
import { supabase } from "../utils/supabase";
import DashboardNavbar from "../../components/dashboard/navbar";
import DashboardSidenav from "../../components/dashboard/sidenav";
import FacultySidenav from "../../components/dashboard/faculty-sidenav";
import StudentSidenav from "../../components/dashboard/student-sidenav";
import B2CStudentSidenav from "../../components/dashboard/b2c-student-sidenav";

const THEME_STORAGE_KEY = "dashboard-theme";

export default function DashboardLayout({ children }) {
	const [isSidenavOpen, setIsSidenavOpen] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [schoolData, setSchoolData] = useState(null);
	const [activeTheme, setActiveTheme] = useState("indigo");
	const { user, logout } = useAuth();

	// Validate user has valid dashboard role access
	useEffect(() => {
		if (!user) return;
		
		const INSTITUTIONAL_ROLES = ['super_admin', 'co_admin', 'student', 'faculty'];
		const LAUNCH_PAD_ROLES = ['b2c_student', 'b2c_mentor'];
		const ALL_VALID_ROLES = [...INSTITUTIONAL_ROLES, ...LAUNCH_PAD_ROLES];
		
		if (!ALL_VALID_ROLES.includes(user.role)) {
			// User doesn't have any valid role for dashboard
			alert("Access denied. Invalid user role.");
			logout();
		}
	}, [user, logout]);

	// Restore theme preference on mount
	useEffect(() => {
		if (typeof window === "undefined") return;
		const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
		if (savedTheme) {
			setActiveTheme(savedTheme);
			document.body.dataset.dashboardTheme = savedTheme;
		} else {
			document.body.dataset.dashboardTheme = "indigo";
		}
	}, []);

	// Listen for theme change events dispatched from settings page
	useEffect(() => {
		function handleThemeChange(event) {
			if (!event?.detail) return;
			setActiveTheme(event.detail);
		}

		window.addEventListener("dashboard-theme-change", handleThemeChange);
		return () => {
			window.removeEventListener("dashboard-theme-change", handleThemeChange);
		};
	}, []);

	// Persist theme changes and update body attribute
	useEffect(() => {
		if (typeof window === "undefined") return;
		if (!activeTheme) return;
		document.body.dataset.dashboardTheme = activeTheme;
		window.localStorage.setItem(THEME_STORAGE_KEY, activeTheme);
	}, [activeTheme]);

	// Clean up dataset when dashboard unmounts
	useEffect(() => {
		return () => {
			if (document?.body?.dataset) {
				delete document.body.dataset.dashboardTheme;
			}
		};
	}, []);

	useEffect(() => {
		const fetchSchoolData = async () => {
			if (!user?.id) return;

			// B2C users don't have school data
			const LAUNCH_PAD_ROLES = ['b2c_student', 'b2c_mentor'];
			if (LAUNCH_PAD_ROLES.includes(user.role)) {
				setSchoolData(null);
				return;
			}

			try {
				// First check if user has a school_id
				if (user.school_id) {
					// Fetch school data based on user's school_id
					const { data, error } = await supabase
						.from("schools")
						.select("id, school_name, logo_url, subdomain")
						.eq("id", user.school_id)
						.single();

					if (error) {
						console.error("Error fetching school data:", error);
						return;
					}

					if (data) {
						setSchoolData(data);
					}
				} else {
					// Fallback: Check if user created a school
					const { data, error } = await supabase
						.from("schools")
						.select("id, school_name, logo_url, subdomain")
						.eq("created_by", user.id)
						.maybeSingle();

					if (error && error.code !== "PGRST116") {
						console.error("Error fetching school data:", error);
						return;
					}

					if (data) {
						setSchoolData(data);
					}
				}
			} catch (err) {
				console.error("Error in fetchSchoolData:", err);
			}
		};

		fetchSchoolData();
	}, [user]);

	return (
		<div className="dashboard-theme flex h-screen overflow-hidden">
			{/* Sidebar - Role-based navigation */}
			{user?.role === 'faculty' ? (
				<FacultySidenav
					isOpen={isSidenavOpen}
					setIsOpen={setIsSidenavOpen}
					isCollapsed={isCollapsed}
					setIsCollapsed={setIsCollapsed}
					schoolData={schoolData}
				/>
			) : user?.role === 'student' ? (
				<StudentSidenav
					isOpen={isSidenavOpen}
					setIsOpen={setIsSidenavOpen}
					isCollapsed={isCollapsed}
					setIsCollapsed={setIsCollapsed}
					schoolData={schoolData}
				/>
			) : user?.role === 'b2c_student' ? (
				<B2CStudentSidenav
					isOpen={isSidenavOpen}
					setIsOpen={setIsSidenavOpen}
					isCollapsed={isCollapsed}
					setIsCollapsed={setIsCollapsed}
				/>
			) : (
				<DashboardSidenav
					isOpen={isSidenavOpen}
					setIsOpen={setIsSidenavOpen}
					isCollapsed={isCollapsed}
					setIsCollapsed={setIsCollapsed}
					schoolData={schoolData}
				/>
			)}

			{/* Main Content Area */}
			<div className={`flex flex-1 flex-col transition-all duration-300 ${
				isCollapsed ? "lg:ml-20" : "lg:ml-64"
			}`}>
				{/* Top Navbar */}
				<DashboardNavbar 
					onMenuClick={() => setIsSidenavOpen(!isSidenavOpen)}
					schoolData={schoolData}
				/>

				{/* Page Content */}
				<main className="flex-1 overflow-y-auto overflow-x-hidden">
					{children}
				</main>
			</div>
		</div>
	);
}
