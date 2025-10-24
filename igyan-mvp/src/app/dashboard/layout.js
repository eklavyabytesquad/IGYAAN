"use client";

import { useState } from "react";
import DashboardNavbar from "../../components/dashboard/navbar";
import DashboardSidenav from "../../components/dashboard/sidenav";

export default function DashboardLayout({ children }) {
	const [isSidenavOpen, setIsSidenavOpen] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);

	return (
		<div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
			{/* Sidebar */}
			<DashboardSidenav
				isOpen={isSidenavOpen}
				setIsOpen={setIsSidenavOpen}
				isCollapsed={isCollapsed}
				setIsCollapsed={setIsCollapsed}
			/>

			{/* Main Content Area */}
			<div className={`flex flex-1 flex-col transition-all duration-300 ${
				isCollapsed ? "lg:ml-20" : "lg:ml-64"
			}`}>
				{/* Top Navbar */}
				<DashboardNavbar 
					onMenuClick={() => setIsSidenavOpen(!isSidenavOpen)}
				/>

				{/* Page Content */}
				<main className="flex-1 overflow-y-auto overflow-x-hidden">
					{children}
				</main>
			</div>
		</div>
	);
}
