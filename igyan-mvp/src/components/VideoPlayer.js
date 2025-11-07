"use client";

import { useState } from "react";

// Extract the file ID from Google Drive URL
const extractFileId = (url) => {
	const match = url.match(/\/d\/([^/]+)/);
	return match ? match[1] : null;
};

// Convert Google Drive URL to embeddable URL
const getEmbedUrl = (driveUrl) => {
	const fileId = extractFileId(driveUrl);
	return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
};

export default function VideoPlayer({ videoUrl, title, onVideoEnd }) {
	const [isLoading, setIsLoading] = useState(true);

	const embedUrl = getEmbedUrl(videoUrl);

	if (!embedUrl) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-center">
					<div className="mb-4 text-6xl">⚠️</div>
					<p className="text-lg font-semibold text-zinc-900 dark:text-white">
						Invalid video URL
					</p>
					<p className="text-sm text-zinc-600 dark:text-zinc-400">
						Please check the video link
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col items-center justify-center p-8">
			<div className="w-full max-w-5xl space-y-4">
				{/* Video Title */}
				<div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-500/30 dark:bg-indigo-500/10">
					<h2 className="text-xl font-bold text-zinc-900 dark:text-white">
						🎥 {title}
					</h2>
					<p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
						Video Module - Watch the complete video tutorial
					</p>
				</div>

				{/* Video Player */}
				<div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-900 shadow-2xl dark:border-zinc-800">
					<div className="relative" style={{ paddingBottom: "56.25%" }}>
						{isLoading && (
							<div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
								<div className="text-center">
									<div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
									<p className="text-sm text-white">Loading video...</p>
								</div>
							</div>
						)}
						<iframe
							src={embedUrl}
							className="absolute inset-0 h-full w-full"
							allow="autoplay; encrypted-media"
							allowFullScreen
							onLoad={() => setIsLoading(false)}
							title={title}
						/>
					</div>
				</div>

				{/* Video Controls Info */}
				<div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="currentColor"
								viewBox="0 0 24 24"
								className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
							>
								<path d="M8 5v14l11-7z" />
							</svg>
						</div>
						<div>
							<p className="text-sm font-medium text-zinc-900 dark:text-white">
								Watch in fullscreen for best experience
							</p>
							<p className="text-xs text-zinc-500 dark:text-zinc-400">
								Use video controls to pause, rewind, or adjust volume
							</p>
						</div>
					</div>
					<button
						onClick={onVideoEnd}
						className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
					>
						Mark as Complete
					</button>
				</div>

				{/* Additional Info */}
				<div className="grid grid-cols-3 gap-4">
					<div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800">
						<p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
							Video Quality
						</p>
						<p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
							HD Available
						</p>
					</div>
					<div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800">
						<p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
							Playback
						</p>
						<p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
							Streaming
						</p>
					</div>
					<div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800">
						<p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
							Duration
						</p>
						<p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
							Full Course
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
