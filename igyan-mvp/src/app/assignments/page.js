"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Logo from "@/components/logo";

const assignmentsMock = [
	{
		id: "ml-systems-brief",
		title: "Designing ML System Brief",
		course: "AI Fundamentals",
		dueDate: "Nov 04, 2025",
		status: "In Progress",
		brief:
			"Draft a system design memo outlining data sources, guardrails, and evaluation loops for an enterprise ML assistant.",
		resources: [
			{
				label: "Problem Statement",
				url: "#",
			},
			{
				label: "Evaluation Template",
				url: "#",
			},
		],
		feedback: {
			type: "rubric",
			notes: "Focus on measurable KPIs and include fallback strategies for failure cases.",
		},
		submissions: [
			{
				version: 2,
				timestamp: "Oct 30, 10:12 AM",
				notes: "Updated guardrail section after mentor review.",
			},
			{
				version: 1,
				timestamp: "Oct 28, 5:41 PM",
				notes: "Initial outline submitted for early feedback.",
			},
		],
	},
	{
		id: "data-ops-quiz",
		title: "Data Ops Sprint Quiz",
		course: "Python for Data Pros",
		dueDate: "Oct 31, 2025",
		status: "Ready",
		brief:
			"Timed 35-minute assessment covering orchestration patterns and monitoring for ETL pipelines.",
		resources: [{ label: "Study Guide", url: "#" }],
		feedback: { type: "quiz", notes: "Scores released instantly with remediation plan." },
		submissions: [],
	},
	{
		id: "automation-case-study",
		title: "Automation Case Study",
		course: "No-Code Automation Studio",
		dueDate: "Nov 12, 2025",
		status: "Upcoming",
		brief:
			"Compose a portfolio-ready case study detailing business impact from an automation rollout.",
		resources: [{ label: "Case Study Template", url: "#" }],
		feedback: { type: "review", notes: "Instructor annotated PDF returned within 72h." },
		submissions: [],
	},
];

const statusTone = {
	"In Progress": "bg-linear-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-300",
	Ready: "bg-linear-to-r from-emerald-500/10 to-emerald-500/10 text-emerald-600 dark:text-emerald-300",
	Upcoming: "bg-linear-to-r from-sky-500/10 to-blue-500/10 text-sky-600 dark:text-sky-300",
	Overdue: "bg-linear-to-r from-rose-500/10 to-orange-500/10 text-rose-600 dark:text-rose-300",
};

export default function AssignmentsPage() {
	const [selectedId, setSelectedId] = useState(assignmentsMock[0]?.id ?? null);
	const [reminderLead, setReminderLead] = useState("24");
	const [isUploading, setIsUploading] = useState(false);

	const selectedAssignment = useMemo(
		() => assignmentsMock.find((item) => item.id === selectedId) ?? null,
		[selectedId]
	);

	const completionRate = useMemo(() => 72, []);
	const avgScore = useMemo(() => 88, []);
	const workloadHours = useMemo(() => 9, []);

	return (
		<div className="min-h-full space-y-10 p-6 lg:p-10">
			<header className="space-y-3">
				<Logo variant="header" />
				<h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">
					Assignments & Assessments
				</h1>
				<p className="max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
					Manage submissions, fire up timed assessments, and review coaching feedback in one workspace.
				</p>
			</header>

			<section className="grid gap-8 xl:grid-cols-[1.2fr_1fr]">
				<div className="space-y-6">
					<div className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
						<div className="flex items-center justify-between gap-4">
							<div>
								<h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
									Timeline
								</h2>
								<p className="text-xs text-zinc-500 dark:text-zinc-400">
									Track upcoming, active, and overdue assignments.
								</p>
							</div>
							<Link
								href="#"
								className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-500"
							>
								See calendar
							</Link>
						</div>
						<div className="mt-6 space-y-4">
							{assignmentsMock.map((assignment) => (
								<button
									key={assignment.id}
									onClick={() => setSelectedId(assignment.id)}
									className={`w-full rounded-2xl border p-4 text-left transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg ${
										selectedId === assignment.id
											? "border-indigo-300 bg-indigo-50/80 shadow-md dark:border-indigo-700/80 dark:bg-indigo-500/10"
											: "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
									}`}
								>
									<div className="flex flex-wrap items-center justify-between gap-3">
										<div>
											<p className="text-sm font-semibold text-zinc-900 dark:text-white">
												{assignment.title}
											</p>
											<p className="text-xs text-zinc-500 dark:text-zinc-400">
												{assignment.course}
											</p>
										</div>
										<span
											className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
												statusTone[assignment.status] || "bg-zinc-100 text-zinc-600"
											}`}
										>
											{assignment.status}
										</span>
									</div>
									<p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
										Due {assignment.dueDate}
									</p>
								</button>
							))}
						</div>
					</div>

					{selectedAssignment && (
						<div className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
							<div className="flex items-center justify-between gap-4">
								<div>
									<h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
										{selectedAssignment.title}
									</h2>
									<p className="text-xs text-zinc-500 dark:text-zinc-400">
										{selectedAssignment.course}
									</p>
								</div>
								<div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
									<span className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-2.5 py-1 font-medium dark:border-zinc-700">
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
										{selectedAssignment.dueDate}
									</span>
								</div>
							</div>

							<p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
								{selectedAssignment.brief}
							</p>

							<div className="mt-6 grid gap-4 md:grid-cols-2">
								<div className="rounded-2xl border border-dashed border-zinc-300 p-4 text-center dark:border-zinc-700">
									<p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
										Upload submission
									</p>
									<div className="mt-3 flex flex-col items-center justify-center gap-2">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="1.5"
											className="h-8 w-8 text-indigo-500"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M12 16.5V9.75m0 0l-3 3m3-3l3 3M6.75 19.5a4.5 4.5 0 01-1.03-8.876 5.25 5.25 0 0110.233-2.33 3 3 0 013.518 3.166 3.75 3.75 0 01-1.748 7.04"
											/>
										</svg>
										<label className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-zinc-900 dark:hover:bg-indigo-300">
											<input
												className="hidden"
												type="file"
												multiple
												onChange={() => {
													setIsUploading(true);
													setTimeout(() => setIsUploading(false), 1500);
												}}
											/>
											{isUploading ? "Uploading..." : "Upload attempt"}
										</label>
									</div>
									<p className="mt-3 text-[11px] text-zinc-500 dark:text-zinc-400">
										PDF, DOCX, slides, or video links. Auto-versioned for review.
									</p>
								</div>

								<div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
									<h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
										Resources & Notes
									</h3>
									<ul className="mt-3 space-y-2 text-sm">
										{selectedAssignment.resources.map((resource) => (
											<li key={resource.label}>
												<Link
													href={resource.url}
													className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-500 dark:text-indigo-300"
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
															d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
														/>
													</svg>
													{resource.label}
												</Link>
											</li>
										))}
									</ul>
									<div className="mt-4 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-300">
										<strong className="font-semibold">Feedback focus:</strong> {selectedAssignment.feedback.notes}
									</div>
									{selectedAssignment.feedback.type === "quiz" && (
										<button className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600">
											Launch timed test
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
										</button>
									)}
								</div>
							</div>

							<div className="mt-6 rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
								<h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
									Submission history
								</h3>
								<div className="mt-3 space-y-3">
									{selectedAssignment.submissions.length === 0 && (
										<p className="text-xs text-zinc-500 dark:text-zinc-400">
											No attempts yet. Upload to start version tracking.
										</p>
									)}
									{selectedAssignment.submissions.map((submission) => (
										<div
											key={submission.version}
											className="flex items-start justify-between rounded-xl border border-zinc-200 bg-white p-3 text-xs dark:border-zinc-700 dark:bg-zinc-800/70"
										>
											<div>
												<p className="font-semibold text-zinc-700 dark:text-zinc-200">
													Attempt #{submission.version}
												</p>
												<p className="text-[11px] text-zinc-500 dark:text-zinc-400">
													{submission.timestamp}
												</p>
												<p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
													{submission.notes}
												</p>
											</div>
											<button className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-3 py-1 font-medium text-zinc-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-indigo-500">
												Download
											</button>
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				</div>

				<div className="space-y-6">
					<div className="grid gap-4 md:grid-cols-3">
						<MetricCard label="Completion rate" value={`${completionRate}%`} trend="▲ 6%" trendTone="text-emerald-500" />
						<MetricCard label="Avg score" value={`${avgScore}`} trend="▲ 2" trendTone="text-indigo-500" />
						<MetricCard label="Workload" value={`${workloadHours}h`} trend="▼ 1h" trendTone="text-emerald-500" />
					</div>

					<div className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
						<h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
							Smart reminders
						</h2>
						<p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
							We’ll nudge you before deadlines and sync with your calendar.
						</p>
						<form className="mt-4 space-y-4 text-sm">
							<label className="block">
								<span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
									Reminder cadence
								</span>
								<select
									className="mt-1 w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm text-zinc-700 focus:border-indigo-400 focus:outline-none dark:border-zinc-700 dark:text-zinc-200"
									value={reminderLead}
									onChange={(event) => setReminderLead(event.target.value)}
								>
									<option value="1">1 hour before</option>
									<option value="6">6 hours before</option>
									<option value="12">12 hours before</option>
									<option value="24">1 day before</option>
									<option value="48">2 days before</option>
									<option value="72">3 days before</option>
								</select>
							</label>
							<div className="rounded-2xl bg-zinc-50 p-4 text-xs text-zinc-600 dark:bg-zinc-800/70 dark:text-zinc-300">
								We’ll email reminders and push updates to your connected Slack workspace.
							</div>
							<div className="flex flex-wrap items-center gap-3">
								<button
									type="button"
									className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-zinc-900 dark:hover:bg-indigo-300"
								>
									Save reminders
								</button>
								<button
									type="button"
									className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-500"
								>
									Sync calendar
								</button>
							</div>
						</form>
					</div>

					<div className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
						<h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
							AI Copilot boosts
						</h2>
						<p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
							Speed up drafting, self-review, and brainstorming.
						</p>
						<div className="mt-4 space-y-3 text-sm">
							<button className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-left font-medium text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-500">
								Generate outline
							</button>
							<button className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-left font-medium text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-500">
								Summarise brief
							</button>
							<button className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-left font-medium text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-500">
								Critique draft
							</button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}

function MetricCard({ label, value, trend, trendTone }) {
	return (
		<div className="rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm transition dark:border-zinc-800 dark:bg-zinc-900/80">
			<p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
				{label}
			</p>
			<p className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">
				{value}
			</p>
			<p className={`text-xs ${trendTone}`}>{trend}</p>
		</div>
	);
}
