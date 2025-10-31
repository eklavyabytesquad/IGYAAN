import studentProfile from "../data/student-profile.json";

export default function StudentProfile() {
	return (
		<div className="space-y-4">
			<div className="text-center">
				<div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-500 text-2xl font-bold text-white">
					{studentProfile.name.split(" ").map((n) => n[0]).join("")}
				</div>
				<h3 className="text-lg font-bold text-zinc-900 dark:text-white">
					{studentProfile.name}
				</h3>
				<p className="text-sm text-zinc-600 dark:text-zinc-400">
					Class {studentProfile.class} Student
				</p>
			</div>

			<div className="space-y-3 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
				<div className="flex items-start gap-3">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-indigo-500 shrink-0">
						<path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
					</svg>
					<div className="flex-1">
						<p className="text-xs text-zinc-500 dark:text-zinc-400">School</p>
						<p className="text-sm font-medium text-zinc-900 dark:text-white">
							{studentProfile.school.name}
						</p>
						<p className="text-xs text-zinc-600 dark:text-zinc-400">
							{studentProfile.school.location}
						</p>
					</div>
				</div>

				<div className="flex items-start gap-3">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-indigo-500 shrink-0">
						<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
					</svg>
					<div className="flex-1">
						<p className="text-xs text-zinc-500 dark:text-zinc-400">Class Teacher</p>
						<p className="text-sm font-medium text-zinc-900 dark:text-white">
							{studentProfile.classTeacher}
						</p>
					</div>
				</div>

				<div className="flex items-start gap-3">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-indigo-500 shrink-0">
						<path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
					</svg>
					<div className="flex-1">
						<p className="text-xs text-zinc-500 dark:text-zinc-400">Interests</p>
						<div className="mt-1 flex flex-wrap gap-1">
							{studentProfile.interests.map((interest, idx) => (
								<span key={idx} className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
									{interest}
								</span>
							))}
						</div>
					</div>
				</div>

				<div className="flex items-start gap-3">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-indigo-500 shrink-0">
						<path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
					</svg>
					<div className="flex-1">
						<p className="text-xs text-zinc-500 dark:text-zinc-400">Sleep Time</p>
						<p className="text-sm font-medium text-zinc-900 dark:text-white">
							{studentProfile.sleepTime}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
