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
		<div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800 p-6 lg:p-10">
			<header className="mb-8">
				<Logo variant="header" className="mb-3" />
				<h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
					Faculty Substitution System
				</h1>
				<p className="mt-2 text-zinc-600 dark:text-zinc-400">
					Intelligent algorithm-based faculty replacement with AI-powered reasoning
				</p>
			</header>

			{/* Tab Navigation */}
			<div className="mb-6 flex gap-2 border-b border-zinc-200 dark:border-zinc-700">
				<button
					onClick={() => setActiveTab("calendar")}
					className={`px-6 py-3 font-semibold transition ${
						activeTab === "calendar"
							? "border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
							: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
					}`}
				>
					Calendar View
				</button>
				<button
					onClick={() => setActiveTab("request")}
					className={`px-6 py-3 font-semibold transition ${
						activeTab === "request"
							? "border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
							: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
					}`}
				>
					Request Substitution
				</button>
				<button
					onClick={() => setActiveTab("faculty")}
					className={`px-6 py-3 font-semibold transition ${
						activeTab === "faculty"
							? "border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
							: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
					}`}
				>
					Faculty Directory
				</button>
				<button
					onClick={() => setActiveTab("history")}
					className={`px-6 py-3 font-semibold transition ${
						activeTab === "history"
							? "border-b-2 border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
							: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
					}`}
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
								className="rounded-full border border-zinc-300 p-2 text-zinc-600 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300"
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
									<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
								</svg>
							</button>
							<h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
								{new Date(selectedDate).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
							</h2>
							<button
								onClick={() => {
									const date = new Date(selectedDate);
									date.setMonth(date.getMonth() + 1);
									setSelectedDate(date.toISOString().split("T")[0]);
								}}
								className="rounded-full border border-zinc-300 p-2 text-zinc-600 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300"
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
									<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
								</svg>
							</button>
						</div>
						<button
							onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
							className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-indigo-500 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-300"
						>
							Today
						</button>
					</div>

					{/* Calendar Grid */}
					<div className="rounded-3xl border border-zinc-200 bg-white/90 shadow-lg dark:border-zinc-800 dark:bg-zinc-900/90 overflow-hidden">
						<div className="grid grid-cols-7 bg-zinc-50 dark:bg-zinc-800/60">
							{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
								<div key={day} className="p-4 text-center text-xs font-semibold text-zinc-600 dark:text-zinc-400">
									{day}
								</div>
							))}
						</div>
						<div>
							{monthMatrix.map((week, weekIdx) => (
								<div key={weekIdx} className="grid grid-cols-7 border-t border-zinc-200 dark:border-zinc-800">
									{week.map((day, dayIdx) => {
										if (!day) {
											return <div key={dayIdx} className="min-h-[120px] border-r border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/40" />;
										}

										const dateStr = day.toISOString().split("T")[0];
										const isToday = dateStr === new Date().toISOString().split("T")[0];
										const isSelected = dateStr === selectedDate;

										return (
											<div
												key={dayIdx}
												onClick={() => setSelectedDate(dateStr)}
												className={`min-h-[120px] border-r border-zinc-200 p-2 transition cursor-pointer dark:border-zinc-800 ${
													isSelected ? "bg-indigo-50 dark:bg-indigo-900/20" : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
												}`}
											>
												<div className={`text-sm font-semibold mb-2 ${
													isToday ? "rounded-full bg-indigo-600 text-white w-7 h-7 flex items-center justify-center" : "text-zinc-900 dark:text-white"
												}`}>
													{day.getDate()}
												</div>
												<div className="space-y-1 text-xs">
													{classSchedule[dateStr]?.slice(0, 3).map((cls, idx) => {
														const teacher = facultyData.find(f => f.id === cls.facultyId);
														const absent = isTeacherAbsent(cls.facultyId, dateStr, cls.period);
														return (
															<div
																key={idx}
																className={`rounded px-2 py-1 truncate ${
																	absent
																		? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
																		: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
																}`}
															>
																P{cls.period}: {cls.className}
															</div>
														);
													})}
													{classSchedule[dateStr]?.length > 3 && (
														<div className="text-zinc-500 dark:text-zinc-400">
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
					<div className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900/90">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
									Class Schedule
								</h3>
								<p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
									{new Date(selectedDate).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
								</p>
							</div>
							<div className="rounded-xl bg-indigo-50 px-4 py-2 dark:bg-indigo-900/30">
								<p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">
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
										className="rounded-2xl border border-zinc-200 bg-gradient-to-r from-white to-zinc-50/50 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-800/50"
									>
										{/* Class Header - Dropdown Toggle */}
										<button
											onClick={() => setExpandedClass(isExpanded ? null : className)}
											className="w-full flex items-center justify-between p-5 text-left"
										>
											<div className="flex items-center gap-4">
												<div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
													<span className="text-xl font-bold text-white">
														{className.replace(/[^0-9]/g, '')}
													</span>
												</div>
												<div>
													<h4 className="text-lg font-bold text-zinc-900 dark:text-white">
														Class {className}
													</h4>
													<p className="text-sm text-zinc-600 dark:text-zinc-400">
														{hasClasses ? `${Object.keys(classPeriods).length} periods scheduled` : "No classes today"}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-3">
												{absentCount > 0 && (
													<span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
														{absentCount} Absent
													</span>
												)}
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 24 24"
													fill="none"
													stroke="currentColor"
													strokeWidth="2"
													className={`h-5 w-5 text-zinc-400 transition-transform ${
														isExpanded ? "rotate-180" : ""
													}`}
												>
													<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
												</svg>
											</div>
										</button>

										{/* Expanded Class Details */}
										{isExpanded && hasClasses && (
											<div className="border-t border-zinc-200 p-5 dark:border-zinc-800">
												<div className="space-y-4">
													{[1, 2, 3, 4, 5, 6, 7, 8].map((period) => {
														const periodItems = classPeriods[period.toString()] || [];
														if (periodItems.length === 0) return null;

														return (
															<div
																key={period}
																className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
															>
																<div className="flex items-center gap-3 mb-3">
																	<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
																		<span className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
																			P{period}
																		</span>
																	</div>
																	<div>
																		<h5 className="font-semibold text-zinc-900 dark:text-white">
																			Period {period}
																		</h5>
																		<p className="text-xs text-zinc-500 dark:text-zinc-400">
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
																			className={`rounded-lg p-4 ${
																				absent
																					? "bg-red-50 border-2 border-red-200 dark:bg-red-900/20 dark:border-red-800"
																					: "bg-zinc-50 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700"
																			}`}
																		>
																			<div className="flex items-start justify-between mb-3">
																				<div className="flex-1">
																					<div className="flex items-center gap-2 mb-2">
																						<p className="font-semibold text-zinc-900 dark:text-white">
																							{teacher?.name}
																						</p>
																						{absent && (
																							<span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
																								ABSENT
																							</span>
																						)}
																					</div>
																					<div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
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
																					className="flex-1 rounded-lg border-2 border-indigo-300 bg-white px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-700 dark:bg-zinc-900 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
																				>
																					📋 More Details
																				</button>
																				{absent ? (
																					<>
																						<button
																							onClick={() => handleMarkPresent(item.facultyId, selectedDate, period.toString())}
																							className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
																						>
																							✓ Mark Present
																						</button>
																						<button
																							onClick={() => {
																								setAbsentFacultyId(item.facultyId);
																								setSelectedPeriod(period.toString());
																								setActiveTab("request");
																							}}
																							className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
																						>
																							🔍 Find Substitute
																						</button>
																					</>
																				) : (
																					<button
																						onClick={() => handleMarkAbsent(item.facultyId, selectedDate, period.toString())}
																						className="flex-1 rounded-lg border-2 border-red-300 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-700 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-900/20"
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
						<div className="rounded-3xl border border-zinc-200 bg-white/90 p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900/90">
							<h2 className="text-2xl font-semibold text-zinc-900 dark:text-white mb-6">
								Substitution Request
							</h2>

							<div className="space-y-5">
								<div>
									<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
										Absent Faculty Member
									</label>
									<select
										value={absentFacultyId}
										onChange={(e) => setAbsentFacultyId(e.target.value)}
										className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
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
									<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
										Date
									</label>
									<input
										type="date"
										value={selectedDate}
										onChange={(e) => setSelectedDate(e.target.value)}
										className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
										Period
									</label>
									<select
										value={selectedPeriod}
										onChange={(e) => setSelectedPeriod(e.target.value)}
										className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
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
									className="w-full rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 px-6 py-4 font-semibold text-white shadow-lg transition hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{isLoading ? "Finding Best Substitute..." : "Find Substitute"}
								</button>

								<div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
									<p className="text-sm font-medium text-blue-900 dark:text-blue-300">
										Available Faculty: {availableFaculty.length}
									</p>
									<p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
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
							<div className="rounded-3xl border border-zinc-200 bg-white/90 p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900/90 flex items-center justify-center min-h-[400px]">
								<div className="text-center">
									<div className="mx-auto mb-4 h-20 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth={1.5}
											stroke="currentColor"
											className="w-10 h-10 text-zinc-400"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
											/>
										</svg>
									</div>
									<h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
										No Substitution Yet
									</h3>
									<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
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
					<div className={`rounded-2xl border-2 p-5 shadow-2xl backdrop-blur-sm ${
						successMessage.includes("✓")
							? "border-green-300 bg-green-50/95 dark:border-green-700 dark:bg-green-900/95"
							: "border-red-300 bg-red-50/95 dark:border-red-700 dark:bg-red-900/95"
					}`}>
						<div className="flex items-start gap-4">
							<div className={`rounded-full p-2 ${
								successMessage.includes("✓")
									? "bg-green-100 dark:bg-green-800"
									: "bg-red-100 dark:bg-red-800"
							}`}>
								{successMessage.includes("✓") ? (
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-green-600 dark:text-green-400">
										<path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
									</svg>
								) : (
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-red-600 dark:text-red-400">
										<path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
									</svg>
								)}
							</div>
							<div className="flex-1">
								<p className={`text-sm font-semibold ${
									successMessage.includes("✓")
										? "text-green-900 dark:text-green-100"
										: "text-red-900 dark:text-red-100"
								}`}>
									{successMessage}
								</p>
							</div>
							<button
								onClick={() => setShowSuccessMessage(false)}
								className="rounded-lg p-1 hover:bg-white/50 dark:hover:bg-black/20"
							>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-zinc-600 dark:text-zinc-400">
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
					<div className="relative w-full max-w-2xl rounded-3xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
						{/* Modal Header */}
						<div className="border-b border-zinc-200 p-6 dark:border-zinc-800">
							<div className="flex items-start justify-between">
								<div>
									<h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
										Faculty Details
									</h3>
									<p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
										Complete profile information
									</p>
								</div>
								<button
									onClick={() => setShowTeacherModal(false)}
									className="rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
								>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-zinc-600 dark:text-zinc-400">
										<path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
									</svg>
								</button>
							</div>
						</div>

						{/* Modal Body */}
						<div className="p-6 space-y-6">
							{/* Basic Info */}
							<div className="rounded-2xl bg-linear-to-br from-indigo-50 to-purple-50 p-6 dark:from-indigo-900/20 dark:to-purple-900/20">
								<div className="flex items-center gap-4 mb-4">
									<div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-600 shadow-lg">
										<span className="text-2xl font-bold text-white">
											{selectedTeacher.name.split(" ").map(n => n[0]).join("")}
										</span>
									</div>
									<div>
										<h4 className="text-xl font-bold text-zinc-900 dark:text-white">
											{selectedTeacher.name}
										</h4>
										<p className="text-sm text-zinc-600 dark:text-zinc-400">
											{selectedTeacher.id}
										</p>
									</div>
								</div>
							</div>

							{/* Professional Details */}
							<div className="grid gap-4 md:grid-cols-2">
								<div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
									<p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Subject</p>
									<p className="text-lg font-bold text-zinc-900 dark:text-white">{selectedTeacher.subject}</p>
								</div>
								<div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
									<p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Specialization</p>
									<p className="text-lg font-bold text-zinc-900 dark:text-white">{selectedTeacher.specialization}</p>
								</div>
								<div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
									<p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Experience</p>
									<p className="text-lg font-bold text-zinc-900 dark:text-white">{selectedTeacher.experience} years</p>
								</div>
								<div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
									<p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Current Workload</p>
									<p className="text-lg font-bold text-zinc-900 dark:text-white">
										{selectedTeacher.currentSubstitutions}/{selectedTeacher.maxSubstitutionsPerWeek}
									</p>
								</div>
							</div>

							{/* Qualifications */}
							<div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
								<p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-3">Qualifications</p>
								<div className="flex flex-wrap gap-2">
									{selectedTeacher.qualifications.map((qual, idx) => (
										<span
											key={idx}
											className="rounded-lg bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
										>
											{qual}
										</span>
									))}
								</div>
							</div>

							{/* Classes */}
							<div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
								<p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-3">Assigned Classes</p>
								<div className="flex flex-wrap gap-2">
									{selectedTeacher.classes.map((cls, idx) => (
										<span
											key={idx}
											className="rounded-lg bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
										>
											{cls}
										</span>
									))}
								</div>
							</div>

							{/* Preferred Periods */}
							<div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
								<p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-3">Preferred Teaching Periods</p>
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
