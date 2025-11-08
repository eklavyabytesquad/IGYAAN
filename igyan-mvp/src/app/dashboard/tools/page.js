"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import Link from "next/link";

const TOOL_DEFINITIONS = [
	{
		id: "idea-generation",
		name: "Startup Idea Generator",
		description: "Generate innovative startup ideas based on your interests, market trends, and problem domains using AI.",
		icon: (
			<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
			</svg>
		),
		href: "/dashboard/tools/idea-generation",
		gradient: "from-purple-500 to-pink-500",
		bgGradient: "from-purple-50 to-pink-50",
		darkBgGradient: "dark:from-purple-900/20 dark:to-pink-900/20",
		category: "Innovation",
		badge: "Popular"
	},
	{
		id: "notes-generator",
		name: "Smart Notes Generator",
		description: "Transform any topic, lecture, or document into comprehensive, well-structured study notes with AI assistance.",
		icon: (
			<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
			</svg>
		),
		href: "/dashboard/tools/notes-generator",
		gradient: "from-blue-500 to-cyan-500",
		bgGradient: "from-blue-50 to-cyan-50",
		darkBgGradient: "dark:from-blue-900/20 dark:to-cyan-900/20",
		category: "Learning"
	},
	{
		id: "text-summarizer",
		name: "Text Summarizer",
		description: "Instantly condense long articles, documents, or content into clear, concise summaries while preserving key insights.",
		icon: (
			<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
			</svg>
		),
		href: "/dashboard/tools/text-summarizer",
		gradient: "from-emerald-500 to-teal-500",
		bgGradient: "from-emerald-50 to-teal-50",
		darkBgGradient: "dark:from-emerald-900/20 dark:to-teal-900/20",
		category: "Productivity",
		badge: "New"
	},
	{
		id: "step-by-step-guide",
		name: "Step-by-Step Guide",
		description: "Generate clear, actionable walkthroughs with milestones, tips, and resources tailored to any topic you choose.",
		icon: (
			<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h8m-8 6h16" />
			</svg>
		),
		href: "/dashboard/tools/step-by-step",
		gradient: "from-sky-500 to-blue-500",
		bgGradient: "from-sky-50 to-blue-50",
		darkBgGradient: "dark:from-sky-900/20 dark:to-blue-900/20",
		category: "Guidance",
		badge: "New"
	},
	{
		id: "project-learning",
		name: "Project-Based Learning",
		description: "Get personalized project recommendations based on your learning goals, skills, and interests for hands-on experience.",
		icon: (
			<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
			</svg>
		),
		href: "/dashboard/tools/project-learning",
		gradient: "from-amber-500 to-orange-500",
		bgGradient: "from-amber-50 to-orange-50",
		darkBgGradient: "dark:from-amber-900/20 dark:to-orange-900/20",
		category: "Learning",
		badge: "New"
	},
	{
		id: "quiz-me",
		name: "Quiz Me",
		description: "Test your knowledge with AI-generated quizzes. Get instant feedback with detailed explanations for each question.",
		icon: (
			<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
			</svg>
		),
		href: "/dashboard/tools/quiz-me",
		gradient: "from-violet-500 to-fuchsia-500",
		bgGradient: "from-violet-50 to-fuchsia-50",
		darkBgGradient: "dark:from-violet-900/20 dark:to-fuchsia-900/20",
		category: "Assessment",
		badge: "New"
	},
	{
		id: "code-tutor",
		name: "Code Tutor",
		description: "Interactive AI coding assistant that teaches programming in 14+ languages with syntax highlighting and real-time explanations.",
		icon: (
			<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
			</svg>
		),
		href: "/dashboard/tools/code-tutor",
		gradient: "from-indigo-500 to-violet-500",
		bgGradient: "from-indigo-50 to-violet-50",
		darkBgGradient: "dark:from-indigo-900/20 dark:to-violet-900/20",
		category: "Programming",
		badge: "New"
	},
	{
		id: "coming-soon-1",
		name: "Flashcard Creator",
		description: "Generate smart flashcards automatically from your notes and study materials for effective memorization.",
		icon: (
			<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
			</svg>
		),
		href: "#",
		gradient: "from-green-500 to-lime-500",
		bgGradient: "from-green-50 to-lime-50",
		darkBgGradient: "dark:from-green-900/20 dark:to-lime-900/20",
		category: "Learning",
		comingSoon: true
	},
	{
		id: "coming-soon-2",
		name: "Study Planner",
		description: "AI-powered study schedule generator that optimizes your learning time and maximizes retention.",
		icon: (
			<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
			</svg>
		),
		href: "#",
		gradient: "from-orange-500 to-red-500",
		bgGradient: "from-orange-50 to-red-50",
		darkBgGradient: "dark:from-orange-900/20 dark:to-red-900/20",
		category: "Planning",
		comingSoon: true
	},
	{
		id: "coming-soon-3",
		name: "Presentation Builder",
		description: "Convert your ideas into stunning presentations with AI-generated content and design.",
		icon: (
			<svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
			</svg>
		),
		href: "#",
		gradient: "from-pink-500 to-rose-500",
		bgGradient: "from-pink-50 to-rose-50",
		darkBgGradient: "dark:from-pink-900/20 dark:to-rose-900/20",
		category: "Content",
		comingSoon: true
	}
];

export default function ToolsPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [showActiveOnly, setShowActiveOnly] = useState(false);
	const [pinnedToolId, setPinnedToolId] = useState(null);

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const stored = window.localStorage.getItem("ai-tools-pinned");
		if (stored) {
			setPinnedToolId(stored);
		}
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;
		if (pinnedToolId) {
			window.localStorage.setItem("ai-tools-pinned", pinnedToolId);
		} else {
			window.localStorage.removeItem("ai-tools-pinned");
		}
	}, [pinnedToolId]);

	const tools = useMemo(() => TOOL_DEFINITIONS, []);
	const categories = useMemo(
		() => ["All", ...new Set(tools.map((tool) => tool.category))],
		[tools]
	);
	const activeToolCount = useMemo(
		() => tools.filter((tool) => !tool.comingSoon).length,
		[tools]
	);

	const filteredTools = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		return tools.filter((tool) => {
			const matchesCategory = selectedCategory === "All" || tool.category === selectedCategory;
			const matchesActive = !showActiveOnly || !tool.comingSoon;
			const matchesSearch =
				!term ||
				tool.name.toLowerCase().includes(term) ||
				tool.description.toLowerCase().includes(term);
			return matchesCategory && matchesActive && matchesSearch;
		});
	}, [searchTerm, selectedCategory, showActiveOnly, tools]);

	const orderedTools = useMemo(() => {
		const list = [...filteredTools];
		if (pinnedToolId) {
			const idx = list.findIndex((tool) => tool.id === pinnedToolId);
			if (idx >= 0) {
				const [pinned] = list.splice(idx, 1);
				list.unshift(pinned);
			}
		}
		return list;
	}, [filteredTools, pinnedToolId]);

	const filtersDirty = useMemo(
		() => searchTerm.trim() !== "" || selectedCategory !== "All" || showActiveOnly,
		[searchTerm, selectedCategory, showActiveOnly]
	);

	const handlePinToggle = (event, toolId) => {
		event.preventDefault();
		event.stopPropagation();
		setPinnedToolId((prev) => (prev === toolId ? null : toolId));
	};

	const handleResetFilters = () => {
		setSearchTerm("");
		setSelectedCategory("All");
		setShowActiveOnly(false);
	};

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen" style={{ backgroundColor: 'var(--dashboard-background)' }}>
			{/* Header Section */}
			<div className="border-b backdrop-blur-xl" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: 'var(--dashboard-surface-solid)' }}>
				<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
					<div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
						<div className="flex items-center gap-4">
							<div 
								className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-2xl ring-4"
								style={{ 
									background: 'var(--dashboard-primary)',
									ringColor: 'var(--dashboard-border)'
								}}
							>
								<svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
								</svg>
							</div>
							<div>
								<h1 
									className="text-4xl font-extrabold"
									style={{ color: 'var(--dashboard-heading)' }}
								>
									AI Tools Suite
								</h1>
								<p className="mt-2 text-lg" style={{ color: 'var(--dashboard-muted)' }}>
									Supercharge your productivity with intelligent AI assistants
								</p>
							</div>
						</div>
						<div 
							className="flex items-center gap-2 rounded-full border px-4 py-2"
							style={{ 
								borderColor: 'var(--dashboard-border)',
								backgroundColor: 'var(--dashboard-surface-solid)'
							}}
						>
							<div className="flex h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
							<span className="text-sm font-semibold" style={{ color: 'var(--dashboard-text)' }}>
								{activeToolCount} Tools Active
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
				<div className="rounded-3xl dashboard-card px-6 py-5 shadow-lg">
					<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
						<div className="relative w-full md:max-w-xl">
							<svg 
								className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" 
								fill="none" 
								viewBox="0 0 24 24" 
								stroke="currentColor"
								style={{ color: 'var(--dashboard-muted)' }}
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
							</svg>
							<input
								type="text"
								value={searchTerm}
								onChange={(event) => setSearchTerm(event.target.value)}
								placeholder="Search tools by name or description"
								className="w-full rounded-2xl border px-12 py-3 text-sm shadow-inner focus:ring-2"
								style={{
									borderColor: 'var(--dashboard-border)',
									backgroundColor: 'var(--dashboard-surface-solid)',
									color: 'var(--dashboard-text)'
								}}
							/>
						</div>
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
							<div className="flex items-center gap-2">
								<label className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--dashboard-muted)' }}>
									Category
								</label>
								<select
									value={selectedCategory}
									onChange={(event) => setSelectedCategory(event.target.value)}
									className="rounded-xl border px-4 py-2 text-sm font-medium focus:ring-2"
									style={{
										borderColor: 'var(--dashboard-border)',
										backgroundColor: 'var(--dashboard-surface-solid)',
										color: 'var(--dashboard-text)'
									}}
								>
									{categories.map((category) => (
										<option key={category} value={category}>
											{category}
										</option>
									))}
								</select>
							</div>
							<button
								onClick={() => setShowActiveOnly((prev) => !prev)}
								className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition"
								style={{
									borderColor: showActiveOnly ? 'var(--dashboard-primary)' : 'var(--dashboard-border)',
									backgroundColor: showActiveOnly ? 'var(--dashboard-surface-solid)' : 'transparent',
									color: showActiveOnly ? 'var(--dashboard-primary)' : 'var(--dashboard-text)'
								}}
							>
								<span className="flex h-2 w-2 rounded-full bg-green-500"></span>
								Active Only
							</button>
							<button
								onClick={handleResetFilters}
								disabled={!filtersDirty}
								className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
								style={{
									borderColor: 'var(--dashboard-border)',
									color: 'var(--dashboard-muted)'
								}}
							>
								<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582M20 20v-5h-.581M5 9a7.005 7.005 0 0110.95-5.95M19 15a7.004 7.004 0 01-10.95 5.95" />
								</svg>
								Reset
							</button>
						</div>
					</div>
				</div>
			</div>

			{/* Tools Grid */}
			<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{orderedTools.length > 0 ? (
						orderedTools.map((tool) => (
							<Link
								key={tool.id}
								href={tool.comingSoon ? "#" : tool.href}
								className={`group relative overflow-hidden rounded-2xl dashboard-card p-6 shadow-md transition-all duration-300 ${
									tool.comingSoon
										? "cursor-not-allowed opacity-75"
										: "hover:-translate-y-2 hover:shadow-xl"
								}`}
								onClick={(event) => tool.comingSoon && event.preventDefault()}
							>
								<button
									onClick={(event) => handlePinToggle(event, tool.id)}
									className="absolute left-4 top-4 z-20 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition"
									style={{
										borderColor: pinnedToolId === tool.id ? '#f59e0b' : 'var(--dashboard-border)',
										backgroundColor: pinnedToolId === tool.id ? '#fef3c7' : 'var(--dashboard-surface-solid)',
										color: pinnedToolId === tool.id ? '#b45309' : 'var(--dashboard-muted)'
									}}
									aria-label={pinnedToolId === tool.id ? "Unpin tool" : "Pin tool"}
								>
									<svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={pinnedToolId === tool.id ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
										<path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.75.75 0 011.04 0l2.122 2.122a.75.75 0 01-.53 1.28h-.396l2.72 5.44a.75.75 0 01-.67 1.09h-3.25l-.001 5.872a.75.75 0 01-1.5 0l.001-5.873H7.33a.75.75 0 01-.67-1.09l2.72-5.44h-.396a.75.75 0 01-.53-1.28l2.122-2.122z" />
									</svg>
									<span>{pinnedToolId === tool.id ? "Pinned" : "Pin"}</span>
								</button>

								<div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'var(--dashboard-primary)', opacity: 0.05 }}></div>

								<div className="relative z-10">
									<div 
										className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-105"
										style={{ background: 'var(--dashboard-primary)' }}
									>
										{tool.icon}
									</div>
									<div className="mb-3 flex items-center gap-2">
										<span 
											className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide"
											style={{ 
												backgroundColor: 'var(--dashboard-surface-solid)',
												color: 'var(--dashboard-muted)'
											}}
										>
											{tool.category}
										</span>
										{tool.badge && !tool.comingSoon && (
											<span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ${
												tool.badge === "Popular"
													? "bg-yellow-200 text-yellow-800"
													: "bg-green-200 text-green-800"
											}`}
											>
												{tool.badge}
											</span>
										)}
									</div>
									<h3 
										className="text-xl font-bold transition duration-300"
										style={{ color: 'var(--dashboard-heading)' }}
									>
										{tool.name}
									</h3>
									<p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--dashboard-text)' }}>
										{tool.description}
									</p>
									{tool.comingSoon ? (
										<div 
											className="mt-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
											style={{
												borderColor: '#fbbf24',
												backgroundColor: '#fef3c7',
												color: '#b45309'
											}}
										>
											<span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
											In Development
										</div>
									) : (
										<div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold transition group-hover:translate-x-1" style={{ color: 'var(--dashboard-primary)' }}>
											<span>Launch Tool</span>
											<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
											</svg>
										</div>
									)}
								</div>
							</Link>
						))
					) : (
						<div className="sm:col-span-2 lg:col-span-3">
							<div className="flex flex-col items-center justify-center rounded-3xl dashboard-card px-8 py-16 text-center">
								<svg className="mb-4 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--dashboard-primary)' }}>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M5.07 19H18.93c1.54 0 2.52-1.67 1.74-3L13.74 4c-.77-1.33-2.7-1.33-3.47 0L3.33 16c-.78 1.33.2 3 1.74 3z" />
								</svg>
								<h3 className="text-lg font-semibold" style={{ color: 'var(--dashboard-heading)' }}>No tools match your filters</h3>
								<p className="mt-1 text-sm" style={{ color: 'var(--dashboard-muted)' }}>Try adjusting your filters or clearing them to see all tools.</p>
							</div>
						</div>
					)}
				</div>

				{/* Info Section */}
				<div className="mt-14 grid gap-6 md:grid-cols-2">
					<div className="rounded-3xl border-2 border-indigo-200 bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 p-8 shadow-xl dark:border-indigo-800 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
						<div className="flex items-start gap-4">
							<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
								<svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div>
								<h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">AI-Powered Excellence</h3>
								<p className="leading-relaxed text-slate-600 dark:text-slate-400">
									Our tools leverage cutting-edge AI technology to provide intelligent, personalized assistance. Perfect for students, educators, and entrepreneurs looking to maximize productivity.
								</p>
							</div>
						</div>
					</div>

					<div className="rounded-3xl border-2 border-emerald-200 bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8 shadow-xl dark:border-emerald-800 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950">
						<div className="flex items-start gap-4">
							<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
								<svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
								</svg>
							</div>
							<div>
								<h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">Always Improving</h3>
								<p className="leading-relaxed text-slate-600 dark:text-slate-400">
									New tools are added regularly based on user feedback. Have a suggestion? We're constantly evolving to meet your needs and provide the best experience.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
