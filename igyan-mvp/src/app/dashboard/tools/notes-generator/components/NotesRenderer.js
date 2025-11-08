"use client";

export default function NotesRenderer({ notesData }) {
	if (!notesData) return null;

	return (
		<div className="space-y-6">
			{/* Title */}
			<div className="border-b-2 pb-4" style={{ borderColor: 'var(--dashboard-primary)' }}>
				<h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--dashboard-heading)' }}>
					{notesData.title}
				</h1>
				{notesData.subject && (
					<span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium" style={{
						background: 'color-mix(in srgb, var(--dashboard-primary) 12%, transparent)',
						color: 'var(--dashboard-primary)'
					}}>
						{notesData.subject}
					</span>
				)}
			</div>

			{/* Overview */}
			{notesData.overview && (
				<div className="rounded-xl p-5 dashboard-card-muted">
					<h2 className="mb-3 flex items-center gap-2 text-xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
						<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--dashboard-primary)' }}>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Overview
					</h2>
					<p className="leading-relaxed" style={{ color: 'var(--dashboard-text)' }}>
						{notesData.overview}
					</p>
				</div>
			)}

			{/* Topics */}
			{notesData.topics?.map((topic, topicIdx) => (
				<div key={topicIdx} className="rounded-xl border p-6 dashboard-card" style={{ borderColor: 'var(--dashboard-border)' }}>
					<h2 className="mb-4 flex items-center gap-2 text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
						<span className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ background: 'var(--dashboard-primary)' }}>
							{topicIdx + 1}
						</span>
						{topic.title}
					</h2>

					{topic.description && (
						<p className="mb-4" style={{ color: 'var(--dashboard-text)' }}>
							{topic.description}
						</p>
					)}

					{/* Subtopics */}
					{topic.subtopics?.map((subtopic, subIdx) => (
						<div key={subIdx} className="mb-5 ml-4 border-l-4 pl-4" style={{ borderColor: 'color-mix(in srgb, var(--dashboard-primary) 40%, transparent)' }}>
							<h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--dashboard-primary)' }}>
								{topicIdx + 1}.{subIdx + 1} {subtopic.title}
							</h3>
							<p className="mb-3" style={{ color: 'var(--dashboard-text)' }}>
								{subtopic.content}
							</p>

							{/* Key Points */}
							{subtopic.keyPoints && subtopic.keyPoints.length > 0 && (
								<div className="mb-3">
									<h4 className="mb-2 text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>Key Points:</h4>
									<ul className="space-y-1">
										{subtopic.keyPoints.map((point, pointIdx) => (
											<li key={pointIdx} className="flex items-start gap-2 text-sm" style={{ color: 'var(--dashboard-text)' }}>
												<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'var(--dashboard-primary)' }}></span>
												<span>{point}</span>
											</li>
										))}
									</ul>
								</div>
							)}

							{/* Example */}
							{subtopic.example && (
								<div className="rounded-lg p-3" style={{
									background: 'rgba(16, 185, 129, 0.1)',
									borderLeft: '3px solid rgb(16, 185, 129)'
								}}>
									<div className="mb-1 flex items-center gap-2 text-sm font-semibold" style={{ color: 'rgb(6, 95, 70)' }}>
										<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
										</svg>
										Example:
									</div>
									<p className="text-sm" style={{ color: 'var(--dashboard-text)' }}>{subtopic.example}</p>
								</div>
							)}
						</div>
					))}
				</div>
			))}

			{/* Key Definitions */}
			{notesData.definitions && notesData.definitions.length > 0 && (
				<div className="rounded-xl border p-6 dashboard-card-muted" style={{ borderColor: 'color-mix(in srgb, var(--dashboard-primary) 30%, transparent)' }}>
					<h2 className="mb-4 flex items-center gap-2 text-xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
						<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--dashboard-primary)' }}>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
						</svg>
						Important Definitions
					</h2>
					<div className="space-y-3">
						{notesData.definitions.map((def, idx) => (
							<div key={idx} className="rounded-lg border p-4 dashboard-card" style={{ borderColor: 'var(--dashboard-border)' }}>
								<div className="font-bold" style={{ color: 'var(--dashboard-primary)' }}>{def.term}</div>
								<div className="mt-1 text-sm" style={{ color: 'var(--dashboard-text)' }}>{def.definition}</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Practice Questions */}
			{notesData.practiceQuestions && notesData.practiceQuestions.length > 0 && (
				<div className="rounded-xl border p-6 dashboard-card-muted" style={{ borderColor: 'color-mix(in srgb, var(--dashboard-primary) 30%, transparent)' }}>
					<h2 className="mb-4 flex items-center gap-2 text-xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
						<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--dashboard-primary)' }}>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Practice Questions
					</h2>
					<div className="space-y-4">
						{notesData.practiceQuestions.map((q, idx) => (
							<div key={idx} className="rounded-lg border p-4 dashboard-card" style={{ borderColor: 'var(--dashboard-border)' }}>
								<div className="mb-2 flex items-start gap-2">
									<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: 'var(--dashboard-primary)' }}>
										{idx + 1}
									</span>
									<span style={{ color: 'var(--dashboard-heading)' }}>{q.question}</span>
								</div>
								{q.hint && (
									<div className="ml-8 text-sm italic" style={{ color: 'var(--dashboard-muted)' }}>
										💡 Hint: {q.hint}
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Reference Links */}
			{notesData.references && notesData.references.length > 0 && (
				<div className="rounded-xl border p-6 dashboard-card-muted" style={{ borderColor: 'color-mix(in srgb, var(--dashboard-primary) 30%, transparent)' }}>
					<h2 className="mb-4 flex items-center gap-2 text-xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
						<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--dashboard-primary)' }}>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
						</svg>
						Learning Resources & References
					</h2>
					<div className="space-y-2">
						{notesData.references.map((ref, idx) => (
							<a
								key={idx}
								href={ref.url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-start gap-3 rounded-lg border p-3 transition-all hover:shadow-md dashboard-card"
								style={{ borderColor: 'var(--dashboard-border)' }}
							>
								<svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--dashboard-primary)' }}>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
								</svg>
								<div className="flex-1">
									<div className="font-semibold" style={{ color: 'var(--dashboard-primary)' }}>{ref.title}</div>
									<div className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>{ref.description}</div>
								</div>
							</a>
						))}
					</div>
				</div>
			)}

			{/* Summary */}
			{notesData.summary && (
				<div className="rounded-xl border p-6 dashboard-card-muted" style={{ borderColor: 'color-mix(in srgb, var(--dashboard-primary) 30%, transparent)' }}>
					<h2 className="mb-4 flex items-center gap-2 text-xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
						<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--dashboard-primary)' }}>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Key Takeaways
					</h2>
					<ul className="space-y-2">
						{notesData.summary.map((item, idx) => (
							<li key={idx} className="flex items-start gap-3">
								<svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--dashboard-primary)' }}>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
								<span style={{ color: 'var(--dashboard-text)' }}>{item}</span>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
