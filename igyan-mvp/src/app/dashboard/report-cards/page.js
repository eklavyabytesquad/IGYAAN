"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function ReportCardsPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Generate
	const [file, setFile] = useState(null);
	const [marksData, setMarksData] = useState([]);
	const [selectedClass, setSelectedClass] = useState('');
	const [selectedSection, setSelectedSection] = useState('');
	const [examType, setExamType] = useState('midterm'); // midterm | final | quarterly
	const [academicYear, setAcademicYear] = useState('2024-25');
	const [generating, setGenerating] = useState(false);
	const [generatedCards, setGeneratedCards] = useState([]);
	const [attendanceData, setAttendanceData] = useState({});

	// Check authorization
	if (!loading && (!user || !['super_admin', 'co_admin', 'faculty'].includes(user.role))) {
		router.push('/dashboard');
		return null;
	}

	const handleFileUpload = (e) => {
		const selectedFile = e.target.files[0];
		if (!selectedFile) return;

		setFile(selectedFile);

		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const workbook = XLSX.read(event.target.result, { type: 'binary' });
				const sheetName = workbook.SheetNames[0];
				const sheet = workbook.Sheets[sheetName];
				const data = XLSX.utils.sheet_to_json(sheet);

				if (data.length === 0) {
					alert('The Excel file is empty');
					return;
				}

				setMarksData(data);
				setStep(2);
			} catch (error) {
				console.error('Error reading Excel:', error);
				alert('Failed to read Excel file');
			}
		};
		reader.readAsBinaryString(selectedFile);
	};

	const fetchAttendance = async (studentId) => {
		// TODO: Implement actual attendance fetch from database
		// For now, return mock data
		return {
			totalDays: 180,
			present: Math.floor(Math.random() * 30) + 150,
			absent: Math.floor(Math.random() * 20),
			percentage: Math.floor(Math.random() * 15) + 85,
		};
	};

	const generatePDF = async (studentData, attendance) => {
		const doc = new jsPDF();
		const pageWidth = doc.internal.pageSize.getWidth();
		const pageHeight = doc.internal.pageSize.getHeight();

		// Header
		doc.setFillColor(79, 70, 229); // Indigo
		doc.rect(0, 0, pageWidth, 30, 'F');
		
		doc.setTextColor(255, 255, 255);
		doc.setFontSize(20);
		doc.setFont('helvetica', 'bold');
		doc.text('ACADEMIC REPORT CARD', pageWidth / 2, 12, { align: 'center' });
		doc.setFontSize(10);
		doc.text(`Academic Year: ${academicYear} | ${examType.toUpperCase()}`, pageWidth / 2, 20, { align: 'center' });

		// Student Info Box
		doc.setFillColor(243, 244, 246);
		doc.rect(10, 35, pageWidth - 20, 35, 'F');
		
		doc.setTextColor(0, 0, 0);
		doc.setFontSize(11);
		doc.setFont('helvetica', 'bold');
		doc.text('Student Information', 15, 42);
		
		doc.setFont('helvetica', 'normal');
		doc.setFontSize(10);
		doc.text(`Name: ${studentData.studentName || 'N/A'}`, 15, 50);
		doc.text(`Roll No: ${studentData.rollNumber || 'N/A'}`, 15, 56);
		doc.text(`Class: ${studentData.class || selectedClass} ${studentData.section || selectedSection}`, 15, 62);
		doc.text(`Attendance: ${attendance.present}/${attendance.totalDays} (${attendance.percentage}%)`, pageWidth / 2, 50);
		doc.text(`Status: ${attendance.percentage >= 75 ? 'Eligible' : 'Shortage'}`, pageWidth / 2, 56);

		// Marks Table
		const subjects = Object.keys(studentData).filter(key => 
			!['studentName', 'rollNumber', 'class', 'section', 'totalMarks', 'percentage', 'grade', 'rank'].includes(key)
		);

		const tableData = subjects.map(subject => {
			const marks = studentData[subject] || 0;
			const total = 100;
			const percentage = ((marks / total) * 100).toFixed(1);
			let grade = 'F';
			if (percentage >= 90) grade = 'A+';
			else if (percentage >= 80) grade = 'A';
			else if (percentage >= 70) grade = 'B';
			else if (percentage >= 60) grade = 'C';
			else if (percentage >= 50) grade = 'D';
			
			return [subject, marks, total, percentage + '%', grade];
		});

		doc.autoTable({
			startY: 75,
			head: [['Subject', 'Marks Obtained', 'Total Marks', 'Percentage', 'Grade']],
			body: tableData,
			theme: 'striped',
			headStyles: {
				fillColor: [79, 70, 229],
				textColor: [255, 255, 255],
				fontStyle: 'bold',
			},
			styles: {
				fontSize: 10,
				cellPadding: 5,
			},
		});

		// Summary Box
		const finalY = doc.lastAutoTable.finalY + 10;
		doc.setFillColor(243, 244, 246);
		doc.rect(10, finalY, pageWidth - 20, 30, 'F');

		doc.setFont('helvetica', 'bold');
		doc.setFontSize(11);
		doc.text('Overall Performance', 15, finalY + 7);

		doc.setFont('helvetica', 'normal');
		doc.setFontSize(10);
		const totalMarks = studentData.totalMarks || tableData.reduce((sum, row) => sum + parseFloat(row[1]), 0);
		const maxMarks = subjects.length * 100;
		const overallPercentage = ((totalMarks / maxMarks) * 100).toFixed(2);
		let overallGrade = 'F';
		if (overallPercentage >= 90) overallGrade = 'A+';
		else if (overallPercentage >= 80) overallGrade = 'A';
		else if (overallPercentage >= 70) overallGrade = 'B';
		else if (overallPercentage >= 60) overallGrade = 'C';
		else if (overallPercentage >= 50) overallGrade = 'D';

		doc.text(`Total Marks: ${totalMarks}/${maxMarks}`, 15, finalY + 15);
		doc.text(`Percentage: ${overallPercentage}%`, pageWidth / 2, finalY + 15);
		doc.text(`Grade: ${overallGrade}`, 15, finalY + 22);
		doc.text(`Rank: ${studentData.rank || 'N/A'}`, pageWidth / 2, finalY + 22);

		// Footer
		doc.setFontSize(8);
		doc.setTextColor(100);
		doc.text('Generated by I-GYAN School OS', pageWidth / 2, pageHeight - 10, { align: 'center' });
		doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 5, { align: 'center' });

		return doc;
	};

	const handleGenerateAll = async () => {
		setGenerating(true);
		try {
			const cards = [];

			for (const student of marksData) {
				const attendance = await fetchAttendance(student.rollNumber);
				const pdf = await generatePDF(student, attendance);
				
				cards.push({
					studentName: student.studentName || 'Student',
					rollNumber: student.rollNumber,
					pdf: pdf,
					blob: pdf.output('blob'),
				});
			}

			setGeneratedCards(cards);
			setStep(3);
		} catch (error) {
			console.error('Error generating report cards:', error);
			alert('Failed to generate report cards');
		} finally {
			setGenerating(false);
		}
	};

	const downloadIndividual = (card) => {
		card.pdf.save(`Report_Card_${card.rollNumber}_${card.studentName}.pdf`);
	};

	const downloadAllAsZip = async () => {
		const zip = new JSZip();

		generatedCards.forEach((card, index) => {
			const fileName = `${card.rollNumber}_${card.studentName.replace(/\s+/g, '_')}.pdf`;
			zip.file(fileName, card.blob);
		});

		const content = await zip.generateAsync({ type: 'blob' });
		saveAs(content, `Report_Cards_${selectedClass}_${selectedSection}_${examType}.zip`);
	};

	const downloadTemplate = () => {
		const sampleData = [
			{
				studentName: 'Sample Student',
				rollNumber: '001',
				class: '10',
				section: 'A',
				Mathematics: 85,
				Science: 90,
				English: 78,
				'Social Studies': 88,
				Hindi: 82,
			}
		];

		const worksheet = XLSX.utils.json_to_sheet(sampleData);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Marks');
		XLSX.writeFile(workbook, 'report_card_template.xlsx');
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-center">
					<div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
					<p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
			<div className="mx-auto max-w-6xl">
				{/* Header */}
				<div className="mb-6">
					<h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
						Smart Report Card Generator
					</h1>
					<p className="mt-2 text-zinc-600 dark:text-zinc-400">
						Upload marks Excel file to generate PDF report cards with auto attendance integration
					</p>
				</div>

				{/* Progress Steps */}
				<div className="mb-8 flex items-center justify-between">
					{[
						{ step: 1, label: 'Upload Marks' },
						{ step: 2, label: 'Preview & Configure' },
						{ step: 3, label: 'Generate PDFs' },
					].map((s, i) => (
						<div key={s.step} className="flex flex-1 items-center">
							<div className="flex items-center">
								<div className={`flex h-10 w-10 items-center justify-center rounded-full ${
									step >= s.step 
										? 'bg-indigo-600 text-white' 
										: 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
								}`}>
									{step > s.step ? (
										<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
									) : (
										<span className="text-sm font-semibold">{s.step}</span>
									)}
								</div>
								<span className={`ml-2 text-sm font-medium ${
									step >= s.step 
										? 'text-zinc-900 dark:text-white' 
										: 'text-zinc-500'
								}`}>
									{s.label}
								</span>
							</div>
							{i < 2 && (
								<div className={`flex-1 h-1 mx-4 ${
									step > s.step 
										? 'bg-indigo-600' 
										: 'bg-zinc-200 dark:bg-zinc-800'
								}`} />
							)}
						</div>
					))}
				</div>

				{/* Step 1: Upload */}
				{step === 1 && (
					<div className="rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-sm">
						<h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
							Step 1: Upload Marks Data
						</h2>

						{/* Configuration */}
						<div className="grid grid-cols-2 gap-4 mb-6">
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Class
								</label>
								<input
									type="text"
									value={selectedClass}
									onChange={(e) => setSelectedClass(e.target.value)}
									placeholder="e.g., 10"
									className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Section
								</label>
								<input
									type="text"
									value={selectedSection}
									onChange={(e) => setSelectedSection(e.target.value)}
									placeholder="e.g., A"
									className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Exam Type
								</label>
								<select
									value={examType}
									onChange={(e) => setExamType(e.target.value)}
									className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2"
								>
									<option value="midterm">Mid Term</option>
									<option value="final">Final Exam</option>
									<option value="quarterly">Quarterly</option>
									<option value="halfyearly">Half Yearly</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
									Academic Year
								</label>
								<input
									type="text"
									value={academicYear}
									onChange={(e) => setAcademicYear(e.target.value)}
									className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2"
								/>
							</div>
						</div>

						{/* Download Template */}
						<div className="mb-6">
							<button
								onClick={downloadTemplate}
								className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:underline text-sm"
							>
								<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								Download Excel Template
							</button>
						</div>

						{/* File Upload */}
						<div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 text-center">
							<input
								type="file"
								accept=".xlsx,.xls"
								onChange={handleFileUpload}
								className="hidden"
								id="marks-upload"
							/>
							<label htmlFor="marks-upload" className="cursor-pointer">
								<div className="mx-auto h-12 w-12 text-zinc-400">
									<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
									</svg>
								</div>
								<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
									Click to upload marks Excel file
								</p>
								<p className="mt-1 text-xs text-zinc-500">
									Excel format: studentName, rollNumber, subject columns
								</p>
							</label>
						</div>
					</div>
				)}

				{/* Step 2: Preview */}
				{step === 2 && (
					<div className="rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-sm">
						<h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
							Step 2: Preview Data
						</h2>

						<div className="mb-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4">
							<p className="text-sm text-blue-900 dark:text-blue-100">
								✓ {marksData.length} students found | Attendance will be auto-fetched for each student
							</p>
						</div>

						{/* Data Preview */}
						<div className="overflow-x-auto max-h-96 overflow-y-auto">
							<table className="w-full text-sm">
								<thead className="bg-zinc-100 dark:bg-zinc-800 sticky top-0">
									<tr>
										{marksData[0] && Object.keys(marksData[0]).map(key => (
											<th key={key} className="px-4 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300">
												{key}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{marksData.map((row, i) => (
										<tr key={i} className="border-b border-zinc-200 dark:border-zinc-800">
											{Object.values(row).map((value, j) => (
												<td key={j} className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
													{value}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>

						<div className="mt-6 flex justify-between">
							<button
								onClick={() => setStep(1)}
								className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
							>
								Back
							</button>
							<button
								onClick={handleGenerateAll}
								disabled={generating}
								className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
							>
								{generating ? 'Generating...' : `Generate ${marksData.length} Report Cards`}
							</button>
						</div>
					</div>
				)}

				{/* Step 3: Generated */}
				{step === 3 && (
					<div className="rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-sm">
						<h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
							Step 3: Generated Report Cards
						</h2>

						<div className="mb-6 flex items-center justify-between">
							<div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 flex-1 mr-4">
								<p className="text-sm text-green-900 dark:text-green-100">
									✓ Successfully generated {generatedCards.length} report cards
								</p>
							</div>
							<button
								onClick={downloadAllAsZip}
								className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2"
							>
								<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
								</svg>
								Download All as ZIP
							</button>
						</div>

						{/* Cards List */}
						<div className="space-y-2">
							{generatedCards.map((card, i) => (
								<div key={i} className="flex items-center justify-between p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800">
									<div className="flex items-center gap-3">
										<div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
											<svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
											</svg>
										</div>
										<div>
											<p className="text-sm font-medium text-zinc-900 dark:text-white">
												{card.studentName}
											</p>
											<p className="text-xs text-zinc-500">
												Roll No: {card.rollNumber}
											</p>
										</div>
									</div>
									<button
										onClick={() => downloadIndividual(card)}
										className="px-4 py-2 rounded-lg text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
									>
										Download PDF
									</button>
								</div>
							))}
						</div>

						<div className="mt-6 flex justify-center">
							<button
								onClick={() => {
									setStep(1);
									setMarksData([]);
									setGeneratedCards([]);
								}}
								className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
							>
								Generate More Report Cards
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
