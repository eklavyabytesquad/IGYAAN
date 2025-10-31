"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import VoiceChatHistory from "./components/VoiceChatHistory";
import StudentProfile from "./components/StudentProfile";
import NotesSelector from "./components/NotesSelector";
import VoiceMessage from "./components/VoiceMessage";
import studentProfile from "./data/student-profile.json";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

export default function IgyanAIPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [messages, setMessages] = useState([]);
	const [isProcessing, setIsProcessing] = useState(false);
	const [isListening, setIsListening] = useState(false);
	const [transcript, setTranscript] = useState("");
	const [currentChatId, setCurrentChatId] = useState(null);
	const [selectedNotes, setSelectedNotes] = useState(null);
	const [activeTab, setActiveTab] = useState("chats");
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);
	const [aiName, setAiName] = useState("");
	const recognitionRef = useRef(null);
	const messagesEndRef = useRef(null);
	const synthRef = useRef(null);

	// Initialize Speech Recognition and Speech Synthesis
	useEffect(() => {
		if (typeof window !== "undefined") {
			// Initialize Speech Recognition (Chrome's Web Speech API)
			const SpeechRecognition =
				window.SpeechRecognition || window.webkitSpeechRecognition;
			if (SpeechRecognition) {
				const recognition = new SpeechRecognition();
				recognition.continuous = false;
				recognition.interimResults = false;
				recognition.lang = "en-US";

				recognition.onstart = () => {
					setIsListening(true);
					setTranscript("");
				};

				recognition.onresult = (event) => {
					const speechResult = event.results[0][0].transcript;
					setTranscript(speechResult);
					processVoiceInput(speechResult);
				};

				recognition.onerror = (event) => {
					console.error("Speech recognition error:", event.error);
					setIsListening(false);
					if (event.error === "no-speech") {
						alert("No speech detected. Please try again.");
					} else if (event.error === "not-allowed") {
						alert("Microphone access denied. Please enable microphone permissions.");
					}
				};

				recognition.onend = () => {
					setIsListening(false);
				};

				recognitionRef.current = recognition;
			} else {
				console.error("Speech Recognition not supported");
			}

			// Initialize Speech Synthesis
			synthRef.current = window.speechSynthesis;
		}
	}, []);

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	// Load AI name from localStorage or set default
	useEffect(() => {
		if (user) {
			const savedName = localStorage.getItem(`ai-companion-name-${user.id}`);
			if (savedName) {
				setAiName(savedName);
			} else {
				const studentFirstName = user.full_name?.split(" ")[0] || "Student";
				setAiName(`${studentFirstName}'s Companion`);
			}
		}
	}, [user]);

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	// Load chat from localStorage
	useEffect(() => {
		if (currentChatId && user) {
			loadChat(currentChatId);
		}
	}, [currentChatId, user]);

	// Save chat to localStorage when messages change
	useEffect(() => {
		if (currentChatId && messages.length > 0 && user) {
			saveChat();
		}
	}, [messages, currentChatId, user]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const loadChat = (chatId) => {
		const storageKey = `viva-chat-${user.id}-${chatId}`;
		const savedChat = localStorage.getItem(storageKey);
		if (savedChat) {
			const chatData = JSON.parse(savedChat);
			setMessages(chatData.messages || []);
			setSelectedNotes(chatData.selectedNotes || null);
		}
	};

	const saveChat = async () => {
		const storageKey = `viva-chat-${user.id}-${currentChatId}`;
		
		// Generate title if this is a new chat (first message)
		let title = "New Voice Chat";
		const existingChat = localStorage.getItem(storageKey);
		if (existingChat) {
			title = JSON.parse(existingChat).title;
		} else if (messages.length > 0) {
			// Generate AI title from first user message
			title = await generateChatTitle(messages[0].content);
		}

		const chatData = {
			title,
			messages,
			selectedNotes,
			lastUpdated: new Date().toISOString(),
		};
		
		localStorage.setItem(storageKey, JSON.stringify(chatData));
	};

	const generateChatTitle = async (firstMessage) => {
		try {
			const response = await fetch("https://api.openai.com/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${OPENAI_API_KEY}`,
				},
				body: JSON.stringify({
					model: "gpt-3.5-turbo",
					messages: [
						{
							role: "system",
							content: "Generate a short, concise title (max 5 words) for a chat that starts with this message. Just return the title, nothing else.",
						},
						{
							role: "user",
							content: firstMessage,
						},
					],
					temperature: 0.7,
					max_tokens: 20,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				return data.choices[0].message.content.trim().replace(/['"]/g, "");
			}
		} catch (error) {
			console.error("Error generating title:", error);
		}
		return "New Voice Chat";
	};

	const handleSelectChat = (chatId) => {
		if (chatId === null) {
			// New chat
			setCurrentChatId(Date.now().toString());
			setMessages([]);
			setSelectedNotes(null);
		} else {
			setCurrentChatId(chatId);
		}
	};

	const handleNotesSelect = (notes) => {
		setSelectedNotes(notes);
	};

	const handleAiNameChange = (newName) => {
		setAiName(newName);
		localStorage.setItem(`ai-companion-name-${user.id}`, newName);
	};

	const startListening = () => {
		if (recognitionRef.current && !isListening) {
			recognitionRef.current.start();
		}
	};

	const stopListening = () => {
		if (recognitionRef.current && isListening) {
			recognitionRef.current.stop();
		}
	};

	const processVoiceInput = async (transcribedText) => {
		setIsProcessing(true);

		// Add user message
		const userMessage = {
			role: "user",
			content: transcribedText,
			timestamp: new Date().toISOString(),
			hasAudio: false,
		};
		setMessages((prev) => [...prev, userMessage]);

		try {
			// Build context with student profile and selected notes
			const companionName = aiName || "AI Companion";
			const studentFirstName = studentProfile.name.split(" ")[0];
			const mentorSummary = studentProfile.mentors
				?.map((mentor) => `${mentor.name} (${mentor.role})`)
				.join(", ");
			const profileContext = [
				`Student: ${studentProfile.name}, Grade ${studentProfile.class} Section ${studentProfile.section}, House ${studentProfile.house}.`,
				`Learning style: ${studentProfile.learningStyle}.`,
				`Interests: ${studentProfile.interests.join(", ")}.`,
				`Recent wins: ${studentProfile.recentWins.join("; ")}.`,
				`Goals: ${studentProfile.academicGoals.join("; ")}.`,
				`Strengths: ${studentProfile.strengths.join("; ")}.`,
				mentorSummary ? `Mentor circle: ${mentorSummary}.` : null,
				`Study schedule weekdays ${studentProfile.studySchedule?.weekday} and weekends ${studentProfile.studySchedule?.weekend}.`
			]
				.filter(Boolean)
				.join(" ");
			let systemContext = `You are ${companionName}, the spirited iGyanAI mentor for ${studentFirstName}. Mix clarity with playful wit, lean into ${studentFirstName}'s love for comedy, and give crisp explanations that nod to their strengths and goals. Keep the tone encouraging, modern, and emoji-friendly. Cap responses at 140 words for smooth narration. Always reference at least one relevant detail from the student profile or their recent wins/goals.`;
		
			if (selectedNotes) {
				systemContext += `\n\nCurrent study focus: Subject ${selectedNotes.subject}, Chapter ${selectedNotes.chapter}, Topic ${selectedNotes.topic}. Connect explanations back to this focus and suggest how it links to ${studentFirstName}'s ambitions.`;
			}

			systemContext += `\n\nStudent profile insights: ${profileContext}`;

			// Call OpenAI API for AI response
			const response = await fetch("https://api.openai.com/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${OPENAI_API_KEY}`,
				},
				body: JSON.stringify({
					model: "gpt-3.5-turbo",
					messages: [
						{
							role: "system",
							content: systemContext,
						},
						...messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
						{
							role: "user",
							content: transcribedText,
						},
					],
					temperature: 0.7,
					max_tokens: 300,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to get AI response");
			}

			const data = await response.json();
			const aiResponse = data.choices[0].message.content;

			// Add AI response message
			const aiMessage = {
				role: "assistant",
				content: aiResponse,
				timestamp: new Date().toISOString(),
				hasAudio: true,
			};
			setMessages((prev) => [...prev, aiMessage]);

			// Speak the response using Web Speech API
			speakText(aiResponse);
		} catch (error) {
			console.error("Error processing voice:", error);
			const errorMessage = {
				role: "assistant",
				content:
					"Sorry, I encountered an error processing your request. Please make sure your API key is configured correctly.",
				timestamp: new Date().toISOString(),
				isError: true,
				hasAudio: false,
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsProcessing(false);
		}
	};

	const speakText = (text) => {
		if (synthRef.current) {
			// Cancel any ongoing speech
			synthRef.current.cancel();

			const utterance = new SpeechSynthesisUtterance(text);
			utterance.rate = 1.0;
			utterance.pitch = 1.0;
			utterance.volume = 1.0;

			// Try to use a female voice if available
			const voices = synthRef.current.getVoices();
			const femaleVoice =
				voices.find((voice) => voice.name.includes("Female")) ||
				voices.find((voice) => voice.name.includes("Zira")) ||
				voices.find((voice) => voice.name.includes("Google US English")) ||
				voices[0];

			if (femaleVoice) {
				utterance.voice = femaleVoice;
			}

			synthRef.current.speak(utterance);
		}
	};

	const toggleListening = () => {
		if (isListening) {
			stopListening();
		} else {
			startListening();
		}
	};

	const replayAudio = (messageContent) => {
		speakText(messageContent);
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
					<p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
						Loading AI Companion...
					</p>
				</div>
			</div>
		);
	}

	if (!user) return null;

	// Initialize chat ID if needed
	if (!currentChatId && messages.length === 0) {
		setCurrentChatId(Date.now().toString());
	}

	return (
		<div className="flex h-[calc(100vh-4rem)] gap-6 p-4 lg:p-6" style={{
			background: 'var(--dashboard-background)'
		}}>
			{/* Sidebar */}
			<div className={`${isSidebarOpen ? "w-80" : "w-0"} shrink-0 transition-all duration-300 overflow-hidden`}>
				<div className="flex h-full flex-col rounded-3xl border border-purple-200/50 bg-white/80 backdrop-blur-xl shadow-2xl shadow-purple-500/10 dark:border-purple-900/30 dark:bg-zinc-900/80">
				{/* Sidebar Header with Gradient */}
				<div className="relative border-b p-6 overflow-hidden" style={{
					background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`,
					borderColor: 'var(--dashboard-border)'
				}}>
					<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
					<div className="relative flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="h-7 w-7 text-white"
							>
								<path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
								<path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
							</svg>
						</div>
						<div>
							<h2 className="text-lg font-bold text-white drop-shadow-sm">
								{aiName || "AI Companion"}
							</h2>
							<p className="text-xs text-white/90 font-medium">
								Voice Learning Assistant
							</p>
						</div>
					</div>
				</div>
					{/* Tabs */}
					<div className="flex border-b" style={{
						borderColor: 'var(--dashboard-border)',
						background: `linear-gradient(180deg, color-mix(in srgb, var(--dashboard-primary) 8%, transparent), transparent)`
					}}>
						<button
							onClick={() => setActiveTab("chats")}
							className={`group flex-1 px-4 py-3.5 text-sm font-medium transition-all duration-200 relative`}
							style={{
								color: activeTab === "chats" ? 'var(--dashboard-primary)' : 'var(--dashboard-muted)'
							}}
						>
							{activeTab === "chats" && (
								<div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{
									background: `linear-gradient(90deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, transparent))`
								}}></div>
							)}
							<div className="flex items-center justify-center gap-2">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
									<path fillRule="evenodd" d="M3.43 2.524A41.29 41.29 0 0110 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.202 41.202 0 01-5.183.501.78.78 0 00-.528.224l-3.579 3.58A.75.75 0 016 17.25v-3.443a41.033 41.033 0 01-2.57-.33C1.993 13.244 1 11.986 1 10.573V5.426c0-1.413.993-2.67 2.43-2.902z" clipRule="evenodd" />
								</svg>
								Chats
							</div>
						</button>
						<button
							onClick={() => setActiveTab("profile")}
							className={`group flex-1 px-4 py-3.5 text-sm font-medium transition-all duration-200 relative`}
							style={{
								color: activeTab === "profile" ? 'var(--dashboard-primary)' : 'var(--dashboard-muted)'
							}}
						>
							{activeTab === "profile" && (
								<div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{
									background: `linear-gradient(90deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, transparent))`
								}}></div>
							)}
							<div className="flex items-center justify-center gap-2">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
									<path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
								</svg>
								Profile
							</div>
						</button>
						<button
							onClick={() => setActiveTab("notes")}
							className={`group flex-1 px-4 py-3.5 text-sm font-medium transition-all duration-200 relative`}
							style={{
								color: activeTab === "notes" ? 'var(--dashboard-primary)' : 'var(--dashboard-muted)'
							}}
						>
							{activeTab === "notes" && (
								<div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{
									background: `linear-gradient(90deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, transparent))`
								}}></div>
							)}
							<div className="flex items-center justify-center gap-2">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
									<path d="M3.196 12.87l-.825.483a.75.75 0 000 1.294l7.25 4.25a.75.75 0 00.758 0l7.25-4.25a.75.75 0 000-1.294l-.825-.484-5.666 3.322a2.25 2.25 0 01-2.276 0L3.196 12.87z" />
									<path d="M3.196 8.87l-.825.483a.75.75 0 000 1.294l7.25 4.25a.75.75 0 00.758 0l7.25-4.25a.75.75 0 000-1.294l-.825-.484-5.666 3.322a2.25 2.25 0 01-2.276 0L3.196 8.87z" />
									<path d="M10.38 1.103a.75.75 0 00-.76 0l-7.25 4.25a.75.75 0 000 1.294l7.25 4.25a.75.75 0 00.76 0l7.25-4.25a.75.75 0 000-1.294l-7.25-4.25z" />
								</svg>
								Notes
							</div>
						</button>
					</div>

					{/* Tab Content */}
					<div className="flex-1 overflow-y-auto p-4">
						{activeTab === "chats" && (
							<VoiceChatHistory
								onSelectChat={handleSelectChat}
								currentChatId={currentChatId}
								userId={user?.id}
							/>
						)}
						{activeTab === "profile" && (
							<StudentProfile 
								aiName={aiName}
								onAiNameChange={handleAiNameChange}
							/>
						)}
						{activeTab === "notes" && (
							<NotesSelector
								onNotesSelect={handleNotesSelect}
								selectedNotes={selectedNotes}
							/>
						)}
					</div>
				</div>
			</div>

			{/* Main Chat Area */}
			<div className="flex flex-1 flex-col rounded-3xl border border-purple-200/50 bg-white/80 backdrop-blur-xl shadow-2xl shadow-purple-500/10 dark:border-purple-900/30 dark:bg-zinc-900/80 overflow-hidden">
				{/* Header with Gradient */}
				<div className="relative flex items-center justify-between border-b backdrop-blur-md p-5" style={{
					borderColor: 'var(--dashboard-border)',
					backgroundColor: 'var(--dashboard-surface)'
				}}>
					<div className="absolute inset-0" style={{
						background: `linear-gradient(90deg, color-mix(in srgb, var(--dashboard-primary) 5%, transparent), color-mix(in srgb, var(--dashboard-primary) 3%, transparent), color-mix(in srgb, var(--dashboard-primary) 5%, transparent))`
					}}></div>
					<div className="relative flex items-center gap-4">
						<button
							onClick={() => setIsSidebarOpen(!isSidebarOpen)}
							className="group rounded-xl p-2.5 text-zinc-600 transition-all duration-200 hover:bg-purple-100 hover:text-purple-600 dark:text-zinc-400 dark:hover:bg-purple-900/30 dark:hover:text-purple-400"
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 transition-transform group-hover:scale-110">
								<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
							</svg>
						</button>
						<div className="relative">
							<div className="absolute inset-0 animate-pulse rounded-full opacity-20 blur-md" style={{
								background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`
							}}></div>
							<div className="relative flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg" style={{
								background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`,
								boxShadow: `0 10px 25px -10px var(--dashboard-primary)`
							}}>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="h-6 w-6 text-white"
								>
									<path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
									<path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
								</svg>
							</div>
						</div>
						<div>
							<h2 className="text-lg font-bold text-zinc-900 dark:text-white">
								{aiName || "AI Companion"}
							</h2>
							<p className="text-xs font-medium" style={{color: 'var(--dashboard-muted)'}}>
								{selectedNotes ? (
									<span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5" style={{
										backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)',
										color: 'var(--dashboard-primary)'
									}}>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
											<path d="M3.196 12.87l-.825.483a.75.75 0 000 1.294l7.25 4.25a.75.75 0 00.758 0l7.25-4.25a.75.75 0 000-1.294l-.825-.484-5.666 3.322a2.25 2.25 0 01-2.276 0L3.196 12.87z" />
											<path d="M3.196 8.87l-.825.483a.75.75 0 000 1.294l7.25 4.25a.75.75 0 00.758 0l7.25-4.25a.75.75 0 000-1.294l-.825-.484-5.666 3.322a2.25 2.25 0 01-2.276 0L3.196 8.87z" />
											<path d="M10.38 1.103a.75.75 0 00-.76 0l-7.25 4.25a.75.75 0 000 1.294l7.25 4.25a.75.75 0 00.76 0l7.25-4.25a.75.75 0 000-1.294l-7.25-4.25z" />
										</svg>
										{selectedNotes.subject} • {selectedNotes.topic}
									</span>
								) : (
									"Speak naturally, learn effortlessly ✨"
								)}
							</p>
						</div>
					</div>
					<div className="relative flex items-center gap-3">
						{isListening && (
							<div className="flex items-center gap-2.5 rounded-full bg-red-100 px-4 py-2 dark:bg-red-900/30">
								<div className="relative flex h-3 w-3">
									<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75"></span>
									<span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
								</div>
								<span className="text-sm font-semibold text-red-600 dark:text-red-400">
									Listening...
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Messages Container */}
				<div className="flex-1 overflow-y-auto p-6 space-y-4">
					{messages.length === 0 ? (
						<div className="flex h-full flex-col items-center justify-center gap-8 text-center px-4">
							<div className="relative">
								<div className="absolute inset-0 animate-pulse rounded-full opacity-30 blur-2xl" style={{
									background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`
								}}></div>
								<div className="relative flex h-24 w-24 items-center justify-center rounded-3xl shadow-2xl animate-float" style={{
									background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`,
									boxShadow: `0 25px 50px -20px var(--dashboard-primary)`
								}}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										className="h-12 w-12 text-white"
									>
										<path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
										<path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
									</svg>
								</div>
							</div>
							<div className="space-y-3">
								<h3 className="text-3xl font-extrabold" style={{
									background: `linear-gradient(90deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 80%, #000), var(--dashboard-primary))`,
									WebkitBackgroundClip: 'text',
									WebkitTextFillColor: 'transparent',
									backgroundClip: 'text'
								}}>
									Welcome to {aiName || "AI Companion"}! 🎤
								</h3>
								<p className="text-base max-w-md mx-auto" style={{color: 'var(--dashboard-muted)'}}>
									Press the microphone button below to start an interactive voice conversation
								</p>
							</div>

							{/* Features Grid */}
							<div className="grid gap-4 sm:grid-cols-2 max-w-3xl w-full mt-6">
								<div className="dashboard-card group rounded-2xl p-5 text-left shadow-lg transition-all duration-300 hover:shadow-xl" style={{
									background: `linear-gradient(135deg, color-mix(in srgb, var(--dashboard-primary) 8%, var(--dashboard-surface-solid)), var(--dashboard-surface-solid))`
								}}>
									<div className="flex items-center gap-3 mb-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110" style={{
											background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 85%, #000))`
										}}>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="currentColor"
												className="h-5 w-5 text-white"
											>
												<path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
												<path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
											</svg>
										</div>
										<h4 className="font-bold" style={{color: 'var(--dashboard-heading)'}}>
											Voice Input
										</h4>
									</div>
									<p className="text-sm leading-relaxed" style={{color: 'var(--dashboard-muted)'}}>
										Ask questions using your voice naturally
									</p>
								</div>

								<div className="dashboard-card group rounded-2xl p-5 text-left shadow-lg transition-all duration-300 hover:shadow-xl" style={{
									background: `linear-gradient(135deg, color-mix(in srgb, var(--dashboard-primary) 8%, var(--dashboard-surface-solid)), var(--dashboard-surface-solid))`
								}}>
									<div className="flex items-center gap-3 mb-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110" style={{
											background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 85%, #000))`
										}}>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="currentColor"
												className="h-5 w-5 text-white"
											>
												<path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
												<path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
											</svg>
										</div>
										<h4 className="font-bold" style={{color: 'var(--dashboard-heading)'}}>
											Voice Response
										</h4>
									</div>
									<p className="text-sm leading-relaxed" style={{color: 'var(--dashboard-muted)'}}>
										Get answers spoken back to you in natural voice
									</p>
								</div>

								<div className="dashboard-card group rounded-2xl p-5 text-left shadow-lg transition-all duration-300 hover:shadow-xl" style={{
									background: `linear-gradient(135deg, color-mix(in srgb, var(--dashboard-primary) 8%, var(--dashboard-surface-solid)), var(--dashboard-surface-solid))`
								}}>
									<div className="flex items-center gap-3 mb-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110" style={{
											background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 85%, #000))`
										}}>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="currentColor"
												className="h-5 w-5 text-white"
											>
												<path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c.966 0 1.89.166 2.75.47a.75.75 0 001-.708V4.262a.75.75 0 00-.5-.707A9.735 9.735 0 0018 3a9.707 9.707 0 00-5.25 1.533v16.103z" />
											</svg>
										</div>
										<h4 className="font-bold" style={{color: 'var(--dashboard-heading)'}}>
											Study Notes
										</h4>
									</div>
									<p className="text-sm leading-relaxed" style={{color: 'var(--dashboard-muted)'}}>
										Select topics from your curriculum for focused learning
									</p>
								</div>

								<div className="dashboard-card group rounded-2xl p-5 text-left shadow-lg transition-all duration-300 hover:shadow-xl" style={{
									background: `linear-gradient(135deg, color-mix(in srgb, var(--dashboard-primary) 8%, var(--dashboard-surface-solid)), var(--dashboard-surface-solid))`
								}}>
									<div className="flex items-center gap-3 mb-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110" style={{
											background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 85%, #000))`
										}}>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="currentColor"
												className="h-5 w-5 text-white"
											>
												<path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" />
											</svg>
										</div>
										<h4 className="font-bold" style={{color: 'var(--dashboard-heading)'}}>
											Chat History
										</h4>
									</div>
									<p className="text-sm leading-relaxed" style={{color: 'var(--dashboard-muted)'}}>
										Auto-saved conversations with smart titles
									</p>
								</div>
							</div>
						</div>
					) : (
						<>
							{messages.map((message, index) => (
								<VoiceMessage
									key={index}
									message={message}
									onReplay={replayAudio}
								/>
							))}
							{isProcessing && (
								<div className="flex gap-3 justify-start">
									<div className="flex h-8 w-8 items-center justify-center rounded-full" style={{
										background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`
									}}>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											className="h-5 w-5 text-white"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
											/>
										</svg>
									</div>
									<div className="rounded-2xl bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
										<div className="flex gap-1">
											<span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]"></span>
											<span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]"></span>
											<span className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"></span>
										</div>
									</div>
								</div>
							)}
							<div ref={messagesEndRef} />
						</>
					)}
				</div>

				{/* Input Area - Voice Recording */}
				<div className="relative border-t backdrop-blur-md p-8" style={{
					borderColor: 'var(--dashboard-border)',
					backgroundColor: 'var(--dashboard-surface)'
				}}>
					<div className="absolute inset-0" style={{
						background: `linear-gradient(0deg, color-mix(in srgb, var(--dashboard-primary) 5%, transparent), color-mix(in srgb, var(--dashboard-primary) 3%, transparent), transparent)`
					}}></div>
					<div className="relative flex flex-col items-center gap-5">
						<div className="relative">
							{/* Pulse rings for listening state */}
							{isListening && (
								<>
									<div className="absolute inset-0 -m-8 animate-ping rounded-full bg-red-500 opacity-20"></div>
									<div className="absolute inset-0 -m-4 animate-pulse rounded-full bg-red-500 opacity-30"></div>
								</>
							)}
							{/* Glow effect for idle state */}
							{!isListening && !isProcessing && (
								<div className="absolute inset-0 -m-6 animate-pulse rounded-full opacity-20 blur-2xl" style={{
									background: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 70%, #000))`
								}}></div>
							)}
							<button
								onClick={toggleListening}
								disabled={isProcessing}
								className="group relative flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300 transform shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
								style={{
									background: isListening 
										? 'linear-gradient(135deg, #ef4444, #dc2626)' 
										: `linear-gradient(135deg, var(--dashboard-primary), color-mix(in srgb, var(--dashboard-primary) 85%, #000))`,
									boxShadow: isListening 
										? '0 25px 50px -20px rgba(239, 68, 68, 0.5)' 
										: `0 25px 50px -20px var(--dashboard-primary)`,
									transform: isListening ? 'scale(1.05)' : 'scale(1)'
								}}
								onMouseEnter={(e) => {
									if (!isListening && !isProcessing) {
										e.currentTarget.style.transform = 'scale(1.1)';
									}
								}}
								onMouseLeave={(e) => {
									if (!isListening && !isProcessing) {
										e.currentTarget.style.transform = 'scale(1)';
									}
								}}
							>
								{isListening ? (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										className="h-12 w-12 text-white transition-transform group-hover:scale-90"
									>
										<path
											fillRule="evenodd"
											d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z"
											clipRule="evenodd"
										/>
									</svg>
								) : (
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										className="h-12 w-12 text-white transition-transform group-hover:scale-110"
									>
										<path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
										<path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
									</svg>
								)}
							</button>
						</div>
						<div className="flex flex-col items-center gap-2">
							<p className="text-base font-semibold text-center" style={{color: 'var(--dashboard-heading)'}}>
								{isListening
									? "🎤 Listening... Speak now!"
									: isProcessing
									? "⚡ Processing your voice..."
									: "Click to start speaking"}
							</p>
							{!isListening && !isProcessing && (
								<p className="text-sm text-center max-w-lg leading-relaxed" style={{color: 'var(--dashboard-muted)'}}>
									💡 <span className="font-medium">Pro tip:</span> Click the microphone, speak your question clearly, and the AI
									will respond with voice!
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
