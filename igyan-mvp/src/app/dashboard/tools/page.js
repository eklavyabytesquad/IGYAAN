"use client";

import Link from "next/link";
import { Bot, Brain, Code2, FileText, ListChecks, Presentation, Search, Star, Target, WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";
import styles from "./tools.module.css";

const tools = [
	{ name: "Smart Notes Generator", description: "Create clear notes from a topic, lesson, or file.", href: "/dashboard/tools/notes-generator", category: "Writing", icon: FileText, tone: "blue" },
	{ name: "Text Summarizer", description: "Get the important points from lengthy content.", href: "/dashboard/tools/text-summarizer", category: "Writing", icon: ListChecks, tone: "green" },
	{ name: "Step-by-Step Guide", description: "Build a personal plan for any goal or topic.", href: "/dashboard/tools/step-by-step", category: "Practice", icon: Target, tone: "orange" },
	{ name: "Project-Based Learning", description: "Get personalized project recommendations based on your interests.", href: "/dashboard/tools/project-learning", category: "Practice", icon: WandSparkles, tone: "purple" },
	{ name: "Quiz Me", description: "Practice with AI questions and instant feedback.", href: "/dashboard/tools/quiz-me", category: "Practice", icon: Brain, tone: "pink" },
	{ name: "Code Tutor", description: "Learn programming with guided explanations.", href: "/dashboard/tools/code-tutor", category: "Code", icon: Code2, tone: "indigo" },
	{ name: "Pitch Craft", description: "Shape a confident story for your next big idea.", href: "/dashboard/content-generator", category: "Technology", icon: Presentation, tone: "peach" },
	{ name: "Sudarshan AI", description: "Ask a thoughtful question and learn with a guide.", href: "/dashboard/sudarshan", category: "Chatbots", icon: Bot, tone: "violet" },
];
const categories = ["All", "Favourites", "Chatbots", "Writing", "Language", "Research", "Practice", "Technology", "Code"];

export default function ToolsPage() {
	const [query, setQuery] = useState("");
	const [category, setCategory] = useState("All");
	const [favourites, setFavourites] = useState([]);
	const [previewTool, setPreviewTool] = useState(null);
	const displayed = useMemo(() => tools.filter((tool) => (category === "All" || category === "Favourites" ? category !== "Favourites" || favourites.includes(tool.name) : tool.category === category) && `${tool.name} ${tool.description}`.toLowerCase().includes(query.toLowerCase())), [query, category, favourites]);
	const toggleFavourite = (name) => setFavourites((items) => items.includes(name) ? items.filter((item) => item !== name) : [...items, name]);
	const PreviewIcon = previewTool?.icon;

	return <main className={styles.workspace}><section className={styles.panel}>
		<section className={styles.finder}><h2>Not sure which tool to use?</h2><label><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tell me what you’re trying to do, and I’ll find the right tools for you." /><Search size={17}/><button type="button" aria-label="Search tools"><Search size={15}/></button></label></section>
		<div className={styles.listHeader}><h2>Explore AI tools</h2><select value={category} onChange={(event) => setCategory(event.target.value)}><option>Popular</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></div>
		<nav className={styles.filters}>{categories.map((item) => <button key={item} type="button" className={category === item ? styles.active : ""} onClick={() => setCategory(item)}>{item === "Favourites" ? "Favourites" : item}</button>)}</nav>
		<div className={styles.toolGrid}>{displayed.map((tool) => <ToolCard key={tool.name} tool={tool} favourite={favourites.includes(tool.name)} toggleFavourite={toggleFavourite} onPreview={setPreviewTool} />)}</div>
		{!displayed.length && <div className={styles.empty}><h2>No matching tools yet</h2><p>Try another search or category.</p></div>}
		{previewTool && <div className={styles.previewOverlay} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreviewTool(null); }}><section className={styles.previewModal} role="dialog" aria-modal="true" aria-labelledby="tool-preview-title"><button type="button" className={styles.closePreview} onClick={() => setPreviewTool(null)} aria-label="Close preview">×</button><span className={`${styles.previewIcon} ${styles[previewTool.tone]}`}>{PreviewIcon && <PreviewIcon size={25} />}</span><p className={styles.previewLabel}>Tool preview</p><h2 id="tool-preview-title">{previewTool.name}</h2><p>{previewTool.description}</p><div><Link href={previewTool.href} className={styles.openTool}>Review tool</Link><button type="button" className={styles.cancelPreview} onClick={() => setPreviewTool(null)}>Close preview</button></div></section></div>}
	</section></main>;
}

function ToolCard({ tool, favourite, toggleFavourite, onPreview }) {
	const Icon = tool.icon;
	return <article className={styles.tool}><Link href={tool.href} className={styles.toolMain}><span className={`${styles.icon} ${styles[tool.tone]}`}><Icon size={22}/></span><div><h2>{tool.name}</h2><p>{tool.description}</p></div></Link><div className={styles.toolActions}><button type="button" onClick={() => onPreview(tool)}>Preview</button><Link href={tool.href}>Review</Link><button type="button" className={favourite ? styles.favourite : ""} onClick={() => toggleFavourite(tool.name)} aria-label={`Favourite ${tool.name}`}><Star size={15} fill={favourite ? "currentColor" : "none"}/></button></div></article>;
}
