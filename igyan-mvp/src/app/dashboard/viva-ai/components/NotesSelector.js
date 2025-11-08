"use client";

import { useState, useEffect } from "react";
import notesData from "../data/notes.json";

export default function NotesSelector({ onNotesSelect, selectedNotes, userGrade = "9" }) {
	const [expandedSubject, setExpandedSubject] = useState(null);
	const [expandedChapter, setExpandedChapter] = useState(null);
	const [customNotes, setCustomNotes] = useState([]);
	const [customNoteTitle, setCustomNoteTitle] = useState("");
	const [customNoteContent, setCustomNoteContent] = useState("");
	const [isUploadFormVisible, setIsUploadFormVisible] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadError, setUploadError] = useState(null);

	// Filter notes by user grade
	const gradeSubjects = notesData.gradeWiseNotes[userGrade] || notesData.gradeWiseNotes['9'];

	// Load custom notes from localStorage on mount
	useEffect(() => {
		loadCustomNotes();
	}, [userGrade]);

	const loadCustomNotes = () => {
		try {
			const stored = localStorage.getItem('viva_ai_custom_notes');
			if (stored) {
				const allNotes = JSON.parse(stored);
				// Filter by grade
				const gradeNotes = allNotes.filter(note => note.grade === userGrade);
				setCustomNotes(gradeNotes);
			}
		} catch (error) {
			console.error('Error loading custom notes from localStorage:', error);
		}
	};

	const handleCustomNoteUpload = () => {
		if (!customNoteTitle.trim() || !customNoteContent.trim()) {
			setUploadError("Please provide both title and content");
			return;
		}

		if (customNoteContent.length > 1000) {
			setUploadError("Content must be 1000 characters or less");
			return;
		}

		setIsUploading(true);
		setUploadError(null);

		try {
			// Get existing notes from localStorage
			const stored = localStorage.getItem('viva_ai_custom_notes');
			const allNotes = stored ? JSON.parse(stored) : [];

			// Create new note
			const newNote = {
				id: Date.now().toString(), // Simple ID using timestamp
				title: customNoteTitle.trim(),
				content: customNoteContent.trim(),
				grade: userGrade,
				created_at: new Date().toISOString()
			};

			// Add to array and save
			allNotes.unshift(newNote); // Add to beginning
			localStorage.setItem('viva_ai_custom_notes', JSON.stringify(allNotes));

			// Reset form and reload notes
			setCustomNoteTitle("");
			setCustomNoteContent("");
			setIsUploadFormVisible(false);
			loadCustomNotes();
		} catch (error) {
			console.error('Error uploading custom note:', error);
			setUploadError("Failed to save note. Please try again.");
		} finally {
			setIsUploading(false);
		}
	};

	const handleDeleteCustomNote = (noteId) => {
		if (!confirm("Are you sure you want to delete this note?")) return;

		try {
			// Get all notes from localStorage
			const stored = localStorage.getItem('viva_ai_custom_notes');
			if (stored) {
				const allNotes = JSON.parse(stored);
				// Filter out the deleted note
				const updatedNotes = allNotes.filter(note => note.id !== noteId);
				localStorage.setItem('viva_ai_custom_notes', JSON.stringify(updatedNotes));

				// Clear selection if this note was selected
				if (selectedNotes?.isCustom && selectedNotes?.id === noteId) {
					onNotesSelect(null);
				}

				loadCustomNotes();
			}
		} catch (error) {
			console.error('Error deleting custom note:', error);
		}
	};

	const handleTopicSelect = (subject, chapter, topic) => {
		onNotesSelect({ subject, chapter, topic });
	};

	const handleCustomNoteSelect = (note) => {
		onNotesSelect({
			subject: 'Custom Notes',
			chapter: note.title,
			topic: note.title,
			customContent: note.content,
			isCustom: true,
			id: note.id
		});
	};

	const isSelected = (subject, chapter, topic) => {
		return (
			selectedNotes?.subject === subject &&
			selectedNotes?.chapter === chapter &&
			selectedNotes?.topic === topic
		);
	};

	const isCustomNoteSelected = (noteId) => {
		return selectedNotes?.isCustom && selectedNotes?.id === noteId;
	};

	return (
		<div className="space-y-3">
			<div className="mb-4">
				<h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--dashboard-heading)' }}>
					Select Study Material (Grade {userGrade})
				</h3>
				{selectedNotes && (
					<div className="rounded-lg p-3" style={{ 
						backgroundColor: 'var(--dashboard-surface-solid)',
						border: '1px solid var(--dashboard-border)'
					}}>
						<p className="text-xs font-medium" style={{ color: 'var(--dashboard-primary)' }}>
							Currently Selected:
						</p>
						<p className="mt-1 text-xs" style={{ color: 'var(--dashboard-text)' }}>
							{selectedNotes.subject} → {selectedNotes.chapter} → {selectedNotes.topic}
						</p>
						<button
							onClick={() => onNotesSelect(null)}
							className="mt-2 text-xs hover:opacity-80 transition-opacity"
							style={{ color: '#ef4444' }}
						>
							Clear Selection
						</button>
					</div>
				)}
			</div>

			{/* Custom Notes Section */}
			<div className="rounded-lg border p-3" style={{ 
				borderColor: 'var(--dashboard-border)',
				backgroundColor: 'var(--dashboard-surface-solid)'
			}}>
				<div className="flex items-center justify-between mb-3">
					<h4 className="text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
						My Custom Notes
					</h4>
					<button
						onClick={() => setIsUploadFormVisible(!isUploadFormVisible)}
						className="text-xs px-3 py-1 rounded-lg transition-colors"
						style={{
							backgroundColor: 'var(--dashboard-primary)',
							color: 'white'
						}}
					>
						{isUploadFormVisible ? 'Cancel' : '+ Add Note'}
					</button>
				</div>

				{isUploadFormVisible && (
					<div className="mb-3 space-y-2 p-3 rounded-lg" style={{ 
						backgroundColor: 'var(--dashboard-background)',
						border: '1px solid var(--dashboard-border)'
					}}>
						<input
							type="text"
							placeholder="Note Title"
							value={customNoteTitle}
							onChange={(e) => setCustomNoteTitle(e.target.value)}
							className="w-full px-3 py-2 rounded-lg text-sm"
							style={{
								backgroundColor: 'var(--dashboard-surface-solid)',
								color: 'var(--dashboard-text)',
								border: '1px solid var(--dashboard-border)'
							}}
							maxLength={100}
						/>
						<textarea
							placeholder="Note Content (max 1000 characters)"
							value={customNoteContent}
							onChange={(e) => setCustomNoteContent(e.target.value)}
							className="w-full px-3 py-2 rounded-lg text-sm resize-none"
							style={{
								backgroundColor: 'var(--dashboard-surface-solid)',
								color: 'var(--dashboard-text)',
								border: '1px solid var(--dashboard-border)'
							}}
							rows={5}
							maxLength={1000}
						/>
						<div className="flex items-center justify-between">
							<span className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>
								{customNoteContent.length}/1000 characters
							</span>
							<button
								onClick={handleCustomNoteUpload}
								disabled={isUploading}
								className="px-4 py-2 rounded-lg text-xs font-medium transition-opacity disabled:opacity-50"
								style={{
									backgroundColor: 'var(--dashboard-primary)',
									color: 'white'
								}}
							>
								{isUploading ? 'Uploading...' : 'Upload Note'}
							</button>
						</div>
						{uploadError && (
							<p className="text-xs" style={{ color: '#ef4444' }}>
								{uploadError}
							</p>
						)}
					</div>
				)}

				{customNotes.length > 0 ? (
					<div className="space-y-2">
						{customNotes.map((note) => (
							<div
								key={note.id}
								className={`p-3 rounded-lg transition-all cursor-pointer ${
									isCustomNoteSelected(note.id) ? 'ring-2' : ''
								}`}
								style={{
									backgroundColor: isCustomNoteSelected(note.id) 
										? 'var(--dashboard-primary-light)' 
										: 'var(--dashboard-background)',
									border: '1px solid var(--dashboard-border)',
									ringColor: 'var(--dashboard-primary)'
								}}
								onClick={() => handleCustomNoteSelect(note)}
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<h5 className="text-sm font-medium mb-1" style={{ color: 'var(--dashboard-heading)' }}>
											{note.title}
										</h5>
										<p className="text-xs line-clamp-2" style={{ color: 'var(--dashboard-muted)' }}>
											{note.content}
										</p>
									</div>
									<button
										onClick={(e) => {
											e.stopPropagation();
											handleDeleteCustomNote(note.id);
										}}
										className="ml-2 text-xs px-2 py-1 rounded hover:opacity-80 transition-opacity"
										style={{ color: '#ef4444' }}
									>
										Delete
									</button>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-xs text-center py-2" style={{ color: 'var(--dashboard-muted)' }}>
						No custom notes yet. Add your first note!
					</p>
				)}
			</div>

			{/* Standard Grade-Based Notes */}
			<div>
				<h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--dashboard-heading)' }}>
					Standard Notes
				</h4>
				{gradeSubjects.map((subject) => (
					<div key={subject.name} className="mb-3 rounded-lg border" style={{ 
						borderColor: 'var(--dashboard-border)',
						backgroundColor: 'var(--dashboard-surface-solid)'
					}}>
						<button
							onClick={() => setExpandedSubject(expandedSubject === subject.name ? null : subject.name)}
							className="flex w-full items-center justify-between p-3 text-left transition-colors hover:opacity-90"
						>
							<div className="flex items-center gap-2">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" style={{ color: 'var(--dashboard-primary)' }}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
								</svg>
								<span className="text-sm font-medium" style={{ color: 'var(--dashboard-text)' }}>
									{subject.name}
								</span>
							</div>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								className={`h-4 w-4 transition-transform ${
									expandedSubject === subject.name ? "rotate-180" : ""
								}`}
								style={{ color: 'var(--dashboard-muted)' }}
							>
								<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
							</svg>
						</button>

						{expandedSubject === subject.name && (
							<div className="border-t p-2" style={{ borderColor: 'var(--dashboard-border)' }}>
								{subject.chapters.map((chapter) => (
									<div key={chapter.name} className="mb-2">
										<button
											onClick={() => setExpandedChapter(expandedChapter === chapter.name ? null : chapter.name)}
											className="flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors hover:opacity-90"
											style={{ backgroundColor: 'var(--dashboard-background)' }}
										>
											<span className="text-xs font-medium" style={{ color: 'var(--dashboard-text)' }}>
												{chapter.name}
											</span>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												className={`h-3 w-3 transition-transform ${
													expandedChapter === chapter.name ? "rotate-180" : ""
												}`}
												style={{ color: 'var(--dashboard-muted)' }}
											>
												<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
											</svg>
										</button>

										{expandedChapter === chapter.name && (
											<div className="ml-4 mt-1 space-y-1">
												{chapter.topics.map((topic) => (
													<button
														key={topic}
														onClick={() => handleTopicSelect(subject.name, chapter.name, topic)}
														className={`block w-full rounded-lg px-3 py-2 text-left text-xs transition-colors ${
															isSelected(subject.name, chapter.name, topic)
																? 'ring-2'
																: ''
														}`}
														style={
															isSelected(subject.name, chapter.name, topic)
																? {
																	backgroundColor: 'var(--dashboard-primary-light)',
																	color: 'var(--dashboard-primary)',
																	ringColor: 'var(--dashboard-primary)'
																}
																: {
																	color: 'var(--dashboard-muted)',
																	backgroundColor: 'transparent'
																}
														}
													>
														{topic}
													</button>
												))}
											</div>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
