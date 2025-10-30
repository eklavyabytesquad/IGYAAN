"use client";

const metrics = [
	{ label: "Learning velocity", value: "18h", trend: "▲ 12% vs last month", tone: "text-emerald-500" },
	{ label: "Average score", value: "92", trend: "▲ 3 pts", tone: "text-indigo-500" },
	{ label: "Completion streak", value: "11 days", trend: "● steady", tone: "text-zinc-500" },
];

const weeklyVelocity = [
	{ week: "Oct 1-7", hours: 9, target: 8 },
	{ week: "Oct 8-14", hours: 11, target: 9 },
	{ week: "Oct 15-21", hours: 7, target: 9 },
	{ week: "Oct 22-28", hours: 10, target: 10 },
	{ week: "Oct 29-Nov 4", hours: 12, target: 10 },
];

const scoreDistribution = [
	{ course: "AI Fundamentals", score: 94, percentile: 89 },
	{ course: "Python for Data Pros", score: 88, percentile: 82 },
	{ course: "No-Code Automation", score: 91, percentile: 87 },
	{ course: "Startup Ops Blueprint", score: 96, percentile: 92 },
];

const skillScores = [
	{ skill: "AI Systems", score: 86, delta: "▲ 5" },
	{ skill: "Data Ops", score: 82, delta: "▲ 3" },
	{ skill: "Automation", score: 90, delta: "▲ 4" },
	{ skill: "Leadership", score: 78, delta: "▲ 2" },
];

const milestones = [
	{
		title: "Build AI Copilot MVP",
		status: "In Review",
		description: "Awaiting mentor sign-off on deployment checklist.",
	},
	{
		title: "Automation Specialist Badge",
		status: "Complete",
		description: "Earned Oct 18 after delivering automation case study.",
	},
	{
		title: "Data Reliability Certification",
		status: "Next",
		description: "Complete remaining quiz and peer review to qualify.",
	},
];

const benchmarking = [
	{
		title: "Top quartile",
		detail: "You rank in the 78th percentile for applied AI labs versus your cohort.",
	},
	{
		title: "Focus area",
		detail: "Leadership simulation scores trail cohort average by 6 points.",
	},
	{
		title: "Goal alignment",
		detail: "Tracking 92% of your quarterly learning objective, on pace to finish early.",
	},
];

const nudges = [
	"Schedule a 20-minute mentor sync to review the ML system brief feedback.",
	"Revisit leadership simulations to close the six-point gap this week.",
	"Lock a calendar block for the Data Ops quiz retake by Friday.",
];

const feedbackHighlights = [
	{
		source: "Mentor Priya",
		quote: "Strong automation narrative. Add quantifiable ROI to elevate the case study to exec-ready.",
	},
	{
		source: "AI Copilot critique",
		quote: "Prompt clarity improved by 30%. Continue using the structured rubric before submission.",
	},
	{
		source: "Peer review",
		quote: "Loved the sandbox demos. Consider a short video walkthrough to boost engagement.",
	},
];

const monthlyReport = {
	month: "October 2025",
	summary: "High-output sprint with consistent study cadence and strong assessment outcomes.",
	callouts: [
		"Logged 42 learning hours across five projects",
		"Closed two major milestones and cleared three micro-badges",
		"Average assignment score landed at 92 with faster feedback loops",
	],
	recSnapshot: "Focus on leadership labs and prepare for Data Reliability certification exam in November.",
};

const examsReport = [
	{
		exam: "Data Ops Sprint Quiz",
		date: "Oct 26, 2025",
		score: "88",
		status: "Passed",
		next: "Optional retake available Nov 02",
	},
	{
		exam: "AI Architecture Lab",
		date: "Oct 14, 2025",
		score: "95",
		status: "Passed",
		next: "Review mentor annotations for advanced badge",
	},
	{
		exam: "Leadership Simulation",
		date: "Oct 05, 2025",
		score: "81",
		status: "Passed",
		next: "Scheduled improvement sprint Nov 08",
	},
];

export default function PerformancePage() {
	return (
		<div className="min-h-full space-y-10 p-6 lg:p-10">
			<header className="space-y-2">
				<h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">
					Performance intelligence
				</h1>
				<p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
					Monitor learning velocity, exam outcomes, and growth signals to stay ahead of your cohort.
				</p>
			</header>

			<section className="grid gap-4 md:grid-cols-3">
				{metrics.map((metric) => (
					<MetricCard key={metric.label} {...metric} />
				))}
			</section>

			<section className="grid gap-8 xl:grid-cols-[1.2fr_1fr]">
				<div className="space-y-8">
					<Card title="Learning velocity" subtitle="Hours invested vs. target per sprint">
						<VelocityChart data={weeklyVelocity} />
					</Card>

					<Card title="Milestone tracker" subtitle="What you have completed and what's next">
						<div className="space-y-4">
							{milestones.map((milestone) => (
								<div
									key={milestone.title}
									className="rounded-2xl border border-zinc-200 bg-white/90 p-4 dark:border-zinc-700 dark:bg-zinc-800/70"
								>
									<p className="text-sm font-semibold text-zinc-900 dark:text-white">
										{milestone.title}
									</p>
									<p className="mt-1 inline-flex rounded-full bg-linear-to-r from-indigo-500/10 to-purple-500/10 px-3 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-300">
										{milestone.status}
									</p>
									<p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
										{milestone.description}
									</p>
								</div>
							))}
						</div>
					</Card>

					<Card title="Benchmark insights" subtitle="Where you stand vs. goals and cohort">
						<ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
							{benchmarking.map((item) => (
								<li key={item.title} className="rounded-2xl border border-zinc-200 bg-white/90 px-3 py-3 dark:border-zinc-700 dark:bg-zinc-800/70">
									<p className="font-semibold text-zinc-900 dark:text-white">{item.title}</p>
									<p className="text-xs text-zinc-500 dark:text-zinc-400">{item.detail}</p>
								</li>
							))}
						</ul>
					</Card>
				</div>

				<div className="space-y-8">
					<Card title="Score distribution" subtitle="Course grades & positioning">
						<div className="space-y-4">
							{scoreDistribution.map((score) => (
								<div key={score.course} className="rounded-2xl border border-zinc-200 bg-white/90 p-4 text-sm dark:border-zinc-700 dark:bg-zinc-800/70">
									<p className="font-semibold text-zinc-900 dark:text-white">{score.course}</p>
									<div className="mt-3 flex items-center justify-between">
										<ProgressBar value={score.score} />
										<span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300">{score.score}</span>
									</div>
									<p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">Percentile {score.percentile}</p>
								</div>
							))}
						</div>
					</Card>

					<Card title="Skill radar" subtitle="Competency trends vs. last month">
						<div className="space-y-3">
							{skillScores.map((skill) => (
								<div key={skill.skill} className="rounded-2xl border border-zinc-200 bg-white/90 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800/70">
									<div className="flex items-center justify-between">
										<p className="font-semibold text-zinc-900 dark:text-white">{skill.skill}</p>
										<span className="text-xs text-emerald-500">{skill.delta}</span>
									</div>
									<ProgressBar value={skill.score} tone="emerald" />
								</div>
							))}
						</div>
					</Card>

					<Card title="Monthly report" subtitle={monthlyReport.month}>
						<p className="text-sm text-zinc-600 dark:text-zinc-300">{monthlyReport.summary}</p>
						<ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
							{monthlyReport.callouts.map((callout) => (
								<li key={callout} className="flex items-start gap-2">
									<span className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
									<span>{callout}</span>
								</li>
							))}
						</ul>
						<div className="mt-4 rounded-2xl bg-zinc-50 p-4 text-xs text-zinc-500 dark:bg-zinc-800/70 dark:text-zinc-300">
							<strong className="font-semibold text-zinc-700 dark:text-white">Next focus:</strong> {monthlyReport.recSnapshot}
						</div>
						<div className="mt-4 flex flex-wrap gap-3 text-xs">
							<button className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 font-semibold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-zinc-900 dark:hover:bg-indigo-300">
								Download PDF
							</button>
							<button className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 font-semibold text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-500">
								Share to Slack
							</button>
						</div>
					</Card>
				</div>
			</section>

			<section className="grid gap-8 xl:grid-cols-[1fr_1fr]">
				<Card title="Actionable nudges" subtitle="Quick wins for the coming week">
					<ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
						{nudges.map((nudge) => (
							<li key={nudge} className="rounded-2xl border border-zinc-200 bg-white/90 px-3 py-3 dark:border-zinc-700 dark:bg-zinc-800/70">
								{nudge}
							</li>
						))}
					</ul>
				</Card>

				<Card title="Feedback highlights" subtitle="Signals to double down on">
					<ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
						{feedbackHighlights.map((item) => (
							<li key={item.source} className="rounded-2xl border border-zinc-200 bg-white/90 px-3 py-3 dark:border-zinc-700 dark:bg-zinc-800/70">
								<p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">{item.source}</p>
								<p className="mt-1 text-sm">“{item.quote}”</p>
							</li>
						))}
					</ul>
				</Card>
			</section>

			<Card title="Exams report" subtitle="Latest assessment outcomes">
				<div className="overflow-x-auto">
					<table className="w-full min-w-md text-sm">
						<thead className="text-left text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
							<tr>
								<th className="pb-3">Exam</th>
								<th className="pb-3">Date</th>
								<th className="pb-3">Score</th>
								<th className="pb-3">Status</th>
								<th className="pb-3">Next step</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
							{examsReport.map((exam) => (
								<tr key={exam.exam} className="text-sm text-zinc-600 dark:text-zinc-300">
									<td className="py-3 font-semibold text-zinc-900 dark:text-white">{exam.exam}</td>
									<td className="py-3">{exam.date}</td>
									<td className="py-3">{exam.score}</td>
									<td className="py-3">
										<span className="rounded-full bg-linear-to-r from-emerald-500/10 to-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
											{exam.status}
										</span>
									</td>
									<td className="py-3 text-xs text-zinc-500 dark:text-zinc-400">{exam.next}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="mt-4 flex flex-wrap gap-3 text-xs">
					<button className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 font-semibold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-zinc-900 dark:hover:bg-indigo-300">
						Export CSV
					</button>
					<button className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 font-semibold text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-500">
						Notify mentor
					</button>
				</div>
			</Card>
		</div>
	);
}

function MetricCard({ label, value, trend, tone }) {
	return (
		<div className="rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm transition dark:border-zinc-800 dark:bg-zinc-900/80">
			<p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
				{label}
			</p>
			<p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">{value}</p>
			<p className={`text-xs ${tone}`}>{trend}</p>
		</div>
	);
}

function Card({ title, subtitle, children }) {
	return (
		<section className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
			<div className="space-y-1">
				<h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h2>
				{subtitle ? (
					<p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
				) : null}
			</div>
			<div className="mt-5 space-y-4">{children}</div>
		</section>
	);
}

function VelocityChart({ data }) {
	const maxHours = Math.max(...data.map((item) => item.hours), 1);
	return (
		<div className="space-y-4">
			{data.map((item) => (
				<div key={item.week} className="space-y-2">
					<div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
						<span>{item.week}</span>
						<span>{item.hours}h</span>
					</div>
					<div className="relative h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800">
						<div
							className="absolute inset-y-1 left-1 rounded-2xl bg-linear-to-r from-indigo-400 to-indigo-600 dark:from-indigo-500 dark:to-indigo-400"
							style={{ width: `${(item.hours / maxHours) * 100}%` }}
						/>
						<div
							className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300"
						>
							Target {item.target}h
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

function ProgressBar({ value, tone = "indigo" }) {
	const gradient = tone === "emerald" ? "from-emerald-400 to-emerald-600" : "from-indigo-400 to-indigo-600";
	return (
		<div className="h-2.5 flex-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
			<div
				className={`h-full rounded-full bg-linear-to-r ${gradient}`}
				style={{ width: `${value}%` }}
			/>
		</div>
	);
}
