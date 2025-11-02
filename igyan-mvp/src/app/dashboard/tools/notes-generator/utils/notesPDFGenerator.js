import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateNotesPDF = (notesData) => {
	const doc = new jsPDF();
	let yPosition = 20;
	const pageWidth = doc.internal.pageSize.width;
	const pageHeight = doc.internal.pageSize.height;
	const margin = 20;
	const maxWidth = pageWidth - 2 * margin;

	// Helper function to check if we need a new page
	const checkNewPage = (heightNeeded = 20) => {
		if (yPosition + heightNeeded > pageHeight - 20) {
			doc.addPage();
			yPosition = 20;
			return true;
		}
		return false;
	};

	// Helper function to add wrapped text
	const addWrappedText = (text, x, y, maxWidth, fontSize = 10, style = "normal") => {
		doc.setFontSize(fontSize);
		doc.setFont("helvetica", style);
		const lines = doc.splitTextToSize(text, maxWidth);
		lines.forEach((line, index) => {
			if (index > 0) checkNewPage(7);
			doc.text(line, x, y + (index * 7));
		});
		return lines.length * 7;
	};

	// Title
	doc.setFillColor(59, 130, 246); // Blue
	doc.rect(0, 0, pageWidth, 40, "F");
	doc.setTextColor(255, 255, 255);
	doc.setFontSize(24);
	doc.setFont("helvetica", "bold");
	doc.text(notesData.title, pageWidth / 2, 25, { align: "center" });
	
	if (notesData.subject) {
		doc.setFontSize(12);
		doc.setFont("helvetica", "normal");
		doc.text(notesData.subject, pageWidth / 2, 35, { align: "center" });
	}

	yPosition = 50;
	doc.setTextColor(0, 0, 0);

	// Overview
	if (notesData.overview) {
		checkNewPage(30);
		doc.setFillColor(239, 246, 255); // Light blue
		doc.rect(margin - 5, yPosition - 5, maxWidth + 10, 10, "F");
		doc.setFontSize(14);
		doc.setFont("helvetica", "bold");
		doc.setTextColor(37, 99, 235);
		doc.text("Overview", margin, yPosition);
		yPosition += 10;

		doc.setTextColor(0, 0, 0);
		doc.setFont("helvetica", "normal");
		yPosition += addWrappedText(notesData.overview, margin, yPosition, maxWidth, 10);
		yPosition += 10;
	}

	// Topics
	notesData.topics?.forEach((topic, topicIdx) => {
		checkNewPage(40);
		
		// Topic title with colored background
		doc.setFillColor(37, 99, 235); // Blue
		doc.rect(margin - 5, yPosition - 5, maxWidth + 10, 12, "F");
		doc.setFontSize(16);
		doc.setFont("helvetica", "bold");
		doc.setTextColor(255, 255, 255);
		doc.text(`${topicIdx + 1}. ${topic.title}`, margin, yPosition + 3);
		yPosition += 15;

		doc.setTextColor(0, 0, 0);

		if (topic.description) {
			checkNewPage(20);
			yPosition += addWrappedText(topic.description, margin, yPosition, maxWidth, 10);
			yPosition += 8;
		}

		// Subtopics
		topic.subtopics?.forEach((subtopic, subIdx) => {
			checkNewPage(30);

			// Subtopic title
			doc.setFillColor(224, 231, 255); // Light indigo
			doc.rect(margin, yPosition - 2, maxWidth, 8, "F");
			doc.setFontSize(12);
			doc.setFont("helvetica", "bold");
			doc.setTextColor(79, 70, 229);
			doc.text(`${topicIdx + 1}.${subIdx + 1} ${subtopic.title}`, margin + 3, yPosition + 3);
			yPosition += 10;

			doc.setTextColor(0, 0, 0);
			doc.setFont("helvetica", "normal");

			if (subtopic.content) {
				yPosition += addWrappedText(subtopic.content, margin + 5, yPosition, maxWidth - 10, 10);
				yPosition += 5;
			}

			// Key Points
			if (subtopic.keyPoints && subtopic.keyPoints.length > 0) {
				checkNewPage(20);
				doc.setFont("helvetica", "bold");
				doc.setFontSize(10);
				doc.text("Key Points:", margin + 5, yPosition);
				yPosition += 7;
				doc.setFont("helvetica", "normal");

				subtopic.keyPoints.forEach((point) => {
					checkNewPage(15);
					doc.circle(margin + 8, yPosition - 1.5, 1, "F");
					yPosition += addWrappedText(point, margin + 12, yPosition, maxWidth - 17, 9);
					yPosition += 3;
				});
				yPosition += 3;
			}

			// Example
			if (subtopic.example) {
				checkNewPage(25);
				doc.setFillColor(240, 253, 244); // Light green
				doc.rect(margin + 5, yPosition - 3, maxWidth - 10, 8, "F");
				doc.setFont("helvetica", "bold");
				doc.setFontSize(9);
				doc.setTextColor(22, 163, 74);
				doc.text("💡 Example:", margin + 8, yPosition + 2);
				yPosition += 8;

				doc.setTextColor(0, 0, 0);
				doc.setFont("helvetica", "italic");
				yPosition += addWrappedText(subtopic.example, margin + 8, yPosition, maxWidth - 16, 9);
				yPosition += 5;
			}

			yPosition += 5;
		});

		yPosition += 5;
	});

	// Definitions
	if (notesData.definitions && notesData.definitions.length > 0) {
		checkNewPage(40);
		
		doc.setFillColor(254, 243, 199); // Light amber
		doc.rect(margin - 5, yPosition - 5, maxWidth + 10, 12, "F");
		doc.setFontSize(14);
		doc.setFont("helvetica", "bold");
		doc.setTextColor(217, 119, 6);
		doc.text("Important Definitions", margin, yPosition + 3);
		yPosition += 15;

		doc.setTextColor(0, 0, 0);

		notesData.definitions.forEach((def) => {
			checkNewPage(20);
			doc.setFont("helvetica", "bold");
			doc.setFontSize(11);
			doc.text(def.term, margin + 5, yPosition);
			yPosition += 7;

			doc.setFont("helvetica", "normal");
			doc.setFontSize(10);
			yPosition += addWrappedText(def.definition, margin + 5, yPosition, maxWidth - 10);
			yPosition += 8;
		});
	}

	// Practice Questions
	if (notesData.practiceQuestions && notesData.practiceQuestions.length > 0) {
		checkNewPage(40);
		
		doc.setFillColor(243, 232, 255); // Light purple
		doc.rect(margin - 5, yPosition - 5, maxWidth + 10, 12, "F");
		doc.setFontSize(14);
		doc.setFont("helvetica", "bold");
		doc.setTextColor(147, 51, 234);
		doc.text("Practice Questions", margin, yPosition + 3);
		yPosition += 15;

		doc.setTextColor(0, 0, 0);

		notesData.practiceQuestions.forEach((q, idx) => {
			checkNewPage(25);
			doc.setFont("helvetica", "bold");
			doc.setFontSize(10);
			doc.text(`Q${idx + 1}.`, margin + 5, yPosition);
			yPosition += addWrappedText(q.question, margin + 15, yPosition - 5, maxWidth - 20, 10, "normal");
			
			if (q.hint) {
				doc.setFont("helvetica", "italic");
				doc.setFontSize(9);
				doc.setTextColor(100, 100, 100);
				yPosition += 3;
				yPosition += addWrappedText(`💡 Hint: ${q.hint}`, margin + 15, yPosition, maxWidth - 20, 9);
				doc.setTextColor(0, 0, 0);
			}
			yPosition += 8;
		});
	}

	// References
	if (notesData.references && notesData.references.length > 0) {
		checkNewPage(40);
		
		doc.setFillColor(207, 250, 254); // Light cyan
		doc.rect(margin - 5, yPosition - 5, maxWidth + 10, 12, "F");
		doc.setFontSize(14);
		doc.setFont("helvetica", "bold");
		doc.setTextColor(8, 145, 178);
		doc.text("Learning Resources & References", margin, yPosition + 3);
		yPosition += 15;

		doc.setTextColor(0, 0, 0);

		notesData.references.forEach((ref, idx) => {
			checkNewPage(20);
			doc.setFont("helvetica", "bold");
			doc.setFontSize(10);
			doc.text(`${idx + 1}. ${ref.title}`, margin + 5, yPosition);
			yPosition += 7;

			doc.setFont("helvetica", "normal");
			doc.setFontSize(9);
			yPosition += addWrappedText(ref.description, margin + 8, yPosition, maxWidth - 13);
			
			doc.setTextColor(37, 99, 235);
			doc.setFont("helvetica", "italic");
			yPosition += addWrappedText(ref.url, margin + 8, yPosition, maxWidth - 13, 8);
			doc.setTextColor(0, 0, 0);
			yPosition += 8;
		});
	}

	// Summary
	if (notesData.summary && notesData.summary.length > 0) {
		checkNewPage(40);
		
		doc.setFillColor(209, 250, 229); // Light emerald
		doc.rect(margin - 5, yPosition - 5, maxWidth + 10, 12, "F");
		doc.setFontSize(14);
		doc.setFont("helvetica", "bold");
		doc.setTextColor(5, 150, 105);
		doc.text("Key Takeaways", margin, yPosition + 3);
		yPosition += 15;

		doc.setTextColor(0, 0, 0);
		doc.setFont("helvetica", "normal");

		notesData.summary.forEach((item) => {
			checkNewPage(15);
			doc.text("✓", margin + 5, yPosition);
			yPosition += addWrappedText(item, margin + 12, yPosition, maxWidth - 17, 10);
			yPosition += 5;
		});
	}

	// Footer on each page
	const totalPages = doc.internal.getNumberOfPages();
	for (let i = 1; i <= totalPages; i++) {
		doc.setPage(i);
		doc.setFontSize(8);
		doc.setTextColor(150, 150, 150);
		doc.text(
			`Page ${i} of ${totalPages} | Generated by iGyanAI`,
			pageWidth / 2,
			pageHeight - 10,
			{ align: "center" }
		);
	}

	// Save the PDF
	const fileName = `${notesData.title.replace(/[^a-z0-9]/gi, '_')}_notes.pdf`;
	doc.save(fileName);
};
