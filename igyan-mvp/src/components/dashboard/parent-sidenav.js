"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function ParentSidenav({ isOpen, setIsOpen, isCollapsed, setIsCollapsed, schoolData }) {
	const pathname = usePathname();
	const [expandedSections, setExpandedSections] = useState({
		classTeacherConnect: true,
	});

	const toggleSection = (section) => {
		setExpandedSections(prev => ({
			...prev,
			[section]: !prev[section]
		}));
	};

	// Parent Portal Navigation Structure — matches image spec
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
			key: 'classTeacherConnect',
			title: "Class Teacher Connect",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
				</svg>
			),
			isExpandable: true,
			subItems: [
				{
					key: 'message',
					name: "Message",
					href: "/dashboard/parent/teacher-chat",
					icon: "💬",
				},
				{
					key: 'call',
					name: "Call",
					href: "/dashboard/parent/teacher-chat?tab=call",
					icon: "📞",
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
					fixed left-0 top-0 z-50 h-screen
					border-r
					transition-all duration-300 ease-in-out
					${isOpen ? "translate-x-0" : "-translate-x-full"}
					${isCollapsed ? "w-20" : "w-72"}
					lg:translate-x-0
				`}
				style={{ backgroundColor: 'var(--dashboard-surface-solid)', borderColor: 'var(--dashboard-border)' }}
			>
				<div className="flex h-full flex-col">
					{/* Header with Logo */}
					<div className="flex h-16 items-center justify-between border-b px-4" style={{ borderColor: 'var(--dashboard-border)' }}>
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
									<span className="text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
										{schoolData.school_name || "I-GYAN"}
									</span>
									<span className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>
										Parent Portal
									</span>
								</div>
							</div>
						) : (
							!isCollapsed && (
								<div className="flex items-center gap-2">
									<div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--dashboard-primary)' }}>
										<span className="text-sm font-bold text-white">👨‍👩‍👧</span>
									</div>
									<span className="text-lg font-bold" style={{ color: 'var(--dashboard-heading)' }}>
										I-GYAN
									</span>
								</div>
							)
						)}

						{/* Collapse Toggle (Desktop Only) */}
						<button
							onClick={() => setIsCollapsed(!isCollapsed)}
							className="hidden rounded-lg p-2 lg:block transition-colors hover:opacity-70"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className={`h-5 w-5 transition-transform ${
									isCollapsed ? "rotate-180" : ""
								}`}
								style={{ color: 'var(--dashboard-muted)' }}
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
							className="rounded-lg p-2 transition-colors hover:opacity-70 lg:hidden"
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
					<nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
						{parentNavSections.map((section) => (
							<div key={section.key}>
								{section.isExpandable ? (
									<div className="mt-1">
										<button
											onClick={() => toggleSection(section.key)}
											className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all"
											style={section.subItems?.some(item => pathname === item.href)
												? { backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)', color: 'var(--dashboard-primary)' }
												: { color: 'var(--dashboard-text)' }
											}
										>
											<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all"
												style={section.subItems?.some(item => pathname === item.href)
													? { background: 'var(--dashboard-primary)', color: 'white' }
													: { background: 'color-mix(in srgb, var(--dashboard-primary) 8%, transparent)', color: 'var(--dashboard-text)' }
												}
											>
												{section.icon}
											</div>
											{!isCollapsed && (
												<>
													<span className="flex-1 text-left">{section.title}</span>
													<span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
														style={{ background: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)', color: 'var(--dashboard-primary)' }}
													>
														{section.subItems?.length}
													</span>
													<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
														className={`h-3.5 w-3.5 transition-transform duration-300 ${expandedSections[section.key] ? "rotate-180" : ""}`}
														style={{ color: 'var(--dashboard-muted)' }}
													>
														<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
													</svg>
												</>
											)}
										</button>

										{/* Animated Dropdown */}
										<div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSections[section.key] && !isCollapsed ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
											<div className="ml-6 mt-1 space-y-0.5 border-l-2 pl-3 pb-1" style={{ borderColor: 'color-mix(in srgb, var(--dashboard-primary) 20%, transparent)' }}>
												{section.subItems.map((item) => (
													<Link
														key={item.key}
														href={item.href}
														onClick={() => setIsOpen(false)}
														className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all"
														style={pathname === item.href
															? { backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)', color: 'var(--dashboard-primary)', borderLeft: '2px solid var(--dashboard-primary)', marginLeft: '-1px' }
															: { color: 'var(--dashboard-muted)' }
														}
													>
														<span className="flex h-6 w-6 shrink-0 items-center justify-center text-base">{item.icon}</span>
														<span className="flex-1">{item.name}</span>
														{pathname === item.href && (
															<div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--dashboard-primary)' }}></div>
														)}
													</Link>
												))}
											</div>
										</div>
									</div>
								) : (
									<Link
										href={section.href}
										onClick={() => setIsOpen(false)}
										className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all"
										style={pathname === section.href
											? { backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)', color: 'var(--dashboard-primary)' }
											: { color: 'var(--dashboard-text)' }
										}
										title={isCollapsed ? section.title : undefined}
									>
										<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all"
											style={pathname === section.href
												? { background: 'var(--dashboard-primary)', color: 'white' }
												: { background: 'color-mix(in srgb, var(--dashboard-primary) 8%, transparent)', color: 'var(--dashboard-text)' }
											}
										>
											{section.icon}
										</div>
										{!isCollapsed && (
											<>
												<span className="flex-1">{section.title}</span>
												{pathname === section.href && (
													<div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--dashboard-primary)' }}></div>
												)}
											</>
										)}
									</Link>
								)}
							</div>
						))}
					</nav>

					{/* Footer */}
					{!isCollapsed && (
						<div className="border-t p-4" style={{ borderColor: 'var(--dashboard-border)' }}>
							<div className="rounded-lg p-3" style={{ backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 8%, transparent)' }}>
								<div className="flex items-center gap-2 mb-2">
									<span className="text-lg">👨‍👩‍👧‍👦</span>
									<span className="text-xs font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
										Parent Portal
									</span>
								</div>
								<p className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>
									Stay connected with your child&apos;s academic journey and wellbeing.
								</p>
							</div>
						</div>
					)}
				</div>
			</aside>
		</>
	);
}
