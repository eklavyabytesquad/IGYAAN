"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, Eraser, Expand, Highlighter, Mic, PenLine, Send, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import styles from "./reader.module.css";

const chapterNames = ["King Midas and the Echo", "Exploring past continuous", "Understanding conditional sentences", "Diving into adjectives and adverbs", "The art of storytelling", "Crafting persuasive essays"];
const quickQuestions = ["Who was King Midas?", "Why did Pan challenge Apollo?", "What is the moral of the story?"];

export default function CourseReaderPage() {
	const { courseId } = useParams();
	const searchParams = useSearchParams();
	const chapterNumber = Number(searchParams.get("chapter") || 1);
	const chapterTitle = chapterNames[chapterNumber - 1] || chapterNames[0];
	const [question, setQuestion] = useState("");
	const [messages, setMessages] = useState([]);
	const [tool, setTool] = useState("pen");
	const [ink, setInk] = useState("#ff2b2b");
	const drawing = useRef(false);
	const lastPoint = useRef(null);
	const canvasRef = useRef(null);
	const bookFrameRef = useRef(null);

	const sendQuestion = (prompt = question) => {
		if (!prompt.trim()) return;
		setMessages((items) => [...items, { role: "user", text: prompt }, { role: "assistant", text: "Great question. Read the highlighted section once more and look for the characters, their actions, and the lesson they learn. I can explain any part step by step." }]);
		setQuestion("");
	};

	const getContext = () => {
		const canvas = canvasRef.current;
		const frame = bookFrameRef.current;
		if (!canvas || !frame) return null;
		if (canvas.width !== frame.clientWidth || canvas.height !== frame.clientHeight) {
			canvas.width = frame.clientWidth;
			canvas.height = frame.clientHeight;
		}
		return canvas.getContext("2d");
	};

	const pointFromEvent = (event) => {
		const rect = canvasRef.current.getBoundingClientRect();
		return { x: event.clientX - rect.left, y: event.clientY - rect.top };
	};

	const startDrawing = (event) => {
		event.currentTarget.setPointerCapture(event.pointerId);
		getContext();
		drawing.current = true;
		lastPoint.current = pointFromEvent(event);
	};

	const draw = (event) => {
		if (!drawing.current || !lastPoint.current) return;
		const context = getContext();
		if (!context) return;
		const point = pointFromEvent(event);
		context.save();
		context.lineCap = "round";
		context.lineJoin = "round";
		context.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
		context.globalAlpha = tool === "highlighter" ? 0.32 : 1;
		context.strokeStyle = ink;
		context.lineWidth = tool === "highlighter" ? 18 : tool === "eraser" ? 24 : 3;
		context.beginPath();
		context.moveTo(lastPoint.current.x, lastPoint.current.y);
		context.lineTo(point.x, point.y);
		context.stroke();
		context.restore();
		lastPoint.current = point;
	};

	const stopDrawing = () => { drawing.current = false; lastPoint.current = null; };
	const toggleFullscreen = () => { const frame = bookFrameRef.current; if (!document.fullscreenElement) frame?.requestFullscreen?.(); else document.exitFullscreen?.(); };

	return <main className={styles.workspace}>
		<div className={styles.breadcrumb}><Link href="/dashboard/courses" aria-label="Back to Learn"><ChevronLeft size={17} /></Link><span>Learn</span><ChevronRight size={15} /><strong>{courseId === "base-layer" ? "English" : "Subject"}</strong></div>
		<div className={styles.readerGrid}>
			<section className={styles.readerCard} aria-label="Chapter preview">
				<div className={styles.chapterSelect}><span>Chapter</span><button type="button">{chapterTitle}<ChevronDown size={18} /></button></div>
				<div className={styles.readerBody}>
					<nav className={styles.tools} aria-label="Reading tools"><button type="button" onClick={toggleFullscreen} aria-label="Expand preview"><Expand size={19} /></button><button type="button" onClick={() => setTool("pen")} className={tool === "pen" ? styles.activeTool : ""} aria-label="Pen tool"><PenLine size={19} /></button><button type="button" onClick={() => setTool("highlighter")} className={tool === "highlighter" ? styles.activeTool : ""} aria-label="Highlighter"><Highlighter size={19} /></button><button type="button" onClick={() => setTool("eraser")} className={tool === "eraser" ? styles.activeTool : ""} aria-label="Eraser"><Eraser size={19} /></button><hr />{["#ff2b2b", "#ffc515", "#3b9bd1"].map((color) => <button key={color} type="button" onClick={() => { setInk(color); setTool("pen"); }} className={ink === color && tool === "pen" ? styles.selectedColor : ""} aria-label={`Use ${color} ink`}><i style={{ backgroundColor: color }} /></button>)}</nav>
					<div ref={bookFrameRef} className={styles.bookFrame}><Image src="/king-midas-chapter.png" alt="King Midas and the Echo chapter page" fill priority sizes="(max-width: 900px) 100vw, 62vw" className={styles.bookPage} /><canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 2, width: "100%", height: "100%", touchAction: "none", cursor: "crosshair" }} onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerCancel={stopDrawing} /></div>
				</div>
			</section>
			<aside className={styles.aiCard}>
				<header><h1>Sudarshan AI</h1><div><button aria-label="New chat">+</button><button aria-label="More options">⋮</button></div></header>
				<div className={styles.conversation}>
					{messages.length === 0 ? <div className={styles.aiWelcome}><div className={styles.aiMark}><Sparkles size={29} /></div><h2>Hi, I am <span>Sudarshan AI</span> 👋</h2><p>Ask me anything about</p><strong>{chapterTitle}</strong><div className={styles.suggestions}>{quickQuestions.map((item) => <button onClick={() => sendQuestion(item)} key={item} type="button">{item}</button>)}</div></div> : <div className={styles.messages}>{messages.map((message, index) => <p key={index} className={message.role === "user" ? styles.userMessage : styles.aiMessage}>{message.text}</p>)}</div>}
				</div>
				<form onSubmit={(event) => { event.preventDefault(); sendQuestion(); }} className={styles.composer}><textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask me anything..." rows={3} /><div><button type="button" className={styles.mode}>Explanation <ChevronDown size={14} /></button><button type="button" className={styles.mic} aria-label="Voice question"><Mic size={19} /></button><button className={styles.send} type="submit" aria-label="Send question"><Send size={18} /></button></div></form>
				<p className={styles.notice}>Sudarshan AI can make mistakes. Please double-check responses.</p>
			</aside>
		</div>
	</main>;
}
