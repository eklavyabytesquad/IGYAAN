"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import { supabase } from "../../utils/supabase";

const ALLOWED_ROLES = ["super_admin", "co_admin", "faculty"];

export default function StudentManagementPage() {
const { user, loading } = useAuth();
const router = useRouter();
const [classes, setClasses] = useState([]);
const [activeSession, setActiveSession] = useState(null);
const [allStudents, setAllStudents] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [showAddModal, setShowAddModal] = useState(false);
const [showBulkModal, setShowBulkModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [showViewModal, setShowViewModal] = useState(false);
const [viewStudent, setViewStudent] = useState(null);
const [editingStudent, setEditingStudent] = useState(null);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [searchQuery, setSearchQuery] = useState("");
const [filterClassId, setFilterClassId] = useState("");
const [bulkCsv, setBulkCsv] = useState("");
const [bulkClassId, setBulkClassId] = useState("");
const [bulkResults, setBulkResults] = useState(null);
const [bulkSaving, setBulkSaving] = useState(false);

const emptyForm = {
full_name: "", email: "", phone: "", password: "", class_id: "",
roll_number: "", age: "", house: "", learning_style: "",
interests: "", strengths: "", growth_areas: "", academic_goals: "",
favorite_subjects: "", fun_fact: "",
};
const [form, setForm] = useState({ ...emptyForm });

const hashPassword = async (password) => {
const encoder = new TextEncoder();
const data = encoder.encode(password);
const hashBuffer = await crypto.subtle.digest("SHA-256", data);
return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

useEffect(() => {
if (!loading && !user) router.push("/login");
else if (!loading && user && !ALLOWED_ROLES.includes(user.role)) router.push("/dashboard");
}, [user, loading, router]);

useEffect(() => {
if (user && ALLOWED_ROLES.includes(user.role) && user.school_id) {
fetchSessionAndClasses();
}
}, [user]);

const fetchSessionAndClasses = async () => {
try {
setIsLoading(true);
const { data: sessions } = await supabase.from("academic_sessions").select("*").eq("school_id", user.school_id).eq("is_active", true).limit(1);
const session = sessions?.[0] || null;
setActiveSession(session);

if (session) {
if (user.role === "faculty") {
const { data: assignments } = await supabase.from("faculty_assignments").select("class_id, classes(id, class_name, section)").eq("faculty_id", user.id).eq("session_id", session.id).eq("is_active", true);
const unique = [];
const seen = new Set();
(assignments || []).forEach((a) => { if (a.classes && !seen.has(a.classes.id)) { seen.add(a.classes.id); unique.push(a.classes); } });
setClasses(unique);
} else {
const { data: allC } = await supabase.from("classes").select("*").eq("school_id", user.school_id).eq("session_id", session.id).eq("is_active", true).order("class_name");
setClasses(allC || []);
}
}
await fetchAllStudents(session);
} catch (err) { console.error(err); }
finally { setIsLoading(false); }
};

const fetchAllStudents = async (session) => {
try {
let studentQuery = supabase.from("users").select("id, full_name, email, phone, created_at").eq("school_id", user.school_id).eq("role", "student").order("full_name");

if (user.role === "faculty") {
const { data: assignments } = await supabase.from("faculty_assignments").select("class_id").eq("faculty_id", user.id).eq("is_active", true);
const classIds = (assignments || []).map((a) => a.class_id);
if (classIds.length === 0) { setAllStudents([]); return; }
const { data: cs } = await supabase.from("class_students").select("student_id").in("class_id", classIds).eq("status", "active");
const sIds = [...new Set((cs || []).map((c) => c.student_id))];
if (sIds.length === 0) { setAllStudents([]); return; }
studentQuery = studentQuery.in("id", sIds);
}

const { data: studentsData } = await studentQuery;
const userIds = (studentsData || []).map((u) => u.id);

let enrollments = [];
if (userIds.length > 0 && session) {
const { data: eData } = await supabase.from("class_students").select("student_id, class_id, roll_number, classes(id, class_name, section)").in("student_id", userIds).eq("session_id", session.id).eq("status", "active");
enrollments = eData || [];
}

let profiles = [];
if (userIds.length > 0) {
const { data: pData } = await supabase.from("student_profiles").select("*").in("user_id", userIds);
profiles = pData || [];
}

const merged = (studentsData || []).map((u) => {
const enrollment = enrollments.find((e) => e.student_id === u.id);
return {
...u,
profile: profiles.find((p) => p.user_id === u.id) || null,
enrollment,
className: enrollment?.classes ? enrollment.classes.class_name + "-" + enrollment.classes.section : null,
classId: enrollment?.class_id || null,
rollNumber: enrollment?.roll_number || null,
};
});
setAllStudents(merged);
} catch (err) { console.error(err); }
};

const handleAddStudent = async (e) => {
e.preventDefault();
if (!form.full_name || !form.email || !form.password) { setError("Name, email, and password are required"); return; }
if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
setSaving(true); setError("");
try {
const passwordHash = await hashPassword(form.password);
const { data: newUser, error: userErr } = await supabase.from("users").insert([{
email: form.email.trim().toLowerCase(), password_hash: passwordHash,
full_name: form.full_name.trim(), phone: form.phone || null,
school_id: user.school_id, role: "student",
}]).select("id").single();
if (userErr) throw userErr;

if (form.class_id && activeSession) {
await supabase.from("class_students").insert([{
school_id: user.school_id, class_id: form.class_id, student_id: newUser.id,
session_id: activeSession.id, roll_number: form.roll_number || null,
}]);
}

const selectedClass = classes.find((c) => c.id === form.class_id);
const toArr = (s) => s ? s.split(",").map((x) => x.trim()).filter(Boolean) : null;
await supabase.from("student_profiles").insert([{
user_id: newUser.id, name: form.full_name.trim(), school_id: user.school_id,
age: form.age ? parseInt(form.age) : null,
class: selectedClass?.class_name || null, section: selectedClass?.section || null,
house: form.house || null, learning_style: form.learning_style || null, fun_fact: form.fun_fact || null,
interests: toArr(form.interests), strengths: toArr(form.strengths),
growth_areas: toArr(form.growth_areas), academic_goals: toArr(form.academic_goals),
favorite_subjects: toArr(form.favorite_subjects),
}]);

setSuccess("Student \"" + form.full_name + "\" created successfully!");
setForm({ ...emptyForm }); setShowAddModal(false);
await fetchAllStudents(activeSession);
setTimeout(() => setSuccess(""), 4000);
} catch (err) { setError(err.message); }
finally { setSaving(false); }
};

const handleEditStudent = (s) => {
setEditingStudent(s);
setForm({
full_name: s.full_name, email: s.email, phone: s.phone || "",
password: "", class_id: s.classId || "", roll_number: s.rollNumber || "",
age: s.profile?.age || "", house: s.profile?.house || "",
learning_style: s.profile?.learning_style || "", fun_fact: s.profile?.fun_fact || "",
interests: (s.profile?.interests || []).join(", "),
strengths: (s.profile?.strengths || []).join(", "),
growth_areas: (s.profile?.growth_areas || []).join(", "),
academic_goals: (s.profile?.academic_goals || []).join(", "),
favorite_subjects: (s.profile?.favorite_subjects || []).join(", "),
});
setShowEditModal(true); setError("");
};

const handleUpdateStudent = async (e) => {
e.preventDefault();
if (!editingStudent) return;
setSaving(true); setError("");
try {
const userUpdate = { full_name: form.full_name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone || null };
if (form.password.trim()) {
if (form.password.length < 6) { setError("Password must be at least 6 characters"); setSaving(false); return; }
userUpdate.password_hash = await hashPassword(form.password);
}
const { error: uErr } = await supabase.from("users").update(userUpdate).eq("id", editingStudent.id);
if (uErr) throw uErr;

if (form.class_id && activeSession) {
await supabase.from("class_students").delete().eq("student_id", editingStudent.id).eq("session_id", activeSession.id);
await supabase.from("class_students").insert([{
school_id: user.school_id, class_id: form.class_id, student_id: editingStudent.id,
session_id: activeSession.id, roll_number: form.roll_number || null,
}]);
}

const selectedClass = classes.find((c) => c.id === form.class_id);
const toArr = (s) => s ? s.split(",").map((x) => x.trim()).filter(Boolean) : null;
await supabase.from("student_profiles").upsert({
user_id: editingStudent.id, name: form.full_name.trim(), school_id: user.school_id,
age: form.age ? parseInt(form.age) : null,
class: selectedClass?.class_name || null, section: selectedClass?.section || null,
house: form.house || null, learning_style: form.learning_style || null, fun_fact: form.fun_fact || null,
interests: toArr(form.interests), strengths: toArr(form.strengths),
growth_areas: toArr(form.growth_areas), academic_goals: toArr(form.academic_goals),
favorite_subjects: toArr(form.favorite_subjects),
}, { onConflict: "user_id" });

setSuccess("Student updated successfully!");
setShowEditModal(false); setEditingStudent(null); setForm({ ...emptyForm });
await fetchAllStudents(activeSession);
setTimeout(() => setSuccess(""), 4000);
} catch (err) { setError(err.message); }
finally { setSaving(false); }
};

const handleDeleteStudent = async (studentId) => {
if (!confirm("Delete this student? This removes their account and all data.")) return;
try {
await supabase.from("student_profiles").delete().eq("user_id", studentId);
await supabase.from("class_students").delete().eq("student_id", studentId);
await supabase.from("users").delete().eq("id", studentId);
await fetchAllStudents(activeSession);
setSuccess("Student deleted."); setTimeout(() => setSuccess(""), 3000);
} catch (err) { console.error(err); setError("Failed to delete student."); }
};

const handleBulkUpload = async () => {
if (!bulkCsv.trim()) { setError("Please paste CSV data"); return; }
if (!bulkClassId) { setError("Please select a class for bulk upload"); return; }
if (!activeSession) { setError("No active session found"); return; }
setBulkSaving(true); setError(""); setBulkResults(null);

const lines = bulkCsv.trim().split("\n").filter((l) => l.trim());
const startIdx = lines[0]?.toLowerCase().includes("name") || lines[0]?.toLowerCase().includes("email") ? 1 : 0;
let successCount = 0, failCount = 0;
const errors = [];

for (let i = startIdx; i < lines.length; i++) {
const cols = lines[i].split(",").map((c) => c.trim());
const [full_name, email, phone, password, roll_number] = cols;
if (!full_name || !email || !password) { failCount++; errors.push("Row " + (i + 1) + ": Missing required fields"); continue; }
try {
const ph = await hashPassword(password);
const { data: nu, error: ue } = await supabase.from("users").insert([{
email: email.trim().toLowerCase(), password_hash: ph,
full_name: full_name.trim(), phone: phone || null, school_id: user.school_id, role: "student",
}]).select("id").single();
if (ue) throw ue;

await supabase.from("class_students").insert([{
school_id: user.school_id, class_id: bulkClassId, student_id: nu.id,
session_id: activeSession.id, roll_number: roll_number || null,
}]);

const sc = classes.find((c) => c.id === bulkClassId);
await supabase.from("student_profiles").insert([{
user_id: nu.id, name: full_name.trim(), school_id: user.school_id,
class: sc?.class_name || null, section: sc?.section || null,
}]);
successCount++;
} catch (err) { failCount++; errors.push("Row " + (i + 1) + " (" + email + "): " + err.message); }
}

setBulkResults({ successCount, failCount, errors });
if (successCount > 0) await fetchAllStudents(activeSession);
setBulkSaving(false);
};

const downloadCSV = () => {
const headers = ["Name", "Email", "Phone", "Class", "Roll No", "Registered"];
const rows = filteredStudents.map((s) => [s.full_name, s.email, s.phone || "", s.className || "", s.rollNumber || "", new Date(s.created_at).toLocaleDateString()]);
const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
const blob = new Blob([csv], { type: "text/csv" });
const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
a.download = "students_" + new Date().toISOString().split("T")[0] + ".csv"; a.click();
};

let filteredStudents = allStudents;
if (filterClassId) filteredStudents = filteredStudents.filter((s) => s.classId === filterClassId);
if (searchQuery) filteredStudents = filteredStudents.filter((s) => s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase()));

const enrolledCount = allStudents.filter((s) => s.classId).length;

const inputCls = "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white";
const labelCls = "mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300";
const btnPrimary = "inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-md";
const btnSecondary = "inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700";
const btnDanger = "inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20";
const btnGhost = "inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20";

if (loading) return (
<div className="flex min-h-screen items-center justify-center">
<div className="text-center"><div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" /><p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">Loading...</p></div>
</div>
);

if (!user || !ALLOWED_ROLES.includes(user.role)) return null;

return (
<div className="p-6 lg:p-8">
{/* Header */}
<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
<div>
<h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Student Management</h1>
<p className="mt-2 text-zinc-600 dark:text-zinc-400">
{user.role === "faculty" ? "Manage students in your assigned classes" : "Register, manage, and organize students across all classes"}
</p>
{activeSession && <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">Session: {activeSession.session_name}</p>}
</div>
<div className="flex gap-2">
<button onClick={() => { setShowBulkModal(true); setError(""); setBulkResults(null); setBulkCsv(""); setBulkClassId(""); }} className={btnSecondary}>
<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
Bulk Upload CSV
</button>
<button onClick={() => { setShowAddModal(true); setForm({ ...emptyForm }); setError(""); }} className={btnPrimary}>
<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" /></svg>
Add Student
</button>
</div>
</div>

{success && <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-300">&#10003; {success}</div>}

{/* Stats */}
<div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
{[
{ icon: "\uD83C\uDF93", label: "Total Students", value: allStudents.length, bg: "bg-indigo-100 dark:bg-indigo-900/30" },
{ icon: "\u2705", label: "Enrolled", value: enrolledCount, bg: "bg-emerald-100 dark:bg-emerald-900/30" },
{ icon: "\u26A0\uFE0F", label: "Not Enrolled", value: allStudents.length - enrolledCount, bg: "bg-amber-100 dark:bg-amber-900/30" },
{ icon: "\uD83D\uDCC5", label: "Classes", value: classes.length, bg: "bg-sky-100 dark:bg-sky-900/30" },
].map((s) => (
<div key={s.label} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
<div className="flex items-center gap-3">
<div className={"rounded-lg p-3 text-xl " + s.bg}>{s.icon}</div>
<div><p className="text-2xl font-bold text-zinc-900 dark:text-white">{s.value}</p><p className="text-sm text-zinc-600 dark:text-zinc-400">{s.label}</p></div>
</div>
</div>
))}
</div>

{/* Filters */}
<div className="mb-6 flex flex-wrap items-end gap-3">
<div className="min-w-[180px]">
<label className={labelCls}>Filter by Class</label>
<select value={filterClassId} onChange={(e) => setFilterClassId(e.target.value)} className={inputCls}>
<option value="">All Classes</option>
{classes.map((c) => <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>)}
</select>
</div>
<div className="relative min-w-[200px] flex-1">
<svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
<input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={inputCls + " pl-11!"} />
</div>
<button onClick={downloadCSV} className={btnSecondary}>
<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
Export CSV
</button>
</div>

{/* Students Table */}
<div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
<div className="overflow-x-auto">
<table className="w-full">
<thead className="border-b border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-800/50">
<tr>
<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">#</th>
<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Student</th>
<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Phone</th>
<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Class</th>
<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Roll No</th>
<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Registered</th>
<th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
{isLoading ? (
<tr><td colSpan={7} className="px-6 py-16 text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" /></td></tr>
) : filteredStudents.length === 0 ? (
<tr><td colSpan={7} className="px-6 py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">
<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-xl dark:bg-zinc-800">{"\uD83C\uDF93"}</div>
{searchQuery || filterClassId ? "No students match your filters." : "No students registered yet. Click 'Add Student' to get started."}
</td></tr>
) : filteredStudents.map((s, i) => (
<tr key={s.id} className="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30">
<td className="px-6 py-4 font-mono text-xs text-zinc-400">{i + 1}</td>
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-indigo-400 to-purple-500 text-xs font-bold text-white">
{s.full_name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
</div>
<div>
<p className="font-medium text-zinc-900 dark:text-white">{s.full_name}</p>
<p className="text-xs text-zinc-400">{s.email}</p>
</div>
</div>
</td>
<td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{s.phone || "\u2014"}</td>
<td className="px-6 py-4">{s.className ? <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">{s.className}</span> : <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">Not Enrolled</span>}</td>
<td className="px-6 py-4 font-mono text-xs text-zinc-600 dark:text-zinc-400">{s.rollNumber || "\u2014"}</td>
<td className="px-6 py-4 text-xs text-zinc-600 dark:text-zinc-400">{new Date(s.created_at).toLocaleDateString()}</td>
<td className="px-6 py-4 text-right">
<div className="flex items-center justify-end gap-1">
{s.profile && <button onClick={() => { setViewStudent(s); setShowViewModal(true); }} className={btnGhost}>View</button>}
<button onClick={() => handleEditStudent(s)} className={btnGhost}>Edit</button>
<button onClick={() => handleDeleteStudent(s.id)} className={btnDanger}>Delete</button>
</div>
</td>
</tr>
))}
</tbody>
</table>
</div>
</div>

{/* ===== ADD STUDENT MODAL ===== */}
{showAddModal && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
<div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
<div className="mb-6 flex items-center justify-between">
<h2 className="text-xl font-bold text-zinc-900 dark:text-white">Register New Student</h2>
<button onClick={() => { setShowAddModal(false); setError(""); }} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
</button>
</div>
{error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">{"\u26A0"} {error}</div>}
<form onSubmit={handleAddStudent} className="space-y-6">
<div>
<h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
<span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">1</span>
Account &amp; Class
</h3>
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
<div><label className={labelCls}>Full Name <span className="text-red-500">*</span></label><input type="text" placeholder="Student full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputCls} required /></div>
<div><label className={labelCls}>Email <span className="text-red-500">*</span></label><input type="email" placeholder="student@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} required /></div>
<div><label className={labelCls}>Phone</label><input type="text" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} /></div>
<div><label className={labelCls}>Password <span className="text-red-500">*</span></label><input type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} required minLength={6} /></div>
<div>
<label className={labelCls}>Assign to Class <span className="text-red-500">*</span></label>
<select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} className={inputCls} required>
<option value="">-- Select Class --</option>
{classes.map((c) => <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>)}
</select>
</div>
<div><label className={labelCls}>Roll Number</label><input type="text" placeholder="e.g. 01" value={form.roll_number} onChange={(e) => setForm({ ...form, roll_number: e.target.value })} className={inputCls} /></div>
</div>
</div>
<div>
<h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
<span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">2</span>
Profile Details <span className="text-xs font-normal text-zinc-400">(Optional)</span>
</h3>
<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
<div><label className={labelCls}>Age</label><input type="number" placeholder="15" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className={inputCls} min={3} max={25} /></div>
<div><label className={labelCls}>House</label><input type="text" placeholder="e.g. Blue" value={form.house} onChange={(e) => setForm({ ...form, house: e.target.value })} className={inputCls} /></div>
<div><label className={labelCls}>Learning Style</label><select value={form.learning_style} onChange={(e) => setForm({ ...form, learning_style: e.target.value })} className={inputCls}><option value="">Select</option><option value="Visual">Visual</option><option value="Auditory">Auditory</option><option value="Reading/Writing">Reading/Writing</option><option value="Kinesthetic">Kinesthetic</option></select></div>
<div><label className={labelCls}>Fun Fact</label><input type="text" placeholder="Something fun" value={form.fun_fact} onChange={(e) => setForm({ ...form, fun_fact: e.target.value })} className={inputCls} /></div>
</div>
<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
<div><label className={labelCls}>Interests <span className="text-xs text-zinc-400">(comma-separated)</span></label><input type="text" placeholder="Cricket, Art, Science" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} className={inputCls} /></div>
<div><label className={labelCls}>Strengths <span className="text-xs text-zinc-400">(comma-separated)</span></label><input type="text" placeholder="Math, Leadership" value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })} className={inputCls} /></div>
</div>
</div>
<div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
<button type="button" onClick={() => { setShowAddModal(false); setError(""); }} className={btnSecondary}>Cancel</button>
<button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Creating..." : "Register & Enroll Student"}</button>
</div>
</form>
</div>
</div>
)}

{/* ===== EDIT STUDENT MODAL ===== */}
{showEditModal && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
<div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
<div className="mb-6 flex items-center justify-between">
<h2 className="text-xl font-bold text-zinc-900 dark:text-white">Edit Student</h2>
<button onClick={() => { setShowEditModal(false); setError(""); setEditingStudent(null); }} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
</button>
</div>
{error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">{"\u26A0"} {error}</div>}
<form onSubmit={handleUpdateStudent} className="space-y-6">
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
<div><label className={labelCls}>Full Name <span className="text-red-500">*</span></label><input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputCls} required /></div>
<div><label className={labelCls}>Email <span className="text-red-500">*</span></label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} required /></div>
<div><label className={labelCls}>Phone</label><input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} /></div>
<div><label className={labelCls}>New Password <span className="text-xs text-zinc-400">(leave blank to keep)</span></label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} placeholder="Min 6 chars" /></div>
<div>
<label className={labelCls}>Class</label>
<select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} className={inputCls}>
<option value="">-- Select Class --</option>
{classes.map((c) => <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>)}
</select>
</div>
<div><label className={labelCls}>Roll Number</label><input type="text" value={form.roll_number} onChange={(e) => setForm({ ...form, roll_number: e.target.value })} className={inputCls} /></div>
</div>
<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
<div><label className={labelCls}>Age</label><input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className={inputCls} min={3} max={25} /></div>
<div><label className={labelCls}>House</label><input type="text" value={form.house} onChange={(e) => setForm({ ...form, house: e.target.value })} className={inputCls} /></div>
<div><label className={labelCls}>Learning Style</label><select value={form.learning_style} onChange={(e) => setForm({ ...form, learning_style: e.target.value })} className={inputCls}><option value="">Select</option><option value="Visual">Visual</option><option value="Auditory">Auditory</option><option value="Reading/Writing">Reading/Writing</option><option value="Kinesthetic">Kinesthetic</option></select></div>
<div><label className={labelCls}>Fun Fact</label><input type="text" value={form.fun_fact} onChange={(e) => setForm({ ...form, fun_fact: e.target.value })} className={inputCls} /></div>
</div>
<div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
<button type="button" onClick={() => { setShowEditModal(false); setError(""); }} className={btnSecondary}>Cancel</button>
<button type="submit" disabled={saving} className={btnPrimary}>{saving ? "Updating..." : "Update Student"}</button>
</div>
</form>
</div>
</div>
)}

{/* ===== BULK UPLOAD MODAL ===== */}
{showBulkModal && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
<div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
<div className="mb-6 flex items-center justify-between">
<h2 className="text-xl font-bold text-zinc-900 dark:text-white">Bulk Upload Students via CSV</h2>
<button onClick={() => { setShowBulkModal(false); setError(""); setBulkResults(null); }} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
</button>
</div>
{error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">{"\u26A0"} {error}</div>}
<div className="space-y-4">
<div>
<label className={labelCls}>Assign All to Class <span className="text-red-500">*</span></label>
<select value={bulkClassId} onChange={(e) => setBulkClassId(e.target.value)} className={inputCls} required>
<option value="">-- Select Class --</option>
{classes.map((c) => <option key={c.id} value={c.id}>{c.class_name} - {c.section}</option>)}
</select>
</div>
<div>
<label className={labelCls}>Paste CSV Data <span className="text-red-500">*</span></label>
<p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">Format: <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">full_name, email, phone, password, roll_number</code></p>
<textarea rows={8} value={bulkCsv} onChange={(e) => setBulkCsv(e.target.value)} placeholder={"full_name, email, phone, password, roll_number\nRahul Sharma, rahul@school.com, 9876543210, pass123, 01\nPriya Patel, priya@school.com, , pass456, 02"} className={inputCls + " font-mono text-xs!"} />
</div>
{bulkResults && (
<div className={"rounded-xl p-4 " + (bulkResults.failCount === 0 ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-amber-50 dark:bg-amber-900/20")}>
<div className="flex items-center gap-4 text-sm font-medium">
<span className="text-emerald-700 dark:text-emerald-400">{"\u2705"} {bulkResults.successCount} created</span>
{bulkResults.failCount > 0 && <span className="text-red-700 dark:text-red-400">{"\u274C"} {bulkResults.failCount} failed</span>}
</div>
{bulkResults.errors.length > 0 && (
<div className="mt-2 max-h-32 overflow-y-auto text-xs text-red-600 dark:text-red-400">
{bulkResults.errors.map((e, i) => <p key={i}>{"\u2022"} {e}</p>)}
</div>
)}
</div>
)}
<div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
<button onClick={() => { setShowBulkModal(false); setError(""); setBulkResults(null); }} className={btnSecondary}>Close</button>
<button onClick={handleBulkUpload} disabled={bulkSaving} className={btnPrimary}>{bulkSaving ? "Uploading..." : "Upload & Create Students"}</button>
</div>
</div>
</div>
</div>
)}

{/* ===== VIEW STUDENT PROFILE MODAL ===== */}
{showViewModal && viewStudent && (
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
<div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
<div className="mb-6 flex items-center justify-between">
<h2 className="text-xl font-bold text-zinc-900 dark:text-white">Student Profile</h2>
<button onClick={() => { setShowViewModal(false); setViewStudent(null); }} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
</button>
</div>
<div className="space-y-4">
<div className="flex items-center gap-4">
<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-400 to-purple-500 text-xl font-bold text-white">
{viewStudent.full_name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}
</div>
<div>
<h3 className="text-lg font-bold text-zinc-900 dark:text-white">{viewStudent.full_name}</h3>
<p className="text-sm text-zinc-500">{viewStudent.email}</p>
{viewStudent.className && <span className="mt-1 inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">{viewStudent.className}</span>}
</div>
</div>
<div className="grid grid-cols-2 gap-3">
{[
{ label: "Class", value: viewStudent.className || "Not Enrolled" },
{ label: "Roll No", value: viewStudent.rollNumber || "\u2014" },
{ label: "Age", value: viewStudent.profile?.age || "\u2014" },
{ label: "House", value: viewStudent.profile?.house || "\u2014" },
{ label: "Learning Style", value: viewStudent.profile?.learning_style || "\u2014" },
{ label: "Phone", value: viewStudent.phone || "\u2014" },
].map((item) => (
<div key={item.label} className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800">
<p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{item.label}</p>
<p className="mt-0.5 text-sm font-medium text-zinc-900 dark:text-white">{item.value}</p>
</div>
))}
</div>
{[
{ label: "Interests", data: viewStudent.profile?.interests, color: "indigo" },
{ label: "Strengths", data: viewStudent.profile?.strengths, color: "emerald" },
{ label: "Favorite Subjects", data: viewStudent.profile?.favorite_subjects, color: "purple" },
].filter((a) => a.data?.length).map((arr) => (
<div key={arr.label}>
<p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">{arr.label}</p>
<div className="flex flex-wrap gap-1.5">{arr.data.map((item, i) => <span key={i} className={"inline-flex rounded-full px-2.5 py-1 text-xs font-medium bg-" + arr.color + "-100 text-" + arr.color + "-700 dark:bg-" + arr.color + "-900/30 dark:text-" + arr.color + "-400"}>{item}</span>)}</div>
</div>
))}
{viewStudent.profile?.fun_fact && (
<div className="rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20">
<p className="text-xs font-medium text-amber-600 dark:text-amber-400">{"\uD83C\uDF89"} Fun Fact</p>
<p className="mt-0.5 text-sm text-amber-800 dark:text-amber-300">{viewStudent.profile.fun_fact}</p>
</div>
)}
</div>
</div>
</div>
)}
</div>
);
}
