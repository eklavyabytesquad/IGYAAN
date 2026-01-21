export default function StatsCards({ totalStudents, totalClasses, filteredCount }) {
	return (
		<div className="mb-6 grid gap-4 sm:grid-cols-3">
			<div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
				<div className="flex items-center gap-3">
					<div className="rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/30">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
							/>
						</svg>
					</div>
					<div>
						<p className="text-2xl font-bold text-zinc-900 dark:text-white">
							{totalStudents}
						</p>
						<p className="text-sm text-zinc-600 dark:text-zinc-400">
							Total Students
						</p>
					</div>
				</div>
			</div>

			<div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
				<div className="flex items-center gap-3">
					<div className="rounded-lg bg-sky-100 p-3 dark:bg-sky-900/30">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="h-6 w-6 text-sky-600 dark:text-sky-400"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
							/>
						</svg>
					</div>
					<div>
						<p className="text-2xl font-bold text-zinc-900 dark:text-white">
							{totalClasses}
						</p>
						<p className="text-sm text-zinc-600 dark:text-zinc-400">
							Classes
						</p>
					</div>
				</div>
			</div>

			<div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
				<div className="flex items-center gap-3">
					<div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="h-6 w-6 text-purple-600 dark:text-purple-400"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
							/>
						</svg>
					</div>
					<div>
						<p className="text-2xl font-bold text-zinc-900 dark:text-white">
							{filteredCount}
						</p>
						<p className="text-sm text-zinc-600 dark:text-zinc-400">
							Filtered Results
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
