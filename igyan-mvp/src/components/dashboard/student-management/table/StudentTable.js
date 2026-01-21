export default function StudentTable({ students, onDelete, onEdit }) {
	if (students.length === 0) {
		return (
			<div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
				<div className="p-12 text-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						className="mx-auto h-16 w-16 text-zinc-400"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
						/>
					</svg>
					<p className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
						No students found
					</p>
					<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
						Try adjusting your filters or add a new student
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
						<tr>
							<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
								Reg No
							</th>
							<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
								Name
							</th>
							<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
								Email
							</th>
							<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
								Class
							</th>
							<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
								Section
							</th>
							<th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
								Added On
							</th>
							<th className="px-6 py-4 text-right text-sm font-semibold text-zinc-900 dark:text-white">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
						{students.map((student) => (
							<tr
								key={student.id}
								className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
							>
								<td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-white">
									{student.regNo}
								</td>
								<td className="px-6 py-4 text-sm text-zinc-900 dark:text-white">
									{student.name}
								</td>
								<td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
									{student.email}
								</td>
								<td className="px-6 py-4 text-sm text-zinc-900 dark:text-white">
									{student.class}
								</td>
								<td className="px-6 py-4 text-sm text-zinc-900 dark:text-white">
									{student.section}
								</td>
								<td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
									{new Date(student.createdAt).toLocaleDateString()}
								</td>
								<td className="px-6 py-4 text-right">
									<div className="flex items-center justify-end gap-2">
										<button
											onClick={() => onEdit(student)}
											className="rounded-lg p-2 text-blue-500 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
											title="Edit student"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="1.5"
												className="h-5 w-5"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
												/>
											</svg>
										</button>
										<button
											onClick={() => onDelete(student.id)}
											className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
											title="Delete student"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="1.5"
												className="h-5 w-5"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
												/>
											</svg>
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
