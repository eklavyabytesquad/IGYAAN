"use client";

import { useState, useEffect } from "react";

export default function VoiceChatHistory({ onSelectChat, currentChatId, userId }) {
	const [chats, setChats] = useState([]);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

	useEffect(() => {
		if (userId) {
			loadChats();
		}
	}, [userId]);

	const loadChats = async () => {
		try {
			const response = await fetch(`/api/voice-chat?userId=${userId}`);
			const data = await response.json();
			
			if (response.ok) {
				setChats(data.chats || []);
			}
		} catch (error) {
			console.error("Error loading chats:", error);
		}
	};

	const handleDeleteChat = async (chatId) => {
		try {
			const response = await fetch(`/api/voice-chat?userId=${userId}&chatId=${chatId}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				loadChats();
				setShowDeleteConfirm(null);
				
				// If deleting current chat, notify parent
				if (currentChatId === chatId) {
					onSelectChat(null);
				}
			}
		} catch (error) {
			console.error("Error deleting chat:", error);
		}
	};

	const handleNewChat = () => {
		onSelectChat(null);
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = Math.abs(now - date);
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return "Today";
		if (diffDays === 1) return "Yesterday";
		if (diffDays < 7) return `${diffDays} days ago`;
		return date.toLocaleDateString();
	};

	// Expose loadChats to parent
	useEffect(() => {
		if (window) {
			window.reloadVoiceChats = loadChats;
		}
	}, []);

	return (
		<div className="flex h-full flex-col">
			<div className="mb-4">
				<button
					onClick={handleNewChat}
					className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-br from-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:opacity-90"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
						<path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
					</svg>
					New Voice Chat
				</button>
			</div>

			<div className="flex-1 space-y-2 overflow-y-auto">
				{chats.length === 0 ? (
					<div className="py-8 text-center">
						<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6 text-zinc-400">
								<path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
							</svg>
						</div>
						<p className="text-sm text-zinc-500 dark:text-zinc-400">
							No voice chats yet
						</p>
						<p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
							Start a new conversation above
						</p>
					</div>
				) : (
					chats.map((chat) => (
						<div
							key={chat.id}
							className={`group relative rounded-lg border p-3 transition-all ${
								currentChatId === chat.id
									? "border-purple-500 bg-purple-50 dark:border-purple-500 dark:bg-purple-900/30"
									: "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:border-zinc-600"
							}`}
						>
							<button
								onClick={() => onSelectChat(chat.id)}
								className="w-full text-left"
							>
								<div className="flex items-start justify-between gap-2">
									<div className="flex-1 min-w-0">
										<h4 className="truncate text-sm font-medium text-zinc-900 dark:text-white">
											{chat.title}
										</h4>
										<p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
											{chat.messages?.length || 0} messages
										</p>
									</div>
									<button
										onClick={(e) => {
											e.stopPropagation();
											setShowDeleteConfirm(chat.id);
										}}
										className="shrink-0 rounded p-1 text-zinc-400 opacity-0 transition-all hover:bg-red-100 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-900/30"
										title="Delete chat"
									>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
											<path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" />
										</svg>
									</button>
								</div>
								<p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
									{formatDate(chat.updated_at)}
								</p>
							</button>

							{showDeleteConfirm === chat.id && (
								<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/95 p-3 dark:bg-zinc-800/95">
									<div className="space-y-2 text-center">
										<p className="text-xs font-medium text-zinc-900 dark:text-white">
											Delete this chat?
										</p>
										<div className="flex gap-2">
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleDeleteChat(chat.id);
												}}
												className="flex-1 rounded bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600"
											>
												Delete
											</button>
											<button
												onClick={(e) => {
													e.stopPropagation();
													setShowDeleteConfirm(null);
												}}
												className="flex-1 rounded bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
											>
												Cancel
											</button>
										</div>
									</div>
								</div>
							)}
						</div>
					))
				)}
			</div>
		</div>
	);
}
