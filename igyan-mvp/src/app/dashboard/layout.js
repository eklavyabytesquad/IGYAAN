"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../utils/auth_context";
import { supabase } from "../utils/supabase";
import DashboardNavbar from "../../components/dashboard/navbar";
import DashboardSidenav from "../../components/dashboard/sidenav";

const THEME_STORAGE_KEY = "dashboard-theme";

export default function DashboardLayout({ children }) {
	const [isSidenavOpen, setIsSidenavOpen] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [schoolData, setSchoolData] = useState(null);
	const [activeTheme, setActiveTheme] = useState("indigo");
	const { user } = useAuth();

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
			{/* Sidebar */}
			<DashboardSidenav
				isOpen={isSidenavOpen}
				setIsOpen={setIsSidenavOpen}
				isCollapsed={isCollapsed}
				setIsCollapsed={setIsCollapsed}
				schoolData={schoolData}
			/>

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
