"use client";

import Image from "next/image";
import { Mic, MicOff, Plus, Send, Volume2, X } from "lucide-react";
import { useState } from "react";
import styles from "./buddy.module.css";

const buddies = [
	{ id: "maya", name: "Maya", role: "Wellbeing guide", image: "/buddy-mentor-maya.png", color: "coral" },
	{ id: "arjun", name: "Arjun", role: "Study coach", image: "/buddy-mentor-arjun.png", color: "blue" },
	{ id: "bot", name: "Nova", role: "Quick helper", image: "/asset/buddyai.jpg", color: "violet" },
];
const moodOptions = [{ emoji: "😁", label: "Great" }, { emoji: "🙂", label: "Okay" }, { emoji: "😐", label: "Unsure" }, { emoji: "🥺", label: "Low" }, { emoji: "😢", label: "Sad" }];
const prompts = ["I'm feeling stressed about exams", "Help me become more confident", "How do I make good friends?"];

export default function GyanisagePage() {
	const [buddy, setBuddy] = useState(buddies[0]);
	const [voiceMode, setVoiceMode] = useState(false);
	const [mood, setMood] = useState(null);
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [voiceActive, setVoiceActive] = useState(false);

	const sendMessage = async (prompt = input) => {
		if (!prompt.trim() || isLoading) return;
		setMessages((items) => [...items, { role: "user", content: prompt }]);
		setInput(""); setIsLoading(true);
		try {
			const response = await fetch("/api/gyanisage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "counselling", shortName: buddy.name, question: prompt, history: messages, systemPrompt: `You are ${buddy.name}, a kind, practical and age-appropriate student wellbeing companion. Give brief, supportive responses.` }) });
			const result = await response.json();
			setMessages((items) => [...items, { role: "assistant", content: result.answer || "I’m here with you. Tell me a little more and we’ll work through it together." }]);
		} catch { setMessages((items) => [...items, { role: "assistant", content: "I’m here with you. Please try again in a moment." }]); }
		finally { setIsLoading(false); }
	};

	return <main className={styles.workspace}>
		<section className={styles.panel}>
			<header className={styles.header}><div><span className={styles.statusDot} /> <h1>Buddy AI</h1><small>Your safe space to talk</small></div><div className={styles.headerActions}><button type="button" className={styles.voiceToggle} onClick={() => setVoiceMode((value) => !value)}>{voiceMode ? "Switch to text" : "Try voice mode"}</button><button type="button" onClick={() => setMessages([])} aria-label="New chat"><Plus size={17} /></button></div></header>
			<div className={styles.body}>
				<aside className={styles.buddyRail}><p>CHOOSE YOUR BUDDY</p>{buddies.map((item) => <button type="button" key={item.id} onClick={() => { setBuddy(item); setMessages([]); }} className={buddy.id === item.id ? styles.activeBuddy : ""}><Image src={item.image} alt="" width={50} height={50} /><span><strong>{item.name}</strong><small>{item.role}</small></span></button>)}</aside>
				{voiceMode ? <section className={styles.voiceScreen}><div className={styles.voiceOrb}><Image src={buddy.image} alt={buddy.name} fill sizes="280px" /></div><h2>Talking with {buddy.name}</h2><p>{voiceActive ? "I’m listening…" : "Press the microphone to start speaking"}</p><div className={styles.voiceControls}><button type="button" className={voiceActive ? styles.live : ""} onClick={() => setVoiceActive((value) => !value)}>{voiceActive ? <Mic size={22} /> : <MicOff size={22} />}</button><button type="button"><Volume2 size={21} /></button><button type="button" onClick={() => setVoiceMode(false)}><X size={21} /></button></div></section> : <section className={styles.chatScreen}>
					{messages.length === 0 ? <div className={styles.welcome}><div className={`${styles.heroPortrait} ${styles[buddy.color]}`}><Image src={buddy.image} alt={buddy.name} fill sizes="190px" priority /></div><div><span className={styles.eyebrow}>YOUR AI COMPANION</span><h2>Hi, I’m <em>{buddy.name}</em> 👋</h2><p>{buddy.role === "Study coach" ? "Let’s turn the hard stuff into a plan you can feel good about." : "You can talk to me about school, feelings, friendships, or anything on your mind."}</p></div><div className={styles.moodCard}><strong>How are you feeling today?</strong><div>{moodOptions.map((item) => <button type="button" key={item.label} onClick={() => setMood(item.label)} className={mood === item.label ? styles.selectedMood : ""}><span>{item.emoji}</span><small>{item.label}</small></button>)}</div></div></div> : <div className={styles.messages}>{messages.map((message, index) => <article key={index} className={message.role === "user" ? styles.userMessage : styles.buddyMessage}>{message.role === "assistant" && <Image src={buddy.image} alt="" width={30} height={30} />}<p>{message.content}</p></article>)}{isLoading && <article className={styles.buddyMessage}><Image src={buddy.image} alt="" width={30} height={30} /><p>{buddy.name} is thinking…</p></article>}</div>}
					<div className={styles.composerArea}><div className={styles.promptRow}>{prompts.map((prompt) => <button type="button" key={prompt} onClick={() => setInput(prompt)}>{prompt}</button>)}</div><form onSubmit={(event) => { event.preventDefault(); sendMessage(); }} className={styles.composer}><textarea rows={3} value={input} onChange={(event) => setInput(event.target.value)} placeholder={`Talk to ${buddy.name}…`} /><div><span>{mood ? `Feeling ${mood}` : "Choose a topic"}</span><button type="button" onClick={() => setVoiceMode(true)} aria-label="Use voice mode"><Mic size={17} /></button><button type="submit" disabled={!input.trim() || isLoading} aria-label="Send message"><Send size={17} /></button></div></form><p>{buddy.name} can make mistakes. Please double-check responses.</p></div>
				</section>}
			</div>
		</section>
	</main>;
}
