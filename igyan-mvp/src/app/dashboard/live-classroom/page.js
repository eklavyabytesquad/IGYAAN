"use client";

import Image from "next/image";
import {
	CalendarDays, Check, ChevronLeft, Clipboard, Expand, Hand, MessageSquare,
	Mic, MicOff, MoreHorizontal, PanelRight, PhoneOff, ScreenShare, Send,
	Settings2, UsersRound, Video, VideoOff, X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./classroom.module.css";

const upcoming = [
	{ id: "maths-live", title: "Maths - Lecture Title", teacher: "Rahul Sharma", time: "Today · 10:00 AM - 11:00 AM", live: true },
	{ id: "english-next", title: "English - Lecture Title", teacher: "Rahul Sharma", time: "May 10 · 11:00 AM - 11:30 AM" }
];
const previous = [{ status: "Attended", tone: "attended" }, { status: "Attended", tone: "attended" }, { status: "Missed", tone: "missed" }];
const people = ["Rahul Sharma", "Aarav Mehta", "Ananya Singh", "Kabir Khan"];

export default function LiveClassroom() {
	const [activeClass, setActiveClass] = useState(null);
	const [micOn, setMicOn] = useState(false);
	const [videoOn, setVideoOn] = useState(false);
	const [panel, setPanel] = useState(null);
	const [handRaised, setHandRaised] = useState(false);
	const [copied, setCopied] = useState(false);
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState([{ name: "Ananya Singh", text: "Will we get a practice worksheet?", time: "10:24" }, { name: "Rahul Sharma", text: "Yes, I’ll share it after the class.", time: "10:25" }]);
	const [elapsed, setElapsed] = useState(34 * 60 + 23);
	const videoRef = useRef(null);
	const stageRef = useRef(null);
	const streamRef = useRef(null);

	useEffect(() => {
		if (!activeClass) return undefined;
		const timer = setInterval(() => setElapsed((value) => value + 1), 1000);
		return () => clearInterval(timer);
	}, [activeClass]);

	useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

	const toggleMedia = async (kind) => {
		const current = kind === "mic" ? micOn : videoOn;
		if (current) {
			streamRef.current?.getTracks().filter((track) => track.kind === (kind === "mic" ? "audio" : "video")).forEach((track) => { track.enabled = false; });
			kind === "mic" ? setMicOn(false) : setVideoOn(false);
			return;
		}
		try {
			if (!streamRef.current) streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
			streamRef.current.getTracks().filter((track) => track.kind === (kind === "mic" ? "audio" : "video")).forEach((track) => { track.enabled = true; });
			if (videoRef.current) videoRef.current.srcObject = streamRef.current;
			kind === "mic" ? setMicOn(true) : setVideoOn(true);
		} catch { alert("Please allow camera and microphone access in your browser to use this control."); }
	};

	const leaveClass = () => {
		if (!window.confirm("Do you want to leave this live class?")) return;
		streamRef.current?.getTracks().forEach((track) => track.stop());
		streamRef.current = null;
		setActiveClass(null); setPanel(null); setMicOn(false); setVideoOn(false);
	};
	const toggleFullscreen = () => stageRef.current?.requestFullscreen?.();
	const copyInvite = async () => { await navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800); };
	const sendMessage = (event) => { event.preventDefault(); if (!message.trim()) return; setMessages((items) => [...items, { name: "You", text: message.trim(), time: "now" }]); setMessage(""); };
	const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

	if (activeClass) return <main className={styles.workspace}><section className={styles.livePanel}>
		<header className={styles.liveHeader}><button type="button" onClick={leaveClass} aria-label="Back"><ChevronLeft size={18} /></button><div><small>CLASSROOM <i>•</i> LIVE CLASS</small><h1>{activeClass.title}</h1></div><span><b /> {formatTime(elapsed)}</span></header>
		<div className={styles.roomLayout}><div ref={stageRef} className={styles.videoStage}>
			<Image src="/student-hero.png" alt="Rahul Sharma teaching the live class" fill priority className={styles.teacherVideo} />
			<div className={styles.teacherLabel}><span className={styles.liveDot} /> Rahul Sharma · Host</div>
			{videoOn && <div className={styles.selfView}><video ref={videoRef} autoPlay muted playsInline /><strong>You</strong></div>}
			<button className={styles.expand} onClick={toggleFullscreen} aria-label="Fullscreen"><Expand size={19} /></button>
			<div className={styles.callControls}>
				<button onClick={() => toggleMedia("mic")} className={micOn ? styles.controlOn : ""} title={micOn ? "Mute microphone" : "Unmute microphone"}>{micOn ? <Mic size={18} /> : <MicOff size={18} />}</button>
				<button onClick={() => toggleMedia("video")} className={videoOn ? styles.controlOn : ""} title={videoOn ? "Turn camera off" : "Turn camera on"}>{videoOn ? <Video size={18} /> : <VideoOff size={18} />}</button>
				<button onClick={() => setPanel(panel === "people" ? null : "people")} className={panel === "people" ? styles.controlOn : ""} title="Participants"><UsersRound size={18} /></button>
				<button onClick={() => setHandRaised((value) => !value)} className={handRaised ? styles.handActive : ""} title="Raise hand"><Hand size={18} /></button>
				<button onClick={() => setPanel(panel === "chat" ? null : "chat")} className={panel === "chat" ? styles.controlOn : ""} title="Chat"><MessageSquare size={18} /></button>
				<button onClick={() => setPanel(panel === "more" ? null : "more")} title="More options"><MoreHorizontal size={18} /></button>
				<button className={styles.leave} onClick={leaveClass}><PhoneOff size={15} /> Leave</button>
			</div>
		</div>
		{panel && <aside className={styles.sidePanel}><div className={styles.sidePanelHead}><h2>{panel === "people" ? "People" : panel === "chat" ? "In-call messages" : "More options"}</h2><button onClick={() => setPanel(null)} aria-label="Close"><X size={17} /></button></div>
			{panel === "people" && <div className={styles.peopleList}>{people.map((person, index) => <div key={person}><span className={styles.personAvatar}>{person.split(" ").map((part) => part[0]).join("")}</span><span>{person}{index === 0 && <small>Host</small>}</span>{index === 0 ? <Mic size={15} /> : <span className={styles.mutedDot} />}</div>)}</div>}
			{panel === "chat" && <><div className={styles.messages}>{messages.map((item, index) => <div key={`${item.time}-${index}`} className={item.name === "You" ? styles.myMessage : ""}><strong>{item.name}<small>{item.time}</small></strong><p>{item.text}</p></div>)}</div><form className={styles.chatForm} onSubmit={sendMessage}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Send a message" aria-label="Send a message" /><button aria-label="Send"><Send size={16} /></button></form></>}
			{panel === "more" && <div className={styles.moreList}><button onClick={copyInvite}>{copied ? <Check size={17} /> : <Clipboard size={17} />} {copied ? "Invite link copied" : "Copy invite link"}</button><button><ScreenShare size={17} /> Share your screen</button><button><Settings2 size={17} /> Audio and video settings</button></div>}
		</aside>}
		</div>
	</section></main>;

	return <main className={styles.workspace}><section className={styles.panel}><header className={styles.pageHeader}><div><span>CLASSROOM</span><h1>Your classes</h1><p>Join live sessions and revisit your learning.</p></div><button><CalendarDays size={17} /> My timetable</button></header><section><div className={styles.sectionTitle}><h2>Upcoming classes</h2><button><Settings2 size={16} /></button></div><div className={styles.upcoming}>{upcoming.map((session) => <article key={session.id} className={session.live ? styles.liveClass : styles.futureClass}>{session.live && <div className={styles.liveMeta}><em>Live now</em><span><span className={styles.avatars}>RS +3</span>32+ students joined</span></div>}<h3>{session.title}</h3><p>{session.teacher}</p><small><CalendarDays size={13} /> {session.time}</small>{session.live && <button type="button" onClick={() => setActiveClass(session)}><Video size={15} /> Join Live Class</button>}</article>)}</div></section><section><div className={styles.sectionTitle}><h2>Previous classes</h2><button><Settings2 size={16} /></button></div><div className={styles.previous}>{previous.map((item, index) => <article key={index}><span className={styles[item.tone]}>{item.status}</span><h3>English - Lecture Title</h3><p>Rahul Sharma</p><small><CalendarDays size={13} /> May 10, 11:00 - 11:30 AM</small></article>)}</div></section></section></main>;
}
