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

	// Check if user has a school (only for institutional users)
	useEffect(() => {
		const checkSchool = async () => {
			if (!user) return;

			// B2C users don't need school onboarding
			const LAUNCH_PAD_ROLES = ['b2c_student', 'b2c_mentor'];
			if (LAUNCH_PAD_ROLES.includes(user.role)) {
				setHasSchool(true); // Skip school check for B2C users
				setCheckingSchool(false);
				return;
			}

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
		// Trigger a re-render of the layout to fetch school data
		window.location.reload();
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

	const firstName = user.full_name?.split(" ")[0] || "Learner";
	const LAUNCH_PAD_ROLES = ['b2c_student', 'b2c_mentor'];
	const isB2CUser = LAUNCH_PAD_ROLES.includes(user.role);

	const statCards = [
		{
			label: "Active Courses",
			value: "8",
			trend: "+2 this week",
			accent: "from-indigo-500/15 via-indigo-500/5 to-transparent",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
					<path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
				</svg>
			),
			iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
		},
		{
			label: "Completed Tasks",
			value: "23",
			trend: "Great momentum",
			accent: "from-sky-500/15 via-sky-500/5 to-transparent",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
					<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			),
			iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
		},
		{
			label: "Avg Performance",
			value: "92%",
			trend: "Stable progression",
			accent: "from-purple-500/15 via-purple-500/5 to-transparent",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
					<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
				</svg>
			),
			iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-300",
		},
		{
			label: "Learning Time",
			value: "42h",
			trend: "+6h vs last week",
			accent: "from-emerald-500/15 via-emerald-500/5 to-transparent",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
					<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			),
			iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
		},
	];

	const quickActions = [
		{
			title: "Explore Courses",
			description: "Discover curated learning paths tailored to you",
			href: "/features",
			iconBg: "bg-white/70 text-indigo-600 dark:bg-white/10 dark:text-indigo-300",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
				</svg>
			),
		},
		{
			title: "Open iGyanAI",
			description: "Chat with your AI mentor for voice-first guidance",
			href: "/dashboard/viva-ai",
			iconBg: "bg-white/70 text-pink-600 dark:bg-white/10 dark:text-pink-300",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
				</svg>
			),
		},
		{
			title: "Career Hub",
			description: "Match your strengths with future pathways",
			href: "/features",
			iconBg: "bg-white/70 text-purple-600 dark:bg-white/10 dark:text-purple-300",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
				</svg>
			),
		},
		{
			title: "Need Support?",
			description: "Reach the iGyaan team for quick assistance",
			href: "/contact",
			iconBg: "bg-white/70 text-emerald-600 dark:bg-white/10 dark:text-emerald-300",
			icon: (
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
					<path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
				</svg>
			),
		},
	];

	const focusAreas = [
		{
			title: "Math sprint",
			detail: "Revise algebraic identities before Friday's quiz",
			tags: ["15 min", "Concept clarity"],
		},
		{
			title: "Science storyteller",
			detail: "Explain Newton's laws using a skateboard analogy",
			tags: ["Project", "Presentation"],
		},
		{
			title: "Stand-up revision",
			detail: "Draft 3 witty mnemonics for biology terms",
			tags: ["Creative", "Fun"],
		},
	];

	const aiHighlights = [
		{
			title: "Viva AI recap",
			detail: "You asked about electrostatics. Next try linking it to drone design!",
		},
		{
			title: "Momentum boost",
			detail: "Consistency streak of 5 focused sessions this week. Keep the streak alive!",
		},
		{
			title: "Mentor echo",
			detail: "Coach Anil suggests documenting prototype learnings in Notion after each session.",
		},
	];

	const upcomingSessions = [
		{
			time: "Today  b7 7:30 PM",
			title: "Math practice with iGyanAI",
			description: "Run a voice-based problem solving round",
		},
		{
			time: "Tomorrow  b7 5:00 PM",
			title: "Entrepreneurship club",
			description: "Pitch the smart attendance tracker update",
		},
		{
			time: "Friday  b7 4:00 PM",
			title: "Robotics lab",
			description: "Integrate sensor module for the rover",
		},
	];

	return (
		<div className="dashboard-theme min-h-screen p-6 lg:p-8" style={{
			background: 'var(--dashboard-background)'
		}}>
			<div className="mx-auto max-w-6xl space-y-8">
				<header className="relative overflow-hidden rounded-3xl bg-gradient-to-r p-6 text-white shadow-xl sm:p-10" style={{
					background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 80%, #000))`,
				}}>
					<div className="absolute inset-0 opacity-40 mix-blend-soft-light">
						<div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-white/20 blur-3xl"></div>
						<div className="absolute right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-3xl"></div>
					</div>
					<div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
						<div className="space-y-3">
							<Logo variant="header" />
							{isB2CUser && (
								<div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold backdrop-blur">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
										<path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
										<path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
									</svg>
									iGyan AI Launch Pad
								</div>
							)}
							<h1 className="text-3xl font-semibold sm:text-4xl">
								Hey {firstName}, ready for another brilliant session?
							</h1>
							<p className="max-w-xl text-sm text-white/80 sm:text-base">
								Track your goals, jump back into conversations, and keep that NTSE dream in sight. We saved your momentum so you can pick up right where you left off.
							</p>
							<div className="flex flex-wrap gap-3">
								<Link href="/dashboard/viva-ai" className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/30">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
										<path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
									</svg>
									Jump into Viva AI
								</Link>
								<Link href="/features" className="flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/20">
									Plan my week
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
										<path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5h15m-15 0A1.5 1.5 0 003 6v12a1.5 1.5 0 001.5 1.5h15A1.5 1.5 0 0021 18V6a1.5 1.5 0 00-1.5-1.5m-15 0V3.75m0 .75V3.75m0 0A.75.75 0 014.5 3h1.5a.75.75 0 01.75.75V4.5m11.25 0V3.75a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75V4.5m-3 5.25h-6" />
									</svg>
								</Link>
							</div>
						</div>
						<div className="grid gap-4 sm:w-52">
							<div className="rounded-2xl border border-white/30 bg-white/10 p-4 text-sm">
								<p className="text-xs uppercase tracking-wide text-white/70">Next check-in</p>
								<p className="mt-1 text-lg font-semibold">Physics practice · 9 PM</p>
								<p className="mt-2 text-white/70">Akshat has 3 saved prompts from yesterday&apos;s session.</p>
							</div>
							<div className="rounded-2xl border border-white/30 bg-white/10 p-4 text-sm">
								<p className="text-xs uppercase tracking-wide text-white/70">Focus mantra</p>
								<p className="mt-2 text-white/80">Turn curiosity into progress 1 playful question at a time.</p>
							</div>
						</div>
					</div>
				</header>

				<section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
					{statCards.map((card) => (
						<div key={card.label} className="dashboard-card relative overflow-hidden rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg">
							<div className={`absolute inset-0 bg-gradient-to-br ${card.accent}`} style={{
								background: `linear-gradient(135deg, color-mix(in srgb, var(--dashboard-primary) 15%, transparent), color-mix(in srgb, var(--dashboard-primary) 5%, transparent), transparent)`
							}}></div>
							<div className="relative flex items-start justify-between gap-3">
								<div>
									<p className="text-xs font-semibold uppercase tracking-wide" style={{color: 'var(--dashboard-muted)'}}>{card.label}</p>
									<p className="mt-2 text-3xl font-semibold" style={{color: 'var(--dashboard-heading)'}}>{card.value}</p>
									<p className="mt-1 text-xs" style={{color: 'var(--dashboard-muted)'}}>{card.trend}</p>
								</div>
								<div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg}`}>
									{card.icon}
								</div>
							</div>
						</div>
					))}
				</section>

				<div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
					<div className="space-y-6">
						<section className="dashboard-card rounded-3xl p-6">
							<div className="mb-6 flex items-center justify-between">
								<div>
									<h2 className="text-lg font-semibold" style={{color: 'var(--dashboard-heading)'}}>Quick launchpad</h2>
									<p className="text-sm" style={{color: 'var(--dashboard-muted)'}}>Jump back into tools that keep your streak alive</p>
								</div>
								<span className="dashboard-pill rounded-full border px-3 py-1 text-xs">Recommended</span>
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								{quickActions.map((action) => (
									<Link key={action.title} href={action.href} className="group relative flex h-full flex-col gap-4 rounded-2xl border p-4 transition-all hover:-translate-y-1 hover:shadow-lg dashboard-card">
										<div className="absolute inset-0 rounded-2xl opacity-0 transition group-hover:opacity-100" style={{
											background: `linear-gradient(135deg, transparent, color-mix(in srgb, var(--dashboard-primary) 10%, transparent), color-mix(in srgb, var(--dashboard-primary) 20%, transparent))`
										}}></div>
										<div className="relative flex items-center gap-3">
											<div className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.iconBg}`}>
												{action.icon}
											</div>
											<div>
												<p className="font-semibold transition" style={{color: 'var(--dashboard-heading)'}}>{action.title}</p>
												<p className="text-xs" style={{color: 'var(--dashboard-muted)'}}>{action.description}</p>
											</div>
										</div>
										<div className="relative mt-auto flex items-center gap-2 text-xs font-semibold transition group-hover:translate-x-1" style={{color: 'var(--dashboard-primary)'}}>
											<span>Open</span>
											<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
												<path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h9M16.5 7.5v9M16.5 16.5h-9" />
											</svg>
										</div>
									</Link>
								))}
							</div>
						</section>

						<section className="dashboard-card rounded-3xl p-6">
							<div className="mb-6 flex items-center justify-between">
								<h2 className="text-lg font-semibold" style={{color: 'var(--dashboard-heading)'}}>Today&apos;s focus board</h2>
								<span className="text-xs" style={{color: 'var(--dashboard-muted)'}}>Curated for Akshat</span>
							</div>
							<ul className="space-y-4">
								{focusAreas.map((item) => (
									<li key={item.title} className="dashboard-card-muted rounded-2xl p-4">
										<div className="flex items-start justify-between gap-3">
											<div>
												<p className="text-sm font-semibold" style={{color: 'var(--dashboard-heading)'}}>{item.title}</p>
												<p className="mt-1 text-xs" style={{color: 'var(--dashboard-muted)'}}>{item.detail}</p>
											</div>
											<div className="flex gap-2">
												{item.tags.map((tag) => (
													<span key={tag} className="dashboard-pill rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide">
														{tag}
													</span>
												))}
											</div>
										</div>
									</li>
								))}
							</ul>
						</section>

						<section className="dashboard-card rounded-3xl p-6">
							<div className="mb-6 flex items-center justify-between">
								<h2 className="text-lg font-semibold" style={{color: 'var(--dashboard-heading)'}}>iGyanAI highlights</h2>
								<Link href="/dashboard/viva-ai" className="text-xs font-semibold hover:underline" style={{color: 'var(--dashboard-primary)'}}>View chat log</Link>
							</div>
							<ul className="space-y-4">
								{aiHighlights.map((highlight) => (
									<li key={highlight.title} className="dashboard-pill rounded-2xl border p-4">
										<p className="text-sm font-semibold" style={{color: 'var(--dashboard-heading)'}}>{highlight.title}</p>
										<p className="mt-1 text-xs" style={{color: 'var(--dashboard-muted)'}}>{highlight.detail}</p>
									</li>
								))}
							</ul>
						</section>
					</div>

					<div className="space-y-6">
						<section className="dashboard-card overflow-hidden rounded-3xl p-6">
							<div className="flex items-start gap-4">
								<div className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-semibold text-white" style={{
									background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`
								}}>
									{user.full_name
										?.split(" ")
										.map((n) => n[0])
										.join("")
										.toUpperCase() || "U"}
								</div>
								<div className="flex-1">
									<div className="flex items-start justify-between">
										<div>
											<p className="text-lg font-semibold" style={{color: 'var(--dashboard-heading)'}}>{user.full_name}</p>
											<p className="text-sm" style={{color: 'var(--dashboard-muted)'}}>{user.email}</p>
										</div>
										<span className="dashboard-pill rounded-full border px-3 py-1 text-xs font-semibold">
											{isB2CUser ? 'Launch Pad' : 'Pro learner mode'}
										</span>
									</div>
									<div className="mt-4 grid gap-3">
										<div className="flex items-center justify-between text-xs" style={{color: 'var(--dashboard-muted)'}}>
											<span>Role</span>
											<span className="font-semibold" style={{color: 'var(--dashboard-heading)'}}>
												{user.role === 'b2c_student' ? 'Student' :
												 user.role === 'b2c_mentor' ? 'Mentor' :
												 user.role === 'faculty' ? 'Faculty' :
												 user.role === 'super_admin' ? 'Super Admin' :
												 user.role === 'co_admin' ? 'Co-Admin' :
												 user.role === 'student' ? 'Student' : 'User'}
											</span>
										</div>
										<div className="flex items-center justify-between text-xs" style={{color: 'var(--dashboard-muted)'}}>
											<span>Member since</span>
											<span className="font-semibold" style={{color: 'var(--dashboard-heading)'}}>{new Date(user.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
										</div>
										{user.phone && (
											<div className="flex items-center justify-between text-xs" style={{color: 'var(--dashboard-muted)'}}>
												<span>Phone</span>
												<span className="font-semibold" style={{color: 'var(--dashboard-heading)'}}>{user.phone}</span>
											</div>
										)}
										{session && (
											<div className="flex items-center justify-between text-xs" style={{color: 'var(--dashboard-muted)'}}>
												<span>Device</span>
												<span className="font-semibold" style={{color: 'var(--dashboard-heading)'}}>{session.device_type}</span>
											</div>
										)}
									</div>
									<div className="mt-4 flex gap-2">
										<Link href="/features" className="flex-1 rounded-xl border px-4 py-2 text-center text-sm font-semibold transition" style={{
											borderColor: 'var(--dashboard-border)',
											color: 'var(--dashboard-text)'
										}}>Edit profile</Link>
										<Link href="/dashboard/viva-ai" className="dashboard-button flex-1 rounded-xl px-4 py-2 text-center text-sm font-semibold transition hover:shadow-lg">Resume AI chat</Link>
									</div>
								</div>
							</div>
						</section>

						<section className="dashboard-card rounded-3xl p-6">
							<div className="mb-6 flex items-center justify-between">
								<h2 className="text-lg font-semibold" style={{color: 'var(--dashboard-heading)'}}>Upcoming timeline</h2>
								<span className="text-xs" style={{color: 'var(--dashboard-muted)'}}>Stay prepped</span>
							</div>
							<ul className="space-y-4">
								{upcomingSessions.map((sessionItem) => (
									<li key={sessionItem.title} className="dashboard-card-muted flex items-start gap-3 rounded-2xl p-4">
										<div className="mt-1 h-2 w-2 rounded-full" style={{backgroundColor: 'var(--dashboard-primary)'}}></div>
										<div>
											<p className="text-xs font-semibold uppercase tracking-wide" style={{color: 'var(--dashboard-muted)'}}>{sessionItem.time}</p>
											<p className="mt-1 text-sm font-semibold" style={{color: 'var(--dashboard-heading)'}}>{sessionItem.title}</p>
											<p className="text-xs" style={{color: 'var(--dashboard-muted)'}}>{sessionItem.description}</p>
										</div>
									</li>
								))}
							</ul>
						</section>

						<section className="dashboard-pill rounded-3xl border p-6">
							<h2 className="text-lg font-semibold" style={{color: 'var(--dashboard-heading)'}}>Goal tracker</h2>
							<p className="mt-2 text-xs" style={{color: 'var(--dashboard-muted)'}}>You&apos;re 65% through this week&apos;s mission list. Celebrate small wins and log reflections with iGyanAI.</p>
							<div className="mt-4 h-2 w-full overflow-hidden rounded-full" style={{backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)'}}>
								<div className="h-full w-[65%] rounded-full" style={{backgroundColor: 'var(--dashboard-primary)'}}></div>
							</div>
							<div className="mt-4 flex items-center justify-between text-xs" style={{color: 'var(--dashboard-muted)'}}>
								<span>3 objectives remaining</span>
								<Link href="/dashboard/viva-ai" className="font-semibold hover:underline" style={{color: 'var(--dashboard-primary)'}}>Log progress</Link>
							</div>
						</section>
					</div>
				</div>
			</div>
		</div>
	);
}
