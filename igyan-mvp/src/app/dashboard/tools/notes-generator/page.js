"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../utils/auth_context";
import NotesRenderer from "./components/NotesRenderer";
import { generateNotesPDF } from "./utils/notesPDFGenerator";

const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

export default function NotesGeneratorPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [formData, setFormData] = useState({
		topic: "",
		subject: "",
		level: "intermediate",
		length: "medium",
		style: "detailed",
		additionalInfo: ""
	});
	const [generating, setGenerating] = useState(false);
	const [notesData, setNotesData] = useState(null);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		}
	}, [user, loading, router]);

	const subjects = [
		"Computer Science", "Mathematics", "Physics", "Chemistry", "Biology",
		"History", "Geography", "Economics", "Business", "Psychology",
		"Literature", "Philosophy", "Engineering", "Medicine", "Law", "Other"
	];

	const handleSubmit = async (e) => {
		e.preventDefault();
		setGenerating(true);
		setError("");
		setNotesData(null);

		try {
			const prompt = `Create comprehensive, well-structured study notes on the following topic in JSON format:

Topic: ${formData.topic}
Subject: ${formData.subject}
Level: ${formData.level}
Length: ${formData.length}
Style: ${formData.style}
${formData.additionalInfo ? `Additional Context: ${formData.additionalInfo}` : ''}

Return a JSON object with this EXACT structure:
{
  "title": "Note title (the topic)",
  "subject": "${formData.subject}",
  "overview": "Brief 2-3 sentence overview of the topic",
  "topics": [
    {
      "title": "Main Topic 1",
      "description": "Brief intro to this topic",
      "subtopics": [
        {
          "title": "Subtopic 1.1",
          "content": "Detailed explanation",
          "keyPoints": ["Point 1", "Point 2", "Point 3"],
          "example": "Real-world example"
        }
      ]
    }
  ],
  "definitions": [
    {"term": "Term 1", "definition": "Clear definition"},
    {"term": "Term 2", "definition": "Clear definition"}
  ],
  "practiceQuestions": [
    {"question": "Question 1", "hint": "Helpful hint"},
    {"question": "Question 2", "hint": "Helpful hint"}
  ],
  "references": [
    {
      "title": "Resource name",
      "description": "What students will learn",
      "url": "https://example.com"
    }
  ],
  "summary": ["Key takeaway 1", "Key takeaway 2", "Key takeaway 3"]
}

Guidelines:
- Include ${formData.length === 'short' ? '2-3' : formData.length === 'medium' ? '3-4' : '4-5'} main topics
- Each topic should have 2-4 subtopics
- Make it ${formData.level} level appropriate
- Include 3-5 definitions, 4-6 practice questions
- Add 4-6 reference links (mix of Khan Academy, YouTube educational channels, educational websites, and documentation)
- Make references relevant for ${formData.level} learners
- Ensure all URLs are real, working educational resources

Return ONLY valid JSON, no additional text.`;

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
							content: "You are an expert educator who creates clear, well-structured study notes. Always return valid JSON with comprehensive educational content including topics, subtopics, definitions, examples, practice questions, and curated learning references. Include real educational URLs from Khan Academy, YouTube educational channels, Coursera, edX, MIT OpenCourseWare, and other reputable sources."
						},
						{
							role: "user",
							content: prompt
						}
					],
					temperature: 0.7,
					max_tokens: 4000,
					response_format: { type: "json_object" }
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to generate notes");
			}

			const data = await response.json();
			const parsedNotes = JSON.parse(data.choices[0].message.content);
			setNotesData(parsedNotes);
		} catch (err) {
			console.error("Error generating notes:", err);
			setError("Failed to generate notes. Please try again.");
		} finally {
			setGenerating(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const downloadPDF = () => {
		if (!notesData) return;
		try {
			generateNotesPDF(notesData);
		} catch (err) {
			console.error("Error generating PDF:", err);
			alert("Failed to generate PDF. Please try again.");
		}
	};

	const copyNotes = () => {
		if (!notesData) return;
		const textContent = JSON.stringify(notesData, null, 2);
		navigator.clipboard.writeText(textContent);
		alert("Notes copied to clipboard!");
	};

	const downloadJSON = () => {
		if (!notesData) return;
		const element = document.createElement("a");
		const file = new Blob([JSON.stringify(notesData, null, 2)], { type: "application/json" });
		element.href = URL.createObjectURL(file);
		element.download = `${formData.topic.replace(/\s+/g, "_")}_notes.json`;
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	};

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-white dark:from-slate-900 dark:via-blue-900/20 dark:to-slate-900">
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
							<h1 className="text-3xl font-bold text-slate-900 dark:text-white">Smart Notes Generator</h1>
							<p className="text-slate-600 dark:text-slate-400 mt-1">Transform any topic into comprehensive study notes</p>
						</div>
					</div>
				</div>

				<div className="grid gap-8 lg:grid-cols-2">
					{/* Input Form */}
					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
						<h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-white">Configure Your Notes</h2>
						
						<form onSubmit={handleSubmit} className="space-y-5">
							<div>
								<label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
									Topic <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="topic"
									value={formData.topic}
									onChange={handleInputChange}
									className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
									placeholder="E.g., Photosynthesis, World War II, Machine Learning..."
									required
								/>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
									Subject <span className="text-red-500">*</span>
								</label>
								<select
									name="subject"
									value={formData.subject}
									onChange={handleInputChange}
									className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
									required
								>
									<option value="">Select a subject</option>
									{subjects.map(subj => (
										<option key={subj} value={subj}>{subj}</option>
									))}
								</select>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
									Level
								</label>
								<select
									name="level"
									value={formData.level}
									onChange={handleInputChange}
									className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
								>
									<option value="beginner">Beginner</option>
									<option value="intermediate">Intermediate</option>
									<option value="advanced">Advanced</option>
								</select>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
										Length
									</label>
									<select
										name="length"
										value={formData.length}
										onChange={handleInputChange}
										className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
									>
										<option value="short">Short (1-2 pages)</option>
										<option value="medium">Medium (3-4 pages)</option>
										<option value="long">Long (5+ pages)</option>
									</select>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
										Style
									</label>
									<select
										name="style"
										value={formData.style}
										onChange={handleInputChange}
										className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
									>
										<option value="detailed">Detailed Explanations</option>
										<option value="concise">Concise Bullet Points</option>
										<option value="visual">Visual & Diagrams</option>
									</select>
								</div>
							</div>

							<div>
								<label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
									Additional Information (Optional)
								</label>
								<textarea
									name="additionalInfo"
									value={formData.additionalInfo}
									onChange={handleInputChange}
									rows={3}
									className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
									placeholder="Any specific areas to focus on or additional context..."
								/>
							</div>

							<button
								type="submit"
								disabled={generating}
								className="w-full rounded-lg bg-linear-to-r from-blue-600 to-cyan-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{generating ? (
									<span className="flex items-center justify-center gap-2">
										<svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
										</svg>
										Generating Notes...
									</span>
								) : (
									<span className="flex items-center justify-center gap-2">
										<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
										</svg>
										Generate Notes
									</span>
								)}
							</button>
						</form>
					</div>

					{/* Results */}
					<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800">
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Notes</h2>
							{notesData && (
								<div className="flex gap-2">
									<button
										onClick={downloadPDF}
										className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
										title="Download as PDF"
									>
										<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
										</svg>
										PDF
									</button>
									<button
										onClick={downloadJSON}
										className="flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
										title="Download as JSON"
									>
										<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
										</svg>
										JSON
									</button>
									<button
										onClick={copyNotes}
										className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
										title="Copy to clipboard"
									>
										<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
										</svg>
										Copy
									</button>
								</div>
							)}
						</div>
						
						{error && (
							<div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
								{error}
							</div>
						)}

						{!notesData && !generating && !error && (
							<div className="flex flex-col items-center justify-center py-12 text-center">
								<div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
									<svg className="h-10 w-10 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
									</svg>
								</div>
								<h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">No notes generated yet</h3>
								<p className="text-sm text-slate-600 dark:text-slate-400">Enter a topic and click "Generate Notes" to get started!</p>
							</div>
						)}

						{generating && (
							<div className="flex flex-col items-center justify-center py-12">
								<div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mb-4"></div>
								<p className="text-slate-600 dark:text-slate-400">AI is creating your structured notes...</p>
							</div>
						)}

						{notesData && (
							<div className="max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
								<NotesRenderer notesData={notesData} />
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
