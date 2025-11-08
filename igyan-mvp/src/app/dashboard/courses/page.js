"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const coursesData = [
	{
		id: "base-layer",
		title: "Base Layer",
		category: "Foundation",
		description: "Essential life skills, financial literacy, decision-making, and career fundamentals for students.",
		thumbnail: "🎯",
		modules: [
			{
				id: 1,
				title: "Main Content PDF",
				type: "pdf",
				duration: "Complete Guide",
			},
			{
				id: 2,
				title: "Mind Map PDF",
				type: "pdf",
				duration: "Visual Overview",
			},
			{
				id: 3,
				title: "Video Course",
				type: "video",
				duration: "Full Tutorial",
			},
		],
		languages: ["english", "hindi"],
	},
	{
		id: "everyday-tech",
		title: "Everyday Tech",
		category: "Technology",
		description: "Master everyday technology tools, digital literacy, and essential tech skills for modern life.",
		thumbnail: "💻",
		modules: [
			{
				id: 1,
				title: "Main Content PDF",
				type: "pdf",
				duration: "Complete Guide",
			},
			{
				id: 2,
				title: "Mind Map PDF",
				type: "pdf",
				duration: "Visual Overview",
			},
			{
				id: 3,
				title: "Video Course",
				type: "video",
				duration: "Full Tutorial",
			},
		],
		languages: ["english", "hindi"],
	},
	{
		id: "hustle-and-earn",
		title: "Hustle and Earn",
		category: "Entrepreneurship",
		description: "Learn freelancing, side hustles, monetization strategies, and building income streams.",
		thumbnail: "💰",
		modules: [
			{
				id: 1,
				title: "Main Content PDF",
				type: "pdf",
				duration: "Complete Guide",
			},
			{
				id: 2,
				title: "Mind Map PDF",
				type: "pdf",
				duration: "Visual Overview",
			},
			{
				id: 3,
				title: "Video Course",
				type: "video",
				duration: "Full Tutorial",
			},
		],
		languages: ["english", "hindi"],
	},
	{
		id: "professional-edge",
		title: "Professional Edge",
		category: "Career Development",
		description: "Communication skills, networking, resume building, and professional development essentials.",
		thumbnail: "👔",
		modules: [
			{
				id: 1,
				title: "Main Content PDF",
				type: "pdf",
				duration: "Complete Guide",
			},
			{
				id: 2,
				title: "Mind Map PDF",
				type: "pdf",
				duration: "Visual Overview",
			},
			{
				id: 3,
				title: "Video Course",
				type: "video",
				duration: "Full Tutorial",
			},
		],
		languages: ["english", "hindi"],
	},
];

const categoryColors = {
	Foundation: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
	Technology: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300",
	Entrepreneurship: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
	"Career Development": "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300",
};

export default function CoursesPage() {
	const router = useRouter();
	const [selectedLanguage, setSelectedLanguage] = useState("english");
	const [searchQuery, setSearchQuery] = useState("");

	const filteredCourses = coursesData.filter((course) =>
		course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
		course.description.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const handleCourseClick = (courseId) => {
		router.push(`/dashboard/courses/${courseId}?lang=${selectedLanguage}`);
	};

	return (
		<div className="min-h-screen p-6 lg:p-10" style={{ backgroundColor: 'var(--dashboard-background)' }}>
			<div className="mx-auto max-w-7xl space-y-8">
				{/* Header Section */}
				<header className="space-y-6">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
						<div className="space-y-2">
							<h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--dashboard-heading)' }}>
								Explore Courses
							</h1>
							<p className="text-lg" style={{ color: 'var(--dashboard-muted)' }}>
								Transform your skills with our comprehensive learning paths
							</p>
						</div>

						{/* Language Selector */}
						<div className="flex items-center gap-2 rounded-2xl dashboard-card p-1.5 shadow-sm">
							<button
								onClick={() => setSelectedLanguage("english")}
								className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all"
								style={
									selectedLanguage === "english"
										? { backgroundColor: 'var(--dashboard-primary)', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }
										: { color: 'var(--dashboard-muted)' }
								}
							>
								🇬🇧 English
							</button>
							<button
								onClick={() => setSelectedLanguage("hindi")}
								className="rounded-xl px-6 py-2.5 text-sm font-semibold transition-all"
								style={
									selectedLanguage === "hindi"
										? { backgroundColor: 'var(--dashboard-primary)', color: 'white', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }
										: { color: 'var(--dashboard-muted)' }
								}
							>
								🇮🇳 हिंदी
							</button>
						</div>
					</div>

					{/* Search Bar */}
					<div className="relative">
						<input
							type="text"
							placeholder="Search courses..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full rounded-2xl border px-6 py-4 pl-12 shadow-sm transition-all focus:outline-none focus:ring-4"
							style={{
								borderColor: 'var(--dashboard-border)',
								backgroundColor: 'var(--dashboard-surface-solid)',
								color: 'var(--dashboard-text)'
							}}
						/>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={2}
							stroke="currentColor"
							className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2"
							style={{ color: 'var(--dashboard-muted)' }}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
							/>
						</svg>
					</div>
				</header>

				{/* Courses Grid */}
				<section className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
					{filteredCourses.map((course) => (
						<article
							key={course.id}
							onClick={() => handleCourseClick(course.id)}
							className="group relative cursor-pointer overflow-hidden rounded-3xl dashboard-card shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl"
						>
							{/* Gradient Background */}
							<div className="absolute inset-x-0 -top-32 h-64 blur-3xl transition-opacity" style={{ background: 'var(--dashboard-primary)', opacity: 0.1 }} />

							<div className="relative p-8 space-y-6">
								{/* Header */}
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-4">
										<div 
											className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-lg"
											style={{ background: 'var(--dashboard-primary)', color: 'white' }}
										>
											{course.thumbnail}
										</div>
										<div>
											<h2 className="text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
												{course.title}
											</h2>
											<span
												className="mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold"
												style={{ 
													backgroundColor: 'var(--dashboard-surface-solid)', 
													color: 'var(--dashboard-primary)' 
												}}
											>
												{course.category}
											</span>
										</div>
									</div>
								</div>

								{/* Description */}
								<p className="text-sm leading-relaxed" style={{ color: 'var(--dashboard-text)' }}>
									{course.description}
								</p>

								{/* Modules */}
								<div className="space-y-3">
									<h3 className="text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
										Course Modules:
									</h3>
									<div className="space-y-2">
										{course.modules.map((module) => (
											<div
												key={module.id}
												className="flex items-center justify-between rounded-xl border p-3"
												style={{ 
													borderColor: 'var(--dashboard-border)',
													backgroundColor: 'var(--dashboard-surface-solid)'
												}}
											>
												<div className="flex items-center gap-3">
													<div 
														className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
														style={{ 
															backgroundColor: 'var(--dashboard-surface-solid)',
															color: 'var(--dashboard-primary)'
														}}
													>
														{module.id}
													</div>
													<div>
														<p className="text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
															{module.title}
														</p>
														<p className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>
															{module.id === 1 && "📄 PDF"}
															{module.id === 2 && "🗺️ PDF"}
															{module.id === 3 && "🎥 Video"}
															{" · "}
															{module.duration}
														</p>
													</div>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* CTA Button */}
								<button 
									className="w-full rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
									style={{ background: 'var(--dashboard-primary)' }}
								>
									Start Learning →
								</button>

								{/* Language Availability */}
								<div className="flex items-center justify-center gap-2 pt-2">
									<span className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>
										Available in:
									</span>
									{course.languages.includes("english") && (
										<span className="text-xs">🇬🇧 English</span>
									)}
									{course.languages.includes("hindi") && (
										<span className="text-xs">🇮🇳 हिंदी</span>
									)}
								</div>
							</div>
						</article>
					))}
				</section>

				{/* No Results */}
				{filteredCourses.length === 0 && (
					<div className="flex flex-col items-center justify-center py-20 text-center">
						<div className="text-6xl mb-4">🔍</div>
						<h3 className="text-xl font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
							No courses found
						</h3>
						<p className="mt-2" style={{ color: 'var(--dashboard-muted)' }}>
							Try adjusting your search terms
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
