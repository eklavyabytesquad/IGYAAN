export default function EmptyState({ setInputMessage }) {
	const suggestions = [
		"Explain quantum physics",
		"Help with math homework",
		"Study tips for exams",
		"Creative writing ideas",
	];

	return (
		<div className="flex h-full flex-col items-center justify-center gap-6 text-center">
			<div className="flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-500 shadow-lg">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-10 w-10 text-white">
					<path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
				</svg>
			</div>
			<div>
				<h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
					Welcome to AI Copilot!
				</h3>
				<p className="mt-2 text-zinc-600 dark:text-zinc-400">
					Ask me anything about your learning journey
				</p>
			</div>
			<div className="grid gap-3 sm:grid-cols-2 max-w-2xl w-full">
				{suggestions.map((suggestion, idx) => (
					<button
						key={idx}
						onClick={() => setInputMessage(suggestion)}
						className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm text-left text-zinc-700 transition-colors hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-900/30"
					>
						{suggestion}
					</button>
				))}
			</div>
		</div>
	);
}
