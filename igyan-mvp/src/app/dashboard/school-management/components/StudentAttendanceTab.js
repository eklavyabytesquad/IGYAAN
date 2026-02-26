"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabase";
import { Badge, StatCard, inputClass, labelClass, cardClass, btnPrimary, btnGhost, btnDanger, thClass, tdClass, tdBold, emptyClass, alertSuccess } from "./shared";

export default function StudentAttendanceTab({ schoolId, session, classes, userId, userRole }) {
const [selectedClass, setSelectedClass] = useState("");
const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
const [students, setStudents] = useState([]);
const [attendanceMap, setAttendanceMap] = useState({});
const [saving, setSaving] = useState(false);
const [loadingData, setLoadingData] = useState(false);
const [success, setSuccess] = useState("");
const [view, setView] = useState("mark");
const [history, setHistory] = useState([]);
const [filteredClasses, setFilteredClasses] = useState([]);

// Faculty filtering: only show assigned classes
useEffect(() => {
const loadClasses = async () => {
if (userRole === "faculty" && session) {
const { data: assignments } = await supabase
.from("faculty_assignments")
.select("class_id")
.eq("faculty_id", userId)
.eq("session_id", session.id)
.eq("is_active", true);
const assignedIds = (assignments || []).map((a) => a.class_id);
setFilteredClasses(classes.filter((c) => assignedIds.includes(c.id)));
} else {
setFilteredClasses(classes);
}
};
loadClasses();
}, [classes, userId, userRole, session]);

useEffect(() => {
if (selectedClass && session && selectedDate) fetchAttendanceData();
}, [selectedClass, session, selectedDate]);

const fetchAttendanceData = async () => {
setLoadingData(true);
try {
const { data: classStudentData } = await supabase
.from("class_students")
.select("*, users:student_id(id, full_name, email)")
.eq("class_id", selectedClass).eq("session_id", session.id).eq("status", "active").order("roll_number");
setStudents(classStudentData || []);

const { data: attData } = await supabase
.from("student_attendance_v2")
.select("*")
.eq("class_id", selectedClass).eq("attendance_date", selectedDate);

const map = {};
(classStudentData || []).forEach((cs) => {
const existing = (attData || []).find((a) => a.student_id === cs.student_id);
map[cs.student_id] = existing ? existing.status : "present";
});
setAttendanceMap(map);
} catch (err) { console.error(err); }
finally { setLoadingData(false); }
};

const toggleStatus = (studentId) => {
setAttendanceMap((prev) => ({
...prev,
[studentId]: prev[studentId] === "present" ? "absent" : prev[studentId] === "absent" ? "late" : "present",
}));
};

const markAll = (status) => {
const newMap = {};
students.forEach((cs) => { newMap[cs.student_id] = status; });
setAttendanceMap(newMap);
};

const handleSave = async () => {
setSaving(true); setSuccess("");
try {
await supabase.from("student_attendance_v2").delete().eq("class_id", selectedClass).eq("attendance_date", selectedDate);
const records = students.map((cs) => ({
school_id: schoolId, class_id: selectedClass, student_id: cs.student_id,
session_id: session.id, attendance_date: selectedDate,
status: attendanceMap[cs.student_id] || "present", marked_by: userId,
}));
if (records.length > 0) {
const { error } = await supabase.from("student_attendance_v2").insert(records);
if (error) throw error;
}
setSuccess("Attendance saved successfully!");
setTimeout(() => setSuccess(""), 3000);
} catch (err) { alert("Failed to save: " + err.message); }
finally { setSaving(false); }
};

const fetchHistory = async () => {
if (!selectedClass || !session) return;
const { data } = await supabase
.from("student_attendance_v2")
.select("*, users:student_id(full_name)")
.eq("class_id", selectedClass).eq("session_id", session.id)
.order("attendance_date", { ascending: false });
setHistory(data || []);
};

useEffect(() => {
if (view === "history" && selectedClass) fetchHistory();
}, [view, selectedClass]);

const presentCount = Object.values(attendanceMap).filter((v) => v === "present").length;
const absentCount = Object.values(attendanceMap).filter((v) => v === "absent").length;
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
<h2 className="text-xl font-bold text-zinc-900 dark:text-white">Student Attendance</h2>
<p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
{userRole === "faculty" ? "Mark attendance for your assigned classes" : "Mark and review daily attendance"}
</p>
</div>
<div className="flex gap-1 rounded-xl border border-zinc-200 p-1 dark:border-zinc-700">
<button onClick={() => setView("mark")} className={"rounded-lg px-4 py-2 text-xs font-medium transition-all " + (view === "mark" ? "bg-indigo-500 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800")}>Mark</button>
<button onClick={() => setView("history")} className={"rounded-lg px-4 py-2 text-xs font-medium transition-all " + (view === "history" ? "bg-indigo-500 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800")}>History</button>
</div>
</div>

<div className={cardClass + " flex flex-wrap items-end gap-4"}>
<div className="min-w-[180px] flex-1">
<label className={labelClass}>Class</label>
<select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className={inputClass}>
<option value="">-- Select Class --</option>
{filteredClasses.map((c) => <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>)}
</select>
</div>
{view === "mark" && (
<div className="w-48">
<label className={labelClass}>Date</label>
<input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={inputClass} />
</div>
)}
</div>

{success && <div className={alertSuccess}><span>&#10003;</span> {success}</div>}

{view === "mark" && selectedClass && (
<>
{students.length > 0 && (
<div className="flex flex-wrap items-center gap-3">
<StatCard icon="&#9989;" label="Present" value={presentCount} color="emerald" />
<StatCard icon="&#10060;" label="Absent" value={absentCount} color="amber" />
<StatCard icon="&#9200;" label="Late" value={lateCount} color="sky" />
<div className="ml-auto flex gap-2">
<button onClick={() => markAll("present")} className={btnGhost}>Mark All Present</button>
<button onClick={() => markAll("absent")} className={btnDanger + " text-amber-600! hover:bg-amber-50!"}>Mark All Absent</button>
</div>
</div>
)}
<div className={cardClass + " p-0! overflow-hidden"}>
<div className="overflow-x-auto">
<table className="w-full">
<thead className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-800/50">
<tr><th className={thClass}>Roll</th><th className={thClass}>Student</th><th className={thClass + " text-center"}>Status</th></tr>
</thead>
<tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
{loadingData ? (
<tr><td colSpan={3} className={emptyClass}><div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" /></td></tr>
) : students.length === 0 ? (
<tr><td colSpan={3} className={emptyClass}>No students in this class.</td></tr>
) : students.map((cs) => (
<tr key={cs.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
<td className={tdClass + " font-mono text-xs"}>{cs.roll_number || "\u2014"}</td>
<td className={tdBold}>{cs.users?.full_name}</td>
<td className={tdClass + " text-center"}>
<button onClick={() => toggleStatus(cs.student_id)} className={"inline-flex min-w-20 justify-center rounded-full px-4 py-1.5 text-xs font-semibold transition-all " + (
attendanceMap[cs.student_id] === "present" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400" :
attendanceMap[cs.student_id] === "absent" ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400" :
"bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400"
)}>
{attendanceMap[cs.student_id] || "present"}
</button>
</td>
</tr>
))}
</tbody>
</table>
</div>
</div>
{students.length > 0 && (
<div className="flex justify-end">
<button onClick={handleSave} disabled={saving} className={btnPrimary + " px-8! py-3!"}>{saving ? "Saving..." : "Save Attendance"}</button>
</div>
)}
</>
)}

{view === "history" && selectedClass && (
<div className="space-y-4">
{Object.keys(historyByDate).length === 0 ? (
<div className={cardClass + " py-12 text-center"}>
<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-xl dark:bg-zinc-800">&#128202;</div>
<p className="text-sm text-zinc-400">No attendance history for this class.</p>
</div>
) : Object.entries(historyByDate).map(([date, records]) => {
const p = records.filter((r) => r.status === "present").length;
const a = records.filter((r) => r.status === "absent").length;
const l = records.filter((r) => r.status === "late").length;
const pct = records.length > 0 ? Math.round((p / records.length) * 100) : 0;
return (
<div key={date} className={cardClass}>
<div className="mb-3 flex items-center justify-between">
<h3 className="font-semibold text-zinc-900 dark:text-white">{new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</h3>
<div className="flex items-center gap-3 text-xs">
<Badge color="green">P: {p}</Badge>
<Badge color="red">A: {a}</Badge>
<Badge color="yellow">L: {l}</Badge>
<span className="font-semibold text-zinc-600 dark:text-zinc-300">{pct}%</span>
</div>
</div>
<div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
<div className="h-2.5 rounded-full bg-linear-to-r from-emerald-400 to-emerald-500 transition-all" style={{ width: pct + "%" }} />
</div>
{a > 0 && (
<div className="mt-3 flex flex-wrap gap-1.5">
{records.filter((r) => r.status !== "present").map((r) => (
<Badge key={r.id} color={r.status === "absent" ? "red" : "yellow"}>
{r.users?.full_name} {"\u2014"} {r.status}
</Badge>
))}
</div>
)}
</div>
);
})}
</div>
)}
</div>
);
}
