"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function CounselorSidenav({ isOpen, setIsOpen, isCollapsed, setIsCollapsed, schoolData }) {
	const pathname = usePathname();
	const [expandedSections, setExpandedSections] = useState({
		counseling: true,
		safety: true,
	});

	const toggleSection = (section) => {
		setExpandedSections(prev => ({
			...prev,
			[section]: !prev[section]
		}));
	};

	// Counselor Portal Navigation Structure
	const counselorNavSections = [
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
			key: 'safety',
			title: "AI Safety Alerts",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
				</svg>
			),
			isExpandable: true,
			subItems: [
				{
					key: 'activeAlerts',
					name: "Active Alerts",
					href: "/dashboard/counselor/safety-alerts",
					icon: "🚨",
					badge: "live",
				},
				{
					key: 'riskTickets',
					name: "Risk Tickets",
					href: "/dashboard/counselor/risk-tickets",
					icon: "🎫",
				},
				{
					key: 'alertHistory',
					name: "Alert History",
					href: "/dashboard/counselor/alert-history",
					icon: "📜",
				},
			],
		},
		{
			key: 'counseling',
			title: "Counseling Sessions",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
				</svg>
			),
			isExpandable: true,
			subItems: [
				{
					key: 'activeSessions',
					name: "Active Sessions",
					href: "/dashboard/counselor/sessions",
					icon: "💬",
				},
				{
					key: 'studentList',
					name: "Student Directory",
					href: "/dashboard/counselor/students",
					icon: "👥",
				},
				{
					key: 'chatHistory',
					name: "AI Chat History",
					href: "/dashboard/counselor/chat-history",
					icon: "🤖",
				},
				{
					key: 'sessionNotes',
					name: "Session Notes",
					href: "/dashboard/counselor/notes",
					icon: "📝",
				},
			],
		},
		{
			key: 'analytics',
			title: "Analytics & Reports",
			href: "/dashboard/counselor/analytics",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
				</svg>
			),
		},
		{
			key: 'resources',
			title: "Support Resources",
			href: "/dashboard/counselor/resources",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
				</svg>
			),
		},
		{
			key: 'profile',
			title: "My Profile",
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
										Counselor Portal
									</span>
								</div>
							</div>
						) : (
							!isCollapsed && (
								<div className="flex items-center gap-2">
									<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
										<span className="text-sm font-bold text-white">🧘</span>
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
						{counselorNavSections.map((section) => (
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
																	? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 font-medium"
																	: "text-zinc-600 dark:text-zinc-400"
															}
														`}
													>
														<div className="flex items-center gap-2">
															<span className="text-base">{item.icon}</span>
															<span>{item.name}</span>
														</div>
														{item.badge && (
															<span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white animate-pulse">
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
													? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
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
							<div className="rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-3">
								<div className="flex items-center gap-2 mb-2">
									<span className="text-lg">🧘‍♀️</span>
									<span className="text-xs font-semibold text-zinc-900 dark:text-white">
										Counselor Mode
									</span>
								</div>
								<p className="text-xs text-zinc-600 dark:text-zinc-400">
									Monitor student wellbeing and respond to AI safety alerts in real-time.
								</p>
							</div>
						</div>
					)}
				</div>
			</aside>
		</>
	);
}
