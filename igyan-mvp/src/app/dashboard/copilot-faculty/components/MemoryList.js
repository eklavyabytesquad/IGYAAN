export default function MemoryList({ memories, onDeleteMemory, type = "overall" }) {
	return (
		<div className="space-y-3">
			{memories.length === 0 ? (
				<div className="py-8 text-center">
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						{type === "session" ? "No session memories yet" : "No memories yet"}
					</p>
					<p className="mt-1 text-xs text-zinc-500">
						{type === "session" ? "Session summaries will appear here" : "Chat summaries will appear here"}
					</p>
				</div>
			) : (
				memories.map((memory) => (
					<div
						key={memory.id}
						className="group relative rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800"
					>
						<p className="text-xs text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
							{memory.summary}
						</p>
						<p className="mt-2 text-xs text-zinc-500">
							{new Date(memory.createdAt).toLocaleDateString()}
						</p>
						<button
							onClick={() => onDeleteMemory(memory.id)}
							className="absolute right-2 top-2 hidden rounded p-1 text-red-500 hover:bg-red-50 group-hover:block dark:hover:bg-red-900/20"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
								<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				))
			)}
		</div>
	);
}
