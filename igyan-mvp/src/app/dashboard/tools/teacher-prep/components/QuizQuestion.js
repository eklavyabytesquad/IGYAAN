"use client";

import { useState, useEffect } from "react";

export default function QuizQuestion({ question, questionNumber, selectedAnswer, onAnswerSelect }) {
	const [showExplanation, setShowExplanation] = useState(false);

	useEffect(() => {
		if (selectedAnswer) {
			// Show explanation after a short delay when answer is selected
			const timer = setTimeout(() => setShowExplanation(true), 300);
			return () => clearTimeout(timer);
		} else {
			setShowExplanation(false);
		}
	}, [selectedAnswer]);

	const getOptionClass = (optionId) => {
		if (!selectedAnswer) {
			return "border-slate-300 bg-white hover:border-violet-400 hover:bg-violet-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-violet-500 dark:hover:bg-violet-900/20";
		}

		const isCorrect = optionId === question.correctAnswer;
		const isSelected = optionId === selectedAnswer;

		if (isCorrect) {
			return "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-900/30";
		}

		if (isSelected && !isCorrect) {
			return "border-red-500 bg-red-50 dark:border-red-400 dark:bg-red-900/30";
		}

		return "border-slate-200 bg-slate-50 opacity-60 dark:border-slate-700 dark:bg-slate-800/50";
	};

	const getOptionIcon = (optionId) => {
		if (!selectedAnswer) return null;

		const isCorrect = optionId === question.correctAnswer;
		const isSelected = optionId === selectedAnswer;

		if (isCorrect) {
			return (
				<svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			);
		}

		if (isSelected && !isCorrect) {
			return (
				<svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
				</svg>
			);
		}

		return null;
	};

	return (
		<div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-800">
			{/* Question Header */}
			<div className="mb-6 flex items-start gap-4">
				<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500 text-lg font-bold text-white shadow-lg">
					{questionNumber}
				</div>
				<div className="flex-1">
					<h3 className="text-xl font-bold leading-relaxed text-slate-900 dark:text-white">
						{question.question}
					</h3>
				</div>
			</div>

			{/* Options */}
			<div className="space-y-3">
				{question.options.map((option) => (
					<button
						key={option.id}
						onClick={() => !selectedAnswer && onAnswerSelect(question.id, option.id)}
						disabled={!!selectedAnswer}
						className={`group relative w-full rounded-xl border-2 p-5 text-left transition-all duration-300 ${getOptionClass(option.id)} ${
							selectedAnswer ? "cursor-default" : "cursor-pointer"
						}`}
					>
						<div className="flex items-center gap-4">
							<div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold transition ${
								!selectedAnswer
									? "bg-violet-100 text-violet-700 group-hover:bg-violet-600 group-hover:text-white dark:bg-violet-900/40 dark:text-violet-300 dark:group-hover:bg-violet-600"
									: option.id === question.correctAnswer
									? "bg-emerald-600 text-white dark:bg-emerald-500"
									: option.id === selectedAnswer
									? "bg-red-600 text-white dark:bg-red-500"
									: "bg-slate-200 text-slate-500 dark:bg-slate-700"
							}`}>
								{option.id}
							</div>
							<span className={`flex-1 text-base font-medium transition ${
								!selectedAnswer
									? "text-slate-800 group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white"
									: option.id === question.correctAnswer
									? "text-emerald-900 dark:text-emerald-100"
									: option.id === selectedAnswer
									? "text-red-900 dark:text-red-100"
									: "text-slate-600 dark:text-slate-400"
							}`}>
								{option.text}
							</span>
							{getOptionIcon(option.id)}
						</div>
					</button>
				))}
			</div>

			{/* Explanation */}
			{showExplanation && (
				<div className={`mt-6 overflow-hidden rounded-xl border-2 transition-all duration-500 ${
					selectedAnswer === question.correctAnswer
						? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20"
						: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
				}`}>
					<div className="p-6">
						<div className="mb-3 flex items-center gap-2">
							{selectedAnswer === question.correctAnswer ? (
								<>
									<svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<h4 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Correct!</h4>
								</>
							) : (
								<>
									<svg className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
									</svg>
									<h4 className="text-lg font-bold text-amber-900 dark:text-amber-100">Not Quite</h4>
								</>
							)}
						</div>
						<p className={`leading-relaxed ${
							selectedAnswer === question.correctAnswer
								? "text-emerald-800 dark:text-emerald-200"
								: "text-amber-800 dark:text-amber-200"
						}`}>
							{question.explanation}
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
