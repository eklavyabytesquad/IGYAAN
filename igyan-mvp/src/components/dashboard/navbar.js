"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../app/utils/auth_context";
import { useRouter } from "next/navigation";
import { supabase } from "../../app/utils/supabase";
import Link from "next/link";

export default function DashboardNavbar({ onMenuClick, schoolData }) {
	const { user, logout } = useAuth();
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
	const [notifications, setNotifications] = useState(0);
	const [sessionRequests, setSessionRequests] = useState([]);
	const dropdownRef = useRef(null);
	const notificationsRef = useRef(null);
	const router = useRouter();

	// Close dropdown when clicking outside
	// Fetch session requests for B2C users (mentors and students)
	useEffect(() => {
		if (user?.role === 'b2c_mentor' || user?.role === 'b2c_student') {
			fetchSessionRequests();
			
			// Set up real-time subscription for session requests
			const filterField = user.role === 'b2c_mentor' ? 'mentor_user_id' : 'student_user_id';
			const channel = supabase
				.channel('session_requests_channel')
				.on('postgres_changes', 
					{ 
						event: '*', 
						schema: 'public', 
						table: 'session_requests',
						filter: `${filterField}=eq.${user.id}`
					}, 
					() => {
						fetchSessionRequests();
					}
				)
				.subscribe();

			return () => {
				supabase.removeChannel(channel);
			};
		}
	}, [user]);

	async function fetchSessionRequests() {
		if (!user?.id) return;

		try {
			let query = supabase.from("session_requests");
			
			if (user.role === 'b2c_mentor') {
				// Mentors see pending requests
				const { data, error } = await query
					.select(`
						*,
						student:student_user_id (
							id,
							full_name,
							email,
							image_base64
						)
					`)
					.eq("mentor_user_id", user.id)
					.eq("status", "pending")
					.order("created_at", { ascending: false });

				if (error) throw error;
				setSessionRequests(data || []);
				setNotifications(data?.length || 0);
			} else if (user.role === 'b2c_student') {
				// Students see accepted/rejected requests (updates from mentors)
				const { data, error } = await query
					.select(`
						*,
						mentor:mentor_user_id (
							id,
							full_name,
							email,
							image_base64
						)
					`)
					.eq("student_user_id", user.id)
					.in("status", ["accepted", "rejected"])
					.is("student_viewed", null)
					.order("updated_at", { ascending: false });

				if (error) throw error;
				setSessionRequests(data || []);
				setNotifications(data?.length || 0);
			}
		} catch (error) {
			console.error("Error fetching session requests:", error);
		}
	}

	useEffect(() => {
		function handleClickOutside(event) {
			const target = event.target;
			if (dropdownRef.current && !dropdownRef.current.contains(target)) {
				setIsProfileOpen(false);
			}
			if (notificationsRef.current && !notificationsRef.current.contains(target)) {
				setIsNotificationsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const toggleNotifications = () => {
		setIsNotificationsOpen(!isNotificationsOpen);
	};

	const handleLogout = async () => {
		await logout();
		router.push("/login");
	};

	// Determine if user is B2C
	const isB2CUser = user?.role === 'b2c_student' || user?.role === 'b2c_mentor';

	return (
		<header className="dashboard-nav sticky top-0 z-30 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/80">
			<div className="flex h-16 items-center justify-between px-6">
				{/* Left Section */}
				<div className="flex items-center gap-4">
					<button
						onClick={onMenuClick}
						className="rounded-lg p-2 text-zinc-600 transition-all hover:bg-zinc-100 hover:scale-105 dark:text-zinc-400 dark:hover:bg-zinc-800 lg:hidden"
						aria-label="Toggle menu"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="h-6 w-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
							/>
						</svg>
					</button>

					{/* Search Bar */}
					<div className="hidden items-center md:flex">
						<div className="relative">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2"
								style={{ color: 'var(--dashboard-muted)' }}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
								/>
							</svg>
							<input
								type="text"
								placeholder={isB2CUser ? "Search tools, courses..." : "Search courses, assignments..."}
								className="w-64 rounded-xl py-2.5 pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:w-80 lg:w-80"
								style={{
									border: '1px solid var(--dashboard-border)',
									backgroundColor: 'var(--dashboard-surface-muted)',
									color: 'var(--dashboard-text)',
									'--tw-ring-color': 'color-mix(in srgb, var(--dashboard-primary) 30%, transparent)'
								}}
							/>
						</div>
					</div>
				</div>

				{/* Right Section */}
				<div className="flex items-center gap-3">
					{/* Portal Badge */}
					{isB2CUser && (
						<div className="hidden sm:flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-4 py-1.5 ring-1 ring-cyan-500/20 dark:from-cyan-500/20 dark:to-blue-500/20">
							<div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></div>
							<span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">Launch Pad</span>
						</div>
					)}

					{/* Mobile Search */}
					<button 
						className="rounded-lg p-2 text-zinc-600 transition-all hover:bg-zinc-100 hover:scale-105 dark:text-zinc-400 dark:hover:bg-zinc-800 md:hidden"
						aria-label="Search"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="h-5 w-5"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
							/>
						</svg>
					</button>

					{/* Notifications */}
					<div className="relative" ref={notificationsRef}>
						<button
							onClick={toggleNotifications}
							className="relative rounded-lg p-2 text-zinc-600 transition-all hover:bg-zinc-100 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:text-zinc-400 dark:hover:bg-zinc-800"
							aria-haspopup="true"
							aria-expanded={isNotificationsOpen}
							aria-label="Notifications"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-5 w-5"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
								/>
							</svg>
							{notifications > 0 && (
								<span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[10px] font-bold text-white shadow-lg ring-2 ring-white dark:ring-zinc-900">
									{notifications}
								</span>
							)}
						</button>

						{isNotificationsOpen && (
							<div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
								style={{
									border: '1px solid var(--dashboard-border)',
									backgroundColor: 'var(--dashboard-surface-solid)'
								}}>
								<div className="border-b px-4 py-3"
									style={{ borderColor: 'var(--dashboard-border)' }}>
									<p className="text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>Notifications</p>
								</div>
								
								{/* Notification Content */}
								{sessionRequests.length === 0 ? (
									<div className="px-4 py-12 text-center">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											className="mx-auto h-12 w-12 mb-3"
											style={{ color: 'var(--dashboard-muted)' }}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
											/>
										</svg>
										<p className="text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>No notifications yet</p>
										<p className="mt-1 text-xs" style={{ color: 'var(--dashboard-muted)' }}>We'll notify you when something arrives</p>
									</div>
								) : (
									<div className="max-h-96 overflow-y-auto">
										{sessionRequests.map((request) => {
											const otherUser = user?.role === 'b2c_mentor' ? request.student : request.mentor;
											const statusColors = {
												pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
												accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
												rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
											};
											const statusLabel = request.status === 'pending' ? 'New Request' : 
												request.status === 'accepted' ? 'Request Accepted' : 'Request Rejected';
											
											return (
												<Link 
													key={request.id}
													href="/dashboard/messages?openRequests=true"
													onClick={async () => {
														setIsNotificationsOpen(false);
														if (user?.role === 'b2c_student') {
															await supabase
																.from('session_requests')
																.update({ student_viewed: true })
																.eq('id', request.id);
														}
													}}
													className="block border-b px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
													style={{ borderColor: 'var(--dashboard-border)' }}
												>
													<div className="flex items-start gap-3">
														<div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
															{otherUser?.image_base64 ? (
																<img 
																	src={otherUser.image_base64} 
																	alt={otherUser.full_name}
																	className="h-full w-full object-cover"
																/>
															) : (
																<span className="text-white font-semibold text-sm">
																	{otherUser?.full_name?.charAt(0) || 'U'}
																</span>
															)}
														</div>
														
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2">
																<p className="text-sm font-semibold truncate" style={{ color: 'var(--dashboard-heading)' }}>
																	{otherUser?.full_name}
																</p>
																<span className={`flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[request.status]}`}>
																	{statusLabel}
																</span>
															</div>
															<p className="text-sm mt-0.5 truncate" style={{ color: 'var(--dashboard-text)' }}>
																{request.request_title}
															</p>
															<div className="flex items-center gap-2 mt-1">
																<svg
																	xmlns="http://www.w3.org/2000/svg"
																	viewBox="0 0 24 24"
																	fill="none"
																	stroke="currentColor"
																	strokeWidth="1.5"
																	className="h-3.5 w-3.5"
																	style={{ color: 'var(--dashboard-muted)' }}
																>
																	<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
																</svg>
																<p className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>
																	{new Date(request.requested_start_time || request.updated_at).toLocaleString('en-US', {
																		month: 'short',
																		day: 'numeric',
																		hour: 'numeric',
																		minute: '2-digit',
																		hour12: true
																	})}
																</p>
															</div>
														</div>
													</div>
												</Link>
											);
										})}
										
										{/* View All Button */}
										<Link
											href="/dashboard/messages?openRequests=true"
											onClick={() => setIsNotificationsOpen(false)}
											className="block px-4 py-3 text-center text-sm font-medium transition-colors hover:opacity-80"
											style={{ color: 'var(--dashboard-primary)' }}
										>
											{user?.role === 'b2c_mentor' ? 'View All Requests' : 'View My Requests'} →
										</Link>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Divider */}
					<div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700" />

					{/* Profile Dropdown */}
					<div className="relative" ref={dropdownRef}>
						<button
							onClick={() => setIsProfileOpen(!isProfileOpen)}
							className="flex items-center gap-3 rounded-xl p-1.5 transition-all hover:bg-zinc-100/80 hover:shadow-sm dark:hover:bg-zinc-800/80"
							aria-label="User menu"
						>
							{user?.image_base64 ? (
								<img
									src={user.image_base64}
									alt={user?.full_name || "User"}
									className="h-9 w-9 rounded-full object-cover ring-2 ring-offset-2 ring-indigo-500/30 dark:ring-offset-zinc-900"
								/>
							) : (
								<div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white ring-2 ring-offset-2 dark:ring-offset-zinc-900 ${
									isB2CUser 
										? 'bg-gradient-to-br from-cyan-500 to-blue-500 ring-cyan-500/30' 
										: 'bg-gradient-to-br from-indigo-500 to-purple-500 ring-indigo-500/30'
								}`}>
									{user?.full_name
										?.split(" ")
										.map((n) => n[0])
										.join("")
										.toUpperCase() || "U"}
								</div>
							)}
							<div className="hidden text-left lg:block">
								<p className="text-sm font-semibold text-zinc-900 dark:text-white">
									{user?.full_name?.split(" ")[0] || "User"}
								</p>
								<p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
									{user?.role === 'faculty' ? 'Faculty' : 
									 user?.role === 'super_admin' ? 'Super Admin' :
									 user?.role === 'co_admin' ? 'Co-Admin' :
									 user?.role === 'b2c_student' ? (
										<>
											<span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
											Student
										</>
									 ) :
									 user?.role === 'b2c_mentor' ? (
										<>
											<span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
											Mentor
										</>
									 ) :
									 user?.role === 'student' ? (schoolData?.school_name || 'Student') :
									 'User'}
								</p>
							</div>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className={`hidden h-4 w-4 text-zinc-600 transition-transform duration-200 dark:text-zinc-400 lg:block ${
									isProfileOpen ? "rotate-180" : ""
								}`}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M19.5 8.25l-7.5 7.5-7.5-7.5"
								/>
							</svg>
						</button>

						{/* Dropdown Menu */}
						{isProfileOpen && (
							<div className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-700 dark:bg-zinc-800 animate-in fade-in slide-in-from-top-2 duration-200">
								<div className={`border-b border-zinc-100 p-4 dark:border-zinc-700 ${isB2CUser ? 'bg-gradient-to-br from-cyan-500/5 to-blue-500/5' : ''}`}>
									<div className="flex items-center gap-3">
										{user?.image_base64 ? (
											<img
												src={user.image_base64}
												alt={user?.full_name || "User"}
												className={`h-12 w-12 rounded-full object-cover ring-2 ring-offset-2 ${
													isB2CUser ? 'ring-cyan-500/30' : 'ring-indigo-500/30'
												}`}
											/>
										) : (
											<div className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white ring-2 ${
												isB2CUser 
													? 'bg-gradient-to-br from-cyan-500 to-blue-500 ring-cyan-500/30' 
													: 'bg-gradient-to-br from-indigo-500 to-purple-500 ring-indigo-500/30'
											}`}>
												{user?.full_name
													?.split(" ")
													.map((n) => n[0])
													.join("")
													.toUpperCase() || "U"}
											</div>
										)}
										<div className="flex-1 min-w-0">
											<p className="text-sm font-semibold text-zinc-900 truncate dark:text-white">
												{user?.full_name}
											</p>
											<p className="mt-0.5 text-xs text-zinc-500 truncate dark:text-zinc-400">
												{user?.email}
											</p>
											{isB2CUser && (
												<div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-2 py-0.5 ring-1 ring-cyan-500/20">
													<div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
													<span className="text-[10px] font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-400">
														Launch Pad
													</span>
												</div>
											)}
										</div>
									</div>
								</div>

								<div className="p-2">
									<button
										onClick={() => {
											setIsProfileOpen(false);
											router.push("/dashboard/settings");
										}}
										className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											className="h-4 w-4"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
											/>
										</svg>
										My Profile
									</button>
									<button
										onClick={() => {
											setIsProfileOpen(false);
											router.push("/dashboard/settings");
										}}
										className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											className="h-4 w-4"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
											/>
										</svg>
										Settings
									</button>
									<button
										onClick={() => {
											setIsProfileOpen(false);
											router.push("/dashboard");
										}}
										className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											className="h-4 w-4"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
											/>
										</svg>
										Help & Support
									</button>
								</div>

								<div className="border-t border-zinc-100 p-2 dark:border-zinc-700">
									<button
										onClick={handleLogout}
										className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											className="h-4 w-4"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
											/>
										</svg>
										Logout
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
}
