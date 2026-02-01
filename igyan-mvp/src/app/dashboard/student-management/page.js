"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import { supabase } from "../../utils/supabase";
import PageHeader from "@/components/dashboard/student-management/header/PageHeader";
import StatsCards from "@/components/dashboard/student-management/stats/StatsCards";
import FilterBar from "@/components/dashboard/student-management/filters/FilterBar";
import StudentTable from "@/components/dashboard/student-management/table/StudentTable";
import AddStudentModal from "@/components/dashboard/student-management/modal/AddStudentModal";
import BulkUploadModal from "@/components/dashboard/student-management/modal/BulkUploadModal";
import LoadingSpinner from "@/components/dashboard/student-management/common/LoadingSpinner";

const ALLOWED_ROLES = ["super_admin", "co_admin", "faculty"];

export default function StudentManagementPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [students, setStudents] = useState([]);
	const [schoolName, setSchoolName] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);
	const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingStudent, setEditingStudent] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [filterClass, setFilterClass] = useState("");
	const [filterSection, setFilterSection] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [formData, setFormData] = useState({
		regNo: "",
		name: "",
		email: "",
		password: "",
		class: "",
		section: "",
		age: "",
		house: "",
		classTeacher: "",
		sleepTime: "",
		studyScheduleWeekday: "",
		studyScheduleWeekend: "",
		schoolBoard: "",
		learningStyle: "",
		interests: "",
		strengths: "",
		growthAreas: "",
		academicGoals: "",
		favoriteSubjects: "",
		funFact: "",
	});
	const [formErrors, setFormErrors] = useState({});

	// Password hashing function
	const hashPassword = async (password) => {
		const encoder = new TextEncoder();
		const data = encoder.encode(password);
		const hashBuffer = await crypto.subtle.digest("SHA-256", data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hashHex = hashArray
			.map((byte) => byte.toString(16).padStart(2, "0"))
			.join("");
		return hashHex;
	};

	// Redirect if not authenticated or role not allowed
	useEffect(() => {
		if (!loading && !user) {
			router.push("/login");
		} else if (!loading && user && !ALLOWED_ROLES.includes(user.role)) {
			router.push("/dashboard");
		}
	}, [user, loading, router]);

	// Load students and school info from Supabase
	useEffect(() => {
		if (user && ALLOWED_ROLES.includes(user.role)) {
			fetchSchoolInfo();
			fetchStudents();
		}
	}, [user]);

	// Fetch school information
	const fetchSchoolInfo = async () => {
		try {
			if (!user.school_id) {
				console.warn("No school_id found for user:", user.id);
				return;
			}

			const { data, error } = await supabase
				.from("schools")
				.select("school_name")
				.eq("id", user.school_id)
				.single();

			if (error) {
				console.error("Error fetching school info:", error);
				return;
			}

			if (data) {
				setSchoolName(data.school_name);
			}
		} catch (error) {
			console.error("Error in fetchSchoolInfo:", error);
		}
	};

	// Fetch students from Supabase
	const fetchStudents = async () => {
		try {
			setIsLoading(true);
			
			let query = supabase
				.from("users")
				.select(`
					*,
					student_profiles (*)
				`)
				.eq("role", "student");
			
			// Filter by school_id - only show students from same school
			if (user.school_id) {
				query = query.eq("school_id", user.school_id);
			}
			
			query = query.order("created_at", { ascending: false });
			
			const { data, error } = await query;

			if (error) throw error;

			// Map to match existing structure with all profile fields
			const mappedStudents = data.map((student) => {
				const profile = Array.isArray(student.student_profiles) 
					? student.student_profiles[0] 
					: student.student_profiles;
				
				return {
					id: student.id,
					regNo: student.email.split("@")[0],
					name: student.full_name,
					email: student.email,
					class: profile?.class || "",
					section: profile?.section || "",
					age: profile?.age || "",
					house: profile?.house || "",
					classTeacher: profile?.class_teacher || "",
					sleepTime: profile?.sleep_time || "",
					studyScheduleWeekday: profile?.study_schedule_weekday || "",
					studyScheduleWeekend: profile?.study_schedule_weekend || "",
					schoolBoard: profile?.school_board || "",
					learningStyle: profile?.learning_style || "",
					interests: profile?.interests || [],
					strengths: profile?.strengths || [],
					growthAreas: profile?.growth_areas || [],
					academicGoals: profile?.academic_goals || [],
					favoriteSubjects: profile?.favorite_subjects || [],
					funFact: profile?.fun_fact || "",
					createdAt: student.created_at,
					profileId: profile?.id || null,
				};
			});

			setStudents(mappedStudents);
		} catch (error) {
			console.error("Error fetching students:", error);
			alert("Failed to load students: " + error.message);
		} finally {
			setIsLoading(false);
		}
	};

	// Note: saveStudents function removed - using direct Supabase operations

	// Validate form
	const validateForm = async () => {
		const errors = {};
		if (!formData.regNo.trim()) errors.regNo = "Registration number is required";
		if (!formData.name.trim()) errors.name = "Name is required";
		if (!formData.email.trim()) errors.email = "Email is required";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
			errors.email = "Invalid email format";
		if (!formData.password.trim()) errors.password = "Password is required";
		else if (formData.password.length < 6)
			errors.password = "Password must be at least 6 characters";
		if (!formData.class.trim()) errors.class = "Class is required";
		if (!formData.section.trim()) errors.section = "Section is required";

		// Check for duplicate email in Supabase
		try {
			const { data, error } = await supabase
				.from("users")
				.select("email")
				.eq("email", formData.email.toLowerCase().trim())
				.single();

			if (data) {
				errors.email = "Email already exists";
			}
		} catch (error) {
			// No duplicate found (expected error)
		}

		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	// Handle form submit
	const handleAddStudent = async (e) => {
		e.preventDefault();
		const isValid = await validateForm();
		if (isValid) {
			try {
				setIsLoading(true);
				
				// Debug: Check user.school_id
				if (!user.school_id) {
					throw new Error("School ID not found. Please ensure you are logged in with a valid school account.");
				}
				
				const passwordHash = await hashPassword(formData.password);

				// Step 1: Create user with school_id
				const { data: userData, error: userError } = await supabase
					.from("users")
					.insert([
						{
							email: formData.email.toLowerCase().trim(),
							password_hash: passwordHash,
							full_name: formData.name.trim(),
							role: "student",
							school_id: user.school_id,
							phone: null,
							image_base64: null,
						},
					])
					.select()
					.single();

				if (userError) {
					console.error("User creation error:", userError);
					throw userError;
				}

				console.log("User created successfully with school_id:", userData.school_id);

				// Step 2: Create student profile with school_id
				const { error: profileError } = await supabase
					.from("student_profiles")
					.insert([
						{
							user_id: userData.id,
							name: formData.name.trim(),
							age: formData.age ? parseInt(formData.age) : null,
							class: formData.class.trim(),
							section: formData.section.trim(),
							house: formData.house.trim() || null,
							class_teacher: formData.classTeacher.trim() || null,
							sleep_time: formData.sleepTime.trim() || null,
							study_schedule_weekday: formData.studyScheduleWeekday.trim() || null,
							study_schedule_weekend: formData.studyScheduleWeekend.trim() || null,
							school_id: user.school_id,
							learning_style: formData.learningStyle.trim() || null,
							interests: formData.interests ? formData.interests.split(',').map(i => i.trim()).filter(i => i) : null,
							strengths: formData.strengths ? formData.strengths.split(',').map(s => s.trim()).filter(s => s) : null,
							growth_areas: formData.growthAreas ? formData.growthAreas.split(',').map(g => g.trim()).filter(g => g) : null,
							academic_goals: formData.academicGoals ? formData.academicGoals.split(',').map(a => a.trim()).filter(a => a) : null,
							favorite_subjects: formData.favoriteSubjects ? formData.favoriteSubjects.split(',').map(f => f.trim()).filter(f => f) : null,
							fun_fact: formData.funFact.trim() || null,
						},
					]);

				if (profileError) {
					console.error("Profile creation error:", profileError);
					// Rollback user creation
					await supabase.from("users").delete().eq("id", userData.id);
					throw profileError;
				}

				console.log("Student profile created successfully");
				alert("Student added successfully!");
				setShowAddModal(false);
				setFormData({
					regNo: "",
					name: "",
					email: "",
					password: "",
					class: "",
					section: "",
					age: "",
					house: "",
					classTeacher: "",
					sleepTime: "",
					studyScheduleWeekday: "",
					studyScheduleWeekend: "",
					schoolBoard: "",
					learningStyle: "",
					interests: "",
					strengths: "",
					growthAreas: "",
					academicGoals: "",
					favoriteSubjects: "",
					funFact: "",
				});
				setFormErrors({});
				await fetchStudents(); // Refresh list
			} catch (error) {
				console.error("Error adding student:", error);
				alert("Failed to add student: " + error.message);
			} finally {
				setIsLoading(false);
			}
		}
	};

	// Handle add and add more
	const handleAddAndMore = async (e) => {
		e.preventDefault();
		const isValid = await validateForm();
		if (isValid) {
			try {
				setIsLoading(true);
				
				if (!user.school_id) {
					throw new Error("School ID not found. Please ensure you are logged in with a valid school account.");
				}
				
				const passwordHash = await hashPassword(formData.password);

				// Step 1: Create user with school_id
				const { data: userData, error: userError } = await supabase
					.from("users")
					.insert([
						{
							email: formData.email.toLowerCase().trim(),
							password_hash: passwordHash,
							full_name: formData.name.trim(),
							role: "student",
							school_id: user.school_id,
							phone: null,
							image_base64: null,
						},
					])
					.select()
					.single();

				if (userError) throw userError;

				// Step 2: Create student profile with school_id
				const { error: profileError } = await supabase
					.from("student_profiles")
					.insert([
						{
							user_id: userData.id,
							name: formData.name.trim(),
							age: formData.age ? parseInt(formData.age) : null,
							class: formData.class.trim(),
							section: formData.section.trim(),
							house: formData.house.trim() || null,
							class_teacher: formData.classTeacher.trim() || null,
							sleep_time: formData.sleepTime.trim() || null,
							study_schedule_weekday: formData.studyScheduleWeekday.trim() || null,
							study_schedule_weekend: formData.studyScheduleWeekend.trim() || null,
							school_id: user.school_id,
							learning_style: formData.learningStyle.trim() || null,
							interests: formData.interests ? formData.interests.split(',').map(i => i.trim()).filter(i => i) : null,
							strengths: formData.strengths ? formData.strengths.split(',').map(s => s.trim()).filter(s => s) : null,
							growth_areas: formData.growthAreas ? formData.growthAreas.split(',').map(g => g.trim()).filter(g => g) : null,
							academic_goals: formData.academicGoals ? formData.academicGoals.split(',').map(a => a.trim()).filter(a => a) : null,
							favorite_subjects: formData.favoriteSubjects ? formData.favoriteSubjects.split(',').map(f => f.trim()).filter(f => f) : null,
							fun_fact: formData.funFact.trim() || null,
						},
					]);

				if (profileError) {
					// Rollback user creation
					await supabase.from("users").delete().eq("id", userData.id);
					throw profileError;
				}

				alert("Student added successfully! Add another.");
				// Clear form but keep modal open
				setFormData({
					regNo: "",
					name: "",
					email: "",
					password: "",
					class: "",
					section: "",
					age: "",
					house: "",
					classTeacher: "",
					sleepTime: "",
					studyScheduleWeekday: "",
					studyScheduleWeekend: "",
					schoolBoard: "",
					learningStyle: "",
					interests: "",
					strengths: "",
					growthAreas: "",
					academicGoals: "",
					favoriteSubjects: "",
					funFact: "",
				});
				setFormErrors({});
				await fetchStudents(); // Refresh list
			} catch (error) {
				console.error("Error adding student:", error);
				alert("Failed to add student: " + error.message);
			} finally {
				setIsLoading(false);
			}
		}
	};

	// Handle bulk upload
	const handleBulkUpload = async (uploadedStudents) => {
		const validStudents = [];
		const errors = [];

		try {
			setIsLoading(true);

			// Get school details first
			const { data: schoolData } = await supabase
				.from("schools")
				.select("id, school_name, location, board")
				.eq("id", user.school_id)
				.single();

			// Validate and prepare students for insertion
			for (let index = 0; index < uploadedStudents.length; index++) {
				const student = uploadedStudents[index];

				// Check for required fields
				if (
					!student.name ||
					!student.email ||
					!student.password ||
					!student.class ||
					!student.section
				) {
					errors.push(`Row ${index + 2}: Missing required fields`);
					continue;
				}

				// Validate email format
				if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
					errors.push(`Row ${index + 2}: Invalid email format`);
					continue;
				}

				// Check for duplicate email in Supabase
				const { data: existingUser } = await supabase
					.from("users")
					.select("email")
					.eq("email", student.email.toLowerCase().trim())
					.single();

				if (existingUser) {
					errors.push(`Row ${index + 2}: Email ${student.email} already exists`);
					continue;
				}

				// Check for duplicates in current batch
				const isDuplicateInBatch = validStudents.some(
					(s) => s.user.email.toLowerCase() === student.email.toLowerCase()
				);

				if (isDuplicateInBatch) {
					errors.push(`Row ${index + 2}: Duplicate email in upload`);
					continue;
				}

				// Hash password
				const passwordHash = await hashPassword(student.password);

				validStudents.push({
					user: {
						email: student.email.toLowerCase().trim(),
						password_hash: passwordHash,
						full_name: student.name.trim(),
						role: "student",
						school_id: user.school_id,
						phone: null,
						image_base64: null,
					},
					profile: {
						name: student.name.trim(),
						class: student.class.trim(),
						section: student.section.trim(),
						age: student.age || null,
						house: student.house || null,
						classTeacher: student.classTeacher || null,
					},
				});
			}

			if (validStudents.length > 0) {
				if (!user.school_id) {
					throw new Error("School ID not found. Please ensure you are logged in with a valid school account.");
				}
				
				// Step 1: Bulk insert users
				const usersToInsert = validStudents.map((s) => s.user);
				const { data: insertedUsers, error: usersError } = await supabase
					.from("users")
					.insert(usersToInsert)
					.select();

				if (usersError) throw usersError;

				// Step 2: Bulk insert student profiles with school_id
				const profilesToInsert = insertedUsers.map((user, index) => ({
					user_id: user.id,
					name: validStudents[index].profile.name,
					class: validStudents[index].profile.class,
					section: validStudents[index].profile.section,
					age: validStudents[index].profile.age,
					house: validStudents[index].profile.house,
					class_teacher: validStudents[index].profile.classTeacher,
					school_id: user.school_id,
				}));

				const { error: profilesError } = await supabase
					.from("student_profiles")
					.insert(profilesToInsert);

				if (profilesError) throw profilesError;

				setShowBulkUploadModal(false);
				await fetchStudents(); // Refresh list

				if (errors.length > 0) {
					alert(
						`Added ${validStudents.length} students.\n\nSkipped ${errors.length} entries:\n${errors.join("\n")}`
					);
				} else {
					alert(`Successfully added ${validStudents.length} students!`);
				}
			} else {
				alert(`No valid students to add.\n\n${errors.join("\n")}`);
			}
		} catch (error) {
			console.error("Error in bulk upload:", error);
			alert("Failed to upload students: " + error.message);
		} finally {
			setIsLoading(false);
		}
	};

	// Handle edit student
	const handleEditStudent = (student) => {
		setEditingStudent(student);
		setFormData({
			regNo: student.regNo,
			name: student.name,
			email: student.email,
			password: "", // Don't pre-fill password
			class: student.class,
			section: student.section,
			age: student.age || "",
			house: student.house || "",
			classTeacher: student.classTeacher || "",
			sleepTime: student.sleepTime || "",
			studyScheduleWeekday: student.studyScheduleWeekday || "",
			studyScheduleWeekend: student.studyScheduleWeekend || "",
			schoolBoard: student.schoolBoard || "",
			learningStyle: student.learningStyle || "",
			interests: Array.isArray(student.interests) ? student.interests.join(', ') : "",
			strengths: Array.isArray(student.strengths) ? student.strengths.join(', ') : "",
			growthAreas: Array.isArray(student.growthAreas) ? student.growthAreas.join(', ') : "",
			academicGoals: Array.isArray(student.academicGoals) ? student.academicGoals.join(', ') : "",
			favoriteSubjects: Array.isArray(student.favoriteSubjects) ? student.favoriteSubjects.join(', ') : "",
			funFact: student.funFact || "",
		});
		setShowEditModal(true);
	};

	// Handle update student
	const handleUpdateStudent = async (e) => {
		e.preventDefault();
		if (!editingStudent) return;

		try {
			setIsLoading(true);
			
			if (!user.school_id) {
				throw new Error("School ID not found. Please ensure you are logged in with a valid school account.");
			}

			// Update user details - ensure school_id is maintained
			const userUpdate = {
				full_name: formData.name.trim(),
				email: formData.email.toLowerCase().trim(),
				school_id: user.school_id, // Ensure school_id is maintained
				updated_at: new Date().toISOString(),
			};

			// Only update password if provided
			if (formData.password.trim()) {
				if (formData.password.length < 6) {
					alert("Password must be at least 6 characters");
					setIsLoading(false);
					return;
				}
				userUpdate.password_hash = await hashPassword(formData.password);
			}

			const { error: userError } = await supabase
				.from("users")
				.update(userUpdate)
				.eq("id", editingStudent.id);

			if (userError) {
				console.error("User update error:", userError);
				throw userError;
			}

			// Update student profile with school_id
			const { error: profileError } = await supabase
				.from("student_profiles")
				.update({
					name: formData.name.trim(),
					age: formData.age ? parseInt(formData.age) : null,
					class: formData.class.trim(),
					section: formData.section.trim(),
					house: formData.house.trim() || null,
					class_teacher: formData.classTeacher.trim() || null,
					sleep_time: formData.sleepTime.trim() || null,
					study_schedule_weekday: formData.studyScheduleWeekday.trim() || null,
					study_schedule_weekend: formData.studyScheduleWeekend.trim() || null,
					school_id: user.school_id,
					learning_style: formData.learningStyle.trim() || null,
					interests: formData.interests ? formData.interests.split(',').map(i => i.trim()).filter(i => i) : null,
					strengths: formData.strengths ? formData.strengths.split(',').map(s => s.trim()).filter(s => s) : null,
					growth_areas: formData.growthAreas ? formData.growthAreas.split(',').map(g => g.trim()).filter(g => g) : null,
					academic_goals: formData.academicGoals ? formData.academicGoals.split(',').map(a => a.trim()).filter(a => a) : null,
					favorite_subjects: formData.favoriteSubjects ? formData.favoriteSubjects.split(',').map(f => f.trim()).filter(f => f) : null,
					fun_fact: formData.funFact.trim() || null,
					updated_at: new Date().toISOString(),
				})
				.eq("user_id", editingStudent.id);

			if (profileError) {
				console.error("Profile update error:", profileError);
				throw profileError;
			}

			console.log("Student updated successfully with school_id:", user.school_id);
			alert("Student updated successfully!");
			setShowEditModal(false);
			setEditingStudent(null);
			setFormData({
				regNo: "",
				name: "",
				email: "",
				password: "",
				class: "",
				section: "",
				age: "",
				house: "",
				classTeacher: "",
				sleepTime: "",
				studyScheduleWeekday: "",
				studyScheduleWeekend: "",
				schoolBoard: "",
				learningStyle: "",
				interests: "",
				strengths: "",
				growthAreas: "",
				academicGoals: "",
				favoriteSubjects: "",
				funFact: "",
			});
			setFormErrors({});
			await fetchStudents();
		} catch (error) {
			console.error("Error updating student:", error);
			alert("Failed to update student: " + error.message);
		} finally {
			setIsLoading(false);
		}
	};

	// Handle delete student
	const handleDeleteStudent = async (id) => {
		if (confirm("Are you sure you want to delete this student?")) {
			try {
				setIsLoading(true);
				const { error } = await supabase.from("users").delete().eq("id", id);

				if (error) throw error;

				alert("Student deleted successfully!");
				await fetchStudents(); // Refresh list
			} catch (error) {
				console.error("Error deleting student:", error);
				alert("Failed to delete student: " + error.message);
			} finally {
				setIsLoading(false);
			}
		}
	};

	// Download CSV
	const downloadCSV = () => {
		const headers = [
			"Reg No",
			"Name",
			"Email",
			"Class",
			"Section",
			"Added On",
		];
		const csvData = filteredStudents.map((s) => [
			s.regNo,
			s.name,
			s.email,
			s.class,
			s.section,
			new Date(s.createdAt).toLocaleDateString(),
		]);

		const csvContent = [
			headers.join(","),
			...csvData.map((row) => row.join(",")),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `students_${new Date().toISOString().split("T")[0]}.csv`;
		a.click();
		window.URL.revokeObjectURL(url);
	};

	// Filter students
	const filteredStudents = students.filter((student) => {
		const matchesClass = !filterClass || student.class === filterClass;
		const matchesSection = !filterSection || student.section === filterSection;
		const matchesSearch =
			!searchQuery ||
			student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			student.regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
			student.email.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesClass && matchesSection && matchesSearch;
	});

	// Get unique classes and sections
	const uniqueClasses = [...new Set(students.map((s) => s.class))].sort();
	const uniqueSections = [...new Set(students.map((s) => s.section))].sort();

	// Handle modal close
	const handleCloseModal = () => {
		setShowAddModal(false);
		setFormData({
			regNo: "",
			name: "",
			email: "",
			password: "",
			class: "",
			section: "",
			age: "",
			house: "",
			classTeacher: "",
			sleepTime: "",
			studyScheduleWeekday: "",
			studyScheduleWeekend: "",
			schoolBoard: "",
			learningStyle: "",
			interests: "",
			strengths: "",
			growthAreas: "",
			academicGoals: "",
			favoriteSubjects: "",
			funFact: "",
		});
		setFormErrors({});
	};

	const handleCloseEditModal = () => {
		setShowEditModal(false);
		setEditingStudent(null);
		setFormData({
			regNo: "",
			name: "",
			email: "",
			password: "",
			class: "",
			section: "",
			age: "",
			house: "",
			classTeacher: "",
			sleepTime: "",
			studyScheduleWeekday: "",
			studyScheduleWeekend: "",
			schoolBoard: "",
			learningStyle: "",
			interests: "",
			strengths: "",
			growthAreas: "",
			academicGoals: "",
			favoriteSubjects: "",
			funFact: "",
		});
		setFormErrors({});
	};

	if (loading || isLoading) {
		return <LoadingSpinner />;
	}

	if (!user || !ALLOWED_ROLES.includes(user.role)) return null;

	return (
		<div className="p-6 lg:p-8">
			<PageHeader
				onAddStudent={() => setShowAddModal(true)}
				onBulkUpload={() => setShowBulkUploadModal(true)}
				schoolName={schoolName}
			/>

			<StatsCards
				totalStudents={students.length}
				totalClasses={uniqueClasses.length}
				filteredCount={filteredStudents.length}
			/>

			<FilterBar
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				filterClass={filterClass}
				setFilterClass={setFilterClass}
				filterSection={filterSection}
				setFilterSection={setFilterSection}
				uniqueClasses={uniqueClasses}
				uniqueSections={uniqueSections}
				filteredCount={filteredStudents.length}
				totalCount={students.length}
				onDownloadCSV={downloadCSV}
			/>

			<StudentTable
				students={filteredStudents}
				onDelete={handleDeleteStudent}
				onEdit={handleEditStudent}
			/>

			<AddStudentModal
				isOpen={showAddModal}
				onClose={handleCloseModal}
				onSubmit={handleAddStudent}
				onAddMore={handleAddAndMore}
				formData={formData}
				setFormData={setFormData}
				formErrors={formErrors}
			/>

			<AddStudentModal
				isOpen={showEditModal}
				onClose={handleCloseEditModal}
				onSubmit={handleUpdateStudent}
				formData={formData}
				setFormData={setFormData}
				formErrors={formErrors}
				isEditMode={true}
			/>

			<BulkUploadModal
				isOpen={showBulkUploadModal}
				onClose={() => setShowBulkUploadModal(false)}
				onUpload={handleBulkUpload}
			/>
		</div>
	);
}
