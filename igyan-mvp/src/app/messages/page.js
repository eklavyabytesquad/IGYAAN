"use client";

import { useMemo, useState } from "react";
import Logo from "@/components/logo";

const tabs = [
	{ id: "all", label: "All" },
	{ id: "mentors", label: "Mentors" },
	{ id: "peers", label: "Peers" },
	{ id: "system", label: "System" },
];

const inboxThreads = [
	{
		id: "mentor-priya",
		participants: "Mentor Priya",
		preview: "Sharing rubric highlights on automation case study…",
		unread: 1,
		lastActivity: "2h ago",
		category: "mentors",
		messages: [
			{
				sender: "Mentor Priya",
				timestamp: "10:12 AM",
				content:
					"Loved the updated guardrail section. Let's tighten the success metrics and add a fallback scenario.",
			},
			{
				sender: "You",
				timestamp: "10:15 AM",
				content: "On it! Drafting KPI additions now and will circle back with a v3.",
			},
		],
	},
	{
		id: "peer-collab",
		participants: "Automation Crew",
		preview: "Standup reminder: share blockers by 5 PM.",
		unread: 0,
		lastActivity: "Yesterday",
		category: "peers",
		messages: [
			{
				sender: "Aman",
				timestamp: "4:30 PM",
				content: "ETA on Zapier integration fix? Would love to test before standup.",
			},
			{
				sender: "You",
				timestamp: "4:57 PM",
				content: "Just merged! Added logs + fallback for missing tokens.",
			},
		],
	},
	{
		id: "system-alert",
		participants: "System",
		preview: "Reminder: Data Ops quiz scheduled for Nov 03.",
		unread: 0,
		lastActivity: "Oct 29",
		category: "system",
		messages: [
			{
				sender: "System",
				timestamp: "Oct 29, 8:15 AM",
				content: "Heads-up: Data Ops quiz opens Nov 03 at 08:00 AM. Add to calendar?",
			},
		],
	},
];

const smartFilters = [
	"Show action items",
	"Assignments",
	"Follow-ups",
	"Mentor notes",
];

export default function MessagesPage() {
	const [activeTab, setActiveTab] = useState("all");
	const [selectedThreadId, setSelectedThreadId] = useState(inboxThreads[0]?.id ?? null);
	const [smartFilter, setSmartFilter] = useState("Show action items");
	const [draft, setDraft] = useState("");

	const filteredThreads = useMemo(() => {
		if (activeTab === "all") return inboxThreads;
		return inboxThreads.filter((thread) => thread.category === activeTab);
	}, [activeTab]);

	const selectedThread = useMemo(
		() => inboxThreads.find((thread) => thread.id === selectedThreadId) ?? null,
		[selectedThreadId]
	);

	return (
		<div className="min-h-full space-y-8 p-6 lg:p-10">
			<header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<Logo variant="header" className="mb-2" />
					<h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">Messages & Coaching</h1>
					<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
						Check mentor feedback, sync with peers, and manage notifications in one inbox.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2 text-xs">
					<button className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 font-semibold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-zinc-900 dark:hover:bg-indigo-300">
						New thread
					</button>
					<button className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 font-semibold text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-500">
						Notification settings
					</button>
				</div>
			</header>

			<section className="grid gap-6 xl:grid-cols-[0.5fr_1fr]">
				<div className="space-y-5">
					<nav className="rounded-3xl border border-zinc-200 bg-white/80 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
						<div className="flex flex-wrap items-center gap-2">
							{tabs.map((tab) => (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
										activeTab === tab.id
											? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
											: "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/70"
									}`}
								>
									{tab.label}
								</button>
							))}
						</div>
					</nav>

					<div className="rounded-3xl border border-zinc-200 bg-white/80 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
						<header className="flex items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
							<h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Inbox</h2>
							<select
								value={smartFilter}
								onChange={(event) => setSmartFilter(event.target.value)}
								className="rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-xs font-medium text-zinc-700 focus:border-indigo-400 focus:outline-none dark:border-zinc-700 dark:text-zinc-200"
							>
								{smartFilters.map((option) => (
									<option key={option}>{option}</option>
								))}
							</select>
						</header>
						<div className="max-h-104 overflow-y-auto">
							{filteredThreads.map((thread) => (
								<button
									key={thread.id}
									onClick={() => setSelectedThreadId(thread.id)}
									className={`flex w-full flex-col gap-1 border-b border-zinc-100 px-5 py-4 text-left transition hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60 ${
										selectedThreadId === thread.id ? "bg-zinc-100 dark:bg-zinc-800/70" : ""
									}`}
								>
									<div className="flex items-center justify-between text-xs">
										<p className="font-semibold text-zinc-900 dark:text-white">
											{thread.participants}
										</p>
										<span className="text-zinc-500 dark:text-zinc-400">{thread.lastActivity}</span>
									</div>
									<p className="text-xs text-zinc-500 dark:text-zinc-400">
										{thread.preview}
									</p>
									{thread.unread ? (
										<span className="mt-1 inline-flex w-fit rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-300">
											{thread.unread} unread
										</span>
									) : null}
								</button>
							))}
						</div>
					</div>

					<section className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
						<h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
							Response insights
						</h2>
						<ul className="mt-4 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
							<li>Unread messages: <strong className="text-indigo-600 dark:text-indigo-300">3</strong></li>
							<li>Avg response time (mentors): <strong className="text-emerald-600 dark:text-emerald-300">2h 14m</strong></li>
							<li>Follow-ups scheduled: <strong className="text-purple-600 dark:text-purple-300">4</strong></li>
						</ul>
					</section>
				</div>

				<div className="space-y-5">
					<div className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
						<header className="flex items-center justify-between gap-3">
							<div>
								<h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
									Conversation
								</h2>
								<p className="text-xs text-zinc-500 dark:text-zinc-400">
									Summaries and action items generate automatically via AI Copilot.
								</p>
							</div>
							<button className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-indigo-500">
								AI summarise
							</button>
						</header>
						<div className="mt-5 max-h-80 space-y-4 overflow-y-auto">
							{selectedThread?.messages.map((message, index) => (
								<article
									key={`${message.sender}-${index}`}
									className={`max-w-[85%] rounded-2xl border px-4 py-3 text-sm shadow-sm ${
										message.sender === "You"
											? "ml-auto border-indigo-200 bg-indigo-50/80 text-indigo-900 dark:border-indigo-600/50 dark:bg-indigo-500/10 dark:text-indigo-200"
											: "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-200"
									}`}
								>
									<p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
										{message.sender} · {message.timestamp}
									</p>
									<p className="mt-2 leading-relaxed">{message.content}</p>
								</article>
							))}
						</div>
					</div>

					<div className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
						<h2 className="text-sm font-semibold text-zinc-900 dark:text-white">Compose</h2>
						<textarea
							value={draft}
							onChange={(event) => setDraft(event.target.value)}
							placeholder="Type a reply, or ask AI Copilot to draft one…"
							className="mt-3 h-32 w-full rounded-2xl border border-zinc-300 bg-transparent px-4 py-3 text-sm text-zinc-700 focus:border-indigo-400 focus:outline-none dark:border-zinc-700 dark:text-zinc-200"
						/>
						<div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
							<button className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-2 font-semibold text-white transition hover:bg-indigo-600 dark:bg-white dark:text-zinc-900 dark:hover:bg-indigo-300">
								Send
							</button>
							<button className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 font-semibold text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-500">
								Attach
							</button>
							<button className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 font-semibold text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-indigo-500">
								Ask AI to rewrite
							</button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
