import { jsPDF } from 'jspdf';

export const generateQuestionPaperPDF = (
  paperContent,
  classInfo,
  subject,
  topic,
  duration,
  totalMarks
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = 20;

  // Add page border
  const addPageBorder = () => {
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(1.5);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16, 'S');
    
    // Inner border
    doc.setLineWidth(0.5);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');
  };

  // Add logo
  const addLogo = () => {
    try {
      doc.addImage('/logo.png', 'PNG', margin, 12, 25, 25);
    } catch (e) {
      try {
        doc.addImage('/logo.jpg', 'JPEG', margin, 12, 25, 25);
      } catch (e2) {
        console.log('Logo not found');
      }
    }
  };

  // Check if new page is needed
  const checkNewPage = (requiredSpace) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      addPageBorder();
      yPos = 25;
      return true;
    }
    return false;
  };

  // Add header
  const addHeader = () => {
    addPageBorder();
    addLogo();

    // School/Institution Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('QUESTION PAPER', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${classInfo} - ${subject}`, pageWidth / 2, 30, { align: 'center' });
    doc.text(`Academic Year: ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, pageWidth / 2, 38, {
      align: 'center',
    });

    yPos = 55;

    // Exam Details Box
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(191, 219, 254);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'FD');

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    // Left column
    doc.text('Class:', margin + 5, yPos + 10);
    doc.text('Subject:', margin + 5, yPos + 18);
    doc.text('Topic:', margin + 5, yPos + 26);

    doc.setFont('helvetica', 'normal');
    doc.text(classInfo, margin + 25, yPos + 10);
    doc.text(subject, margin + 25, yPos + 18);
    doc.text(topic, margin + 25, yPos + 26);

    // Right column
    doc.setFont('helvetica', 'bold');
    doc.text('Time:', pageWidth / 2 + 10, yPos + 10);
    doc.text('Max. Marks:', pageWidth / 2 + 10, yPos + 18);
    doc.text('Date:', pageWidth / 2 + 10, yPos + 26);

    doc.setFont('helvetica', 'normal');
    doc.text(`${duration} Hours`, pageWidth / 2 + 30, yPos + 10);
    doc.text(totalMarks, pageWidth / 2 + 40, yPos + 18);
    doc.text(new Date().toLocaleDateString(), pageWidth / 2 + 30, yPos + 26);

    yPos += 45;
  };

  // Parse and format the question paper
  const formatQuestionPaper = () => {
    const lines = paperContent.split('\n');
    let inMarkingScheme = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        yPos += 3;
        continue;
      }

      // Check for marking scheme separator
      if (line.includes('MARKING SCHEME') || line.includes('---')) {
        if (!inMarkingScheme && line.includes('MARKING SCHEME')) {
          checkNewPage(40);
          doc.addPage();
          addPageBorder();
          yPos = 25;
          
          // Marking Scheme Header
          doc.setFillColor(16, 185, 129);
          doc.rect(0, yPos - 5, pageWidth, 15, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('MARKING SCHEME', pageWidth / 2, yPos + 5, { align: 'center' });
          doc.setTextColor(0, 0, 0);
          yPos += 20;
          inMarkingScheme = true;
        }
        continue;
      }

      checkNewPage(15);

      // Section Headers
      if (line.startsWith('SECTION') || line.includes('[Section')) {
        yPos += 5;
        doc.setFillColor(99, 102, 241);
        doc.roundedRect(margin, yPos - 4, contentWidth, 12, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(line, margin + 5, yPos + 4);
        doc.setTextColor(0, 0, 0);
        yPos += 15;
        continue;
      }

      // General Instructions Header
      if (line.includes('GENERAL INSTRUCTIONS')) {
        checkNewPage(20);
        doc.setFillColor(245, 247, 250);
        doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, 'F');
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 58, 138);
        doc.text(line, margin + 5, yPos + 7);
        doc.setTextColor(0, 0, 0);
        yPos += 15;
        continue;
      }

      // Questions
      if (line.match(/^Q\d+\./)) {
        checkNewPage(20);
        yPos += 3;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const qNum = line.match(/^Q\d+\./)[0];
        const qText = line.substring(qNum.length).trim();
        
        doc.setTextColor(37, 99, 235);
        doc.text(qNum, margin, yPos);
        doc.setTextColor(0, 0, 0);
        
        const questionLines = doc.splitTextToSize(qText, contentWidth - 15);
        doc.setFont('helvetica', 'normal');
        questionLines.forEach((qLine) => {
          checkNewPage(8);
          doc.text(qLine, margin + 10, yPos);
          yPos += 6;
        });
        yPos += 3;
        continue;
      }

      // Instructions and numbered points
      if (line.match(/^\d+\./)) {
        checkNewPage(10);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const textLines = doc.splitTextToSize(line, contentWidth - 10);
        textLines.forEach((tLine) => {
          checkNewPage(7);
          doc.text(tLine, margin + 5, yPos);
          yPos += 5;
        });
        continue;
      }

      // Regular text
      checkNewPage(10);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const textLines = doc.splitTextToSize(line, contentWidth);
      textLines.forEach((tLine) => {
        checkNewPage(7);
        doc.text(tLine, margin, yPos);
        yPos += 6;
      });
    }
  };

  // Add footer to all pages
  const addFooters = () => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Footer line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

      // Footer text
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `IGYAAN Question Paper | ${classInfo} ${subject}`,
        15,
        pageHeight - 10
      );
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 15, pageHeight - 10, {
        align: 'right',
      });
    }
  };

  // Generate PDF
  addHeader();
  formatQuestionPaper();
  addFooters();

  return doc;
};
