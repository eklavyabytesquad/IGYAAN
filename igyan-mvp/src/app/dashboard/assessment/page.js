"use client";

import { CheckCircle2, ChevronLeft, ChevronRight, Clock3, Flag, Send, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import styles from "./assessment.module.css";

const questionBank = [
	{ prompt: "Which fraction is equivalent to 1/2?", answers: ["2/3", "3/6", "4/7", "5/8"], correct: "3/6" },
	{ prompt: "What is 3/4 + 1/4?", answers: ["1/2", "3/4", "1", "2"], correct: "1" },
	{ prompt: "Which fraction is the greatest?", answers: ["1/4", "2/3", "3/8", "1/2"], correct: "2/3" },
	{ prompt: "What is 5/10 in its simplest form?", answers: ["1/5", "1/2", "2/5", "5/5"], correct: "1/2" },
	{ prompt: "A fraction has numerator 3 and denominator 8. Which is its decimal form?", answers: ["0.38", "0.375", "0.83", "3.8"], correct: "0.375" }
];

export default function AssessmentPage() {
	const [index, setIndex] = useState(0);
	const [answers, setAnswers] = useState({});
	const [submitted, setSubmitted] = useState(false);
	const [seconds, setSeconds] = useState(30 * 60);
	const title = useMemo(() => new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("title") || "Fractions Test", []);
	const current = questionBank[index];

	useEffect(() => {
		if (submitted) return undefined;
		const timer = setInterval(() => setSeconds((value) => {
			if (value <= 1) { clearInterval(timer); setSubmitted(true); return 0; }
			return value - 1;
		}), 1000);
		return () => clearInterval(timer);
	}, [submitted]);

	const selectAnswer = (answer) => setAnswers((value) => ({ ...value, [index]: answer }));
	const finish = () => setSubmitted(true);
	const score = questionBank.reduce((total, question, questionIndex) => total + (answers[questionIndex] === question.correct ? 1 : 0), 0);
	const formatTime = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

	if (submitted) return <main className={styles.assessment}><section className={styles.result}><CheckCircle2 size={54} /><p className={styles.eyebrow}>Assessment submitted</p><h1>{title}</h1><strong>{score} / {questionBank.length}</strong><p>You answered {Object.keys(answers).length} of {questionBank.length} questions.</p><button onClick={() => window.close()}><X size={16} /> Close assessment</button></section></main>;

	return <main className={styles.assessment}><header className={styles.header}><div><p className={styles.eyebrow}>IGYAAN · ASSESSMENT</p><h1>{title}</h1><span>Mathematics · Multiple choice questions</span></div><div className={styles.timer}><Clock3 size={17} /><strong>{formatTime}</strong><small>remaining</small></div></header><div className={styles.body}><aside className={styles.questionNav}><h2>Questions</h2><div>{questionBank.map((question, questionIndex) => <button key={question.prompt} className={`${questionIndex === index ? styles.current : ""} ${answers[questionIndex] ? styles.answered : ""}`} onClick={() => setIndex(questionIndex)}>{questionIndex + 1}{answers[questionIndex] && <CheckCircle2 size={13} />}</button>)}</div><p><Flag size={14} /> {Object.keys(answers).length} answered</p></aside><section className={styles.question}><div className={styles.questionMeta}><span>Question {index + 1} of {questionBank.length}</span><span>1 mark</span></div><div className={styles.progress}><span style={{ width: `${((index + 1) / questionBank.length) * 100}%` }} /></div><h2>{current.prompt}</h2><div className={styles.answers}>{current.answers.map((answer) => <button key={answer} className={answers[index] === answer ? styles.selected : ""} onClick={() => selectAnswer(answer)}><span>{String.fromCharCode(65 + current.answers.indexOf(answer))}</span>{answer}{answers[index] === answer && <CheckCircle2 size={18} />}</button>)}</div><div className={styles.actions}><button className={styles.secondary} disabled={index === 0} onClick={() => setIndex((value) => value - 1)}><ChevronLeft size={17} /> Previous</button>{index === questionBank.length - 1 ? <button className={styles.primary} onClick={finish}><Send size={16} /> Submit assessment</button> : <button className={styles.primary} onClick={() => setIndex((value) => value + 1)}>Next question <ChevronRight size={17} /></button>}</div></section></div></main>;
}
