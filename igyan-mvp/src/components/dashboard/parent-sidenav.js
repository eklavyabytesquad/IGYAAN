"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function ParentSidenav({ isOpen, setIsOpen, isCollapsed, setIsCollapsed, schoolData }) {
	const pathname = usePathname();
	const [expandedSections, setExpandedSections] = useState({
		attendance: true,
		academics: true,
	});

	const toggleSection = (section) => {
		setExpandedSections(prev => ({
			...prev,
			[section]: !prev[section]
		}));
	};

	// Parent Portal Navigation Structure
	const parentNavSections = [
		{
			key: 'dashboard',
			title: "Dashboard",
			href: "/dashboard",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
				</svg>
			),
		},
		{
			key: 'myChildren',
			title: "My Children",
			href: "/dashboard/parent/children",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
				</svg>
			),
		},
		{
			key: 'attendance',
			title: "Attendance",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
				</svg>
			),
			isExpandable: true,
			subItems: [
				{
					key: 'todayAttendance',
					name: "Today's Status",
					href: "/dashboard/parent/attendance/today",
					icon: "📅",
					badge: "new",
				},
				{
					key: 'absenceAlerts',
					name: "Absence Alerts",
					href: "/dashboard/parent/attendance/alerts",
					icon: "🚨",
				},
				{
					key: 'weeklyReports',
					name: "Weekly Reports",
					href: "/dashboard/parent/attendance/weekly",
					icon: "📊",
				},
				{
					key: 'attendanceHistory',
					name: "Attendance History",
					href: "/dashboard/parent/attendance/history",
					icon: "📜",
				},
			],
		},
		{
			key: 'academics',
			title: "Academics",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
				</svg>
			),
			isExpandable: true,
			subItems: [
				{
					key: 'reportCards',
					name: "Report Cards",
					href: "/dashboard/parent/report-cards",
					icon: "📋",
				},
				{
					key: 'homework',
					name: "Homework Tracking",
					href: "/dashboard/parent/homework",
					icon: "📝",
				},
				{
					key: 'performance',
					name: "Performance",
					href: "/dashboard/parent/performance",
					icon: "📈",
				},
				{
					key: 'timetable',
					name: "Timetable",
					href: "/dashboard/parent/timetable",
					icon: "🕐",
				},
			],
		},
		{
			key: 'communication',
			title: "Communication",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
				</svg>
			),
			isExpandable: true,
			subItems: [
				{
					key: 'classTeacher',
					name: "Class Teacher",
					href: "/dashboard/parent/teacher-contact",
					icon: "👨‍🏫",
					badge: "POC",
				},
				{
					key: 'messages',
					name: "Messages",
					href: "/dashboard/parent/messages",
					icon: "💬",
				},
				{
					key: 'notifications',
					name: "Notifications",
					href: "/dashboard/parent/notifications",
					icon: "🔔",
				},
			],
		},
		{
			key: 'events',
			title: "School Events",
			href: "/dashboard/parent/events",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
				</svg>
			),
		},
		{
			key: 'fees',
			title: "Fee Payment",
			href: "/dashboard/parent/fees",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
				</svg>
			),
		},
		{
			key: 'profile',
			title: "Profile",
			href: "/dashboard/profile",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
			),
		},
		{
			key: 'settings',
			title: "Settings",
			href: "/dashboard/settings",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
					<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
			),
		},
	];

	return (
		<>
			{/* Mobile Overlay */}
			{isOpen && (
				<div
					className="fixed inset-0 z-40 bg-zinc-900/50 backdrop-blur-sm lg:hidden"
					onClick={() => setIsOpen(false)}
				/>
			)}

			{/* Sidenav */}
			<aside
				className={`
					fixed left-0 top-0 z-50 h-screen bg-white dark:bg-zinc-900 
					border-r border-zinc-200 dark:border-zinc-800 
					transition-all duration-300 ease-in-out
					${isOpen ? "translate-x-0" : "-translate-x-full"}
					${isCollapsed ? "w-20" : "w-72"}
					lg:translate-x-0
				`}
			>
				<div className="flex h-full flex-col">
					{/* Header with Logo */}
					<div className="flex h-16 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4">
						{!isCollapsed && schoolData?.logo_url ? (
							<div className="flex items-center gap-3">
								<Image
									src={schoolData.logo_url}
									alt={schoolData.school_name || "School Logo"}
									width={32}
									height={32}
									className="h-8 w-8 rounded-lg object-contain"
								/>
								<div className="flex flex-col">
									<span className="text-sm font-semibold text-zinc-900 dark:text-white">
										{schoolData.school_name || "I-GYAN"}
									</span>
									<span className="text-xs text-zinc-500 dark:text-zinc-400">
										Parent Portal
									</span>
								</div>
							</div>
						) : (
							!isCollapsed && (
								<div className="flex items-center gap-2">
									<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
										<span className="text-sm font-bold text-white">👨‍👩‍👧</span>
									</div>
									<span className="text-lg font-bold text-zinc-900 dark:text-white">
										I-GYAN
									</span>
								</div>
							)
						)}

						{/* Collapse Toggle (Desktop Only) */}
						<button
							onClick={() => setIsCollapsed(!isCollapsed)}
							className="hidden rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:block"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className={`h-5 w-5 text-zinc-600 dark:text-zinc-400 transition-transform ${
									isCollapsed ? "rotate-180" : ""
								}`}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"
								/>
							</svg>
						</button>

						{/* Close Button (Mobile Only) */}
						<button
							onClick={() => setIsOpen(false)}
							className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 lg:hidden"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className="h-5 w-5"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					{/* Navigation */}
					<nav className="flex-1 space-y-1 overflow-y-auto p-4">
						{parentNavSections.map((section) => (
							<div key={section.key}>
								{section.isExpandable ? (
									<div>
										<button
											onClick={() => toggleSection(section.key)}
											className={`
												flex w-full items-center justify-between rounded-lg px-3 py-2.5
												text-sm font-medium transition-all
												hover:bg-zinc-100 dark:hover:bg-zinc-800
												${
													section.subItems?.some(item => pathname === item.href)
														? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
														: "text-zinc-700 dark:text-zinc-300"
												}
											`}
										>
											<div className="flex items-center gap-3">
												{section.icon}
												{!isCollapsed && <span>{section.title}</span>}
											</div>
											{!isCollapsed && (
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													className={`h-4 w-4 transition-transform ${
														expandedSections[section.key] ? "rotate-180" : ""
													}`}
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														d="M19 9l-7 7-7-7"
													/>
												</svg>
											)}
										</button>

										{/* Sub Items */}
										{expandedSections[section.key] && !isCollapsed && (
											<div className="ml-4 mt-1 space-y-1 border-l-2 border-zinc-200 dark:border-zinc-700 pl-4">
												{section.subItems.map((item) => (
													<Link
														key={item.key}
														href={item.href}
														className={`
															flex items-center justify-between gap-2 rounded-lg px-3 py-2
															text-sm transition-all
															hover:bg-zinc-100 dark:hover:bg-zinc-800
															${
																pathname === item.href
																	? "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400 font-medium"
																	: "text-zinc-600 dark:text-zinc-400"
															}
														`}
													>
														<div className="flex items-center gap-2">
															<span className="text-base">{item.icon}</span>
															<span>{item.name}</span>
														</div>
														{item.badge && (
															<span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
																item.badge === 'new' ? 'bg-blue-500 text-white' : 
																item.badge === 'POC' ? 'bg-amber-500 text-white' : 
																'bg-zinc-500 text-white'
															}`}>
																{item.badge}
															</span>
														)}
													</Link>
												))}
											</div>
										)}
									</div>
								) : (
									<Link
										href={section.href}
										className={`
											flex items-center gap-3 rounded-lg px-3 py-2.5
											text-sm font-medium transition-all
											hover:bg-zinc-100 dark:hover:bg-zinc-800
											${
												pathname === section.href
													? "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"
													: "text-zinc-700 dark:text-zinc-300"
											}
										`}
										title={isCollapsed ? section.title : undefined}
									>
										{section.icon}
										{!isCollapsed && <span>{section.title}</span>}
									</Link>
								)}
							</div>
						))}
					</nav>

					{/* Footer */}
					{!isCollapsed && (
						<div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
							<div className="rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-3">
								<div className="flex items-center gap-2 mb-2">
									<span className="text-lg">👨‍👩‍👧‍👦</span>
									<span className="text-xs font-semibold text-zinc-900 dark:text-white">
										Parent Portal
									</span>
								</div>
								<p className="text-xs text-zinc-600 dark:text-zinc-400">
									Stay connected with your child's academic journey and wellbeing.
								</p>
							</div>
						</div>
					)}
				</div>
			</aside>
		</>
	);
}
