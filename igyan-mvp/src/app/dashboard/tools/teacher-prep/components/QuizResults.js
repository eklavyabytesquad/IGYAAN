"use client";

export default function QuizResults({ quiz, userAnswers, score, onRestartQuiz, onReviewAnswers }) {
	const getPerformanceMessage = () => {
		if (score.percentage >= 90) {
			return {
				title: "Outstanding! 🎉",
				message: "You've mastered this topic! Excellent work!",
				color: "emerald"
			};
		} else if (score.percentage >= 70) {
			return {
				title: "Great Job! 👏",
				message: "You have a solid understanding. Keep it up!",
				color: "blue"
			};
		} else if (score.percentage >= 50) {
			return {
				title: "Good Effort! 💪",
				message: "You're on the right track. Review and try again!",
				color: "amber"
			};
		} else {
			return {
				title: "Keep Learning! 📚",
				message: "Don't give up! Review the material and retry.",
				color: "orange"
			};
		}
	};

	const performance = getPerformanceMessage();

	const getGradeClass = () => {
		const colorMap = {
			emerald: "from-emerald-500 to-teal-500",
			blue: "from-blue-500 to-cyan-500",
			amber: "from-amber-500 to-yellow-500",
			orange: "from-orange-500 to-red-500"
		};
		return colorMap[performance.color] || colorMap.blue;
	};

	const getBgClass = () => {
		const colorMap = {
			emerald: "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
			blue: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
			amber: "from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20",
			orange: "from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20"
		};
		return colorMap[performance.color] || colorMap.blue;
	};

	return (
		<div className="mx-auto max-w-4xl">
			<div className={`rounded-3xl border border-slate-200 bg-linear-to-br ${getBgClass()} p-8 shadow-2xl dark:border-slate-700`}>
				{/* Score Circle */}
				<div className="mb-8 flex justify-center">
					<div className="relative">
						<svg className="h-48 w-48 -rotate-90 transform">
							<circle
								cx="96"
								cy="96"
								r="88"
								stroke="currentColor"
								strokeWidth="12"
								fill="none"
								className="text-slate-200 dark:text-slate-700"
							/>
							<circle
								cx="96"
								cy="96"
								r="88"
								stroke="currentColor"
								strokeWidth="12"
								fill="none"
								strokeDasharray={`${2 * Math.PI * 88}`}
								strokeDashoffset={`${2 * Math.PI * 88 * (1 - score.percentage / 100)}`}
								className={`text-${performance.color}-500 transition-all duration-1000`}
								strokeLinecap="round"
							/>
						</svg>
						<div className="absolute inset-0 flex flex-col items-center justify-center">
							<div className="text-5xl font-extrabold text-slate-900 dark:text-white">{score.percentage}%</div>
							<div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Score</div>
						</div>
					</div>
				</div>

				{/* Performance Message */}
				<div className="mb-8 text-center">
					<h2 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">{performance.title}</h2>
					<p className="text-lg text-slate-600 dark:text-slate-400">{performance.message}</p>
				</div>

				{/* Stats Grid */}
				<div className="mb-8 grid gap-4 sm:grid-cols-3">
					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
						<div className={`mb-2 text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r ${getGradeClass()}`}>
							{score.correct}
						</div>
						<div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Correct Answers</div>
					</div>
					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
						<div className="mb-2 text-3xl font-bold text-slate-700 dark:text-slate-300">
							{score.total - score.correct}
						</div>
						<div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Incorrect</div>
					</div>
					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
						<div className="mb-2 text-3xl font-bold text-slate-700 dark:text-slate-300">
							{score.total}
						</div>
						<div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Questions</div>
					</div>
				</div>

				{/* Question Breakdown */}
				<div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
					<h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Question Breakdown</h3>
					<div className="space-y-3">
						{quiz.questions.map((question, index) => {
							const isCorrect = userAnswers[question.id] === question.correctAnswer;
							return (
								<div key={question.id} className="flex items-center gap-3">
									<div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold text-white ${
										isCorrect ? "bg-emerald-500" : "bg-red-500"
									}`}>
										{index + 1}
									</div>
									<div className="flex-1">
										<p className="line-clamp-1 text-sm font-medium text-slate-700 dark:text-slate-300">
											{question.question}
										</p>
									</div>
									{isCorrect ? (
										<svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									) : (
										<svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									)}
								</div>
							);
						})}
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col gap-3 sm:flex-row">
					<button
						onClick={onReviewAnswers}
						className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border-2 border-violet-600 bg-white px-6 py-3 font-semibold text-violet-600 transition-all hover:bg-violet-50 dark:border-violet-500 dark:bg-slate-800 dark:text-violet-400 dark:hover:bg-violet-900/20"
					>
						<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
						</svg>
						Review Answers
					</button>
					<button
						onClick={onRestartQuiz}
						className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-linear-to-r ${getGradeClass()} px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl`}
					>
						<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						Try New Quiz
					</button>
				</div>
			</div>
		</div>
	);
}
