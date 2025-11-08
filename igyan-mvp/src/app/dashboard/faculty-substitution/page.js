"use client";

import { useState, useMemo } from "react";
import { facultyData, generateSubstitution, generateClassSchedule } from "./utils/substitutionAlgorithm";
import SubstitutionCard from "./components/SubstitutionCard";
import FacultyList from "./components/FacultyList";
import SubstitutionHistory from "./components/SubstitutionHistory";
import Logo from "@/components/logo";

export default function FacultySubstitutionPage() {
	const [absentFacultyId, setAbsentFacultyId] = useState("");
	const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
	const [selectedPeriod, setSelectedPeriod] = useState("1");
	const [substitutionResult, setSubstitutionResult] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [substitutionHistory, setSubstitutionHistory] = useState([]);
	const [activeTab, setActiveTab] = useState("calendar");
	const [absentTeachers, setAbsentTeachers] = useState({});
	const [expandedClass, setExpandedClass] = useState(null);
	const [showTeacherModal, setShowTeacherModal] = useState(false);
	const [selectedTeacher, setSelectedTeacher] = useState(null);
	const [showSuccessMessage, setShowSuccessMessage] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");

	const handleSubstitutionRequest = async () => {
		if (!absentFacultyId) {
			alert("Please select an absent faculty member");
			return;
		}

		setIsLoading(true);

		try {
			const result = await generateSubstitution(
				absentFacultyId,
				selectedDate,
				selectedPeriod,
				facultyData
			);

			setSubstitutionResult(result);

			// Add to history
			const historyEntry = {
				id: Date.now(),
				timestamp: new Date().toISOString(),
				absentFaculty: result.absentFaculty,
				substitute: result.bestMatch,
				date: selectedDate,
				period: selectedPeriod,
				reasoning: result.reasoning,
			};

			setSubstitutionHistory((prev) => [historyEntry, ...prev]);

			// Show success message
			setSuccessMessage(
				`✓ Substitution request sent successfully! ${result.bestMatch.name} has been notified and will substitute for ${result.absentFaculty.name} on ${selectedDate}, Period ${selectedPeriod}.`
			);
			setShowSuccessMessage(true);
			
			// Auto-hide message after 5 seconds
			setTimeout(() => {
				setShowSuccessMessage(false);
			}, 5000);
		} catch (error) {
			console.error("Substitution error:", error);
			setSuccessMessage("❌ Failed to generate substitution. Please try again.");
			setShowSuccessMessage(true);
			setTimeout(() => {
				setShowSuccessMessage(false);
			}, 5000);
		} finally {
			setIsLoading(false);
		}
	};

	const handleMarkAbsent = (facultyId, date, period) => {
		const key = `${date}-${period}`;
		setAbsentTeachers(prev => ({
			...prev,
			[key]: [...(prev[key] || []), facultyId]
		}));
	};

	const handleMarkPresent = (facultyId, date, period) => {
		const key = `${date}-${period}`;
		setAbsentTeachers(prev => ({
			...prev,
			[key]: (prev[key] || []).filter(id => id !== facultyId)
		}));
	};

	const isTeacherAbsent = (facultyId, date, period) => {
		const key = `${date}-${period}`;
		return absentTeachers[key]?.includes(facultyId) || false;
	};

	const monthMatrix = useMemo(() => {
		const date = new Date(selectedDate);
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const startDay = firstDay.getDay();
		
		const days = [];
		for (let i = 0; i < startDay; i++) {
			days.push(null);
		}
		for (let i = 1; i <= lastDay.getDate(); i++) {
			days.push(new Date(year, month, i));
		}
		
		const weeks = [];
		for (let i = 0; i < days.length; i += 7) {
			weeks.push(days.slice(i, i + 7));
		}
		return weeks;
	}, [selectedDate]);

	const classSchedule = useMemo(() => 
		generateClassSchedule(facultyData, selectedDate), 
		[selectedDate]
	);

	// Get unique classes
	const uniqueClasses = useMemo(() => {
		const classes = new Set();
		facultyData.forEach(faculty => {
			faculty.classes.forEach(cls => classes.add(cls));
		});
		return Array.from(classes).sort();
	}, []);

	// Group schedule by class and period
	const scheduleByClass = useMemo(() => {
		const grouped = {};
		if (!classSchedule[selectedDate]) return grouped;

		classSchedule[selectedDate].forEach(item => {
			if (!grouped[item.className]) {
				grouped[item.className] = {};
			}
			if (!grouped[item.className][item.period]) {
				grouped[item.className][item.period] = [];
			}
			grouped[item.className][item.period].push(item);
		});
		return grouped;
	}, [classSchedule, selectedDate]);

	const availableFaculty = useMemo(
		() => facultyData.filter((f) => f.availability[selectedDate]?.[selectedPeriod]),
		[selectedDate, selectedPeriod]
	);

	return (
		<div className="dashboard-theme min-h-screen p-6 lg:p-10">
			<header className="dashboard-card mb-8 rounded-3xl p-6 shadow-xl">
				<Logo variant="header" className="mb-3" />
				<h1 className="text-4xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
					Faculty Substitution System
				</h1>
				<p className="mt-2" style={{ color: 'var(--dashboard-muted)' }}>
					Intelligent algorithm-based faculty replacement with AI-powered reasoning
				</p>
			</header>

			{/* Tab Navigation */}
			<div className="mb-6 flex gap-2" style={{ borderBottom: '2px solid var(--dashboard-border)' }}>
				<button
					onClick={() => setActiveTab("calendar")}
					className={`px-6 py-3 font-semibold transition ${
						activeTab === "calendar" ? "border-b-2" : ""
					}`}
					style={{
						borderColor: activeTab === "calendar" ? 'var(--dashboard-primary)' : 'transparent',
						color: activeTab === "calendar" ? 'var(--dashboard-primary)' : 'var(--dashboard-muted)'
					}}
				>
					Calendar View
				</button>
				<button
					onClick={() => setActiveTab("request")}
					className={`px-6 py-3 font-semibold transition ${
						activeTab === "request" ? "border-b-2" : ""
					}`}
					style={{
						borderColor: activeTab === "request" ? 'var(--dashboard-primary)' : 'transparent',
						color: activeTab === "request" ? 'var(--dashboard-primary)' : 'var(--dashboard-muted)'
					}}
				>
					Request Substitution
				</button>
				<button
					onClick={() => setActiveTab("faculty")}
					className={`px-6 py-3 font-semibold transition ${
						activeTab === "faculty" ? "border-b-2" : ""
					}`}
					style={{
						borderColor: activeTab === "faculty" ? 'var(--dashboard-primary)' : 'transparent',
						color: activeTab === "faculty" ? 'var(--dashboard-primary)' : 'var(--dashboard-muted)'
					}}
				>
					Faculty Directory
				</button>
				<button
					onClick={() => setActiveTab("history")}
					className={`px-6 py-3 font-semibold transition ${
						activeTab === "history" ? "border-b-2" : ""
					}`}
					style={{
						borderColor: activeTab === "history" ? 'var(--dashboard-primary)' : 'transparent',
						color: activeTab === "history" ? 'var(--dashboard-primary)' : 'var(--dashboard-muted)'
					}}
				>
					History ({substitutionHistory.length})
				</button>
			</div>

			{/* Calendar View Tab */}
			{activeTab === "calendar" && (
				<div className="space-y-6">
					{/* Month Navigation */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<button
								onClick={() => {
									const date = new Date(selectedDate);
									date.setMonth(date.getMonth() - 1);
									setSelectedDate(date.toISOString().split("T")[0]);
								}}
								className="rounded-full border p-2 transition"
								style={{ 
									borderColor: 'var(--dashboard-border)',
									color: 'var(--dashboard-text)'
								}}
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
									<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
								</svg>
							</button>
							<h2 className="text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
								{new Date(selectedDate).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
							</h2>
							<button
								onClick={() => {
									const date = new Date(selectedDate);
									date.setMonth(date.getMonth() + 1);
									setSelectedDate(date.toISOString().split("T")[0]);
								}}
								className="rounded-full border p-2 transition"
								style={{ 
									borderColor: 'var(--dashboard-border)',
									color: 'var(--dashboard-text)'
								}}
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
									<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
								</svg>
							</button>
						</div>
						<button
							onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
							className="rounded-xl border px-4 py-2 text-sm font-semibold transition"
							style={{
								borderColor: 'var(--dashboard-border)',
								color: 'var(--dashboard-text)'
							}}
						>
							Today
						</button>
					</div>

					{/* Calendar Grid */}
					<div className="dashboard-card rounded-3xl shadow-lg overflow-hidden">
						<div className="grid grid-cols-7" style={{ backgroundColor: 'var(--dashboard-surface-muted)' }}>
							{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
								<div key={day} className="p-4 text-center text-xs font-semibold" style={{ color: 'var(--dashboard-muted)' }}>
									{day}
								</div>
							))}
						</div>
						<div>
							{monthMatrix.map((week, weekIdx) => (
								<div key={weekIdx} className="grid grid-cols-7" style={{ borderTop: '1px solid var(--dashboard-border)' }}>
									{week.map((day, dayIdx) => {
										if (!day) {
											return <div key={dayIdx} className="min-h-[120px]" style={{ 
												borderRight: '1px solid var(--dashboard-border)',
												backgroundColor: 'var(--dashboard-surface-muted)'
											}} />;
										}

										const dateStr = day.toISOString().split("T")[0];
										const isToday = dateStr === new Date().toISOString().split("T")[0];
										const isSelected = dateStr === selectedDate;

										return (
											<div
												key={dayIdx}
												onClick={() => setSelectedDate(dateStr)}
												className={`min-h-[120px] p-2 transition cursor-pointer`}
												style={{
													borderRight: '1px solid var(--dashboard-border)',
													backgroundColor: isSelected ? 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)' : 'transparent'
												}}
											>
												<div className={`text-sm font-semibold mb-2 ${
													isToday ? "rounded-full w-7 h-7 flex items-center justify-center text-white" : ""
												}`} style={{
													backgroundColor: isToday ? 'var(--dashboard-primary)' : 'transparent',
													color: isToday ? 'white' : 'var(--dashboard-text)'
												}}>
													{day.getDate()}
												</div>
												<div className="space-y-1 text-xs">
													{classSchedule[dateStr]?.slice(0, 3).map((cls, idx) => {
														const teacher = facultyData.find(f => f.id === cls.facultyId);
														const absent = isTeacherAbsent(cls.facultyId, dateStr, cls.period);
														return (
															<div
																key={idx}
																className={`rounded px-2 py-1 truncate`}
																style={{
																	backgroundColor: absent ? '#fee2e2' : '#dbeafe',
																	color: absent ? '#991b1b' : '#1e40af'
																}}
															>
																P{cls.period}: {cls.className}
															</div>
														);
													})}
													{classSchedule[dateStr]?.length > 3 && (
														<div style={{ color: 'var(--dashboard-muted)' }}>
															+{classSchedule[dateStr].length - 3} more
														</div>
													)}
												</div>
											</div>
										);
									})}
								</div>
							))}
						</div>
					</div>

					{/* Daily Schedule Detail - Class-wise */}
					<div className="dashboard-card rounded-3xl p-6 shadow-lg">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h3 className="text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
									Class Schedule
								</h3>
								<p className="text-sm mt-1" style={{ color: 'var(--dashboard-muted)' }}>
									{new Date(selectedDate).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
								</p>
							</div>
							<div className="rounded-xl px-4 py-2" style={{ backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)' }}>
								<p className="text-sm font-semibold" style={{ color: 'var(--dashboard-primary)' }}>
									{uniqueClasses.length} Classes
								</p>
							</div>
						</div>
						
						<div className="space-y-3">
							{uniqueClasses.map((className) => {
								const classPeriods = scheduleByClass[className] || {};
								const hasClasses = Object.keys(classPeriods).length > 0;
								const isExpanded = expandedClass === className;
								
								// Count absent teachers for this class
								const absentCount = Object.entries(classPeriods).reduce((count, [period, items]) => {
									return count + items.filter(item => 
										isTeacherAbsent(item.facultyId, selectedDate, period)
									).length;
								}, 0);

								return (
									<div
										key={className}
										className="rounded-2xl shadow-sm transition hover:shadow-md"
										style={{
											border: '1px solid var(--dashboard-border)',
											backgroundColor: 'var(--dashboard-surface-solid)'
										}}
									>
										{/* Class Header - Dropdown Toggle */}
										<button
											onClick={() => setExpandedClass(isExpanded ? null : className)}
											className="w-full flex items-center justify-between p-5 text-left"
										>
											<div className="flex items-center gap-4">
												<div className="flex h-14 w-14 items-center justify-center rounded-xl shadow-md" style={{
													backgroundColor: 'var(--dashboard-primary)'
												}}>
													<span className="text-xl font-bold text-white">
														{className.replace(/[^0-9]/g, '')}
													</span>
												</div>
												<div>
													<h4 className="text-lg font-bold" style={{ color: 'var(--dashboard-heading)' }}>
														Class {className}
													</h4>
													<p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>
														{hasClasses ? `${Object.keys(classPeriods).length} periods scheduled` : "No classes today"}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-3">
												{absentCount > 0 && (
													<span className="rounded-full px-3 py-1 text-xs font-semibold" style={{
														backgroundColor: '#fee2e2',
														color: '#991b1b'
													}}>
														{absentCount} Absent
													</span>
												)}
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													className={`h-5 w-5 transition-transform ${
														isExpanded ? "rotate-180" : ""
													}`}
													style={{ color: 'var(--dashboard-muted)' }}
												>
													<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
												</svg>
											</div>
										</button>

										{/* Expanded Class Details */}
										{isExpanded && hasClasses && (
											<div className="p-5" style={{ borderTop: '1px solid var(--dashboard-border)' }}>
												<div className="space-y-4">
													{[1, 2, 3, 4, 5, 6, 7, 8].map((period) => {
														const periodItems = classPeriods[period.toString()] || [];
														if (periodItems.length === 0) return null;

														return (
															<div
																key={period}
																className="rounded-xl p-4"
																style={{
																	border: '1px solid var(--dashboard-border)',
																	backgroundColor: 'var(--dashboard-surface-solid)'
																}}
															>
																<div className="flex items-center gap-3 mb-3">
																	<div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{
																		backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)'
																	}}>
																		<span className="text-sm font-bold" style={{ color: 'var(--dashboard-primary)' }}>
																			P{period}
																		</span>
																	</div>
																	<div>
																		<h5 className="font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
																			Period {period}
																		</h5>
																		<p className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>
																			{periodItems[0]?.subject}
																		</p>
																	</div>
																</div>

																{periodItems.map((item) => {
																	const teacher = facultyData.find(f => f.id === item.facultyId);
																	const absent = isTeacherAbsent(item.facultyId, selectedDate, period.toString());

																	return (
																		<div
																			key={item.facultyId}
																			className={`rounded-lg p-4`}
																			style={{
																				backgroundColor: absent ? '#fef2f2' : 'var(--dashboard-surface-muted)',
																				border: absent ? '2px solid #fecaca' : '1px solid var(--dashboard-border)'
																			}}
																		>
																			<div className="flex items-start justify-between mb-3">
																				<div className="flex-1">
																					<div className="flex items-center gap-2 mb-2">
																						<p className="font-semibold" style={{ color: 'var(--dashboard-text)' }}>
																							{teacher?.name}
																						</p>
																						{absent && (
																							<span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{
																								backgroundColor: '#dc2626'
																							}}>
																								ABSENT
																							</span>
																						)}
																					</div>
																					<div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'var(--dashboard-muted)' }}>
																						<p>📚 Subject: <span className="font-medium">{teacher?.subject}</span></p>
																						<p>🎓 Experience: <span className="font-medium">{teacher?.experience} years</span></p>
																						<p>⭐ Specialization: <span className="font-medium">{teacher?.specialization}</span></p>
																						<p>📊 Workload: <span className="font-medium">{teacher?.currentSubstitutions}/{teacher?.maxSubstitutionsPerWeek}</span></p>
																					</div>
																				</div>
																			</div>

																			<div className="flex gap-2">
																				<button
																					onClick={() => {
																						setSelectedTeacher(teacher);
																						setShowTeacherModal(true);
																					}}
																					className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition"
																					style={{
																						border: `2px solid var(--dashboard-primary)`,
																						backgroundColor: 'var(--dashboard-surface-solid)',
																						color: 'var(--dashboard-primary)'
																					}}
																				>
																					📋 More Details
																				</button>
																				{absent ? (
																					<>
																						<button
																							onClick={() => handleMarkPresent(item.facultyId, selectedDate, period.toString())}
																							className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-white transition"
																							style={{ backgroundColor: '#16a34a' }}
																						>
																							✓ Mark Present
																						</button>
																						<button
																							onClick={() => {
																								setAbsentFacultyId(item.facultyId);
																								setSelectedPeriod(period.toString());
																								setActiveTab("request");
																							}}
																							className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold text-white transition"
																							style={{ backgroundColor: 'var(--dashboard-primary)' }}
																						>
																							🔍 Find Substitute
																						</button>
																					</>
																				) : (
																					<button
																						onClick={() => handleMarkAbsent(item.facultyId, selectedDate, period.toString())}
																						className="flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition"
																						style={{
																							border: '2px solid #fca5a5',
																							backgroundColor: 'var(--dashboard-surface-solid)',
																							color: '#dc2626'
																						}}
																					>
																						✗ Mark Absent
																					</button>
																				)}
																			</div>
																		</div>
																	);
																})}
															</div>
														);
													})}
												</div>
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				</div>
			)}

			{/* Request Substitution Tab */}
			{activeTab === "request" && (
				<div className="grid gap-8 lg:grid-cols-2">
					{/* Input Section */}
					<div className="space-y-6">
						<div className="dashboard-card rounded-3xl p-8 shadow-lg">
							<h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--dashboard-heading)' }}>
								Substitution Request
							</h2>

							<div className="space-y-5">
								<div>
									<label className="block text-sm font-medium mb-2" style={{ color: 'var(--dashboard-text)' }}>
										Absent Faculty Member
									</label>
									<select
										value={absentFacultyId}
										onChange={(e) => setAbsentFacultyId(e.target.value)}
										className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition"
										style={{
											border: '1px solid var(--dashboard-border)',
											backgroundColor: 'var(--dashboard-surface-solid)',
											color: 'var(--dashboard-text)'
										}}
									>
										<option value="">Select faculty...</option>
										{facultyData.map((faculty) => (
											<option key={faculty.id} value={faculty.id}>
												{faculty.name} - {faculty.subject} ({faculty.classes.join(", ")})
											</option>
										))}
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2" style={{ color: 'var(--dashboard-text)' }}>
										Date
									</label>
									<input
										type="date"
										value={selectedDate}
										onChange={(e) => setSelectedDate(e.target.value)}
										className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition"
										style={{
											border: '1px solid var(--dashboard-border)',
											backgroundColor: 'var(--dashboard-surface-solid)',
											color: 'var(--dashboard-text)'
										}}
									/>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2" style={{ color: 'var(--dashboard-text)' }}>
										Period
									</label>
									<select
										value={selectedPeriod}
										onChange={(e) => setSelectedPeriod(e.target.value)}
										className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition"
										style={{
											border: '1px solid var(--dashboard-border)',
											backgroundColor: 'var(--dashboard-surface-solid)',
											color: 'var(--dashboard-text)'
										}}
									>
										{[1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
											<option key={period} value={period.toString()}>
												Period {period}
											</option>
										))}
									</select>
								</div>

								<button
									onClick={handleSubstitutionRequest}
									disabled={isLoading || !absentFacultyId}
									className="w-full rounded-xl px-6 py-4 font-semibold text-white shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
									style={{
										backgroundColor: 'var(--dashboard-primary)'
									}}
								>
									{isLoading ? "Finding Best Substitute..." : "Find Substitute"}
								</button>

								<div className="rounded-xl p-4" style={{
									backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)'
								}}>
									<p className="text-sm font-medium" style={{ color: 'var(--dashboard-primary)' }}>
										Available Faculty: {availableFaculty.length}
									</p>
									<p className="text-xs mt-1" style={{ color: 'var(--dashboard-muted)' }}>
										For {selectedDate}, Period {selectedPeriod}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Result Section */}
					<div>
						{substitutionResult ? (
							<SubstitutionCard result={substitutionResult} />
						) : (
							<div className="dashboard-card rounded-3xl p-8 shadow-lg flex items-center justify-center min-h-[400px]">
								<div className="text-center">
									<div className="mx-auto mb-4 h-20 w-20 rounded-full flex items-center justify-center" style={{
										backgroundColor: 'var(--dashboard-surface-muted)'
									}}>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth={1.5}
											stroke="currentColor"
											className="w-10 h-10"
											style={{ color: 'var(--dashboard-muted)' }}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
											/>
										</svg>
									</div>
									<h3 className="text-lg font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
										No Substitution Yet
									</h3>
									<p className="mt-2 text-sm" style={{ color: 'var(--dashboard-muted)' }}>
										Select an absent faculty member and click "Find Substitute" to see results
									</p>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Faculty Directory Tab */}
			{activeTab === "faculty" && (
				<FacultyList
					facultyData={facultyData}
					selectedDate={selectedDate}
					selectedPeriod={selectedPeriod}
				/>
			)}

			{/* History Tab */}
			{activeTab === "history" && (
				<SubstitutionHistory history={substitutionHistory} />
			)}

			{/* Success Message Toast */}
			{showSuccessMessage && (
				<div className="fixed bottom-6 right-6 z-50 animate-slide-up">
					<div className={`rounded-2xl p-5 shadow-2xl backdrop-blur-sm`} style={{
						border: successMessage.includes("✓") ? '2px solid #86efac' : '2px solid #fca5a5',
						backgroundColor: successMessage.includes("✓") ? '#f0fdf4' : '#fef2f2'
					}}>
						<div className="flex items-start gap-4">
							<div className={`rounded-full p-2`} style={{
								backgroundColor: successMessage.includes("✓") ? '#dcfce7' : '#fee2e2'
							}}>
								{successMessage.includes("✓") ? (
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" style={{ color: '#16a34a' }}>
										<path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
									</svg>
								) : (
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" style={{ color: '#dc2626' }}>
										<path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
									</svg>
								)}
							</div>
							<div className="flex-1">
								<p className={`text-sm font-semibold`} style={{
									color: successMessage.includes("✓") ? '#166534' : '#991b1b'
								}}>
									{successMessage}
								</p>
							</div>
							<button
								onClick={() => setShowSuccessMessage(false)}
								className="rounded-lg p-1 transition"
								style={{
									color: 'var(--dashboard-muted)'
								}}
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
									<path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
								</svg>
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Teacher Details Modal */}
			{showTeacherModal && selectedTeacher && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
					<div className="dashboard-card relative w-full max-w-2xl rounded-3xl shadow-2xl">
						{/* Modal Header */}
						<div className="p-6" style={{ borderBottom: '1px solid var(--dashboard-border)' }}>
							<div className="flex items-start justify-between">
								<div>
									<h3 className="text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
										Faculty Details
									</h3>
									<p className="text-sm mt-1" style={{ color: 'var(--dashboard-muted)' }}>
										Complete profile information
									</p>
								</div>
								<button
									onClick={() => setShowTeacherModal(false)}
									className="rounded-xl p-2 transition"
									style={{
										color: 'var(--dashboard-muted)'
									}}
								>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
										<path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
									</svg>
								</button>
							</div>
						</div>

						{/* Modal Body */}
						<div className="p-6 space-y-6">
							{/* Basic Info */}
							<div className="rounded-2xl p-6" style={{
								backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 10%, transparent)'
							}}>
								<div className="flex items-center gap-4 mb-4">
									<div className="flex h-16 w-16 items-center justify-center rounded-full shadow-lg" style={{
										backgroundColor: 'var(--dashboard-primary)'
									}}>
										<span className="text-2xl font-bold text-white">
											{selectedTeacher.name.split(" ").map(n => n[0]).join("")}
										</span>
									</div>
									<div>
										<h4 className="text-xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
											{selectedTeacher.name}
										</h4>
										<p className="text-sm" style={{ color: 'var(--dashboard-muted)' }}>
											{selectedTeacher.id}
										</p>
									</div>
								</div>
							</div>

							{/* Professional Details */}
							<div className="grid gap-4 md:grid-cols-2">
								<div className="rounded-xl p-4" style={{ backgroundColor: 'var(--dashboard-surface-muted)' }}>
									<p className="text-xs font-semibold mb-1" style={{ color: 'var(--dashboard-muted)' }}>Subject</p>
									<p className="text-lg font-bold" style={{ color: 'var(--dashboard-heading)' }}>{selectedTeacher.subject}</p>
								</div>
								<div className="rounded-xl p-4" style={{ backgroundColor: 'var(--dashboard-surface-muted)' }}>
									<p className="text-xs font-semibold mb-1" style={{ color: 'var(--dashboard-muted)' }}>Specialization</p>
									<p className="text-lg font-bold" style={{ color: 'var(--dashboard-heading)' }}>{selectedTeacher.specialization}</p>
								</div>
								<div className="rounded-xl p-4" style={{ backgroundColor: 'var(--dashboard-surface-muted)' }}>
									<p className="text-xs font-semibold mb-1" style={{ color: 'var(--dashboard-muted)' }}>Experience</p>
									<p className="text-lg font-bold" style={{ color: 'var(--dashboard-heading)' }}>{selectedTeacher.experience} years</p>
								</div>
								<div className="rounded-xl p-4" style={{ backgroundColor: 'var(--dashboard-surface-muted)' }}>
									<p className="text-xs font-semibold mb-1" style={{ color: 'var(--dashboard-muted)' }}>Current Workload</p>
									<p className="text-lg font-bold" style={{ color: 'var(--dashboard-heading)' }}>
										{selectedTeacher.currentSubstitutions}/{selectedTeacher.maxSubstitutionsPerWeek}
									</p>
								</div>
							</div>

							{/* Qualifications */}
							<div className="rounded-xl p-4" style={{ backgroundColor: 'var(--dashboard-surface-muted)' }}>
								<p className="text-xs font-semibold mb-3" style={{ color: 'var(--dashboard-muted)' }}>Qualifications</p>
								<div className="flex flex-wrap gap-2">
									{selectedTeacher.qualifications.map((qual, idx) => (
										<span
											key={idx}
											className="rounded-lg px-3 py-1 text-sm font-semibold"
											style={{
												backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)',
												color: 'var(--dashboard-primary)'
											}}
										>
											{qual}
										</span>
									))}
								</div>
							</div>

							{/* Classes */}
							<div className="rounded-xl p-4" style={{ backgroundColor: 'var(--dashboard-surface-muted)' }}>
								<p className="text-xs font-semibold mb-3" style={{ color: 'var(--dashboard-muted)' }}>Assigned Classes</p>
								<div className="flex flex-wrap gap-2">
									{selectedTeacher.classes.map((cls, idx) => (
										<span
											key={idx}
											className="rounded-lg px-3 py-1 text-sm font-semibold"
											style={{
												backgroundColor: 'color-mix(in srgb, var(--dashboard-primary) 15%, transparent)',
												color: 'var(--dashboard-primary)'
											}}
										>
											{cls}
										</span>
									))}
								</div>
							</div>

							{/* Preferred Periods */}
							<div className="rounded-xl p-4" style={{ backgroundColor: 'var(--dashboard-surface-muted)' }}>
								<p className="text-xs font-semibold mb-3" style={{ color: 'var(--dashboard-muted)' }}>Preferred Teaching Periods</p>
								<div className="flex flex-wrap gap-2">
									{selectedTeacher.preferredPeriods.map((period, idx) => (
										<span
											key={idx}
											className="rounded-lg bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
										>
											Period {period}
										</span>
									))}
								</div>
							</div>
						</div>

						{/* Modal Footer */}
						<div className="border-t border-zinc-200 p-6 dark:border-zinc-800">
							<button
								onClick={() => setShowTeacherModal(false)}
								className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
