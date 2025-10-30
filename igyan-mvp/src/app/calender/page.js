"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const calendarEvents = [
	{
		id: "ai-quiz",
		type: "assessment",
		title: "Data Ops Quiz",
		date: "2025-11-03",
		course: "Python for Data Pros",
		context: "Timed 35-minute sprint assessment.",
	},
	{
		id: "mentor-review",
		type: "mentor",
		title: "Mentor sync · ML Brief",
		date: "2025-11-05",
		course: "AI Fundamentals",
		context: "Walk through feedback and revise guardrails.",
	},
	{
		id: "assignment-due",
		type: "assignment",
		title: "Automation Case Study due",
		date: "2025-11-12",
		course: "No-Code Automation Studio",
		context: "Final narrative upload due by 11:59 PM.",
	},
	{
		id: "study-block",
		type: "study",
		title: "Deep work · Leadership sim",
		date: "2025-11-07",
		timeRange: "7:30 PM · 2h",
		course: "Startup Ops Blueprint",
		context: "Practice negotiation scenarios.",
	},
	{
		id: "ai-lab",
		type: "lab",
		title: "AI Lab Run",
		date: "2025-11-15",
		timeRange: "10:00 AM",
		course: "AI Fundamentals",
		context: "Deploy MVP agent to staging.",
	},
	{
		id: "review-session",
		type: "study",
		title: "Review analytics",
		date: "2025-11-10",
		timeRange: "6:00 PM",
		course: "Python for Data Pros",
		context: "Prep for cohort benchmarking call.",
	},
];

const typeTone = {
	assignment: "bg-linear-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-300",
	assessment: "bg-linear-to-r from-rose-500/10 to-orange-500/10 text-rose-600 dark:text-rose-300",
	mentor: "bg-linear-to-r from-emerald-500/10 to-emerald-500/10 text-emerald-600 dark:text-emerald-300",
	study: "bg-linear-to-r from-sky-500/10 to-blue-500/10 text-sky-600 dark:text-sky-300",
	lab: "bg-linear-to-r from-amber-500/10 to-yellow-500/10 text-amber-600 dark:text-amber-300",
};

const views = ["Month", "Week", "Agenda"];

export default function CalendarPage() {
	const [view, setView] = useState("Month");
	const [activeDate, setActiveDate] = useState(new Date("2025-11-01"));
	const [selectedEventId, setSelectedEventId] = useState(calendarEvents[0]?.id ?? null);
	const [filter, setFilter] = useState("all");

	const monthMatrix = useMemo(() => buildMonthMatrix(activeDate), [activeDate]);
	const eventMap = useMemo(() => buildEventMap(calendarEvents, filter), [filter]);
	const selectedEvent = useMemo(
		() => calendarEvents.find((event) => event.id === selectedEventId) ?? null,
		[selectedEventId]
	);

	return (
		<div className="min-h-full space-y-10 p-6 lg:p-10">
			<header className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
				<div>
					<h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">Learning calendar</h1>
					<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
						Plot deadlines, study blocks, and mentor sessions on one interactive view.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					{views.map((item) => (
						<button
							key={item}
							onClick={() => setView(item)}
							className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
								view === item
									? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
									: "border border-zinc-300 text-zinc-700 hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-500"
							}`}
						>
							{item}
						</button>
					))}
				</div>
			</header>

			<section className="grid gap-8 xl:grid-cols-[1.1fr_0.6fr]">
				<div className="space-y-6">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div className="flex items-center gap-3">
							<button
								onClick={() => setActiveDate(offsetMonth(activeDate, -1))}
								className="rounded-full border border-zinc-200 p-2 text-zinc-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-500"
								title="Previous month"
							>
								<ArrowLeftIcon />
							</button>
							<div className="text-left">
								<p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Current view</p>
								<p className="text-xl font-semibold text-zinc-900 dark:text-white">
									{formatMonthYear(activeDate)}
								</p>
							</div>
							<button
								onClick={() => setActiveDate(offsetMonth(activeDate, 1))}
								className="rounded-full border border-zinc-200 p-2 text-zinc-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-500"
								title="Next month"
							>
								<ArrowRightIcon />
							</button>
						</div>
						<button
							onClick={() => setActiveDate(new Date())}
							className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-indigo-500"
						>
							Today
						</button>
					</div>

					<div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white/80 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
						<table className="hidden min-w-full table-fixed text-sm text-zinc-600 dark:text-zinc-300 lg:table">
							<thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-800/60 dark:text-zinc-400">
								<tr>
									{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
										<th key={day} className="px-4 py-3 text-left">
											{day}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{monthMatrix.map((week, index) => (
									<tr key={index} className="border-t border-zinc-100 dark:border-zinc-800">
										{week.map((day) => (
											<td
												key={day.dateKey}
												className={`align-top px-4 py-3 transition ${
													day.isCurrentMonth
														? "bg-white dark:bg-transparent"
														: "bg-zinc-50/80 text-zinc-400 dark:bg-zinc-900/40 dark:text-zinc-600"
												}`}>
													<div className="flex items-center justify-between gap-2">
														<button
															onClick={() => setSelectedEventId(firstEventId(eventMap[day.dateKey]))}
															className={`h-8 w-8 rounded-full text-xs font-semibold transition ${
																isToday(day.date)
																? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
																: "hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
															}`}
														>
															{day.date.getDate()}
														</button>
													</div>
													<div className="mt-3 space-y-2">
														{eventMap[day.dateKey]?.map((event) => (
															<button
																key={event.id}
																onClick={() => setSelectedEventId(event.id)}
																className={`block w-full rounded-xl px-3 py-2 text-left text-xs font-semibold transition hover:border-indigo-300 hover:shadow ${
																	typeTone[event.type] || "bg-zinc-100 text-zinc-700"
																}
																${selectedEventId === event.id ? "ring-2 ring-indigo-400" : ""}`}
															>
																{event.title}
															</button>
														))}
													</div>
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>

						{/* Mobile agenda */}
						<div className="grid gap-3 p-4 text-sm text-zinc-600 dark:text-zinc-300 lg:hidden">
							{calendarEvents.map((event) => (
								<div key={event.id} className="rounded-2xl border border-zinc-200 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-900/80">
									<p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
										{formatMobileDate(event.date)}
									</p>
									<p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
										{event.title}
									</p>
									<p className="text-xs text-zinc-500 dark:text-zinc-400">{event.course}</p>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="space-y-6">
					<section className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
						<header className="flex items-center justify-between gap-3">
							<div>
								<h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
									Today & upcoming
								</h2>
								<p className="text-xs text-zinc-500 dark:text-zinc-400">
									Focus the week on high-impact events.
								</p>
							</div>
							<select
								value={filter}
								onChange={(event) => setFilter(event.target.value)}
								className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-xs font-medium text-zinc-700 focus:border-indigo-400 focus:outline-none dark:border-zinc-700 dark:text-zinc-200"
							>
								<option value="all">All events</option>
								<option value="assignment">Assignments</option>
								<option value="assessment">Assessments</option>
								<option value="mentor">Mentor sessions</option>
								<option value="study">Study blocks</option>
								<option value="lab">Labs</option>
							</select>
						</header>
						<ul className="mt-5 space-y-3">
							{calendarEvents
								.filter((event) => filter === "all" || event.type === filter)
								.slice(0, 5)
								.map((event) => (
									<li
										key={event.id}
										className={`rounded-2xl border border-zinc-200 bg-white/90 px-4 py-4 text-sm transition hover:border-indigo-300 hover:shadow dark:border-zinc-700 dark:bg-zinc-800/70`}
									>
										<div className="flex items-center justify-between gap-3">
											<p className="font-semibold text-zinc-900 dark:text-white">{event.title}</p>
											<span
												className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
													typeTone[event.type] || "bg-zinc-100 text-zinc-600"
												}`}
											>
												{event.type}
											</span>
										</div>
										<p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
											{formatLongDate(event.date)} {event.timeRange ? `· ${event.timeRange}` : ""}
										</p>
									</li>
								))}
						</ul>
						<div className="mt-5 flex flex-wrap gap-3 text-xs">
							<button className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 font-semibold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-zinc-900 dark:hover:bg-indigo-300">
								Add event
							</button>
							<button className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 font-semibold text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-500">
								Sync calendar
							</button>
						</div>
					</section>

					<section className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
						<h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
							Event details
						</h2>
						{selectedEvent ? (
							<div className="mt-4 space-y-4 text-sm text-zinc-600 dark:text-zinc-300">
								<div className="flex items-center gap-2">
									<span
										className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
											typeTone[selectedEvent.type] || "bg-zinc-100 text-zinc-600"
										}`}
									>
										{selectedEvent.type}
									</span>
									<p className="font-semibold text-zinc-900 dark:text-white">
										{selectedEvent.title}
									</p>
								</div>
								<p className="text-xs text-zinc-500 dark:text-zinc-400">
									{formatLongDate(selectedEvent.date)} {selectedEvent.timeRange ? `· ${selectedEvent.timeRange}` : ""}
								</p>
								<p>{selectedEvent.context}</p>
								<div className="rounded-2xl bg-zinc-50 p-3 text-xs text-zinc-600 dark:bg-zinc-800/70 dark:text-zinc-300">
									Course: {selectedEvent.course}
								</div>
								<div className="flex flex-wrap gap-3 text-xs">
									<button className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 font-semibold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-zinc-900 dark:hover:bg-indigo-300">
										Open brief
									</button>
									<button className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 font-semibold text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-500">
										Reschedule
									</button>
								</div>
							</div>
						) : (
							<p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
								Choose an event on the calendar to see details.
							</p>
						)}
					</section>

					<section className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
						<h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
							Scheduling insights
						</h2>
						<div className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
							<p>Planned study hours: <span className="font-semibold text-indigo-600 dark:text-indigo-300">36h</span> this month.</p>
							<p>Available free blocks next week: <span className="font-semibold text-emerald-600 dark:text-emerald-300">6</span>.</p>
							<p>Streak: <span className="font-semibold text-purple-600 dark:text-purple-300">9 consecutive days</span> with at least 30 minutes logged.</p>
						</div>
						<button className="mt-4 inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-500">
							Generate smart suggestions
						</button>
					</section>
				</div>
			</section>
		</div>
	);
}

function buildMonthMatrix(referenceDate) {
	const startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
	const startDay = startDate.getDay();
	const matrix = [];
	let current = new Date(startDate);
	current.setDate(current.getDate() - startDay);

	for (let row = 0; row < 6; row += 1) {
		const week = [];
		for (let col = 0; col < 7; col += 1) {
			const dateKey = formatDateKey(current);
			week.push({
				date: new Date(current),
				dateKey,
				isCurrentMonth: current.getMonth() === referenceDate.getMonth(),
			});
			current.setDate(current.getDate() + 1);
		}
		matrix.push(week);
	}

	return matrix;
}

function buildEventMap(events, filter) {
	return events
		.filter((event) => filter === "all" || event.type === filter)
		.reduce((acc, event) => {
			const dateKey = event.date;
			if (!acc[dateKey]) acc[dateKey] = [];
			acc[dateKey].push(event);
			return acc;
		}, {});
}

function firstEventId(events = []) {
	return events[0]?.id ?? null;
}

function offsetMonth(date, offset) {
	const next = new Date(date);
	next.setMonth(next.getMonth() + offset);
	return next;
}

function formatMonthYear(date) {
	return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function formatLongDate(dateString) {
	return new Date(dateString).toLocaleDateString(undefined, {
		weekday: "short",
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function formatMobileDate(dateString) {
	return new Date(dateString).toLocaleDateString(undefined, {
		weekday: "long",
		month: "long",
		day: "numeric",
	});
}

function formatDateKey(date) {
	return date.toISOString().split("T")[0];
}

function isToday(date) {
	const today = new Date();
	return (
		date.getDate() === today.getDate() &&
		date.getMonth() === today.getMonth() &&
		date.getFullYear() === today.getFullYear()
	);
}

function ArrowLeftIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
			<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
		</svg>
	);
}

function ArrowRightIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
			<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
		</svg>
	);
}
