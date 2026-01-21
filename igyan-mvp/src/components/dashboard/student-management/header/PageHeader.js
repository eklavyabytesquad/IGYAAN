export default function PageHeader({ onAddStudent, onBulkUpload }) {
	return (
		<div className="mb-8 flex items-center justify-between">
			<div>
				<h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
					Student Management
				</h1>
				<p className="mt-2 text-zinc-600 dark:text-zinc-400">
					Manage your students, add new records, and export data
				</p>
			</div>
			<div className="flex gap-3">
				<button
					onClick={onBulkUpload}
					className="flex items-center gap-2 rounded-lg border-2 border-indigo-500 px-4 py-2.5 text-sm font-semibold text-indigo-500 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						className="h-5 w-5"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
						/>
					</svg>
					Bulk Upload
				</button>
				<button
					onClick={onAddStudent}
					className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-indigo-600"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						className="h-5 w-5"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 4.5v15m7.5-7.5h-15"
						/>
					</svg>
					Add Student
				</button>
			</div>
		</div>
	);
}
