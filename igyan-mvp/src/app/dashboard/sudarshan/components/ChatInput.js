export default function ChatInput({ 
	inputMessage, 
	setInputMessage, 
	onSend, 
	isTyping 
}) {
	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			onSend();
		}
	};

	return (
		<div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
			<div className="flex gap-2">
				<textarea
					value={inputMessage}
					onChange={(e) => setInputMessage(e.target.value)}
					onKeyPress={handleKeyPress}
					placeholder="Ask me anything..."
					rows="1"
					className="flex-1 resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
					disabled={isTyping}
				/>
				<button
					onClick={onSend}
					disabled={!inputMessage.trim() || isTyping}
					className="flex items-center justify-center rounded-xl bg-indigo-500 px-6 text-white transition-all hover:-translate-y-0.5 hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
						<path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
					</svg>
				</button>
			</div>
			<p className="mt-2 text-xs text-zinc-500 text-center">
				Press Enter to send • Shift+Enter for new line
			</p>
		</div>
	);
}
