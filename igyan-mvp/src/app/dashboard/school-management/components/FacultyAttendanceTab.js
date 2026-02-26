"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import { Badge, StatCard, inputClass, labelClass, cardClass, btnPrimary, thClass, tdClass, tdBold, emptyClass, alertSuccess } from "./shared";

export default function FacultyAttendanceTab({ schoolId, session, faculty, userId }) {
	const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
	const [attendanceMap, setAttendanceMap] = useState({});
	const [saving, setSaving] = useState(false);
	const [loadingData, setLoadingData] = useState(false);
	const [success, setSuccess] = useState("");
	const [view, setView] = useState("mark");
	const [history, setHistory] = useState([]);

	useEffect(() => {
		if (session && selectedDate && faculty.length) fetchAttendanceData();
	}, [session, selectedDate, faculty]);

	const fetchAttendanceData = async () => {
		setLoadingData(true);
		try {
			const { data } = await supabase.from("faculty_attendance").select("*").eq("school_id", schoolId).eq("attendance_date", selectedDate);
			const map = {};
			faculty.forEach((f) => {
				const existing = (data || []).find((a) => a.faculty_id === f.id);
				map[f.id] = existing ? existing.status : "present";
			});
			setAttendanceMap(map);
		} catch (err) {
			console.error(err);
		} finally {
			setLoadingData(false);
		}
	};

	const toggleStatus = (facultyId) => {
		setAttendanceMap((prev) => ({
			...prev,
			[facultyId]: prev[facultyId] === "present" ? "absent" : prev[facultyId] === "absent" ? "on_leave" : prev[facultyId] === "on_leave" ? "late" : "present",
		}));
	};

	const handleSave = async () => {
		if (!session) return;
		setSaving(true);
		setSuccess("");
		try {
			await supabase.from("faculty_attendance").delete().eq("school_id", schoolId).eq("attendance_date", selectedDate);
			const records = faculty.map((f) => ({
				school_id: schoolId, faculty_id: f.id, session_id: session.id,
				attendance_date: selectedDate, status: attendanceMap[f.id] || "present", marked_by: userId,
			}));
			if (records.length > 0) {
				const { error } = await supabase.from("faculty_attendance").insert(records);
				if (error) throw error;
			}
			setSuccess("Faculty attendance saved!");
			setTimeout(() => setSuccess(""), 3000);
		} catch (err) {
			alert("Failed: " + err.message);
		} finally {
			setSaving(false);
		}
	};

	const fetchHistory = async () => {
		const { data } = await supabase.from("faculty_attendance")
			.select("*, users:faculty_id(full_name)")
			.eq("school_id", schoolId).eq("session_id", session?.id)
			.order("attendance_date", { ascending: false }).limit(500);
		setHistory(data || []);
	};

	useEffect(() => {
		if (view === "history" && session) fetchHistory();
	}, [view, session]);

	const presentCount = Object.values(attendanceMap).filter((v) => v === "present").length;
	const absentCount = Object.values(attendanceMap).filter((v) => v === "absent").length;
	const leaveCount = Object.values(attendanceMap).filter((v) => v === "on_leave").length;
	const lateCount = Object.values(attendanceMap).filter((v) => v === "late").length;

	const historyByDate = {};
	history.forEach((h) => {
		if (!historyByDate[h.attendance_date]) historyByDate[h.attendance_date] = [];
		historyByDate[h.attendance_date].push(h);
	});

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-zinc-900 dark:text-white">Faculty Attendance</h2>
					<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Track staff attendance and leave</p>
				</div>
				<div className="flex gap-1 rounded-xl border border-zinc-200 p-1 dark:border-zinc-700">
					<button onClick={() => setView("mark")} className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${view === "mark" ? "bg-indigo-500 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}>Mark</button>
					<button onClick={() => setView("history")} className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${view === "history" ? "bg-indigo-500 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}>History</button>
				</div>
			</div>

			{view === "mark" && (
				<div className={`${cardClass} flex flex-wrap items-end gap-4`}>
					<div className="w-48">
						<label className={labelClass}>Date</label>
						<input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={inputClass} />
					</div>
				</div>
			)}

			{success && <div className={alertSuccess}><span>✓</span> {success}</div>}

			{view === "mark" && (
				<>
					{faculty.length > 0 && (
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
							<StatCard icon="✅" label="Present" value={presentCount} color="emerald" />
							<StatCard icon="❌" label="Absent" value={absentCount} color="amber" />
							<StatCard icon="📝" label="On Leave" value={leaveCount} color="sky" />
							<StatCard icon="⏰" label="Late" value={lateCount} color="purple" />
						</div>
					)}

					<div className={cardClass + " p-0! overflow-hidden"}>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-800/50">
									<tr>
										<th className={thClass}>#</th>
										<th className={thClass}>Faculty</th>
										<th className={thClass}>Email</th>
										<th className={thClass + " text-center"}>Status</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
									{loadingData ? (
										<tr><td colSpan={4} className={emptyClass}><div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" /></td></tr>
									) : faculty.length === 0 ? (
										<tr><td colSpan={4} className={emptyClass}>No faculty members.</td></tr>
									) : faculty.map((f, i) => (
										<tr key={f.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
											<td className={tdClass + " font-mono text-xs text-zinc-400"}>{i + 1}</td>
											<td className={tdBold}>
												<div className="flex items-center gap-3">
													<div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
														{f.full_name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
													</div>
													{f.full_name}
												</div>
											</td>
											<td className={tdClass}>{f.email}</td>
											<td className={tdClass + " text-center"}>
												<button onClick={() => toggleStatus(f.id)} className={`inline-flex min-w-20 justify-center rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
													attendanceMap[f.id] === "present" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400" :
													attendanceMap[f.id] === "absent" ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400" :
													attendanceMap[f.id] === "on_leave" ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400" :
													"bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
												}`}>
													{(attendanceMap[f.id] || "present").replace("_", " ")}
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{faculty.length > 0 && (
						<div className="flex justify-end">
							<button onClick={handleSave} disabled={saving} className={btnPrimary + " px-8! py-3!"}>
								{saving ? "Saving..." : "💾 Save Faculty Attendance"}
							</button>
						</div>
					)}
				</>
			)}

			{view === "history" && (
				<div className="space-y-4">
					{Object.keys(historyByDate).length === 0 ? (
						<div className={`${cardClass} py-12 text-center`}>
							<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-xl dark:bg-zinc-800">📊</div>
							<p className="text-sm text-zinc-400">No attendance history yet.</p>
						</div>
					) : Object.entries(historyByDate).map(([date, records]) => {
						const p = records.filter((r) => r.status === "present").length;
						const a = records.filter((r) => r.status === "absent").length;
						const pct = records.length > 0 ? Math.round((p / records.length) * 100) : 0;
						return (
							<div key={date} className={cardClass}>
								<div className="mb-3 flex items-center justify-between">
									<h3 className="font-semibold text-zinc-900 dark:text-white">{new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</h3>
									<div className="flex items-center gap-3 text-xs">
										<Badge color="green">P: {p}</Badge>
										<Badge color="red">A: {a}</Badge>
										<Badge color="blue">L: {records.filter((r) => r.status === "on_leave").length}</Badge>
										<span className="font-semibold text-zinc-600 dark:text-zinc-300">{pct}%</span>
									</div>
								</div>
								<div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
									<div className="h-2.5 rounded-full bg-linear-to-r from-emerald-400 to-emerald-500 transition-all" style={{ width: `${pct}%` }} />
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
