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
	// Core
	dashboard:           ['super_admin','co_admin','faculty','student','counselor','parent','b2c_student','b2c_mentor'],
	settings:            ['super_admin','co_admin','faculty','student','counselor','parent','b2c_student','b2c_mentor'],
	// AI Suite
	copilot:             ['super_admin','co_admin','faculty','student','b2c_student','b2c_mentor'],
	gyanisage:           ['super_admin','co_admin','faculty','student','counselor','b2c_student','b2c_mentor'],
	sharkAi:             ['super_admin','co_admin','faculty','student','counselor','b2c_student','b2c_mentor'],
	tools:               ['super_admin','co_admin','faculty','student','b2c_student','b2c_mentor'],
	liveClassroom:       ['super_admin','co_admin','faculty','student','b2c_student','b2c_mentor'],
	// Faculty
	parentChat:          ['super_admin','co_admin','faculty'],
	facultySubstitution: ['super_admin','co_admin','faculty'],
	// Homework & Assessment
	homework:            ['super_admin','co_admin','faculty','student'],
	vivaResults:         ['super_admin','co_admin','faculty','student'],
	aiReport:            ['super_admin','co_admin','faculty','student','parent'],
	gamifiedAssignments: ['super_admin','co_admin','faculty'],
	vivaLab:             ['super_admin','co_admin','faculty','student','b2c_student','b2c_mentor'],
	vivaAi:              ['super_admin','co_admin','faculty','student','b2c_student','b2c_mentor'],
	gamified:            ['super_admin','co_admin','faculty','student'],
	questionPaper:       ['super_admin','co_admin','faculty'],
	assignments:         ['super_admin','co_admin','faculty','student'],
	// Academic Operations
	academics:            ['super_admin','co_admin','faculty','student'],
	skillTracks:         ['super_admin','co_admin','faculty','student','b2c_student','b2c_mentor'],
	courses:             ['super_admin','co_admin','faculty','student','b2c_student','b2c_mentor'],
	attendance:          ['super_admin','co_admin','faculty','parent'],
	timetable:           ['super_admin','co_admin','faculty'],
	reports:             ['super_admin','co_admin','faculty'],
	reportCards:         ['super_admin','co_admin','faculty','parent'],
	performance:         ['super_admin','co_admin','faculty','student','parent','b2c_student','b2c_mentor'],
	contentGenerator:    ['super_admin','co_admin','faculty','student'],
	// Student Tools
	games:                ['super_admin','co_admin','faculty','student'],
	aiGround:            ['super_admin','co_admin','student'],
	buddyAi:             ['super_admin','co_admin','student'],
	// Innovation Cell
	innovation:           ['super_admin','co_admin','faculty','student'],
	campus:               ['super_admin','co_admin','faculty','student'],
	ideaSpark:           ['super_admin','co_admin','faculty','student'],
	pitchCraft:          ['super_admin','co_admin','faculty','student'],
	incubation:          ['super_admin','co_admin','faculty','student','b2c_student','b2c_mentor'],
	incubationHub:       ['super_admin','co_admin','faculty','student','b2c_student','b2c_mentor'],
	// Administration
	schoolManagement:    ['super_admin','co_admin'],
	schoolProfile:       ['super_admin','co_admin'],
	studentManagement:   ['super_admin','co_admin','faculty'],
	userManagement:      ['super_admin','co_admin'],
	userAccess:          ['super_admin'],
	// Events
	eventsManagement:    ['super_admin','co_admin'],
	events:              ['super_admin','co_admin','faculty','student','parent'],
	eventsStudent:       ['super_admin','co_admin','faculty','student'],
	eventsPublic:        ['super_admin','co_admin','faculty','student','parent','b2c_student','b2c_mentor'],
	// Counselor
	activeAlerts:        ['super_admin','co_admin','counselor'],
	riskTickets:         ['super_admin','co_admin','counselor'],
	alertHistory:        ['super_admin','co_admin','counselor'],
	activeSessions:      ['super_admin','co_admin','counselor'],
	studentDir:          ['super_admin','co_admin','counselor'],
	chatHistory:         ['super_admin','co_admin','counselor'],
	sessionNotes:        ['super_admin','co_admin','counselor'],
	// Parent
	myChildren:          ['super_admin','co_admin','parent'],
	teacherConnect:      ['super_admin','co_admin','parent'],
	// B2C
	mentors:             ['b2c_student','b2c_mentor'],
};

// ══════════════════════════════════════════════════════════════════
//  NAV CONFIGS PER ROLE
// ══════════════════════════════════════════════════════════════════

export function getNavSections(role) {
	switch (role) {
		case 'super_admin':
			return ADMIN_NAV;
		case 'co_admin':
			return CO_ADMIN_NAV;
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
			{ key: 'courses', name: 'Learn', href: '/dashboard/courses', icon: BookOpen },
			{ key: 'copilot', name: 'Co-pilot', href: '/dashboard/copilot', icon: SudarshanIcon, isCustomIcon: true },
			{ key: 'facultySubstitution', name: 'Smart Substitution System (Faculty)', href: '/dashboard/faculty-substitution', icon: UserCheck },
			{ key: 'eventsManagement', name: 'Events', href: '/dashboard/events', icon: Calendar },
			{ key: 'gyanisage', name: 'Buddy AI', href: '/dashboard/gyanisage', icon: BuddyIcon, isCustomIcon: true },
			{ key: 'schoolManagement', name: 'School Management', href: '/dashboard/school-management', icon: Building2 },
		],
	},
	{
		label: 'Users',
		labelColor: 'text-purple-500',
		items: [
			{ key: 'userManagement', name: 'User Management', href: '/dashboard/users', icon: Users },
			{ key: 'userAccess', name: 'Access & Roles', href: '/dashboard/user-access', icon: Lock },
		],
	},
	{
		items: [
			{ key: 'settings', name: 'Settings', href: '/dashboard/settings', icon: Settings },
		],
	},
];

// ── Co-Admin ────────────────────────────────────────────────────
const CO_ADMIN_NAV = [
	{
		items: [
			{ key: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: Home },
			{ key: 'copilot', name: 'Co-pilot', href: '/dashboard/copilot', icon: SudarshanIcon, isCustomIcon: true },
			{ key: 'facultySubstitution', name: 'Smart Substitution System (Faculty)', href: '/dashboard/faculty-substitution', icon: UserCheck },
			{ key: 'eventsManagement', name: 'Events', href: '/dashboard/events', icon: Calendar },
			{ key: 'gyanisage', name: 'Buddy AI', href: '/dashboard/gyanisage', icon: BuddyIcon, isCustomIcon: true },
			{ key: 'schoolManagement', name: 'School Management', href: '/dashboard/school-management', icon: Building2 },
		],
	},
	{
		label: 'Users',
		labelColor: 'text-purple-500',
		items: [
			{ key: 'userManagement', name: 'User Management (View Only)', href: '/dashboard/users', icon: Users },
			{ key: 'userAccess', name: 'Access & Roles (View Only)', href: '/dashboard/user-access', icon: Lock },
		],
	},
	{
		items: [
			{ key: 'settings', name: 'Settings', href: '/dashboard/settings', icon: Settings },
		],
	},
];

// ── Faculty ─────────────────────────────────────────────────────
const FACULTY_NAV = [
	{
		label: 'Main Section',
		labelColor: 'text-sky-500',
		items: [
			{ key: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: Home },
			{ key: 'calendar', name: 'Calendar', href: '/dashboard/timetable', icon: Calendar },
			{ key: 'gyanisage', name: 'Buddy AI', href: '/dashboard/gyanisage', icon: BuddyIcon, isCustomIcon: true },
			{ key: 'tools', name: 'AI Tools', href: '/dashboard/tools', icon: Wrench },
			{ key: 'innovation', name: 'Innovation', href: '/dashboard/innovation', icon: Rocket },
			{ key: 'campus', name: 'Campus', href: '/dashboard/campus', icon: Building2 },
		],
	},
	{
		label: 'Students',
		labelColor: 'text-emerald-500',
		items: [
			{ key: 'attendance', name: 'Attendance', href: '/dashboard/attendance', icon: CheckCircle },
			{ key: 'courses', name: 'Curriculum', href: '/dashboard/courses', icon: BookOpen },
			{ key: 'homework', name: 'Create & Assign', href: '/dashboard/homework', icon: ClipboardList },
			{ key: 'liveClassroom', name: 'Classroom', href: '/dashboard/live-classroom', icon: Video },
			{ key: 'parentChat', name: 'Parents', href: '/dashboard/faculty-chat', icon: MessageCircle, badge: 2 },
			{ key: 'reports', name: 'Insights', href: '/dashboard/reports', icon: BarChart3 },
		],
	},
	{
		items: [
			{ key: 'settings', name: 'Settings', href: '/dashboard/settings', icon: Settings },
		],
	},
];

// ── Student (Institutional) ──────────────────────────────────────
const STUDENT_NAV = [
	{
		items: [
			{ key: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: Home },
			{ key: 'courses', name: 'Learn', href: '/dashboard/courses', icon: BookOpen },
			{ key: 'buddyAi', name: 'Buddy AI', href: '/dashboard/gyanisage', icon: BuddyIcon, isCustomIcon: true },
			{ key: 'academics', name: 'Academics', href: '/dashboard/academics', icon: GraduationCap },
			{ key: 'liveClassroom', name: 'Classroom', href: '/dashboard/live-classroom', icon: Video },
			{ key: 'games', name: 'Games', href: '/dashboard/games', icon: Gamepad2 },
			{ key: 'innovation', name: 'Innovation', href: '/dashboard/innovation', icon: Rocket },
			{ key: 'tools', name: 'AI Tools', href: '/dashboard/tools', icon: Wrench },
			{ key: 'campus', name: 'Campus', href: '/dashboard/campus', icon: Building2 },
		],
	},
	{
		label: 'Task Hub',
		labelColor: 'text-purple-500',
		items: [
			{ key: 'copilot', name: 'Co-pilot', href: '/dashboard/copilot', icon: SudarshanIcon, isCustomIcon: true },
			{ key: 'vivaLab', name: 'AI Viva Lab', href: '/dashboard/viva-ai', icon: Mic },
			{ key: 'homework', name: 'My Homework', href: '/dashboard/homework/student', icon: BookOpen },
			{ key: 'vivaResults', name: 'Viva Evaluation Result', href: '/dashboard/homework/reports', icon: BarChart },
			{ key: 'aiReport', name: 'AI Report', href: '/dashboard/report-cards', icon: FileText },
			{ key: 'gamified', name: 'Gamified Homework', href: '/dashboard/gamified', icon: Puzzle },
			{ key: 'skillTracks', name: 'Skill Tracks', href: '/dashboard/courses', icon: GraduationCap },
		],
	},
	{
		label: 'School Innovation Cell',
		labelColor: 'text-emerald-500',
		items: [
			{ key: 'ideaSpark', name: 'IDEA SPARK', href: '/dashboard/tools/idea-generation', icon: Lightbulb },
			{ key: 'pitchCraft', name: 'Pitch Craft', href: '/dashboard/content-generator', icon: Presentation },
			{ key: 'sharkAi', name: 'AI Shark', href: '/dashboard/shark-ai', icon: SharkIcon, isCustomIcon: true },
			{ key: 'incubation', name: 'Incubation Form', href: '/dashboard/incubation-hub', icon: Rocket },
		],
	},
	{
		items: [
			{ key: 'events', name: 'Campus Events', href: '/dashboard/events/student', icon: Calendar },
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
		label: 'Main Section',
		labelColor: 'text-sky-500',
		items: [
			{ key: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: Home },
			{ key: 'myChildren', name: 'My Children', href: '/dashboard/parent/children', icon: Users },
			{ key: 'teacherConnect', name: 'Class Teacher Connect', href: '/dashboard/parent/teacher-chat', icon: MessageCircle },
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

// ══════════════════════════════════════════════════════════════════
//  MUST-HAVE keys — always shown regardless of whitelist
//  super_admin: dashboard, userAccess, settings
//  all others:  dashboard, settings
// ══════════════════════════════════════════════════════════════════
export const MUST_HAVE_KEYS = {
	super_admin: new Set(['dashboard', 'userAccess', 'settings']),
	_default:    new Set(['dashboard', 'settings']),
};

export function getMustHaveKeys(role) {
	return MUST_HAVE_KEYS[role] || MUST_HAVE_KEYS._default;
}

// ══════════════════════════════════════════════════════════════════
//  MASTER NAV — every possible institutional item.
//  Used when user_access whitelist is set; checkAccess filters.
// ══════════════════════════════════════════════════════════════════
const MASTER_NAV = [
	{
		label: 'Main',
		labelColor: 'text-sky-500',
		items: [
			{ key: 'dashboard', name: 'Dashboard', href: '/dashboard', icon: Home },
			{ key: 'copilot', name: 'Co-pilot', href: '/dashboard/copilot', icon: SudarshanIcon, isCustomIcon: true },
			{ key: 'gyanisage', name: 'Buddy AI', href: '/dashboard/gyanisage', icon: BuddyIcon, isCustomIcon: true },
			{ key: 'sharkAi', name: 'AI Shark', href: '/dashboard/shark-ai', icon: SharkIcon, isCustomIcon: true },
			{ key: 'tools', name: 'Teaching Tools Kit', href: '/dashboard/tools', icon: Wrench },
			{ key: 'liveClassroom', name: 'Omni Sight (Live Classroom)', href: '/dashboard/live-classroom', icon: Video },
		],
	},
	{
		label: 'Faculty',
		labelColor: 'text-sky-500',
		items: [
			{ key: 'parentChat', name: 'Parent Connect', href: '/dashboard/faculty-chat', icon: MessageCircle },
			{ key: 'facultySubstitution', name: 'Smart Substitution', href: '/dashboard/faculty-substitution', icon: UserCheck },
		],
	},
	{
		label: 'Homework & Assessment',
		labelColor: 'text-emerald-500',
		items: [
			{ key: 'homework', name: 'AI Viva Evaluator / Homework', href: '/dashboard/homework', icon: Mic },
			{ key: 'vivaResults', name: 'Viva Evaluation Result', href: '/dashboard/homework/reports', icon: BarChart },
			{ key: 'aiReport', name: 'AI Report / Report Cards', href: '/dashboard/report-cards', icon: FileText },
			{ key: 'gamifiedAssignments', name: 'Gamified Assignments', href: '/dashboard/gamified-assignments', icon: Gamepad2 },
			{ key: 'vivaLab', name: 'AI Viva Lab', href: '/dashboard/viva-ai', icon: Mic },
			{ key: 'gamified', name: 'Gamified Homework', href: '/dashboard/gamified', icon: Puzzle },
			{ key: 'questionPaper', name: 'Question Paper Generator', href: '/dashboard/question-paper', icon: FileStack },
			{ key: 'assignments', name: 'Assignments', href: '/dashboard/assignments', icon: ClipboardCheck },
		],
	},
	{
		label: 'Academic Operations',
		labelColor: 'text-purple-500',
		items: [
			{ key: 'skillTracks', name: 'Skill Tracks / Courses', href: '/dashboard/courses', icon: GraduationCap },
			{ key: 'attendance', name: 'Attendance', href: '/dashboard/attendance', icon: CheckCircle },
			{ key: 'timetable', name: 'Timetable', href: '/dashboard/timetable', icon: Clock },
			{ key: 'reports', name: 'Reports & Analytics', href: '/dashboard/reports', icon: BarChart3 },
			{ key: 'performance', name: 'Performance', href: '/dashboard/performance', icon: BarChart3 },
			{ key: 'contentGenerator', name: 'Content Generator', href: '/dashboard/content-generator', icon: Presentation },
		],
	},
	{
		label: 'Student Tools',
		labelColor: 'text-cyan-500',
		items: [
			{ key: 'aiGround', name: 'AI Ground', href: '/dashboard/tools', icon: Wrench },
			{ key: 'buddyAi', name: 'Buddy AI (Student)', href: '/dashboard/gyanisage', icon: BuddyIcon, isCustomIcon: true },
		],
	},
	{
		label: 'Innovation Cell',
		labelColor: 'text-orange-500',
		items: [
			{ key: 'ideaSpark', name: 'IDEA SPARK', href: '/dashboard/tools/idea-generation', icon: Lightbulb },
			{ key: 'pitchCraft', name: 'Pitch Craft / Slide Creator', href: '/dashboard/content-generator', icon: Presentation },
			{ key: 'incubation', name: 'Incubation Hub', href: '/dashboard/incubation-hub', icon: Rocket },
		],
	},
	{
		label: 'Administration',
		labelColor: 'text-amber-500',
		items: [
			{ key: 'schoolManagement', name: 'School Management', href: '/dashboard/school-management', icon: Building2 },
			{ key: 'schoolProfile', name: 'School Profile', href: '/dashboard/school-profile', icon: Globe },
			{ key: 'studentManagement', name: 'Student Management', href: '/dashboard/student-management', icon: Users },
			{ key: 'eventsManagement', name: 'Events Management', href: '/dashboard/events', icon: Calendar },
			{ key: 'events', name: 'Campus Events', href: '/dashboard/events/student', icon: Calendar },
			{ key: 'userManagement', name: 'User Management', href: '/dashboard/users', icon: Users },
			{ key: 'userAccess', name: 'Access & Roles', href: '/dashboard/user-access', icon: Lock },
		],
	},
	{
		label: 'Counselor',
		labelColor: 'text-red-500',
		items: [
			{ key: 'activeAlerts', name: 'Active Alerts', href: '/dashboard/counselor/safety-alerts', icon: AlertTriangle },
			{ key: 'riskTickets', name: 'Risk Tickets', href: '/dashboard/counselor/risk-tickets', icon: ClipboardList },
			{ key: 'alertHistory', name: 'Alert History', href: '/dashboard/counselor/alert-history', icon: History },
			{ key: 'activeSessions', name: 'Active Sessions', href: '/dashboard/counselor/sessions', icon: MessagesSquare },
			{ key: 'studentDir', name: 'Student Directory', href: '/dashboard/counselor/students', icon: Users },
			{ key: 'chatHistory', name: 'AI Chat History', href: '/dashboard/counselor/chat-history', icon: Bot },
			{ key: 'sessionNotes', name: 'Session Notes', href: '/dashboard/counselor/notes', icon: Notebook },
		],
	},
	{
		label: 'Parent',
		labelColor: 'text-teal-500',
		items: [
			{ key: 'myChildren', name: 'My Children', href: '/dashboard/parent/children', icon: Users },
			{ key: 'teacherConnect', name: 'Class Teacher Connect', href: '/dashboard/parent/teacher-chat', icon: MessageCircle },
		],
	},
	{
		items: [
			{ key: 'settings', name: 'Settings', href: '/dashboard/settings', icon: Settings },
		],
	},
];

export function getMasterNavSections() {
	return MASTER_NAV;
}
