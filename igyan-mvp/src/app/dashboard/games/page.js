"use client";

import { Check, ChevronRight, Gamepad2, Search, Star, Trophy, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import styles from "./games.module.css";

const games = [
	{ title: "Math Quest", description: "Build algebra confidence through play.", category: "Quiz", level: "Level 5", time: "8 min", image: "/games/math-quest.png" },
	{ title: "Mystery of Shapes", description: "Solve visual puzzles, one clue at a time.", category: "Memory", level: "Level 4", time: "6 min", image: "/games/mystery-of-shapes.png" },
	{ title: "History Heroes", description: "Meet the people who changed the world.", category: "Vocabulary", level: "Level 6", time: "9 min", image: "/games/history-heroes.png" },
	{ title: "Biology Battles", description: "Explore life science with quick challenges.", category: "Quiz", level: "Level 7", time: "10 min", image: "/games/biology-battles.png" },
	{ title: "Puzzle Pilot", description: "Spot patterns, match ideas, and sharpen your thinking.", category: "Memory", level: "Level 5", time: "5 min", image: "/games/learning-game-cover-sheet.png", playable: true },
	{ title: "Vocabulary Wizard", description: "Expand your vocabulary with engaging games.", category: "Vocabulary", level: "Level 5", time: "8 min", image: "/games/vocabulary-wizard.png" },
	{ title: "Writing Whiz", description: "Polish your writing skills through creative prompts.", category: "Grammar", level: "Level 7", time: "10 min", image: "/games/writing-whiz.png" },
	{ title: "Grammar Hero", description: "Master grammar rules in a fun way.", category: "Grammar", level: "Level 8", time: "6 min", image: "/games/grammar-hero.png" },
	{ title: "Reading Ranger", description: "Improve reading comprehension with exciting stories.", category: "Memory", level: "Level 6", time: "7 min", image: "/games/reading-ranger.png" },
];
const filters = ["All", "Favourite", "Quiz", "Memory", "Grammar", "Vocabulary"];

export default function GamesPage() {
	const [filter, setFilter] = useState("All");
	const [query, setQuery] = useState("");
	const [playing, setPlaying] = useState(null);
	const [activeGame, setActiveGame] = useState(null);
	const [favourites, setFavourites] = useState([]);
	const visibleGames = useMemo(() => games.filter((game) => (filter === "All" || filter === "Favourite" ? filter !== "Favourite" || favourites.includes(game.title) : game.category === filter) && game.title.toLowerCase().includes(query.toLowerCase())), [filter, query, favourites]);
	const toggleFavourite = (title) => setFavourites((items) => items.includes(title) ? items.filter((item) => item !== title) : [...items, title]);
	return <main className={styles.workspace}><section className={styles.panel}><header className={styles.heading}><div><span>GAME ZONE</span><h1>Games to level up your learning</h1><p>Short challenges built around what you&apos;re studying this week.</p></div><div className={styles.points}><Trophy size={19} /><strong>1,280</strong><small>points</small></div></header><h2 className={styles.sectionTitle}>Recommended games</h2><div className={styles.recommended}>{games.slice(0, 5).map((game) => <GameCard key={game.title} game={game} onPlay={setPlaying} favourite={favourites.includes(game.title)} onFavourite={toggleFavourite} featured />)}</div><div className={styles.libraryHeader}><h2 className={styles.sectionTitle}>All games</h2><label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search games" /></label></div><div className={styles.filterRow}>{filters.map((item) => <button type="button" key={item} onClick={() => setFilter(item)} className={filter === item ? styles.activeFilter : ""}>{item === "Favourite" && <Star size={13} />}{item}</button>)}</div><div className={styles.gameList}>{visibleGames.map((game) => <GameRow key={game.title} game={game} onPlay={setPlaying} favourite={favourites.includes(game.title)} onFavourite={toggleFavourite} />)}</div></section>{playing && <div className={styles.gameModal}><div><button type="button" className={styles.modalClose} onClick={() => setPlaying(null)} aria-label="Close game preview"><X size={18} /></button><Gamepad2 size={34} /><h2>Ready for {playing.title}?</h2><p>{playing.description}</p><button type="button" onClick={() => { setActiveGame(playing); setPlaying(null); }}>Start playing <ChevronRight size={17} /></button><button type="button" className={styles.cancel} onClick={() => setPlaying(null)}>Not now</button></div></div>}{activeGame && <PuzzleGame game={activeGame} onClose={() => setActiveGame(null)} />}</main>;
}
function GameCard({ game, onPlay, favourite, onFavourite }) { return <article className={styles.gameCard}><div className={styles.gameArt}><Image src={game.image} alt="" fill sizes="(max-width: 620px) 100vw, (max-width: 950px) 33vw, 20vw" /></div><h3>{game.title}</h3><p>{game.description}</p><footer><span><Star size={13} fill="currentColor" /> 4.7</span><button type="button" onClick={() => onPlay(game)}>Play</button></footer><button type="button" onClick={() => onFavourite(game.title)} aria-label={`Favourite ${game.title}`} className={favourite ? styles.favourited : styles.cardStar}><Star size={15} fill={favourite ? "currentColor" : "none"} /></button></article>; }
function GameRow({ game, onPlay, favourite, onFavourite }) { return <article className={styles.gameRow}><Image className={styles.rowIcon} src={game.image} alt="" width={45} height={45} /><div><h3>{game.title}</h3><p>{game.description}</p><small>{game.level} <i>•</i> {game.time}</small></div><button type="button" className={styles.playSmall} onClick={() => onPlay(game)}>Play</button><button type="button" onClick={() => onFavourite(game.title)} className={favourite ? styles.favourited : styles.rowStar} aria-label={`Favourite ${game.title}`}><Star size={16} fill={favourite ? "currentColor" : "none"} /></button></article>; }

function PuzzleGame({ game, onClose }) {
	const [selected, setSelected] = useState(null);
	const answer = "Square";
	const options = ["Circle", "Square", "Triangle", "Star"];
	const isCorrect = selected === answer;
	return <div className={styles.playModal}><div className={styles.playBoard}><header><div><span>PUZZLE PILOT</span><h2>Find the pattern</h2></div><button type="button" onClick={onClose} aria-label="Close game"><X size={19} /></button></header><div className={styles.playProgress}><i /></div><p className={styles.question}>Which shape has 4 equal sides?</p><div className={styles.answers}>{options.map((option) => <button key={option} type="button" onClick={() => setSelected(option)} className={selected === option ? (isCorrect ? styles.correct : styles.incorrect) : ""} disabled={Boolean(selected)}>{option}{selected === option && (isCorrect ? <Check size={17} /> : <X size={17} />)}</button>)}</div>{selected && <div className={`${styles.feedback} ${isCorrect ? styles.feedbackGood : styles.feedbackBad}`}><strong>{isCorrect ? "Great thinking!" : "Almost there."}</strong><span>{isCorrect ? "+50 points added to your journey." : "The answer was Square. Give it another try next round."}</span><button type="button" onClick={onClose}>Back to games</button></div>}<Image className={styles.playArt} src={game.image} alt="" width={150} height={86} /></div></div>;
}
