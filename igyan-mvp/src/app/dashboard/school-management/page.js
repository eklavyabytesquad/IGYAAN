"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../utils/supabase";
import { useAuth } from "../../utils/auth_context";
import { TABS, StatCard } from "./components/shared";

import SessionsTab from "./components/SessionsTab";
import SubjectsTab from "./components/SubjectsTab";
import ClassesTab from "./components/ClassesTab";
import AddStudentsTab from "./components/AddStudentsTab";
import StudentsTab from "./components/StudentsTab";
import FacultyAssignTab from "./components/FacultyAssignTab";
import StudentAttendanceTab from "./components/StudentAttendanceTab";
import FacultyAttendanceTab from "./components/FacultyAttendanceTab";
import TransfersTab from "./components/TransfersTab";
import ParentsTab from "./components/ParentsTab";

export default function SchoolManagementPage() {
	const { user, loading: authLoading } = useAuth();
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("sessions");
	const [schoolId, setSchoolId] = useState(null);
	const [schoolData, setSchoolData] = useState(null);
	const [pageLoading, setPageLoading] = useState(true);

	// Data states
	const [sessions, setSessions] = useState([]);
	const [activeSession, setActiveSession] = useState(null);
	const [subjects, setSubjects] = useState([]);
	const [classes, setClasses] = useState([]);
	const [students, setStudents] = useState([]);
	const [faculty, setFaculty] = useState([]);
	const [parents, setParents] = useState([]);

	useEffect(() => {
		if (!authLoading && (!user || !["super_admin", "co_admin"].includes(user.role))) {
			router.push("/dashboard");
		}
	}, [user, authLoading, router]);

	const fetchSchool = useCallback(async () => {
		if (!user?.school_id) { setPageLoading(false); return; }
		try {
			const { data } = await supabase.from("schools").select("*").eq("id", user.school_id).single();
			if (data) { setSchoolId(data.id); setSchoolData(data); }
		} catch (err) { console.error(err); }
		setPageLoading(false);
	}, [user]);

	const fetchSessions = useCallback(async () => {
		if (!schoolId) return;
		const { data } = await supabase.from("academic_sessions").select("*").eq("school_id", schoolId).order("start_date", { ascending: false });
		setSessions(data || []);
		setActiveSession((data || []).find((s) => s.is_active) || null);
	}, [schoolId]);

	const fetchSubjects = useCallback(async () => {
		if (!schoolId) return;
		const { data } = await supabase.from("subjects").select("*").eq("school_id", schoolId).order("subject_name");
		setSubjects(data || []);
	}, [schoolId]);

	const fetchClasses = useCallback(async () => {
		if (!schoolId || !activeSession) return;
		const { data } = await supabase.from("classes").select("*").eq("school_id", schoolId).eq("session_id", activeSession.id).order("class_name");
		setClasses(data || []);
	}, [schoolId, activeSession]);

	const fetchStudents = useCallback(async () => {
		if (!schoolId) return;
		const { data } = await supabase.from("users").select("id, full_name, email, phone").eq("school_id", schoolId).eq("role", "student").order("full_name");
		setStudents(data || []);
	}, [schoolId]);

	const fetchFaculty = useCallback(async () => {
		if (!schoolId) return;
		const { data } = await supabase.from("users").select("id, full_name, email, phone").eq("school_id", schoolId).eq("role", "faculty").order("full_name");
		setFaculty(data || []);
	}, [schoolId]);

	const fetchParents = useCallback(async () => {
		if (!schoolId) return;
		const { data } = await supabase.from("users").select("id, full_name, email, phone").eq("school_id", schoolId).eq("role", "parent").order("full_name");
		setParents(data || []);
	}, [schoolId]);

	useEffect(() => { if (user) fetchSchool(); }, [user, fetchSchool]);
	useEffect(() => { if (schoolId) { fetchSessions(); fetchSubjects(); fetchStudents(); fetchFaculty(); fetchParents(); } }, [schoolId, fetchSessions, fetchSubjects, fetchStudents, fetchFaculty, fetchParents]);
	useEffect(() => { if (activeSession) fetchClasses(); }, [activeSession, fetchClasses]);

	const refreshAll = () => { fetchSessions(); fetchSubjects(); fetchClasses(); fetchStudents(); fetchFaculty(); fetchParents(); };

	if (authLoading || pageLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
					<p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading School Management...</p>
				</div>
			</div>
		);
	}

	if (!schoolId) {
		return (
			<div className="flex h-screen items-center justify-center p-6">
				<div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
					<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl dark:bg-amber-900/30">🏫</div>
					<h2 className="text-xl font-bold text-zinc-900 dark:text-white">No School Found</h2>
					<p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Your account is not linked to any school. Please contact support or complete your school profile setup.</p>
				</div>
			</div>
		);
	}

	const sessionSelector = activeTab !== "sessions" && activeTab !== "subjects" && activeTab !== "add-students" && activeTab !== "parents" && (
		<div className="flex items-center gap-3">
			<span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Session:</span>
			<select
				value={activeSession?.id || ""}
				onChange={(e) => {
					const s = sessions.find((s) => s.id === e.target.value);
					setActiveSession(s || null);
				}}
				className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
			>
				{sessions.map((s) => <option key={s.id} value={s.id}>{s.session_name}{s.is_active ? " ✦" : ""}</option>)}
			</select>
		</div>
	);

	return (
		<div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950">
			{/* Hero Banner */}
			<div className="relative overflow-hidden bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-700 px-6 py-8 sm:px-8">
				<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBWMkgydjJoMzR6TTIgMjBoMzR2Mkgydi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
				<div className="relative z-10">
					<h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
						🏫 {schoolData?.name || "School Management"}
					</h1>
					<p className="mt-1.5 text-sm text-indigo-100/80">Manage your academic operations — sessions, classes, students, faculty & more</p>
					<div className="mt-5 flex flex-wrap gap-3">
						<StatCard icon="📅" label="Sessions" value={sessions.length} color="white" />
						<StatCard icon="📚" label="Subjects" value={subjects.length} color="white" />
						<StatCard icon="🏫" label="Classes" value={classes.length} color="white" />
						<StatCard icon="🎓" label="Students" value={students.length} color="white" />
						<StatCard icon="👨‍🏫" label="Faculty" value={faculty.length} color="white" />
						<StatCard icon="👪" label="Parents" value={parents.length} color="white" />
					</div>
				</div>
			</div>

			{/* Tab Navigation */}
			<div className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-900/90">
				<div className="flex items-center justify-between px-6 py-3">
					<div className="no-scrollbar flex gap-1 overflow-x-auto">
						{TABS.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
									activeTab === tab.id
										? "bg-indigo-500 text-white shadow-md shadow-indigo-500/25"
										: "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
								}`}
							>
								<span>{tab.icon}</span>
								<span className="hidden sm:inline">{tab.label}</span>
							</button>
						))}
					</div>
					{sessionSelector}
				</div>
			</div>

			{/* Tab Content */}
			<div className="p-6 sm:p-8">
				{activeTab === "sessions" && (
					<SessionsTab schoolId={schoolId} sessions={sessions} onRefresh={fetchSessions} />
				)}
				{activeTab === "subjects" && (
					<SubjectsTab schoolId={schoolId} subjects={subjects} onRefresh={fetchSubjects} />
				)}
				{activeTab === "classes" && (
					<ClassesTab schoolId={schoolId} session={activeSession} classes={classes} subjects={subjects} onRefresh={fetchClasses} />
				)}
				{activeTab === "add-students" && (
					<AddStudentsTab schoolId={schoolId} onRefresh={fetchStudents} />
				)}
				{activeTab === "students" && (
					<StudentsTab schoolId={schoolId} session={activeSession} classes={classes} students={students} onRefresh={refreshAll} />
				)}
				{activeTab === "faculty-assign" && (
					<FacultyAssignTab schoolId={schoolId} session={activeSession} classes={classes} subjects={subjects} faculty={faculty} onRefresh={refreshAll} />
				)}
				{activeTab === "student-attendance" && (
					<StudentAttendanceTab schoolId={schoolId} session={activeSession} classes={classes} userId={user?.id} />
				)}
				{activeTab === "faculty-attendance" && (
					<FacultyAttendanceTab schoolId={schoolId} session={activeSession} faculty={faculty} userId={user?.id} />
				)}
				{activeTab === "transfers" && (
					<TransfersTab schoolId={schoolId} sessions={sessions} classes={classes} students={students} activeSession={activeSession} userId={user?.id} onRefresh={refreshAll} />
				)}
				{activeTab === "parents" && (
					<ParentsTab schoolId={schoolId} students={students} userId={user?.id} onRefresh={refreshAll} />
				)}
			</div>
		</div>
	);
}
