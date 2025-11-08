export default function ChatHistory({ 
	chatHistory, 
	currentChatId, 
	onLoadChat, 
	onDeleteChat 
}) {
	return (
		<div className="space-y-2">
			{chatHistory.length === 0 ? (
				<div className="py-8 text-center">
					<p className="text-sm text-zinc-600 dark:text-zinc-400">No chat history yet</p>
					<p className="mt-1 text-xs text-zinc-500">Start a new conversation!</p>
				</div>
			) : (
				chatHistory.map((chat) => (
					<div
						key={chat.id}
						className={`group relative cursor-pointer rounded-lg p-3 transition-all hover:shadow-sm ${
							chat.id === currentChatId
								? "bg-gradient-to-r from-indigo-50 to-purple-50 border-l-2 border-indigo-500 dark:from-indigo-900/30 dark:to-purple-900/30"
								: "hover:bg-zinc-50 dark:hover:bg-zinc-800"
						}`}
						onClick={() => onLoadChat(chat)}
					>
						<div className="flex items-start justify-between gap-2">
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-indigo-500 shrink-0">
										<path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" clipRule="evenodd" />
									</svg>
									<p className="truncate text-sm font-semibold text-zinc-900 dark:text-white leading-tight">
										{chat.title}
									</p>
								</div>
								<div className="flex items-center gap-2 mt-2">
									<span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
										{chat.messages?.length || 0} messages
									</span>
									<span className="text-xs text-zinc-500">
										{new Date(chat.updatedAt).toLocaleDateString('en-US', { 
											month: 'short', 
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit'
										})}
									</span>
								</div>
							</div>
							<button
								onClick={(e) => {
									e.stopPropagation();
									onDeleteChat(chat.id);
								}}
								className="shrink-0 opacity-0 group-hover:opacity-100 rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition-all dark:hover:bg-red-900/20"
								title="Delete chat"
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
									<path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
								</svg>
							</button>
						</div>
					</div>
				))
			)}
		</div>
	);
}
