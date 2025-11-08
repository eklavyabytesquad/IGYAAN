import { useState } from "react";

export default function SubstitutionCard({ result }) {
	const [selectedFaculty, setSelectedFaculty] = useState(result.bestMatch);
	const [showConfirmation, setShowConfirmation] = useState(false);

	const handleConfirmSubstitution = () => {
		// Here you can add the logic to confirm the substitution
		console.log("Substitution confirmed for:", selectedFaculty);
		alert(`Substitution confirmed: ${selectedFaculty.name} will substitute for ${result.absentFaculty.name}`);
		setShowConfirmation(false);
	};

	const handleSelectFaculty = (faculty) => {
		setSelectedFaculty(faculty);
		setShowConfirmation(false);
	};

	return (
		<div className="rounded-3xl border border-zinc-200 bg-white/90 p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900/90 space-y-6">
			<div className="flex items-start justify-between">
				<div>
					<h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
						{selectedFaculty.id === result.bestMatch.id ? "Best Substitute Found" : "Alternative Substitute Selected"}
					</h2>
					<p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
						Match Score: <span className="font-bold text-green-600 dark:text-green-400">{selectedFaculty.matchScore}/100</span>
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
			<div className={`rounded-2xl p-5 ${selectedFaculty.id === result.bestMatch.id ? 'bg-green-50 dark:bg-green-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
				<h3 className={`text-sm font-semibold mb-3 ${selectedFaculty.id === result.bestMatch.id ? 'text-green-900 dark:text-green-300' : 'text-blue-900 dark:text-blue-300'}`}>
					{selectedFaculty.id === result.bestMatch.id ? 'Recommended Substitute' : 'Selected Substitute'}
				</h3>
				<div className="space-y-3">
					<div className="flex items-start justify-between">
						<div>
							<p className="text-lg font-semibold text-zinc-900 dark:text-white">
								{selectedFaculty.name}
							</p>
							<p className="text-xs text-zinc-600 dark:text-zinc-400">
								{selectedFaculty.qualifications.join(" • ")}
							</p>
						</div>
					</div>
					<div className="flex flex-wrap gap-2 text-xs">
						<span className="rounded-full bg-white px-3 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
							{selectedFaculty.subject}
						</span>
						<span className="rounded-full bg-white px-3 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
							{selectedFaculty.specialization}
						</span>
						<span className="rounded-full bg-white px-3 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
							{selectedFaculty.experience} years exp.
						</span>
						<span className="rounded-full bg-white px-3 py-1 font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
							Workload: {selectedFaculty.currentSubstitutions}/{selectedFaculty.maxSubstitutionsPerWeek}
						</span>
					</div>
					<div className="rounded-xl bg-white/80 p-3 dark:bg-zinc-800/50">
						<p className="text-xs text-zinc-600 dark:text-zinc-400">
							<span className="font-semibold">Classes: </span>
							{selectedFaculty.classes.join(", ")}
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
						Alternative Options (Click to Select)
					</h3>
					<div className="space-y-2">
						{result.alternativeMatches.map((alt, index) => (
							<button
								key={alt.id}
								onClick={() => handleSelectFaculty(alt)}
								className={`w-full flex items-center justify-between rounded-xl p-3 transition-all ${
									selectedFaculty.id === alt.id
										? 'bg-indigo-100 border-2 border-indigo-500 dark:bg-indigo-900/30 dark:border-indigo-400'
										: 'bg-white border-2 border-transparent hover:border-indigo-300 dark:bg-zinc-900 dark:hover:border-indigo-600'
								}`}
							>
								<div className="flex-1 text-left">
									<p className="text-sm font-medium text-zinc-900 dark:text-white">
										{alt.name}
									</p>
									<p className="text-xs text-zinc-600 dark:text-zinc-400">
										{alt.subject} • {alt.experience} years
									</p>
								</div>
								<div className="flex items-center gap-2">
									<span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
										Score: {alt.matchScore}
									</span>
									{selectedFaculty.id === alt.id && (
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-indigo-600 dark:text-indigo-400">
											<path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
										</svg>
									)}
								</div>
							</button>
						))}
					</div>
				</div>
			)}

			{/* Confirmation Dialog */}
			{showConfirmation && (
				<div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-5 dark:bg-amber-900/20 dark:border-amber-600">
					<div className="flex items-start gap-3">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0">
							<path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
						</svg>
						<div className="flex-1">
							<h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
								Confirm Substitution
							</h4>
							<p className="text-sm text-amber-800 dark:text-amber-300 mb-4">
								Are you sure you want to assign <strong>{selectedFaculty.name}</strong> to substitute for <strong>{result.absentFaculty.name}</strong>?
							</p>
							<div className="flex gap-3">
								<button
									onClick={handleConfirmSubstitution}
									className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-green-700"
								>
									Yes, Confirm
								</button>
								<button
									onClick={() => setShowConfirmation(false)}
									className="flex-1 rounded-lg border-2 border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-300"
								>
									Cancel
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Action Buttons */}
			{!showConfirmation && (
				<div className="flex flex-wrap gap-3 pt-2">
					<button
						onClick={() => setShowConfirmation(true)}
						className="flex-1 rounded-xl bg-linear-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:from-green-700 hover:to-emerald-700 hover:shadow-xl"
					>
						Assign Substitute
					</button>
				</div>
			)}
		</div>
	);
}
