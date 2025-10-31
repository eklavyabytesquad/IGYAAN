export default function VoiceMessage({ message, onReplay }) {
	const isUser = message.role === "user";

	return (
		<div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
			{!isUser && (
				<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-500 text-sm font-bold text-white">
					AI
				</div>
			)}
			
			<div className={`max-w-[80%] space-y-2 ${isUser ? "items-end" : "items-start"}`}>
				<div
					className={`rounded-2xl px-4 py-3 ${
						isUser
							? "bg-linear-to-br from-purple-500 to-pink-500 text-white"
							: "border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800"
					}`}
				>
					<p className={`text-sm ${isUser ? "text-white" : "text-zinc-900 dark:text-white"}`}>
						{message.content}
					</p>
				</div>

				<div className="flex items-center gap-2 px-2">
					{message.hasAudio && !isUser && (
						<button
							onClick={() => onReplay(message.content)}
							className="flex items-center gap-1 text-xs text-purple-500 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300"
							title="Replay audio"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
								<path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
								<path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
							</svg>
							<span>Replay</span>
						</button>
					)}
					
					<span className="text-xs text-zinc-400 dark:text-zinc-500">
						{new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
					</span>
				</div>
			</div>

			{isUser && (
				<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-sm font-bold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
					U
				</div>
			)}
		</div>
	);
}
