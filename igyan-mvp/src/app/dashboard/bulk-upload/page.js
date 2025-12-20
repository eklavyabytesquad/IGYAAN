"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../utils/auth_context";
import * as XLSX from 'xlsx';

export default function BulkUploadPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Preview, 4: Import
	const [uploadType, setUploadType] = useState('students'); // students | faculty | academic
	const [file, setFile] = useState(null);
	const [excelData, setExcelData] = useState([]);
	const [excelHeaders, setExcelHeaders] = useState([]);
	const [columnMapping, setColumnMapping] = useState({});
	const [validationErrors, setValidationErrors] = useState([]);
	const [importing, setImporting] = useState(false);
	const [importResults, setImportResults] = useState(null);

	// Check authorization
	if (!loading && (!user || !['super_admin', 'co_admin'].includes(user.role))) {
		router.push('/dashboard');
		return null;
	}

	// Define required fields for each upload type
	const requiredFields = {
		students: [
			{ field: 'full_name', label: 'Full Name', type: 'text', required: true },
			{ field: 'email', label: 'Email', type: 'email', required: true },
			{ field: 'phone', label: 'Phone', type: 'text', required: false },
			{ field: 'class', label: 'Class', type: 'text', required: true },
			{ field: 'section', label: 'Section', type: 'text', required: true },
			{ field: 'roll_number', label: 'Roll Number', type: 'text', required: false },
			{ field: 'parent_name', label: 'Parent Name', type: 'text', required: false },
			{ field: 'parent_email', label: 'Parent Email', type: 'email', required: false },
			{ field: 'parent_phone', label: 'Parent Phone', type: 'text', required: false },
			{ field: 'date_of_birth', label: 'Date of Birth', type: 'date', required: false },
			{ field: 'gender', label: 'Gender', type: 'text', required: false },
			{ field: 'address', label: 'Address', type: 'text', required: false },
		],
		faculty: [
			{ field: 'full_name', label: 'Full Name', type: 'text', required: true },
			{ field: 'email', label: 'Email', type: 'email', required: true },
			{ field: 'phone', label: 'Phone', type: 'text', required: false },
			{ field: 'subject', label: 'Subject', type: 'text', required: false },
			{ field: 'department', label: 'Department', type: 'text', required: false },
			{ field: 'designation', label: 'Designation', type: 'text', required: false },
			{ field: 'qualification', label: 'Qualification', type: 'text', required: false },
			{ field: 'experience_years', label: 'Experience (Years)', type: 'number', required: false },
			{ field: 'date_of_joining', label: 'Date of Joining', type: 'date', required: false },
		],
		academic: [
			{ field: 'class', label: 'Class', type: 'text', required: true },
			{ field: 'section', label: 'Section', type: 'text', required: true },
			{ field: 'subject', label: 'Subject', type: 'text', required: true },
			{ field: 'teacher_email', label: 'Teacher Email', type: 'email', required: true },
			{ field: 'class_teacher', label: 'Is Class Teacher', type: 'boolean', required: false },
			{ field: 'room_number', label: 'Room Number', type: 'text', required: false },
		],
	};

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
				const data = XLSX.utils.sheet_to_json(sheet, { raw: false });
				
				if (data.length === 0) {
					alert('The Excel file is empty');
					return;
				}

				const headers = Object.keys(data[0]);
				setExcelHeaders(headers);
				setExcelData(data);
				setStep(2); // Move to mapping step

			} catch (error) {
				console.error('Error reading Excel:', error);
				alert('Failed to read Excel file. Please ensure it is a valid .xlsx file');
			}
		};
		reader.readAsBinaryString(selectedFile);
	};

	const handleColumnMap = (systemField, excelColumn) => {
		setColumnMapping(prev => ({
			...prev,
			[systemField]: excelColumn,
		}));
	};

	const validateData = () => {
		const errors = [];
		const fields = requiredFields[uploadType];

		// Check if all required fields are mapped
		const requiredMapped = fields
			.filter(f => f.required)
			.every(f => columnMapping[f.field] && columnMapping[f.field] !== '');

		if (!requiredMapped) {
			errors.push({
				type: 'mapping',
				message: 'Not all required fields are mapped',
			});
		}

		// Validate data rows
		excelData.forEach((row, index) => {
			fields.forEach(field => {
				const excelColumn = columnMapping[field.field];
				if (!excelColumn) return;

				const value = row[excelColumn];

				// Check required fields
				if (field.required && (!value || value.toString().trim() === '')) {
					errors.push({
						type: 'required',
						row: index + 2, // +2 for header and 0-index
						field: field.label,
						message: `${field.label} is required`,
					});
				}

				// Validate email format
				if (field.type === 'email' && value && value.toString().trim() !== '') {
					const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
					if (!emailRegex.test(value)) {
						errors.push({
							type: 'format',
							row: index + 2,
							field: field.label,
							message: `Invalid email format: ${value}`,
						});
					}
				}

				// Validate phone format (basic)
				if (field.field.includes('phone') && value && value.toString().trim() !== '') {
					const phoneStr = value.toString().replace(/\D/g, '');
					if (phoneStr.length < 10) {
						errors.push({
							type: 'format',
							row: index + 2,
							field: field.label,
							message: `Invalid phone number: ${value}`,
						});
					}
				}
			});
		});

		setValidationErrors(errors);
		return errors.length === 0;
	};

	const handlePreview = () => {
		if (validateData()) {
			setStep(3);
		}
	};

	const handleImport = async () => {
		setImporting(true);
		try {
			// Transform data according to mapping
			const transformedData = excelData.map(row => {
				const newRow = {};
				Object.keys(columnMapping).forEach(systemField => {
					const excelColumn = columnMapping[systemField];
					if (excelColumn) {
						newRow[systemField] = row[excelColumn];
					}
				});
				return newRow;
			});

			// TODO: Send to API for import
			// const response = await fetch('/api/bulk-upload', {
			// 	method: 'POST',
			// 	headers: { 'Content-Type': 'application/json' },
			// 	body: JSON.stringify({
			// 		type: uploadType,
			// 		data: transformedData,
			// 		schoolId: user.school_id,
			// 	}),
			// });

			// Simulate import
			await new Promise(resolve => setTimeout(resolve, 2000));

			setImportResults({
				success: transformedData.length,
				failed: 0,
				total: transformedData.length,
			});
			setStep(4);

		} catch (error) {
			console.error('Import error:', error);
			alert('Failed to import data: ' + error.message);
		} finally {
			setImporting(false);
		}
	};

	const resetForm = () => {
		setStep(1);
		setFile(null);
		setExcelData([]);
		setExcelHeaders([]);
		setColumnMapping({});
		setValidationErrors([]);
		setImportResults(null);
	};

	const downloadTemplate = () => {
		const fields = requiredFields[uploadType];
		const headers = fields.map(f => f.label);
		
		// Create sample data
		const sampleRow = {};
		headers.forEach(header => {
			sampleRow[header] = '';
		});

		const worksheet = XLSX.utils.json_to_sheet([sampleRow], { header: headers });
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
		XLSX.writeFile(workbook, `${uploadType}_template.xlsx`);
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
						Bulk Upload System
					</h1>
					<p className="mt-2 text-zinc-600 dark:text-zinc-400">
						Import students, faculty, and academic data from Excel files
					</p>
				</div>

				{/* Progress Steps */}
				<div className="mb-8 flex items-center justify-between">
					{[
						{ step: 1, label: 'Upload File' },
						{ step: 2, label: 'Map Columns' },
						{ step: 3, label: 'Preview Data' },
						{ step: 4, label: 'Import' },
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
										: 'text-zinc-500 dark:text-zinc-500'
								}`}>
									{s.label}
								</span>
							</div>
							{i < 3 && (
								<div className={`flex-1 h-1 mx-4 ${
									step > s.step 
										? 'bg-indigo-600' 
										: 'bg-zinc-200 dark:bg-zinc-800'
								}`} />
							)}
						</div>
					))}
				</div>

				{/* Step 1: Upload File */}
				{step === 1 && (
					<div className="rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-sm">
						<h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
							Step 1: Upload Excel File
						</h2>

						{/* Upload Type Selection */}
						<div className="mb-6">
							<label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
								Select Upload Type
							</label>
							<div className="grid grid-cols-3 gap-4">
								{[
									{ value: 'students', label: 'Students', icon: '👨‍🎓', desc: 'Import student records' },
									{ value: 'faculty', label: 'Faculty', icon: '👨‍🏫', desc: 'Import teacher data' },
									{ value: 'academic', label: 'Academic', icon: '📚', desc: 'Import class assignments' },
								].map(type => (
									<button
										key={type.value}
										onClick={() => setUploadType(type.value)}
										className={`p-4 rounded-lg border-2 transition-all ${
											uploadType === type.value
												? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950'
												: 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-400'
										}`}
									>
										<div className="text-3xl mb-2">{type.icon}</div>
										<div className="text-sm font-semibold text-zinc-900 dark:text-white">{type.label}</div>
										<div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{type.desc}</div>
									</button>
								))}
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
								Download Excel Template for {uploadType}
							</button>
						</div>

						{/* File Upload */}
						<div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 text-center">
							<input
								type="file"
								accept=".xlsx,.xls"
								onChange={handleFileUpload}
								className="hidden"
								id="file-upload"
							/>
							<label htmlFor="file-upload" className="cursor-pointer">
								<div className="mx-auto h-12 w-12 text-zinc-400">
									<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
									</svg>
								</div>
								<p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
									Click to upload or drag and drop
								</p>
								<p className="mt-1 text-xs text-zinc-500">
									Excel files (.xlsx, .xls) only
								</p>
							</label>
						</div>
					</div>
				)}

				{/* Step 2: Column Mapping */}
				{step === 2 && (
					<div className="rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-sm">
						<h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
							Step 2: Map Columns
						</h2>
						<p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
							Map your Excel columns to system fields. Fields marked with * are required.
						</p>

						<div className="space-y-4">
							{requiredFields[uploadType].map(field => (
								<div key={field.field} className="grid grid-cols-2 gap-4 items-center">
									<div>
										<label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
											{field.label} {field.required && <span className="text-red-500">*</span>}
										</label>
										<p className="text-xs text-zinc-500">{field.type}</p>
									</div>
									<select
										value={columnMapping[field.field] || ''}
										onChange={(e) => handleColumnMap(field.field, e.target.value)}
										className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm"
									>
										<option value="">-- Select Column --</option>
										{excelHeaders.map(header => (
											<option key={header} value={header}>{header}</option>
										))}
									</select>
								</div>
							))}
						</div>

						<div className="mt-6 flex justify-between">
							<button
								onClick={() => setStep(1)}
								className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
							>
								Back
							</button>
							<button
								onClick={handlePreview}
								className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
							>
								Preview Data
							</button>
						</div>
					</div>
				)}

				{/* Step 3: Preview & Validation */}
				{step === 3 && (
					<div className="rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-sm">
						<h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
							Step 3: Preview & Validation
						</h2>

						{validationErrors.length > 0 && (
							<div className="mb-6 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4">
								<h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">
									{validationErrors.length} Validation Error(s) Found
								</h3>
								<ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
									{validationErrors.slice(0, 10).map((error, i) => (
										<li key={i}>
											Row {error.row}: {error.message}
										</li>
									))}
									{validationErrors.length > 10 && (
										<li>...and {validationErrors.length - 10} more errors</li>
									)}
								</ul>
							</div>
						)}

						<div className="mb-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4">
							<p className="text-sm text-green-900 dark:text-green-100">
								✓ {excelData.length} records ready to import
							</p>
						</div>

						{/* Data Preview Table */}
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="bg-zinc-100 dark:bg-zinc-800">
									<tr>
										{requiredFields[uploadType]
											.filter(f => columnMapping[f.field])
											.map(field => (
												<th key={field.field} className="px-4 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300">
													{field.label}
												</th>
											))}
									</tr>
								</thead>
								<tbody>
									{excelData.slice(0, 5).map((row, i) => (
										<tr key={i} className="border-b border-zinc-200 dark:border-zinc-800">
											{requiredFields[uploadType]
												.filter(f => columnMapping[f.field])
												.map(field => (
													<td key={field.field} className="px-4 py-2 text-zinc-600 dark:text-zinc-400">
														{row[columnMapping[field.field]]}
													</td>
												))}
										</tr>
									))}
								</tbody>
							</table>
							{excelData.length > 5 && (
								<p className="mt-2 text-xs text-zinc-500">
									Showing first 5 of {excelData.length} records
								</p>
							)}
						</div>

						<div className="mt-6 flex justify-between">
							<button
								onClick={() => setStep(2)}
								className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
							>
								Back
							</button>
							<button
								onClick={handleImport}
								disabled={importing || validationErrors.length > 0}
								className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{importing ? 'Importing...' : 'Import Data'}
							</button>
						</div>
					</div>
				)}

				{/* Step 4: Import Results */}
				{step === 4 && importResults && (
					<div className="rounded-lg bg-white dark:bg-zinc-900 p-6 shadow-sm text-center">
						<div className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
							<svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
							Import Successful!
						</h2>
						<p className="text-zinc-600 dark:text-zinc-400 mb-6">
							Successfully imported {importResults.success} of {importResults.total} records
						</p>

						{importResults.failed > 0 && (
							<div className="mb-6 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4">
								<p className="text-sm text-amber-900 dark:text-amber-100">
									⚠️ {importResults.failed} records failed to import
								</p>
							</div>
						)}

						<div className="flex gap-4 justify-center">
							<button
								onClick={resetForm}
								className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
							>
								Import More Data
							</button>
							<button
								onClick={() => router.push('/dashboard')}
								className="px-6 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
							>
								Back to Dashboard
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
