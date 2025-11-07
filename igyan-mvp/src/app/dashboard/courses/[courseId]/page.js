"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import VideoPlayer from "@/components/VideoPlayer";

// Course data mapping - Module 1: Main PDF, Module 2: Mind Map PDF, Module 3: Video
const courseDataMap = {
	"base-layer": {
		title: "Base Layer",
		module1English: "https://drive.google.com/file/d/18wbzZ9RN1QE2zN4zwnZ03vNeL_lXC9Zg/view?usp=drive_link",
		module2English: "https://drive.google.com/file/d/1ItN8tM6FTWw2gDHZOyCQ-wp0Xdhgyy9A/view?usp=sharing",
		module1Hindi: "https://drive.google.com/file/d/18zsKcJgVbFLfNMN0hQMlVGGWMqB5Qp06/view?usp=drive_link",
		module2Hindi: "https://drive.google.com/file/d/1r5iX2AjP3xLDDHiiSy9LJZDhsdtGxkp3/view?usp=drive_link",
		module3English: "https://drive.google.com/file/d/1BnyaZKZcabxpUmT6f0thphsNUQmDRbG3/view?usp=sharing",
		module3Hindi: "https://drive.google.com/file/d/10cZw2Ar8gfSNy5U0QdwLKzHuqrpd5MT4/view?usp=sharing",
	},
	"everyday-tech": {
		title: "Everyday Tech",
		module1English: "https://drive.google.com/file/d/1iKOBrL8NzFhuitm3J0AL1PIwuZW9Uroc/view?usp=drive_link",
		module2English: "https://drive.google.com/file/d/19VkrybLK1LdMvOF5hotDJvfse6oNoaZQ/view?usp=drive_link",
		module1Hindi: "https://drive.google.com/file/d/1oTqd0z2GULBRm_1n9_8alUxtw_yLgbGp/view?usp=drive_link",
		module2Hindi: "https://drive.google.com/file/d/1oCMrzeNd_0i-77afQX3PSSIf1_STrSEK/view?usp=drive_link",
		module3English: "https://drive.google.com/file/d/1nxcpSFHTxbyDvwYPO5u353ztBUqz4Cax/view?usp=sharing",
		module3Hindi: "https://drive.google.com/file/d/1oTqd0z2GULBRm_1n9_8alUxtw_yLgbGp/view?usp=sharing",
	},
	"hustle-and-earn": {
		title: "Hustle and Earn",
		module1English: "https://drive.google.com/file/d/1VKsegGXI3aL81gev1XcxZee0unuPTzYN/view?usp=drive_link",
		module2English: "https://drive.google.com/file/d/1VZpINhlGwjmH0K759WVBOvceJ33zO_JF/view?usp=drive_link",
		module1Hindi: "https://drive.google.com/file/d/1aiOkrYdApO6CxXdlHOgj8uM2-R_SfAYv/view?usp=sharing",
		module2Hindi: "https://drive.google.com/file/d/1kHWXhgMJRoDbttGpiVGYsV_JGVMI0VXV/view?usp=drive_link",
		module3English: "https://drive.google.com/file/d/1FFGIKPPd71DbUjK_7t_014vFGSd2jrxS/view?usp=sharing",
		module3Hindi: "https://drive.google.com/file/d/1PtYEDFCoqdtAYJ9Wl8pr3I6fRikorCpe/view?usp=sharing",
	},
	"professional-edge": {
		title: "Professional Edge",
		module1English: "https://drive.google.com/file/d/1v-pJfuGHHzb5JhTrXmv3F_DiM25SeBVF/view?usp=drive_link",
		module2English: "https://drive.google.com/file/d/13R_lzhLYQfdP4q2iET75SdzzjGQXlYDL/view?usp=drive_link",
		module1Hindi: "https://drive.google.com/file/d/1rwOUiMjq98wDCiwo3jxY9m6nHPm53oQq/view?usp=drive_link",
		module2Hindi: "https://drive.google.com/file/d/17SIHZWZojfkZASGv0IGA0kahHbdfgwZN/view?usp=drive_link",
		module3English: "https://drive.google.com/file/d/16ex8KP0lPZ2qc4fADjDehcFpiRjToikn/view?usp=sharing",
		module3Hindi: "https://drive.google.com/file/d/11AQF710cBedlEFKXojCS-ddHOvu67BJp/view?usp=sharing",
	},
};

export default function CourseViewerPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const contentRef = useRef(null);
	
	const courseId = params.courseId;
	const language = searchParams.get("lang") || "english";
	
	const [currentModule, setCurrentModule] = useState(1);
	const [scrollProgress, setScrollProgress] = useState(0);
	const [showNextModuleButton, setShowNextModuleButton] = useState(false);

	const courseData = courseDataMap[courseId];



	// Helper function to extract Google Drive file ID
	const extractDriveFileId = (url) => {
		if (!url) return null;
		const match = url.match(/\/file\/d\/([^\/]+)/);
		return match ? match[1] : null;
	};

	// Get Google Drive embed URL for PDFs
	const getGoogleDriveEmbedUrl = () => {
		if (!courseData) return null;
		
		let pdfUrl = null;
		if (currentModule === 1) {
			pdfUrl = language === "hindi" ? courseData.module1Hindi : courseData.module1English;
		} else if (currentModule === 2) {
			pdfUrl = language === "hindi" ? courseData.module2Hindi : courseData.module2English;
		}
		
		// Convert to Google Drive embed URL
		if (pdfUrl) {
			const fileId = extractDriveFileId(pdfUrl);
			if (fileId) {
				return `https://drive.google.com/file/d/${fileId}/preview`;
			}
		}
		
		return null;
	};

	// Get current video URL for Module 3
	const getCurrentVideoUrl = () => {
		if (!courseData || currentModule !== 3) return null;
		return language === "hindi" ? courseData.module3Hindi : courseData.module3English;
	};



	// Handle scroll progress
	useEffect(() => {
		const handleScroll = () => {
			if (!contentRef.current) return;

			const element = contentRef.current;
			const scrollTop = element.scrollTop;
			const scrollHeight = element.scrollHeight - element.clientHeight;
			const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

			setScrollProgress(progress);

			// Show next module button when user scrolls to 95% or more
			if (progress >= 95) {
				setShowNextModuleButton(true);
			}
		};

		const element = contentRef.current;
		if (element) {
			element.addEventListener("scroll", handleScroll);
			return () => element.removeEventListener("scroll", handleScroll);
		}
	}, []);

	// Reset scroll progress when module or language changes
	useEffect(() => {
		const resetScroll = () => {
			setScrollProgress(0);
			setShowNextModuleButton(false);
			if (contentRef.current) {
				contentRef.current.scrollTop = 0;
			}
		};
		
		resetScroll();
	}, [currentModule, language]);

	const handleNextModule = () => {
		if (currentModule === 1) {
			setCurrentModule(2);
			setShowNextModuleButton(false);
			setScrollProgress(0);
		} else if (currentModule === 2) {
			setCurrentModule(3);
			setShowNextModuleButton(false);
			setScrollProgress(0);
		}
	};

	const handleLanguageChange = (newLang) => {
		router.push(`/dashboard/courses/${courseId}?lang=${newLang}`);
	};

	if (!courseData) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Course not found</h1>
					<Link href="/dashboard/courses" className="mt-4 inline-block text-indigo-600 hover:text-indigo-700">
						← Back to courses
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
			{/* Header */}
			<header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-900/80">
				<div className="flex items-center justify-between px-6 py-4">
					<div className="flex items-center gap-4">
						<Link
							href="/dashboard/courses"
							className="flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
						>
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
								<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
							</svg>
							Back to Courses
						</Link>
						<div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700" />
						<h1 className="text-lg font-semibold text-zinc-900 dark:text-white">
							{courseData.title}
						</h1>
					</div>

					<div className="flex items-center gap-4">
						{/* Language Toggle */}
						<div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-800">
							<button
								onClick={() => handleLanguageChange("english")}
								className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
									language === "english"
										? "bg-white text-indigo-600 shadow-sm dark:bg-zinc-700 dark:text-indigo-400"
										: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
								}`}
							>
								🇬🇧 English
							</button>
							<button
								onClick={() => handleLanguageChange("hindi")}
								className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
									language === "hindi"
										? "bg-white text-indigo-600 shadow-sm dark:bg-zinc-700 dark:text-indigo-400"
										: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
								}`}
							>
								🇮🇳 हिंदी
							</button>
						</div>

						{/* Module Indicator */}
						<div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-800">
							<span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Module:</span>
							<span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
								{currentModule}
							</span>
							<span className="text-sm text-zinc-500 dark:text-zinc-500">/ 3</span>
						</div>
					</div>
				</div>

				{/* Progress Bar */}
				<div className="h-1 bg-zinc-200 dark:bg-zinc-800">
					<div
						className="h-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-300"
						style={{ width: `${scrollProgress}%` }}
					/>
				</div>
			</header>

			{/* Main Content Area */}
			<div className="flex flex-1 overflow-hidden">
				{/* Sidebar - Module Navigation */}
				<aside className="w-80 border-r border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
					<h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
						Course Modules
					</h2>
					<div className="space-y-3">
						{/* Module 1 - PDF */}
						<button
							onClick={() => setCurrentModule(1)}
							className={`w-full rounded-xl border p-4 text-left transition ${
								currentModule === 1
									? "border-indigo-500 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-500/10"
									: "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-800 dark:hover:border-zinc-700"
							}`}
						>
							<div className="flex items-center gap-3">
								<div className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${
									currentModule === 1
										? "bg-indigo-600 text-white"
										: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
								}`}>
									📄
								</div>
								<div className="flex-1">
									<p className="text-sm font-semibold text-zinc-900 dark:text-white">Module 1</p>
									<p className="text-xs text-zinc-500 dark:text-zinc-400">PDF Content</p>
								</div>
								{currentModule === 1 && (
									<div className="flex h-2 w-2 rounded-full bg-indigo-600" />
								)}
							</div>
						</button>

						{/* Module 2 - Mind Map PDF */}
						<button
							onClick={() => setCurrentModule(2)}
							className={`w-full rounded-xl border p-4 text-left transition ${
								currentModule === 2
									? "border-purple-500 bg-purple-50 dark:border-purple-500 dark:bg-purple-500/10"
									: "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-800 dark:hover:border-zinc-700"
							}`}
						>
							<div className="flex items-center gap-3">
								<div className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${
									currentModule === 2
										? "bg-purple-600 text-white"
										: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
								}`}>
									🗺️
								</div>
								<div className="flex-1">
									<p className="text-sm font-semibold text-zinc-900 dark:text-white">Module 2</p>
									<p className="text-xs text-zinc-500 dark:text-zinc-400">Mind Map PDF</p>
								</div>
								{currentModule === 2 && (
									<div className="flex h-2 w-2 rounded-full bg-purple-600" />
								)}
							</div>
						</button>

						{/* Module 3 - Video */}
						<button
							onClick={() => setCurrentModule(3)}
							className={`w-full rounded-xl border p-4 text-left transition ${
								currentModule === 3
									? "border-pink-500 bg-pink-50 dark:border-pink-500 dark:bg-pink-500/10"
									: "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-800 dark:hover:border-zinc-700"
							}`}
						>
							<div className="flex items-center gap-3">
								<div className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${
									currentModule === 3
										? "bg-pink-600 text-white"
										: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
								}`}>
									🎥
								</div>
								<div className="flex-1">
									<p className="text-sm font-semibold text-zinc-900 dark:text-white">Module 3</p>
									<p className="text-xs text-zinc-500 dark:text-zinc-400">Video Course</p>
								</div>
								{currentModule === 3 && (
									<div className="flex h-2 w-2 rounded-full bg-pink-600" />
								)}
							</div>
						</button>
					</div>

					{/* Progress Stats */}
					<div className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800">
						<h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">Your Progress</h3>
						<div className="space-y-2">
							<div className="flex items-center justify-between text-xs">
								<span className="text-zinc-600 dark:text-zinc-400">Current Module</span>
								<span className="font-semibold text-zinc-900 dark:text-white">{scrollProgress.toFixed(0)}%</span>
							</div>
							<div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-700">
								<div
									className="h-full rounded-full bg-linear-to-r from-indigo-500 to-purple-500"
									style={{ width: `${scrollProgress}%` }}
								/>
							</div>
						</div>
					</div>
				</aside>

				{/* Content Viewer */}
				<main className="flex-1 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
					{(currentModule === 1 || currentModule === 2) && (
						<div className="flex h-full flex-col">
							{/* PDF Info Header */}
							<div className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
											<span className="text-lg">
												{currentModule === 1 ? "📄" : "🗺️"}
											</span>
										</div>
										<div>
											<p className="text-sm font-semibold text-zinc-900 dark:text-white">
												{currentModule === 1 ? "Main Content" : "Mind Map"}
											</p>
											<p className="text-xs text-zinc-500 dark:text-zinc-400">
												Module {currentModule} • {language === "hindi" ? "हिंदी" : "English"}
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* PDF Viewer - Google Drive Embed */}
							<div className="flex-1 overflow-hidden bg-zinc-900">
								<iframe
									src={getGoogleDriveEmbedUrl()}
									className="h-full w-full border-0"
									allow="autoplay"
									title={`Module ${currentModule} PDF`}
								/>
							</div>
						</div>
					)}

					{currentModule === 3 && (
						<div className="h-full bg-zinc-100 dark:bg-zinc-900">
							<VideoPlayer
								videoUrl={getCurrentVideoUrl()}
								title={`${courseData.title} - ${language === "hindi" ? "हिंदी" : "English"}`}
								onVideoEnd={() => {
									alert("🎉 Congratulations! You've completed this module!");
								}}
							/>
						</div>
					)}
				</main>
			</div>

			{/* Floating Next Module Button */}
			{showNextModuleButton && currentModule < 3 && (
				<button
					onClick={handleNextModule}
					className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-full bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-4 text-sm font-semibold text-white shadow-2xl transition-all hover:scale-105 hover:shadow-3xl"
				>
					<span>Next Module</span>
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
						<path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
					</svg>
				</button>
			)}
		</div>
	);
}
