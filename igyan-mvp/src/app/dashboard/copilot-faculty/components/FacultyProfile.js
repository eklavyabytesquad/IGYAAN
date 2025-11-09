export default function FacultyProfile({ profile, onEditProfile }) {
	if (!profile) {
		return (
			<div className="text-center py-8">
				<div className="flex h-16 w-16 items-center justify-center mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 text-indigo-600 dark:text-indigo-400">
						<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
					</svg>
				</div>
				<p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
					No faculty profile found
				</p>
				<button
					onClick={onEditProfile}
					className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
						<path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
					</svg>
					Create Profile
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Faculty Name & Department */}
			<div className="rounded-lg border border-zinc-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-4 dark:border-zinc-700 dark:from-indigo-900/20 dark:to-purple-900/20">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-lg font-bold text-white shadow-lg">
							{profile.name?.charAt(0).toUpperCase()}
						</div>
						<div>
							<h3 className="font-semibold text-zinc-900 dark:text-white">
								{profile.name}
							</h3>
							{profile.department && (
								<p className="text-sm text-indigo-700 dark:text-indigo-400">
									{profile.department}
								</p>
							)}
							{profile.designation && (
								<p className="text-xs text-zinc-600 dark:text-zinc-400">
									{profile.designation}
								</p>
							)}
						</div>
					</div>
					<button
						onClick={onEditProfile}
						className="rounded-lg p-2 text-zinc-600 hover:bg-white/50 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
						title="Edit Profile"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
							<path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
						</svg>
					</button>
				</div>
			</div>

			{/* Teaching Details */}
			<div className="space-y-3">
				{profile.experience && (
					<div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-blue-600 dark:text-blue-400">
								<path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
							</svg>
						</div>
						<div className="flex-1">
							<p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Experience</p>
							<p className="text-sm font-semibold text-zinc-900 dark:text-white">{profile.experience} years</p>
						</div>
					</div>
				)}

				{profile.subjects && profile.subjects.length > 0 && (
					<div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
						<div className="mb-2 flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-green-600 dark:text-green-400">
								<path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
							</svg>
							<p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Subjects Teaching</p>
						</div>
						<div className="flex flex-wrap gap-1.5">
							{profile.subjects.map((subject, idx) => (
								<span
									key={idx}
									className="rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400"
								>
									{subject}
								</span>
							))}
						</div>
					</div>
				)}

				{profile.grades && profile.grades.length > 0 && (
					<div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
						<div className="mb-2 flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-purple-600 dark:text-purple-400">
								<path d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z" />
								<path d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z" />
								<path d="M4.462 19.462c.42-.419.753-.89 1-1.394.453.213.902.434 1.347.661a6.743 6.743 0 01-1.286 1.794.75.75 0 11-1.06-1.06z" />
							</svg>
							<p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Teaching Grades</p>
						</div>
						<div className="flex flex-wrap gap-1.5">
							{profile.grades.map((grade, idx) => (
								<span
									key={idx}
									className="rounded-md bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
								>
									{grade}
								</span>
							))}
						</div>
					</div>
				)}

				{profile.teachingStyle && (
					<div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
						<div className="mb-2 flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-amber-600 dark:text-amber-400">
								<path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
							</svg>
							<p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Teaching Style</p>
						</div>
						<p className="text-sm text-zinc-700 dark:text-zinc-300">{profile.teachingStyle}</p>
					</div>
				)}

				{profile.school?.name && (
					<div className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-indigo-600 dark:text-indigo-400">
								<path fillRule="evenodd" d="M3 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5H15v-18a.75.75 0 000-1.5H3zM6.75 19.5v-2.25a.75.75 0 01.75-.75h3a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75zM6 6.75A.75.75 0 016.75 6h.75a.75.75 0 010 1.5h-.75A.75.75 0 016 6.75zM9.75 6a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75zM6 9.75A.75.75 0 016.75 9h.75a.75.75 0 010 1.5h-.75A.75.75 0 016 9.75zM9.75 9a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75zM6 12.75a.75.75 0 01.75-.75h.75a.75.75 0 010 1.5h-.75a.75.75 0 01-.75-.75zM9.75 12a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75z" clipRule="evenodd" />
								<path d="M18.75 15.75h-1.5v-7.5h1.5v7.5z" />
							</svg>
						</div>
						<div className="flex-1">
							<p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">School</p>
							<p className="text-sm font-semibold text-zinc-900 dark:text-white">{profile.school.name}</p>
							{profile.school.location && (
								<p className="text-xs text-zinc-600 dark:text-zinc-400">{profile.school.location}</p>
							)}
						</div>
					</div>
				)}

				{profile.aiName && (
					<div className="rounded-lg border border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 p-3 dark:border-orange-800/50 dark:from-orange-900/20 dark:to-yellow-900/20">
						<div className="mb-1 flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-orange-600 dark:text-orange-400">
								<path d="M16.5 7.5h-9v9h9v-9z" />
								<path fillRule="evenodd" d="M8.25 2.25A.75.75 0 019 3v.75h2.25V3a.75.75 0 011.5 0v.75H15V3a.75.75 0 011.5 0v.75h.75a3 3 0 013 3v.75H21A.75.75 0 0121 9h-.75v2.25H21a.75.75 0 010 1.5h-.75V15H21a.75.75 0 010 1.5h-.75v.75a3 3 0 01-3 3h-.75V21a.75.75 0 01-1.5 0v-.75h-2.25V21a.75.75 0 01-1.5 0v-.75H9V21a.75.75 0 01-1.5 0v-.75h-.75a3 3 0 01-3-3v-.75H3A.75.75 0 013 15h.75v-2.25H3a.75.75 0 010-1.5h.75V9H3a.75.75 0 010-1.5h.75v-.75a3 3 0 013-3h.75V3a.75.75 0 01.75-.75z" clipRule="evenodd" />
							</svg>
							<p className="text-xs font-medium text-orange-900 dark:text-orange-300">AI Assistant Name</p>
						</div>
						<p className="text-sm font-semibold text-orange-700 dark:text-orange-400">{profile.aiName}</p>
					</div>
				)}
			</div>
		</div>
	);
}
