"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StudentSidenav({ isOpen, setIsOpen, isCollapsed, setIsCollapsed, schoolData }) {
	const pathname = usePathname();
	const [expandedSections, setExpandedSections] = useState({
		projects: true,
		homework: true,
	});

	const toggleSection = (section) => {
		setExpandedSections(prev => ({
			...prev,
			[section]: !prev[section]
		}));
	};

	// Student Portal Navigation Structure
	const studentNavSections = [
		{
			key: 'projects',
			title: "Projects",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
				</svg>
			),
			isExpandable: true,
			subItems: [
				{
					key: 'copilot',
					name: "I-GYAN Co-Pilot",
					href: "/dashboard/copilot",
					icon: "🤖",
				},
				{
					key: 'pitchDeck',
					name: "Auto Pitch Deck Creator",
					href: "/dashboard/content-generator",
					icon: "📊",
				},
			],
		},
		{
			key: 'innovation',
			title: "School Innovation Cell",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
				</svg>
			),
			isExpandable: true,
			subItems: [
				{
					key: 'aiShark',
					name: "AI Shark",
					href: "/dashboard/shark-ai",
					icon: "🦈",
				},
				{
					key: 'incubationForm',
					name: "Incubation Form",
					href: "/dashboard/incubation-hub",
					icon: "🚀",
				},
			],
		},
		{
			key: 'homework',
			title: "Homework",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
				</svg>
			),
			isExpandable: true,
			subItems: [
				{
					key: 'gamifiedHomework',
					name: "Gamified Homework",
					href: "/dashboard/homework/student",
					icon: "🎮",
				},
				{
					key: 'virtualViva',
					name: "Virtual Viva",
					href: "/dashboard/viva-ai",
					icon: "🎤",
				},
				{
					key: 'aiReports',
					name: "AI Reports",
					href: "/dashboard/reports",
					icon: "📈",
				},
			],
		},
		{
			key: 'events',
			title: "Events",
			href: "/dashboard/events/student",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
				</svg>
			),
		},
		{
			key: 'courses',
			title: "I-GYAN Courses",
			href: "/mycourses",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
				</svg>
			),
		},
		{
			key: 'counsellor',
			title: "AI Counsellor",
			href: "/dashboard/gyanisage",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
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
					className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
					onClick={() => setIsOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={`dashboard-sidenav fixed left-0 top-0 z-50 flex h-screen transform flex-col border-r border-zinc-200 bg-white/95 backdrop-blur-xl transition-all duration-300 ease-in-out lg:translate-x-0 dark:border-zinc-800 dark:bg-zinc-900/95 ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				} ${isCollapsed ? "w-20" : "w-64"}`}
			>
				{/* Logo Section */}
				<div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
					<Link
						href="/dashboard"
						className={`flex items-center gap-2 transition-all duration-300 ${
							isCollapsed ? "lg:justify-center" : ""
						}`}
					>
						{schoolData?.logo_url ? (
							<img
								src={schoolData.logo_url}
								alt={schoolData.school_name || "School Logo"}
								className="h-10 w-10 shrink-0 rounded-lg object-cover shadow-md ring-2 ring-blue-500/20"
							/>
						) : (
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-cyan-600 shadow-md ring-2 ring-blue-500/20">
								<span className="text-base font-bold text-white">
									{schoolData?.school_name?.[0] || "iG"}
								</span>
							</div>
						)}
						{!isCollapsed && (
							<span className="text-lg font-bold text-zinc-900 transition-all duration-300 dark:text-white">
								{schoolData?.school_name || "iGyanAI"}
							</span>
						)}
					</Link>
					<div className="flex items-center gap-2">
						<button
							onClick={() => setIsCollapsed(!isCollapsed)}
							className="hidden lg:flex rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
							title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className={`h-5 w-5 transition-transform duration-300 ${
									isCollapsed ? "rotate-180" : ""
								}`}
							>
								<path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
							</svg>
						</button>
						<button
							onClick={() => setIsOpen(false)}
							className="lg:hidden rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				</div>

				{/* Student Portal Header */}
				{!isCollapsed && (
					<div className="border-b border-zinc-200 bg-linear-to-r from-blue-50 to-cyan-50 px-4 py-3 dark:border-zinc-800 dark:from-blue-950/30 dark:to-cyan-950/30">
						<div className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-cyan-600 shadow-sm">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-white">
									<path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
									<path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
									<path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
								</svg>
							</div>
							<div className="flex-1">
								<p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Student Portal</p>
								<p className="text-[10px] text-zinc-500 dark:text-zinc-400">Learning & Innovation Hub</p>
							</div>
						</div>
					</div>
				)}

				{/* Navigation */}
				<nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					{studentNavSections.map((section) => {
						const isActive = pathname === section.href;
						const isExpanded = expandedSections[section.key];

						if (section.isExpandable) {
							return (
								<div key={section.key} className="space-y-1">
									{/* Parent Section */}
									<button
										onClick={() => !isCollapsed && toggleSection(section.key)}
										className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
											isCollapsed ? "lg:justify-center lg:px-0" : ""
										} text-zinc-700 hover:bg-zinc-100/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80`}
										title={isCollapsed ? section.title : ""}
									>
										<div className={`${isCollapsed ? "lg:mx-auto" : ""} transition-transform`}>
											{section.icon}
										</div>
										{!isCollapsed && (
											<>
												<span className="flex-1 text-left">{section.title}</span>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													className={`h-4 w-4 transition-transform duration-200 ${
														isExpanded ? "rotate-180" : ""
													}`}
												>
													<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
												</svg>
											</>
										)}
										{/* Tooltip for collapsed state */}
										{isCollapsed && (
											<div className="invisible absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900 lg:block hidden">
												{section.title}
												<div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900 dark:border-r-zinc-100"></div>
											</div>
										)}
									</button>

									{/* Sub Items */}
									{isExpanded && !isCollapsed && section.subItems && (
										<div className="ml-3 space-y-0.5 border-l-2 border-zinc-200 pl-4 dark:border-zinc-700">
											{section.subItems.map((subItem) => {
												const isSubActive = pathname === subItem.href;
												return (
													<Link
														key={subItem.key}
														href={subItem.href}
														onClick={() => setIsOpen(false)}
														className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
															isSubActive
																? "bg-linear-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 shadow-sm ring-1 ring-blue-500/20 dark:from-blue-500/20 dark:to-cyan-500/20 dark:text-blue-400"
																: "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-200"
														}`}
													>
														<span className={`text-base ${isSubActive ? "scale-110" : ""} transition-transform`}>
															{subItem.icon}
														</span>
														<span className="flex-1">{subItem.name}</span>
														{isSubActive && (
															<div className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400"></div>
														)}
													</Link>
												);
											})}
										</div>
									)}
								</div>
							);
						}

						// Regular Section (no subitems)
						return (
							<Link
								key={section.key}
								href={section.href}
								onClick={() => setIsOpen(false)}
								className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all ${
									isActive
										? "bg-linear-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 shadow-sm ring-1 ring-blue-500/20 dark:from-blue-500/20 dark:to-cyan-500/20 dark:text-blue-400"
										: "text-zinc-700 hover:bg-zinc-100/80 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
								} ${isCollapsed ? "lg:justify-center lg:px-0" : ""}`}
								title={isCollapsed ? section.title : ""}
							>
								<div className={`${isCollapsed ? "lg:mx-auto" : ""} ${isActive ? "scale-110" : ""} transition-transform`}>
									{section.icon}
								</div>
								{!isCollapsed && (
									<>
										<span className="flex-1">{section.title}</span>
										{isActive && (
											<div className="h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400"></div>
										)}
									</>
								)}
								{/* Tooltip for collapsed state */}
								{isCollapsed && (
									<div className="invisible absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900 lg:block hidden">
										{section.title}
										<div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900 dark:border-r-zinc-100"></div>
									</div>
								)}
							</Link>
						);
					})}
				</nav>

				{/* Footer */}
				{!isCollapsed && (
					<div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
						<div className="rounded-lg bg-linear-to-br from-blue-50 to-cyan-50 p-3 dark:from-blue-950/30 dark:to-cyan-950/30">
							<p className="text-xs font-semibold text-zinc-900 dark:text-white">Learn & Innovate</p>
							<p className="mt-1 text-[10px] text-zinc-600 dark:text-zinc-400">
								Your journey to excellence starts here
							</p>
						</div>
					</div>
				)}
			</aside>
		</>
	);
}
