"use client";

import { useState } from "react";

const AI_MODES = [
	{
		id: "doubt-solver",
		name: "Doubt Solver",
		description: "Step-by-step explanations with follow-up questions",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
				<path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
			</svg>
		),
		gradient: "from-blue-500 to-cyan-500",
		bgColor: "bg-blue-500/10",
		borderColor: "border-blue-500/20",
		hoverBorder: "hover:border-blue-500/40",
		textColor: "text-blue-600 dark:text-blue-400",
		systemPrompt: "You are in Doubt Solver Mode. Provide detailed step-by-step explanations. Break down complex concepts into simple steps. Ask follow-up questions to ensure understanding. Use numbered steps and clear explanations.",
	},
	{
		id: "homework-helper",
		name: "Homework Helper",
		description: "Guided learning without direct answers",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
				<path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
			</svg>
		),
		gradient: "from-green-500 to-emerald-500",
		bgColor: "bg-green-500/10",
		borderColor: "border-green-500/20",
		hoverBorder: "hover:border-green-500/40",
		textColor: "text-green-600 dark:text-green-400",
		systemPrompt: "You are in Homework Helper Mode. Guide the student to find answers themselves. Ask probing questions, provide hints, and help them think through problems without giving direct answers. Encourage critical thinking.",
	},
	{
		id: "concept-explainer",
		name: "Concept Explainer",
		description: "Simplified explanations with analogies",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
				<path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
			</svg>
		),
		gradient: "from-amber-500 to-orange-500",
		bgColor: "bg-amber-500/10",
		borderColor: "border-amber-500/20",
		hoverBorder: "hover:border-amber-500/40",
		textColor: "text-amber-600 dark:text-amber-400",
		systemPrompt: "You are in Concept Explainer Mode. Explain concepts in simple, easy-to-understand language (ELI5 - Explain Like I'm 5). Use real-world analogies, metaphors, and relatable examples. Make complex topics accessible and fun.",
	},
	{
		id: "test-prep",
		name: "Test Prep",
		description: "Practice with quizzes, MCQs, and assessments",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
				<path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
			</svg>
		),
		gradient: "from-purple-500 to-pink-500",
		bgColor: "bg-purple-500/10",
		borderColor: "border-purple-500/20",
		hoverBorder: "hover:border-purple-500/40",
		textColor: "text-purple-600 dark:text-purple-400",
		systemPrompt: "You are in Test Prep Mode. Create quiz-style questions, MCQs, and viva practice questions. Provide instant feedback on answers. Focus on exam-relevant topics and help the student practice effectively.",
	},
	{
		id: "study-buddy",
		name: "Study Buddy",
		description: "Motivation, planning, and productivity support",
		icon: (
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
				<path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
			</svg>
		),
		gradient: "from-rose-500 to-red-500",
		bgColor: "bg-rose-500/10",
		borderColor: "border-rose-500/20",
		hoverBorder: "hover:border-rose-500/40",
		textColor: "text-rose-600 dark:text-rose-400",
		systemPrompt: "You are in Study Buddy Mode. Be supportive, motivational, and encouraging. Help with study planning, time management, and productivity tips. Provide emotional support and keep the student motivated.",
	},
];

export default function ModeSelector({ selectedMode, onModeSelect, isOpen, onToggle }) {
	const currentMode = AI_MODES.find(m => m.id === selectedMode);

	return (
		<div className="relative">
			{/* Mode Selection Button */}
			<button
				onClick={onToggle}
				className={`group flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
					selectedMode
						? `${currentMode?.borderColor} ${currentMode?.bgColor} ${currentMode?.textColor} hover:shadow-md`
						: "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-zinc-600"
				}`}
			>
				{selectedMode ? (
					<>
						<span className={`${currentMode?.textColor}`}>
							{currentMode?.icon}
						</span>
						<span className="hidden sm:inline">{currentMode?.name}</span>
						<span className="sm:hidden">Mode</span>
					</>
				) : (
					<>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
							<path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
							<path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
						</svg>
						<span className="hidden sm:inline">Select Mode</span>
						<span className="sm:hidden">Mode</span>
					</>
				)}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
				>
					<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
				</svg>
			</button>

			{/* Dropdown Menu */}
			{isOpen && (
				<>
					{/* Backdrop */}
					<div 
						className="fixed inset-0 z-40" 
						onClick={onToggle}
					/>
					
					{/* Menu */}
					<div className="absolute top-full right-0 mt-2 w-[320px] z-50 animate-[slideDown_0.15s_ease-out]">
						<div className="rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900 overflow-hidden">
							{/* Header */}
							<div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
								<h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
									AI Learning Modes
								</h3>
								<p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
									Choose how you want to learn
								</p>
							</div>

							{/* Mode List */}
							<div className="p-2 space-y-1 max-h-[420px] overflow-y-auto">
								{AI_MODES.map((mode) => (
									<button
										key={mode.id}
										onClick={() => {
											onModeSelect(mode.id);
											onToggle();
										}}
										className={`group w-full text-left rounded-lg border p-3 transition-all ${
											selectedMode === mode.id
												? `${mode.borderColor} ${mode.bgColor} ${mode.textColor}`
												: `border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800 ${mode.hoverBorder}`
										}`}
									>
										<div className="flex items-start gap-3">
											{/* Icon */}
											<div className={`flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-lg transition-all ${
												selectedMode === mode.id
													? mode.bgColor
													: "bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700"
											} ${mode.textColor}`}>
												{mode.icon}
											</div>
											
											{/* Content */}
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<h4 className="font-semibold text-sm text-zinc-900 dark:text-white">
														{mode.name}
													</h4>
													{selectedMode === mode.id && (
														<svg
															xmlns="http://www.w3.org/2000/svg"
															viewBox="0 0 24 24"
															fill="currentColor"
															className={`h-4 w-4 flex-shrink-0 ${mode.textColor}`}
														>
															<path
																fillRule="evenodd"
																d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
																clipRule="evenodd"
															/>
														</svg>
													)}
												</div>
												<p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
													{mode.description}
												</p>
											</div>
										</div>
									</button>
								))}
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}

export { AI_MODES };
