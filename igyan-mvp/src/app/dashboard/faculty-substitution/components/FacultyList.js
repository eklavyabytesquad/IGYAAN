import { useState } from "react";

export default function FacultyList({ facultyData, selectedDate, selectedPeriod }) {
	const [searchTerm, setSearchTerm] = useState("");
	const [subjectFilter, setSubjectFilter] = useState("all");

	const subjects = ["all", ...new Set(facultyData.map((f) => f.subject))];

	const filteredFaculty = facultyData.filter((faculty) => {
		const matchesSearch = faculty.name.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesSubject = subjectFilter === "all" || faculty.subject === subjectFilter;
		return matchesSearch && matchesSubject;
	});

	return (
		<div className="space-y-6">
			{/* Filters */}
			<div className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900/90">
				<div className="grid gap-4 md:grid-cols-2">
					<div>
						<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
							Search Faculty
						</label>
						<input
							type="text"
							placeholder="Search by name..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
							Filter by Subject
						</label>
						<select
							value={subjectFilter}
							onChange={(e) => setSubjectFilter(e.target.value)}
							className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
						>
							{subjects.map((subject) => (
								<option key={subject} value={subject}>
									{subject === "all" ? "All Subjects" : subject}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Faculty Cards */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{filteredFaculty.map((faculty) => {
					const isAvailable = faculty.availability[selectedDate]?.[selectedPeriod];
					const workloadPercentage = (faculty.currentSubstitutions / faculty.maxSubstitutionsPerWeek) * 100;

					return (
						<div
							key={faculty.id}
							className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-lg transition hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900/90"
						>
							<div className="flex items-start justify-between mb-4">
								<div className="flex-1">
									<h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
										{faculty.name}
									</h3>
									<p className="text-sm text-zinc-600 dark:text-zinc-400">
										{faculty.id}
									</p>
								</div>
								<span
									className={`rounded-full px-3 py-1 text-xs font-semibold ${
										isAvailable
											? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
											: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
									}`}
								>
									{isAvailable ? "Available" : "Busy"}
								</span>
							</div>

							<div className="space-y-3">
								<div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
									<p className="text-xs text-zinc-600 dark:text-zinc-400">Subject</p>
									<p className="text-sm font-semibold text-zinc-900 dark:text-white">
										{faculty.subject}
									</p>
								</div>

								<div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
									<p className="text-xs text-zinc-600 dark:text-zinc-400">Specialization</p>
									<p className="text-sm font-semibold text-zinc-900 dark:text-white">
										{faculty.specialization}
									</p>
								</div>

								<div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
									<p className="text-xs text-zinc-600 dark:text-zinc-400">Experience</p>
									<p className="text-sm font-semibold text-zinc-900 dark:text-white">
										{faculty.experience} years
									</p>
								</div>

								<div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
									<p className="text-xs text-zinc-600 dark:text-zinc-400">Classes</p>
									<div className="flex flex-wrap gap-1 mt-1">
										{faculty.classes.map((cls) => (
											<span
												key={cls}
												className="rounded-full bg-white px-2 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
											>
												{cls}
											</span>
										))}
									</div>
								</div>

								<div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
									<div className="flex items-center justify-between mb-2">
										<p className="text-xs text-zinc-600 dark:text-zinc-400">Workload</p>
										<p className="text-xs font-semibold text-zinc-900 dark:text-white">
											{faculty.currentSubstitutions}/{faculty.maxSubstitutionsPerWeek}
										</p>
									</div>
									<div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-700">
										<div
											className={`h-2 rounded-full transition-all ${
												workloadPercentage < 50
													? "bg-green-500"
													: workloadPercentage < 80
													? "bg-yellow-500"
													: "bg-red-500"
											}`}
											style={{ width: `${workloadPercentage}%` }}
										/>
									</div>
								</div>

								<div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
									<p className="text-xs text-zinc-600 dark:text-zinc-400 mb-1">
										Qualifications
									</p>
									<p className="text-xs text-zinc-700 dark:text-zinc-300">
										{faculty.qualifications.join(" • ")}
									</p>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{filteredFaculty.length === 0 && (
				<div className="rounded-3xl border border-zinc-200 bg-white/90 p-12 text-center shadow-lg dark:border-zinc-800 dark:bg-zinc-900/90">
					<p className="text-zinc-600 dark:text-zinc-400">
						No faculty members found matching your criteria
					</p>
				</div>
			)}
		</div>
	);
}
