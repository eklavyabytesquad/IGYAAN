export default function ChatMessage({ message, user }) {
	return (
		<div
			className={`flex gap-3 ${
				message.role === "user" ? "justify-end" : "justify-start"
			}`}
		>
			{message.role === "assistant" && (
				<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-500">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-white">
						<path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
					</svg>
				</div>
			)}
			<div
				className={`max-w-[80%] rounded-2xl px-4 py-3 ${
					message.role === "user"
						? "bg-indigo-500 text-white"
						: message.isError
						? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
						: "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
				}`}
			>
				<p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
				<p className={`mt-2 text-xs ${message.role === "user" ? "text-indigo-200" : "text-zinc-500"}`}>
					{new Date(message.timestamp).toLocaleTimeString()}
				</p>
			</div>
			{message.role === "user" && (
				user?.image_base64 ? (
					<img
						src={user.image_base64}
						alt={user?.full_name || "User"}
						className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-emerald-500/30"
					/>
				) : (
					<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-teal-500 text-sm font-semibold text-white">
						{user?.full_name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "U"}
					</div>
				)
			)}
		</div>
	);
}
