"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../utils/auth_context";
import { supabase } from "../utils/supabase";
import Link from "next/link";
import SchoolOnboarding from "../../components/dashboard/school-onboarding";
import Logo from "@/components/logo";

export default function DashboardPage() {
	const { user, session, loading } = useAuth();
	const router = useRouter();
	const [hasSchool, setHasSchool] = useState(null);
	const [checkingSchool, setCheckingSchool] = useState(true);

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	// Check if user has a school
	useEffect(() => {
		const checkSchool = async () => {
			if (!user) return;

			try {
				// Check if user has created a school
				const { data, error } = await supabase
					.from("schools")
					.select("id")
					.limit(1)
					.maybeSingle();

				if (error && error.code !== "PGRST116") {
					console.error("Error checking school:", error);
				}

				setHasSchool(!!data);
				setCheckingSchool(false);
			} catch (err) {
				console.error("Error checking school:", err);
				setCheckingSchool(false);
			}
		};

		if (user) {
			checkSchool();
		}
	}, [user]);

	const handleOnboardingComplete = () => {
		setHasSchool(true);
	};

	if (loading || checkingSchool) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
					<p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
						Loading your dashboard...
					</p>
				</div>
			</div>
		);
	}

	if (!user) return null;

	// Show onboarding if user has no school
	if (hasSchool === false) {
		return (
			<SchoolOnboarding userId={user.id} onComplete={handleOnboardingComplete} />
		);
	}

	return (
		<div className="p-6 lg:p-8">
			{/* Header */}
			<div className="mb-8 space-y-3">
				<Logo variant="header" />
				<h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
					Welcome back, {user.full_name?.split(" ")[0] || "User"}! 👋
				</h1>
				<p className="mt-2 text-zinc-600 dark:text-zinc-400">
					Here&rsquo;s what&rsquo;s happening with your learning today
				</p>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
				<div className="animate-float rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-indigo-100 p-3 dark:bg-indigo-900/30">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
								/>
							</svg>
						</div>
						<div>
							<p className="text-2xl font-semibold text-zinc-900 dark:text-white">
								8
							</p>
							<p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
								Active Courses
							</p>
						</div>
					</div>
				</div>

				<div
					className="animate-float rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
					style={{ animationDelay: "0.1s" }}
				>
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-sky-100 p-3 dark:bg-sky-900/30">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-6 w-6 text-sky-600 dark:text-sky-400"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div>
							<p className="text-2xl font-semibold text-zinc-900 dark:text-white">
								23
							</p>
							<p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
								Completed Tasks
							</p>
						</div>
					</div>
				</div>

				<div
					className="animate-float rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
					style={{ animationDelay: "0.2s" }}
				>
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-6 w-6 text-purple-600 dark:text-purple-400"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
								/>
							</svg>
						</div>
						<div>
							<p className="text-2xl font-semibold text-zinc-900 dark:text-white">
								92%
							</p>
							<p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
								Avg Performance
							</p>
						</div>
					</div>
				</div>

				<div
					className="animate-float rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
					style={{ animationDelay: "0.3s" }}
				>
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-900/30">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div>
							<p className="text-2xl font-semibold text-zinc-900 dark:text-white">
								42h
							</p>
							<p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
								Learning Time
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content Grid */}
			<div className="grid gap-6 lg:grid-cols-3">
				{/* Quick Actions */}
				<div className="lg:col-span-2">
					<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
						<h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">
							Quick Actions
						</h2>
						<div className="grid gap-4 sm:grid-cols-2">
							<Link
								href="/features"
								className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 transition-all hover:-translate-y-1 hover:border-indigo-300 hover:bg-white hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
							>
								<div className="rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/30">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
										/>
									</svg>
								</div>
								<div className="flex-1">
									<p className="font-semibold text-zinc-900 dark:text-white">
										Browse Courses
									</p>
									<p className="text-xs text-zinc-600 dark:text-zinc-400">
										Explore learning paths
									</p>
								</div>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									className="h-5 w-5 text-zinc-400 transition-transform group-hover:translate-x-1"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M8.25 4.5l7.5 7.5-7.5 7.5"
									/>
								</svg>
							</Link>

							<Link
								href="/features"
								className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 transition-all hover:-translate-y-1 hover:border-indigo-300 hover:bg-white hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
							>
								<div className="rounded-lg bg-sky-100 p-3 dark:bg-sky-900/30">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										className="h-6 w-6 text-sky-600 dark:text-sky-400"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
										/>
									</svg>
								</div>
								<div className="flex-1">
									<p className="font-semibold text-zinc-900 dark:text-white">
										AI Copilot
									</p>
									<p className="text-xs text-zinc-600 dark:text-zinc-400">
										Get personalized help
									</p>
								</div>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									className="h-5 w-5 text-zinc-400 transition-transform group-hover:translate-x-1"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M8.25 4.5l7.5 7.5-7.5 7.5"
									/>
								</svg>
							</Link>

							<Link
								href="/features"
								className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 transition-all hover:-translate-y-1 hover:border-indigo-300 hover:bg-white hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
							>
								<div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										className="h-6 w-6 text-purple-600 dark:text-purple-400"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
										/>
									</svg>
								</div>
								<div className="flex-1">
									<p className="font-semibold text-zinc-900 dark:text-white">
										Career Hub
									</p>
									<p className="text-xs text-zinc-600 dark:text-zinc-400">
										Plan your future
									</p>
								</div>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									className="h-5 w-5 text-zinc-400 transition-transform group-hover:translate-x-1"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M8.25 4.5l7.5 7.5-7.5 7.5"
									/>
								</svg>
							</Link>

							<Link
								href="/contact"
								className="group flex items-center gap-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 transition-all hover:-translate-y-1 hover:border-indigo-300 hover:bg-white hover:shadow-md dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:bg-zinc-800"
							>
								<div className="rounded-lg bg-emerald-100 p-3 dark:bg-emerald-900/30">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
										/>
									</svg>
								</div>
								<div className="flex-1">
									<p className="font-semibold text-zinc-900 dark:text-white">
										Get Support
									</p>
									<p className="text-xs text-zinc-600 dark:text-zinc-400">
										We&rsquo;re here to help
									</p>
								</div>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									className="h-5 w-5 text-zinc-400 transition-transform group-hover:translate-x-1"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M8.25 4.5l7.5 7.5-7.5 7.5"
									/>
								</svg>
							</Link>
						</div>
					</div>
				</div>

				{/* User Profile Card */}
				<div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
					<h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">
						Profile
					</h2>
					<div className="space-y-4">
						<div className="flex items-center gap-4">
							<div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-500 text-xl font-semibold text-white">
								{user.full_name
									?.split(" ")
									.map((n) => n[0])
									.join("")
									.toUpperCase() || "U"}
							</div>
							<div>
								<p className="font-semibold text-zinc-900 dark:text-white">
									{user.full_name}
								</p>
								<p className="text-sm text-zinc-600 dark:text-zinc-400">
									{user.email}
								</p>
							</div>
						</div>

						<div className="space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-700">
							<div className="flex items-center justify-between text-sm">
								<span className="text-zinc-600 dark:text-zinc-400">
									Member since
								</span>
								<span className="font-medium text-zinc-900 dark:text-white">
									{new Date(user.created_at).toLocaleDateString("en-US", {
										month: "short",
										year: "numeric",
									})}
								</span>
							</div>
							{user.phone && (
								<div className="flex items-center justify-between text-sm">
									<span className="text-zinc-600 dark:text-zinc-400">
										Phone
									</span>
									<span className="font-medium text-zinc-900 dark:text-white">
										{user.phone}
									</span>
								</div>
							)}
							{session && (
								<div className="flex items-center justify-between text-sm">
									<span className="text-zinc-600 dark:text-zinc-400">
										Device
									</span>
									<span className="font-medium text-zinc-900 dark:text-white">
										{session.device_type}
									</span>
								</div>
							)}
						</div>

						<Link
							href="/features"
							className="block w-full rounded-lg border border-zinc-300 px-4 py-2 text-center text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
						>
							Edit Profile
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
