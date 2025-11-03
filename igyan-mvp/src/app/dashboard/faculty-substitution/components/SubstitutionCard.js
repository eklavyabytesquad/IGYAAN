export default function SubstitutionCard({ result }) {
	return (
		<div className="rounded-3xl border border-zinc-200 bg-white/90 p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900/90 space-y-6">
			<div className="flex items-start justify-between">
				<div>
					<h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
						Best Substitute Found
					</h2>
					<p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
						Match Score: <span className="font-bold text-green-600 dark:text-green-400">{result.bestMatch.matchScore}/100</span>
					</p>
				</div>
				<div className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
					✓ Verified
				</div>
			</div>

			{/* Absent Faculty Info */}
			<div className="rounded-2xl bg-red-50 p-5 dark:bg-red-900/20">
				<h3 className="text-sm font-semibold text-red-900 dark:text-red-300 mb-3">
					Absent Faculty
				</h3>
				<div className="space-y-2 text-sm">
					<p className="text-zinc-900 dark:text-white font-medium">
						{result.absentFaculty.name}
					</p>
					<div className="flex flex-wrap gap-2 text-xs">
						<span className="rounded-full bg-white px-3 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
							{result.absentFaculty.subject}
						</span>
						<span className="rounded-full bg-white px-3 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
							{result.absentFaculty.experience} years exp.
						</span>
						<span className="rounded-full bg-white px-3 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
							Classes: {result.absentFaculty.classes.join(", ")}
						</span>
					</div>
				</div>
			</div>

			{/* Substitute Info */}
			<div className="rounded-2xl bg-green-50 p-5 dark:bg-green-900/20">
				<h3 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-3">
					Recommended Substitute
				</h3>
				<div className="space-y-3">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-lg font-semibold text-zinc-900 dark:text-white">
								{result.bestMatch.name}
							</p>
							<p className="text-xs text-zinc-600 dark:text-zinc-400">
								{result.bestMatch.qualifications.join(" • ")}
							</p>
						</div>
					</div>
					<div className="flex flex-wrap gap-2 text-xs">
						<span className="rounded-full bg-white px-3 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
							{result.bestMatch.subject}
						</span>
						<span className="rounded-full bg-white px-3 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
							{result.bestMatch.specialization}
						</span>
						<span className="rounded-full bg-white px-3 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
							{result.bestMatch.experience} years exp.
						</span>
						<span className="rounded-full bg-white px-3 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
							Workload: {result.bestMatch.currentSubstitutions}/{result.bestMatch.maxSubstitutionsPerWeek}
						</span>
					</div>
					<div className="rounded-xl bg-white/80 p-3 dark:bg-zinc-800/50">
						<p className="text-xs text-zinc-600 dark:text-zinc-400">
							<span className="font-semibold">Classes: </span>
							{result.bestMatch.classes.join(", ")}
						</p>
					</div>
				</div>
			</div>

			{/* Match Analysis */}
			<div className="rounded-2xl bg-blue-50 p-5 dark:bg-blue-900/20">
				<h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
					Match Analysis
				</h3>
				<div className="grid grid-cols-2 gap-3 text-xs">
					<div className={`rounded-lg p-3 ${
						result.matchDetails.sameSubject
							? "bg-green-100 dark:bg-green-900/30"
							: "bg-zinc-100 dark:bg-zinc-800"
					}`}>
						<p className="font-semibold text-zinc-900 dark:text-white">Same Subject</p>
						<p className={result.matchDetails.sameSubject ? "text-green-700 dark:text-green-400" : "text-zinc-600 dark:text-zinc-400"}>
							{result.matchDetails.sameSubject ? "✓ Yes" : "✗ No"}
						</p>
					</div>
					<div className={`rounded-lg p-3 ${
						result.matchDetails.experienceMatch
							? "bg-green-100 dark:bg-green-900/30"
							: "bg-zinc-100 dark:bg-zinc-800"
					}`}>
						<p className="font-semibold text-zinc-900 dark:text-white">Experience Match</p>
						<p className={result.matchDetails.experienceMatch ? "text-green-700 dark:text-green-400" : "text-zinc-600 dark:text-zinc-400"}>
							{result.matchDetails.experienceMatch ? "✓ Similar" : "Different"}
						</p>
					</div>
					<div className={`rounded-lg p-3 ${
						result.matchDetails.classOverlap.length > 0
							? "bg-green-100 dark:bg-green-900/30"
							: "bg-zinc-100 dark:bg-zinc-800"
					}`}>
						<p className="font-semibold text-zinc-900 dark:text-white">Class Overlap</p>
						<p className={result.matchDetails.classOverlap.length > 0 ? "text-green-700 dark:text-green-400" : "text-zinc-600 dark:text-zinc-400"}>
							{result.matchDetails.classOverlap.length > 0
								? `${result.matchDetails.classOverlap.length} classes`
								: "None"}
						</p>
					</div>
					<div className={`rounded-lg p-3 ${
						result.matchDetails.preferredPeriod
							? "bg-green-100 dark:bg-green-900/30"
							: "bg-zinc-100 dark:bg-zinc-800"
					}`}>
						<p className="font-semibold text-zinc-900 dark:text-white">Preferred Period</p>
						<p className={result.matchDetails.preferredPeriod ? "text-green-700 dark:text-green-400" : "text-zinc-600 dark:text-zinc-400"}>
							{result.matchDetails.preferredPeriod ? "✓ Yes" : "No"}
						</p>
					</div>
				</div>
			</div>

			{/* AI Reasoning */}
			<div className="rounded-2xl bg-purple-50 p-5 dark:bg-purple-900/20">
				<div className="flex items-center gap-2 mb-3">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						className="w-5 h-5 text-purple-600 dark:text-purple-400"
					>
						<path d="M16.5 7.5h-9v9h9v-9z" />
						<path
							fillRule="evenodd"
							d="M8.25 2.25A.75.75 0 019 3v.75h2.25V3a.75.75 0 011.5 0v.75H15V3a.75.75 0 011.5 0v.75h.75a3 3 0 013 3v.75H21A.75.75 0 0121 9h-.75v2.25H21a.75.75 0 010 1.5h-.75V15H21a.75.75 0 010 1.5h-.75v.75a3 3 0 01-3 3h-.75V21a.75.75 0 01-1.5 0v-.75h-2.25V21a.75.75 0 01-1.5 0v-.75H9V21a.75.75 0 01-1.5 0v-.75h-.75a3 3 0 01-3-3v-.75H3A.75.75 0 013 15h.75v-2.25H3a.75.75 0 010-1.5h.75V9H3a.75.75 0 010-1.5h.75v-.75a3 3 0 013-3h.75V3a.75.75 0 01.75-.75z"
							clipRule="evenodd"
						/>
					</svg>
					<h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300">
						AI-Generated Reasoning
					</h3>
				</div>
				<p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
					{result.reasoning}
				</p>
			</div>

			{/* Alternative Matches */}
			{result.alternativeMatches.length > 0 && (
				<div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-800/50">
					<h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3">
						Alternative Options
					</h3>
					<div className="space-y-2">
						{result.alternativeMatches.map((alt, index) => (
							<div
								key={alt.id}
								className="flex items-center justify-between rounded-xl bg-white p-3 dark:bg-zinc-900"
							>
								<div className="flex-1">
									<p className="text-sm font-medium text-zinc-900 dark:text-white">
										{alt.name}
									</p>
									<p className="text-xs text-zinc-600 dark:text-zinc-400">
										{alt.subject} • {alt.experience} years
									</p>
								</div>
								<span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
									Score: {alt.matchScore}
								</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Action Buttons */}
			<div className="flex flex-wrap gap-3 pt-2">
				<button className="flex-1 rounded-xl bg-linear-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-green-700 hover:to-emerald-700">
					Confirm Substitution
				</button>
				<button className="rounded-xl border-2 border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-zinc-600 dark:text-zinc-300">
					View Details
				</button>
			</div>
		</div>
	);
}
