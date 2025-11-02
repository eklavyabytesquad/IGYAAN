"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../utils/auth_context";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

export default function TextSummarizerPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [formData, setFormData] = useState({
		text: "",
		length: "medium",
		format: "paragraph",
		tone: "neutral"
	});
	const [summarizing, setSummarizing] = useState(false);
	const [summary, setSummary] = useState(null);
	const [error, setError] = useState("");
	const [stats, setStats] = useState(null);

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	const calculateStats = (original, summarized) => {
		const originalWords = original.trim().split(/\s+/).length;
		const summarizedWords = summarized.trim().split(/\s+/).length;
		const reduction = Math.round(((originalWords - summarizedWords) / originalWords) * 100);
		
		return {
			originalWords,
			summarizedWords,
			reduction,
			originalChars: original.length,
			summarizedChars: summarized.length
		};
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSummarizing(true);
		setError("");
		setSummary(null);
		setStats(null);

		try {
			const lengthInstructions = {
				short: "very brief (2-3 sentences)",
				medium: "concise but comprehensive (1 paragraph)",
				long: "detailed (2-3 paragraphs)"
			};

			const formatInstructions = {
				paragraph: "Write the summary in paragraph form with smooth transitions.",
				bullets: "Write the summary as clear bullet points highlighting key information.",
				numbered: "Write the summary as a numbered list of main points in logical order."
			};

			const toneInstructions = {
				neutral: "Use a neutral, objective tone.",
				casual: "Use a casual, conversational tone.",
				formal: "Use a formal, professional tone.",
				technical: "Use technical language and precise terminology."
			};

			const prompt = `Summarize the following text. Make it ${lengthInstructions[formData.length]}. ${formatInstructions[formData.format]} ${toneInstructions[formData.tone]}

Text to summarize:
${formData.text}

Provide ONLY the summary, no additional commentary or explanations.`;

			const response = await fetch("https://api.openai.com/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${OPENAI_API_KEY}`,
				},
				body: JSON.stringify({
					model: "gpt-4o",
					messages: [
						{
							role: "system",
							content: "You are an expert text summarizer. You create clear, accurate summaries that capture the essential information while being concise. Follow the user's formatting and length requirements precisely."
						},
						{
							role: "user",
							content: prompt
						}
					],
					temperature: 0.5,
					max_tokens: 1000,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to generate summary");
			}

			const data = await response.json();
			const summaryText = data.choices[0].message.content;
			setSummary(summaryText);
			setStats(calculateStats(formData.text, summaryText));
		} catch (err) {
			console.error("Error generating summary:", err);
			setError("Failed to generate summary. Please check your API key and try again.");
		} finally {
			setSummarizing(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const copySummary = () => {
		if (!summary) return;
		navigator.clipboard.writeText(summary);
		alert("Summary copied to clipboard!");
	};

	const downloadSummary = () => {
		if (!summary) return;
		const element = document.createElement("a");
		const file = new Blob([summary], { type: "text/plain" });
		element.href = URL.createObjectURL(file);
		element.download = "summary.txt";
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	};

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-emerald-900/20 dark:to-slate-900">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center gap-3 mb-4">
						<button
							onClick={() => router.back()}
							className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
						>
							<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						<div>
							<h1 className="text-3xl font-bold text-slate-900 dark:text-white">Text Summarizer</h1>
							<p className="text-slate-600 dark:text-slate-400 mt-1">Transform long content into concise, clear summaries</p>
						</div>
					</div>
				</div>

				<div className="grid gap-8 lg:grid-cols-2">
					{/* Input Form */}
					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
						<h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">Input Text</h2>
						
						<form onSubmit={handleSubmit} className="space-y-5">
							<div>
								<label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
									Text to Summarize <span className="text-red-500">*</span>
								</label>
								<textarea
									name="text"
									value={formData.text}
									onChange={handleInputChange}
									rows={12}
									className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
									placeholder="Paste your text here... (article, document, notes, etc.)"
									required
								/>
								<div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
									<span>
										{formData.text.trim() ? `${formData.text.trim().split(/\s+/).length} words, ${formData.text.length} characters` : "0 words"}
									</span>
									{formData.text.trim().split(/\s+/).length > 3000 && (
										<span className="text-amber-600 dark:text-amber-400">⚠️ Very long text may take time</span>
									)}
								</div>
							</div>

							<div className="grid gap-4 sm:grid-cols-3">
								<div>
									<label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
										Length
									</label>
									<select
										name="length"
										value={formData.length}
										onChange={handleInputChange}
										className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
									>
										<option value="short">Short</option>
										<option value="medium">Medium</option>
										<option value="long">Long</option>
									</select>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
										Format
									</label>
									<select
										name="format"
										value={formData.format}
										onChange={handleInputChange}
										className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
									>
										<option value="paragraph">Paragraph</option>
										<option value="bullets">Bullet Points</option>
										<option value="numbered">Numbered List</option>
									</select>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
										Tone
									</label>
									<select
										name="tone"
										value={formData.tone}
										onChange={handleInputChange}
										className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
									>
										<option value="neutral">Neutral</option>
										<option value="casual">Casual</option>
										<option value="formal">Formal</option>
										<option value="technical">Technical</option>
									</select>
								</div>
							</div>

							<button
								type="submit"
								disabled={summarizing || !formData.text.trim()}
								className="w-full rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{summarizing ? (
									<span className="flex items-center justify-center gap-2">
										<svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
										</svg>
										Summarizing...
									</span>
								) : (
									<span className="flex items-center justify-center gap-2">
										<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
										</svg>
										Generate Summary
									</span>
								)}
							</button>
						</form>
					</div>

					{/* Results */}
					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-bold text-slate-900 dark:text-white">Summary</h2>
							{summary && (
								<div className="flex gap-2">
									<button
										onClick={copySummary}
										className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
										title="Copy to clipboard"
									>
										<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
										</svg>
										Copy
									</button>
									<button
										onClick={downloadSummary}
										className="flex items-center gap-1 rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
										title="Download summary"
									>
										<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
										</svg>
										Download
									</button>
								</div>
							)}
						</div>

						{error && (
							<div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
								{error}
							</div>
						)}

						{!summary && !summarizing && !error && (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
									<svg className="h-10 w-10 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
								</div>
								<h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">No summary yet</h3>
								<p className="text-sm text-slate-600 dark:text-slate-400">Paste your text and click "Generate Summary" to get started!</p>
							</div>
						)}

						{summarizing && (
							<div className="flex flex-col items-center justify-center py-12">
								<div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mb-4"></div>
								<p className="text-slate-600 dark:text-slate-400">AI is analyzing and summarizing your text...</p>
							</div>
						)}

						{summary && stats && (
							<div className="space-y-6">
								{/* Statistics */}
								<div className="grid grid-cols-3 gap-4">
									<div className="rounded-xl bg-linear-to-br from-blue-50 to-cyan-50 p-4 dark:from-blue-900/20 dark:to-cyan-900/20">
										<div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{stats.reduction}%</div>
										<div className="text-xs font-medium text-slate-600 dark:text-slate-400">Reduction</div>
									</div>
									<div className="rounded-xl bg-linear-to-br from-purple-50 to-pink-50 p-4 dark:from-purple-900/20 dark:to-pink-900/20">
										<div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{stats.originalWords}</div>
										<div className="text-xs font-medium text-slate-600 dark:text-slate-400">Original Words</div>
									</div>
									<div className="rounded-xl bg-linear-to-br from-emerald-50 to-teal-50 p-4 dark:from-emerald-900/20 dark:to-teal-900/20">
										<div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{stats.summarizedWords}</div>
										<div className="text-xs font-medium text-slate-600 dark:text-slate-400">Summary Words</div>
									</div>
								</div>

								{/* Summary Content */}
								<div className="rounded-xl border border-emerald-100 bg-linear-to-br from-emerald-50 to-teal-50 p-6 dark:border-emerald-900/30 dark:from-emerald-900/10 dark:to-teal-900/10">
									<div className="prose prose-sm max-w-none dark:prose-invert">
										<div className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
											{summary}
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
