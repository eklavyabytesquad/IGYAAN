import Link from "next/link";
import Logo from "@/components/logo";

const courses = [
	{
		id: "ai-fundamentals",
		title: "AI Fundamentals",
		category: "Artificial Intelligence",
		description:
			"Master the core concepts of modern AI, from neural networks to prompt engineering, with hands-on labs.",
		progress: 68,
		nextLesson: "Module 5 · Building Reliable Agents",
		status: "In Progress",
		updatedAt: "Updated 2d ago",
	},
	{
		id: "python-data-pro",
		title: "Python for Data Pros",
		category: "Data Science",
		description:
			"Level up your Python stack for analytics by shipping ETL pipelines, dashboards, and ML-ready datasets.",
		progress: 42,
		nextLesson: "Module 3 · FastAPI for Data Apps",
		status: "Resume",
		updatedAt: "Updated 6h ago",
	},
	{
		id: "no-code-automation",
		title: "No-Code Automation Studio",
		category: "Productivity",
		description:
			"Automate business workflows with Zapier, Make, and native AI copilots—no engineering degree required.",
		progress: 12,
		nextLesson: "Module 1 · Mapping Automation Goals",
		status: "Explore",
		updatedAt: "New · Just Launched",
	},
	{
		id: "startup-ops",
		title: "Startup Ops Blueprint",
		category: "Leadership",
		description:
			"Design high-leverage operating systems for early-stage teams covering GTM, hiring, and investor updates.",
		progress: 85,
		nextLesson: "Capstone · GTM Automation",
		status: "Finishing",
		updatedAt: "Updated 5d ago",
	},
];

const statusVariants = {
	"In Progress": "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300",
	Resume: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
	Explore: "bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
	Finishing: "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300",
};

const progressTone = (value) => {
	if (value >= 80) return "from-emerald-400 to-emerald-600";
	if (value >= 50) return "from-indigo-400 to-indigo-600";
	return "from-sky-400 to-sky-600";
};

export default function MyCoursesPage() {
	return (
		<div className="min-h-full space-y-8 p-6 lg:p-10">
			<header className="space-y-3">
				<Logo variant="header" />
				<h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">
					Your Courses
				</h1>
				<p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
					Keep momentum with your active learning tracks. Pick up where you left
					off or dive into a fresh module.
				</p>
			</header>

			<section className="grid gap-6 xl:grid-cols-2">
				{courses.map((course) => (
					<article
						key={course.id}
						className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/80"
					>
						<div className="absolute inset-x-10 -top-24 h-56 rounded-full bg-indigo-500/10 blur-3xl transition-opacity group-hover:opacity-70" />
						<div className="flex items-center justify-between gap-3">
							<span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
								{course.category}
							</span>
							<span
								className={`rounded-full px-3 py-1 text-xs font-semibold ${
									statusVariants[course.status] || "bg-zinc-100 text-zinc-600"
								}`}
							>
								{course.status}
							</span>
						</div>

						<h2 className="mt-4 text-xl font-semibold text-zinc-900 transition-colors group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-300">
							{course.title}
						</h2>
						<p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
							{course.description}
						</p>

						<div className="mt-6 space-y-3">
							<div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
								<span>Progress</span>
								<span>{course.progress}%</span>
							</div>
							<div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-800">
								<div
									className={`h-full rounded-full bg-linear-to-r ${progressTone(
										course.progress
									)} transition-all`}
									style={{ width: `${course.progress}%` }}
								/>
							</div>
						</div>

						<div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
							<span className="flex items-center gap-2 font-medium text-zinc-700 dark:text-zinc-300">
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
										d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								{course.nextLesson}
							</span>
							<span className="text-xs text-zinc-500 dark:text-zinc-400">
								{course.updatedAt}
							</span>
						</div>

						<div className="mt-6 flex flex-wrap items-center gap-3">
							<Link
								href={`/courses/${course.id}`}
								className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-600 dark:bg-white dark:text-zinc-900 dark:hover:bg-indigo-300"
							>
								Continue
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
										d="M8.25 4.5l7.5 7.5-7.5 7.5"
									/>
								</svg>
							</Link>
							<Link
								href={`/courses/${course.id}/overview`}
								className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-500"
							>
								Overview
							</Link>
						</div>
					</article>
				))}
			</section>
		</div>
	);
}
