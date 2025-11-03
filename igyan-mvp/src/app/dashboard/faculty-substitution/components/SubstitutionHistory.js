export default function SubstitutionHistory({ history }) {
	if (history.length === 0) {
		return (
			<div className="rounded-3xl border border-zinc-200 bg-white/90 p-12 text-center shadow-lg dark:border-zinc-800 dark:bg-zinc-900/90">
				<div className="mx-auto mb-4 h-20 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
						className="w-10 h-10 text-zinc-400"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
					No History Yet
				</h3>
				<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
					Substitution requests will appear here once you make them
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{history.map((entry) => (
				<div
					key={entry.id}
					className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900/90"
				>
					<div className="flex items-start justify-between mb-4">
						<div>
							<p className="text-xs text-zinc-500 dark:text-zinc-400">
								{new Date(entry.timestamp).toLocaleString()}
							</p>
							<h3 className="text-lg font-semibold text-zinc-900 dark:text-white mt-1">
								Substitution Request #{entry.id}
							</h3>
						</div>
						<span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
							Completed
						</span>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						{/* Absent Faculty */}
						<div className="rounded-2xl bg-red-50 p-4 dark:bg-red-900/20">
							<p className="text-xs font-semibold text-red-900 dark:text-red-300 mb-2">
								Absent Faculty
							</p>
							<p className="text-sm font-semibold text-zinc-900 dark:text-white">
								{entry.absentFaculty.name}
							</p>
							<p className="text-xs text-zinc-600 dark:text-zinc-400">
								{entry.absentFaculty.subject} • {entry.absentFaculty.classes.join(", ")}
							</p>
							<p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
								{entry.date} • Period {entry.period}
							</p>
						</div>

						{/* Substitute */}
						<div className="rounded-2xl bg-green-50 p-4 dark:bg-green-900/20">
							<p className="text-xs font-semibold text-green-900 dark:text-green-300 mb-2">
								Assigned Substitute
							</p>
							<p className="text-sm font-semibold text-zinc-900 dark:text-white">
								{entry.substitute.name}
							</p>
							<p className="text-xs text-zinc-600 dark:text-zinc-400">
								{entry.substitute.subject} • {entry.substitute.experience} years exp.
							</p>
							<div className="mt-2">
								<span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-green-700 dark:bg-zinc-800 dark:text-green-400">
									Score: {entry.substitute.matchScore}/100
								</span>
							</div>
						</div>
					</div>

					{/* Reasoning */}
					<div className="mt-4 rounded-2xl bg-purple-50 p-4 dark:bg-purple-900/20">
						<p className="text-xs font-semibold text-purple-900 dark:text-purple-300 mb-2">
							AI Reasoning
						</p>
						<p className="text-sm text-zinc-700 dark:text-zinc-300">
							{entry.reasoning}
						</p>
					</div>

					{/* Actions */}
					<div className="mt-4 flex gap-2">
						<button className="rounded-xl border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-zinc-600 dark:text-zinc-300">
							View Details
						</button>
						<button className="rounded-xl border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-zinc-600 dark:text-zinc-300">
							Export
						</button>
					</div>
				</div>
			))}
		</div>
	);
}
