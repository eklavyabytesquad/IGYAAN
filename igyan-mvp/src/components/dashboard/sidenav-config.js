import {
	Home, Wrench, BookOpen, Bot, SmilePlus, Mic, Fish, Video, 
	ClipboardList, Rocket, BarChart3, MessageCircle, Users, GraduationCap,
	Building2, Clock, CheckCircle, Calendar, Globe, FileText, Lock,
	Settings, Lightbulb, FileEdit, FileStack, Clipboard, Puzzle, 
	BarChart, Presentation, Sparkles, AlertTriangle, MessagesSquare,
	UserCheck, History, Notebook, Heart, Star, Phone, Mail, ClipboardCheck,
	Gamepad2, FolderOpen, BrainCircuit, Layers
} from "lucide-react";
import Image from "next/image";

/*
 * Unified Sidenav Navigation Configuration
 * ==========================================
 * Single source of truth for all role-based navigation.
 * Each role gets a curated nav structure. The sidenav component renders
 * whichever config matches the user's role.
 *
 * Structure:
 *   sections[] → { label, items[] }
 *   items[]    → { key, name, href, icon, allowedRoles?, subItems[]? }
 */

// ── Custom icon wrappers for brand images ──────────────────────────
const SudarshanIcon = () => (
	<Image src="/asset/sudarshanai/sudarshanicon.png" alt="Sudarshan AI" width={20} height={20} className="object-contain nav-icon-adaptive" />
);
const SharkIcon = () => (
	<Image src="/asset/ai-shark/sharkicon.png" alt="AI Shark" width={20} height={20} className="object-contain nav-icon-adaptive" />
);
const BuddyIcon = () => (
	<Image src="/asset/buddyicon.png" alt="Buddy AI" width={20} height={20} className="object-contain nav-icon-adaptive" />
);

// ── Role-based access matrix (kept from original) ──────────────────
export const ROLE_ACCESS = {
	dashboard:           ['super_admin','co_admin','faculty','student','counselor','parent','b2c_student','b2c_mentor'],
	tools:               ['super_admin','co_admin','faculty','student','b2c_student','b2c_mentor'],
	courses:             ['super_admin','co_admin','faculty','student','b2c_student','b2c_mentor'],
	copilot:             ['super_admin','co_admin','faculty','student','b2c_student','b2c_mentor'],
	gyanisage:           ['super_admin','co_admin','faculty','student','b2c_student','b2c_mentor'],
	vivaAi:              ['super_admin','co_admin','faculty','student','b2c_student','b2c_mentor'],
	sharkAi:             ['super_admin','co_admin','faculty','student','counselor','b2c_student','b2c_mentor'],
	performance:         ['super_admin','co_admin','faculty','student','parent','b2c_student','b2c_mentor'],
	settings:            ['super_admin','co_admin','faculty','student','counselor','parent','b2c_student','b2c_mentor'],
	liveClassroom:       ['super_admin','co_admin','faculty','student','b2c_student','b2c_mentor'],
	contentGenerator:    ['super_admin','co_admin','faculty','student'],
	reports:             ['super_admin','co_admin','faculty'],
	reportCards:         ['super_admin','co_admin','faculty','parent'],
	assignments:         ['super_admin','co_admin','faculty','student'],
	questionPaper:       ['super_admin','co_admin','faculty'],
	facultySubstitution: ['super_admin','co_admin','faculty'],
	userManagement:      ['super_admin','co_admin'],
	studentManagement:   ['super_admin','co_admin','faculty'],
	attendance:          ['super_admin','co_admin','faculty','parent'],
	userAccess:          ['super_admin'],
	schoolProfile:       ['super_admin','co_admin'],
	schoolManagement:    ['super_admin','co_admin'],
	timetable:           ['super_admin','co_admin','faculty'],
	eventsManagement:    ['super_admin','co_admin'],
	eventsStudent:       ['super_admin','co_admin','faculty','student'],
	eventsPublic:        ['super_admin','co_admin','faculty','student','parent','b2c_student','b2c_mentor'],
	incubationHub:       ['super_admin','co_admin','faculty','student','b2c_student','b2c_mentor'],
	mentors:             ['b2c_student','b2c_mentor'],
};

// ══════════════════════════════════════════════════════════════════
//  NAV CONFIGS PER ROLE
// ══════════════════════════════════════════════════════════════════

export function getNavSections(role) {
	switch (role) {
		case 'super_admin':
		case 'co_admin':
			return ADMIN_NAV;
		case 'faculty':
			return FACULTY_NAV;
		case 'student':
			return STUDENT_NAV;
		case 'counselor':
			return COUNSELOR_NAV;
		case 'parent':
			return PARENT_NAV;
		case 'b2c_student':
			return B2C_STUDENT_NAV;
		case 'b2c_mentor':
			return B2C_MENTOR_NAV;
		default:
			return ADMIN_NAV;
	}
}

// ── Admin / Co-Admin ────────────────────────────────────────────
const ADMIN_NAV = [
	{
		items: [
			{ key: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: Home },
			{ key: 'liveClassroom', name: 'Omni Sight', href: '/dashboard/live-classroom', icon: Video },
		],
	},
	{
		label: 'I-GYAN AI Suite',
		labelColor: 'text-sky-500',
		items: [
			{ key: 'copilot', name: 'Customise Co-Pilot', href: '/dashboard/copilot', icon: SudarshanIcon, isCustomIcon: true },
			{ key: 'gyanisage', name: 'Buddy AI Counsellor', href: '/dashboard/gyanisage', icon: BuddyIcon, isCustomIcon: true },
			{ key: 'vivaAi', name: 'Viva Intelligence', href: '/dashboard/viva-ai', icon: Mic },
			{ key: 'sharkAi', name: 'AI Shark', href: '/dashboard/shark-ai', icon: SharkIcon, isCustomIcon: true },
			{ key: 'contentGenerator', name: "Slide's Creator", href: '/dashboard/content-generator', icon: Presentation },
			{ key: 'tools', name: 'AI Tools Suite', href: '/dashboard/tools', icon: Wrench },
		],
	},
	{
		label: 'Academic Operations',
		labelColor: 'text-emerald-500',
		items: [
			{ key: 'courses', name: 'Courses & Curriculum', href: '/dashboard/courses', icon: BookOpen },
			{ key: 'studentManagement', name: 'Student Management', href: '/dashboard/student-management', icon: GraduationCap },
			{ key: 'schoolManagement', name: 'School Management', href: '/dashboard/school-management', icon: Building2 },
			{ key: 'timetable', name: 'Timetable', href: '/dashboard/timetable', icon: Clock },
			{ key: 'attendance', name: 'Attendance', href: '/dashboard/attendance', icon: CheckCircle },
			{ key: 'facultySubstitution', name: 'Smart Substitution', href: '/dashboard/faculty-substitution', icon: UserCheck },
		],
	},
	{
		label: 'Institutional Development',
		labelColor: 'text-purple-500',
		items: [
			{ key: 'incubationHub', name: 'Incubation Hub', href: '/dashboard/incubation-hub', icon: Rocket },
			{ key: 'performance', name: 'Performance & Analytics', href: '/dashboard/performance', icon: BarChart3 },
			{ key: 'reports', name: 'Smart Report Builder', href: '/dashboard/reports', icon: FileText },
			{ key: 'questionPaper', name: 'Teachers Toolkit', href: '/dashboard/question-paper', icon: ClipboardList },
			{ key: 'assignments', name: 'AI Play Zone', href: '/dashboard/assignments', icon: Puzzle },
			{ key: 'reportCards', name: 'Report Cards Generator', href: '/dashboard/report-cards', icon: FileStack },
		],
	},
	{
		label: 'Events & Engagement',
		labelColor: 'text-amber-500',
		items: [
			{ key: 'eventsManagement', name: 'Events Management', href: '/dashboard/events', icon: Calendar },
			{ key: 'eventsStudent', name: 'Browse Events', href: '/dashboard/events/student', icon: Calendar },
			{ key: 'eventsPublic', name: 'Public Events', href: '/dashboard/events/public', icon: Globe },
		],
	},
	{
		label: 'User Controls',
		labelColor: 'text-rose-500',
		items: [
			{ key: 'userManagement', name: 'User Management', href: '/dashboard/users', icon: Users },
			{ key: 'userAccess', name: 'User Access & Roles', href: '/dashboard/user-access', icon: Lock },
			{ key: 'settings', name: 'Settings', href: '/dashboard/settings', icon: Settings },
		],
	},
];

// ── Faculty ─────────────────────────────────────────────────────
const FACULTY_NAV = [
	{
		items: [
			{ key: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: Home },
			{ key: 'copilot', name: 'Copilot', href: '/dashboard/copilot-faculty', icon: SudarshanIcon, isCustomIcon: true },
			{ key: 'attendance', name: 'Attendance', href: '/dashboard/attendance', icon: ClipboardCheck },
			{ key: 'facultySubstitution', name: 'Smart Substitution', href: '/dashboard/faculty-substitution', icon: Calendar },
		],
	},
	{
		label: 'Assessment Hub',
		labelColor: 'text-sky-500',
		items: [
			{ key: 'assignments', name: 'AI Question Builder', href: '/dashboard/assignments', icon: BrainCircuit },
			{ key: 'questionPaper', name: 'Question Bank', href: '/dashboard/question-paper', icon: FileStack },
			{ key: 'homework', name: 'AI Viva Evaluator', href: '/dashboard/homework', icon: Mic },
			{ key: 'gamifiedAssignments', name: 'Gamified Assignments', href: '/dashboard/gamified-assignments', icon: Gamepad2 },
			{ key: 'reports', name: 'Smart Report Builder', href: '/dashboard/reports', icon: BarChart },
		],
	},
	{
		label: 'Teaching Toolkit',
		labelColor: 'text-emerald-500',
		items: [
			{ key: 'contentGenerator', name: 'Pitch Deck Builder', href: '/dashboard/content-generator', icon: Presentation },
			{ key: 'tools', name: 'AI Tools Suite', href: '/dashboard/tools', icon: Wrench },
			{ key: 'reportCards', name: 'Report Cards', href: '/dashboard/report-cards', icon: FileText },
			{ key: 'courses', name: 'Courses', href: '/dashboard/courses', icon: BookOpen },
		],
	},
	{
		label: 'AI & Insights',
		labelColor: 'text-purple-500',
		items: [
			{ key: 'gyanisage', name: 'Buddy AI', href: '/dashboard/gyanisage', icon: BuddyIcon, isCustomIcon: true },
			{ key: 'vivaAi', name: 'Viva AI', href: '/dashboard/viva-ai', icon: Mic },
			{ key: 'sharkAi', name: 'AI Shark', href: '/dashboard/shark-ai', icon: SharkIcon, isCustomIcon: true },
			{ key: 'performance', name: 'Performance', href: '/dashboard/performance', icon: BarChart3 },
			{ key: 'liveClassroom', name: 'Omni Sight', href: '/dashboard/live-classroom', icon: Video },
		],
	},
	{
		items: [
			{ key: 'eventsStudent', name: 'Events', href: '/dashboard/events/student', icon: Calendar },
			{ key: 'parentChat', name: 'Parent Messages', href: '/dashboard/faculty-chat', icon: MessageCircle },
			{ key: 'incubationHub', name: 'Incubation Hub', href: '/dashboard/incubation-hub', icon: Rocket },
			{ key: 'settings', name: 'Settings', href: '/dashboard/settings', icon: Settings },
		],
	},
];

// ── Student (Institutional) ──────────────────────────────────────
const STUDENT_NAV = [
	{
		items: [
			{ key: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: Home },
		],
	},
	{
		label: 'Projects',
		labelColor: 'text-sky-500',
		items: [
			{ key: 'notesGen', name: 'NoteGen AI', href: '/dashboard/tools/notes-generator', icon: FileEdit },
			{ key: 'quickRead', name: 'QuickRead', href: '/dashboard/tools/text-summarizer', icon: FileText },
			{ key: 'launchProject', name: 'Launch Project', href: '/dashboard/tools/project-learning', icon: Layers },
			{ key: 'copilot', name: 'Personalized Co-Pilot', href: '/dashboard/copilot', icon: SudarshanIcon, isCustomIcon: true },
			{ key: 'ideaSpark', name: 'Idea Spark', href: '/dashboard/tools/idea-generation', icon: Lightbulb },
			{ key: 'deckMaster', name: 'DeckMaster', href: '/dashboard/content-generator', icon: Presentation },
		],
	},
	{
		label: 'School Innovation Cell',
		labelColor: 'text-emerald-500',
		items: [
			{ key: 'brainFlex', name: 'BrainFlex', href: '/dashboard/tools/quiz-me', icon: Clipboard },
			{ key: 'sharkAi', name: 'AI Shark', href: '/dashboard/shark-ai', icon: SharkIcon, isCustomIcon: true },
			{ key: 'incubation', name: 'Incubation Form', href: '/dashboard/incubation-hub', icon: Rocket },
		],
	},
	{
		label: 'Task Hub',
		labelColor: 'text-purple-500',
		items: [
			{ key: 'homework', name: 'Homework', href: '/dashboard/homework/student', icon: BookOpen },
			{ key: 'gamified', name: 'Gamified Homework', href: '/dashboard/gamified', icon: Puzzle },
			{ key: 'vivaAi', name: 'AI Viva Lab', href: '/dashboard/viva-ai', icon: Mic },
			{ key: 'reports', name: 'Report Card', href: '/dashboard/homework/reports', icon: BarChart },
		],
	},
	{
		label: 'AI PlayZone',
		labelColor: 'text-amber-500',
		items: [
			{ key: 'ideaSparkTools', name: 'Idea Spark', href: '/dashboard/tools/idea-generation', icon: Lightbulb },
			{ key: 'notesTools', name: 'NoteGen AI', href: '/dashboard/tools/notes-generator', icon: FileEdit },
			{ key: 'summaryTools', name: 'QuickRead', href: '/dashboard/tools/text-summarizer', icon: FileText },
			{ key: 'quizTools', name: 'BrainFlex', href: '/dashboard/tools/quiz-me', icon: Clipboard },
			{ key: 'projectTools', name: 'Launch Project', href: '/dashboard/tools/project-learning', icon: Layers },
			{ key: 'pitchTools', name: 'PitchCraft', href: '/dashboard/content-generator', icon: Presentation },
		],
	},
	{
		items: [
			{ key: 'events', name: 'Campus Events', href: '/dashboard/events/student', icon: Calendar },
			{ key: 'courses', name: 'SkillTracks', href: '/dashboard/courses', icon: GraduationCap },
			{ key: 'gyanisage', name: 'Buddy AI', href: '/dashboard/gyanisage', icon: BuddyIcon, isCustomIcon: true },
			{ key: 'settings', name: 'Settings', href: '/dashboard/settings', icon: Settings },
		],
	},
];

// ── Counselor ────────────────────────────────────────────────────
const COUNSELOR_NAV = [
	{
		items: [
			{ key: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: Home },
		],
	},
	{
		label: 'AI Safety Alerts',
		labelColor: 'text-red-500',
		items: [
			{ key: 'activeAlerts', name: 'Active Alerts', href: '/dashboard/counselor/safety-alerts', icon: AlertTriangle },
			{ key: 'riskTickets', name: 'Risk Tickets', href: '/dashboard/counselor/risk-tickets', icon: ClipboardList },
			{ key: 'alertHistory', name: 'Alert History', href: '/dashboard/counselor/alert-history', icon: History },
		],
	},
	{
		label: 'Counseling Sessions',
		labelColor: 'text-sky-500',
		items: [
			{ key: 'activeSessions', name: 'Active Sessions', href: '/dashboard/counselor/sessions', icon: MessagesSquare },
			{ key: 'studentDir', name: 'Student Directory', href: '/dashboard/counselor/students', icon: Users },
			{ key: 'chatHistory', name: 'AI Chat History', href: '/dashboard/counselor/chat-history', icon: Bot },
			{ key: 'sessionNotes', name: 'Session Notes', href: '/dashboard/counselor/notes', icon: Notebook },
		],
	},
	{
		label: 'AI Tools',
		labelColor: 'text-purple-500',
		items: [
			{ key: 'gyanisage', name: 'Buddy AI', href: '/dashboard/gyanisage', icon: BuddyIcon, isCustomIcon: true },
			{ key: 'sharkAi', name: 'AI Shark', href: '/dashboard/shark-ai', icon: SharkIcon, isCustomIcon: true },
		],
	},
	{
		items: [
			{ key: 'settings', name: 'Settings', href: '/dashboard/settings', icon: Settings },
		],
	},
];

// ── Parent ───────────────────────────────────────────────────────
const PARENT_NAV = [
	{
		items: [
			{ key: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: Home },
			{ key: 'myChildren', name: 'My Children', href: '/dashboard/parent/children', icon: Users },
		],
	},
	{
		label: 'Attendance',
		labelColor: 'text-sky-500',
		items: [
			{ key: 'todayAttendance', name: "Today's Status", href: '/dashboard/parent/attendance/today', icon: Calendar },
			{ key: 'absenceAlerts', name: 'Absence Alerts', href: '/dashboard/parent/attendance/alerts', icon: AlertTriangle },
			{ key: 'weeklyReports', name: 'Weekly Reports', href: '/dashboard/parent/attendance/weekly', icon: BarChart },
			{ key: 'attendanceHistory', name: 'Attendance History', href: '/dashboard/parent/attendance/history', icon: History },
		],
	},
	{
		label: 'Academics',
		labelColor: 'text-emerald-500',
		items: [
			{ key: 'reportCards', name: 'Report Cards', href: '/dashboard/parent/report-cards', icon: FileText },
			{ key: 'homework', name: 'Homework Tracking', href: '/dashboard/homework/student', icon: BookOpen },
			{ key: 'performance', name: 'Performance', href: '/dashboard/performance', icon: BarChart3 },
		],
	},
	{
		label: 'Communication',
		labelColor: 'text-purple-500',
		items: [
			{ key: 'teacherChat', name: 'Class Teacher Chat', href: '/dashboard/parent/teacher-chat', icon: MessageCircle },
			{ key: 'events', name: 'School Events', href: '/dashboard/events/public', icon: Calendar },
		],
	},
	{
		items: [
			{ key: 'settings', name: 'Settings', href: '/dashboard/settings', icon: Settings },
		],
	},
];

// ── B2C Student (Launch Pad) ─────────────────────────────────────
const B2C_STUDENT_NAV = [
	{
		items: [
			{ key: 'dashboard', name: 'Homebase', href: '/dashboard', icon: Home },
			{ key: 'tools', name: 'Creator Suite', href: '/dashboard/tools', icon: Wrench },
			{ key: 'courses', name: 'Learning Path', href: '/dashboard/courses', icon: GraduationCap },
		],
	},
	{
		label: 'AI Suite',
		labelColor: 'text-sky-500',
		items: [
			{ key: 'copilot', name: 'Sudarshan AI', href: '/dashboard/sudarshan', icon: SudarshanIcon, isCustomIcon: true },
			{ key: 'gyanisage', name: 'GyanAI Sage', href: '/dashboard/gyanisage', icon: SmilePlus },
			{ key: 'sharkAi', name: 'AI Shark', href: '/dashboard/shark-ai', icon: SharkIcon, isCustomIcon: true },
		],
	},
	{
		label: 'Build & Grow',
		labelColor: 'text-emerald-500',
		items: [
			{ key: 'incubation', name: 'Startup Hub', href: '/dashboard/incubation-hub', icon: Rocket },
			{ key: 'performance', name: 'Progress Tracker', href: '/dashboard/performance', icon: BarChart3 },
			{ key: 'mentors', name: 'Mentors', href: '/dashboard/messages', icon: MessageCircle },
			{ key: 'liveClassroom', name: 'Omni Sight', href: '/dashboard/live-classroom', icon: Video },
		],
	},
	{
		items: [
			{ key: 'settings', name: 'Settings', href: '/dashboard/settings', icon: Settings },
		],
	},
];

// ── B2C Mentor ───────────────────────────────────────────────────
const B2C_MENTOR_NAV = [
	{
		items: [
			{ key: 'dashboard', name: 'Homebase', href: '/dashboard', icon: Home },
			{ key: 'tools', name: 'Creator Suite', href: '/dashboard/tools', icon: Wrench },
			{ key: 'courses', name: 'Learning Path', href: '/dashboard/courses', icon: GraduationCap },
		],
	},
	{
		label: 'AI Suite',
		labelColor: 'text-sky-500',
		items: [
			{ key: 'copilot', name: 'Sudarshan AI', href: '/dashboard/sudarshan', icon: SudarshanIcon, isCustomIcon: true },
			{ key: 'gyanisage', name: 'GyanAI Sage', href: '/dashboard/gyanisage', icon: SmilePlus },
			{ key: 'sharkAi', name: 'AI Shark', href: '/dashboard/shark-ai', icon: SharkIcon, isCustomIcon: true },
		],
	},
	{
		label: 'Mentor Tools',
		labelColor: 'text-emerald-500',
		items: [
			{ key: 'incubation', name: 'Validation Desk', href: '/dashboard/incubation-hub', icon: Rocket },
			{ key: 'performance', name: 'Impact Tracker', href: '/dashboard/performance', icon: BarChart3 },
			{ key: 'mentors', name: 'Student Sessions', href: '/dashboard/messages', icon: MessageCircle },
			{ key: 'liveClassroom', name: 'Omni Sight', href: '/dashboard/live-classroom', icon: Video },
		],
	},
	{
		items: [
			{ key: 'settings', name: 'Settings', href: '/dashboard/settings', icon: Settings },
		],
	},
];
