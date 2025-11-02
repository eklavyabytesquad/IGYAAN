import { jsPDF } from 'jspdf';

export const generateMCQPDF = (mcqContent, classInfo, subject, topic) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Helper function to add page border
  const addPageBorder = () => {
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(1);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10, 'S');
  };

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      addPageBorder();
      yPos = 20;
      return true;
    }
    return false;
  };

  // Add logo
  try {
    doc.addImage('/logo.png', 'PNG', 10, 10, 20, 20);
  } catch (e) {
    try {
      doc.addImage('/logo.jpg', 'JPEG', 10, 10, 20, 20);
    } catch (e2) {
      console.log('Logo not found');
    }
  }

  addPageBorder();

  // Header
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('MCQ Assessment', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${classInfo} - ${subject}`, pageWidth / 2, 25, { align: 'center' });

  yPos = 45;

  // Topic Section
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(15, yPos, pageWidth - 30, 25, 3, 3, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Topic:', 20, yPos + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(topic, 20, yPos + 16);
  
  doc.text('Date:', pageWidth - 60, yPos + 8);
  doc.text(new Date().toLocaleDateString(), pageWidth - 60, yPos + 16);

  yPos += 35;

  // Instructions
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('Instructions: Choose the correct answer for each question. Each question carries equal marks.', 20, yPos);
  yPos += 15;

  // Parse and format MCQs
  const lines = mcqContent.split('\n');
  let questionNumber = 0;
  let currentQuestion = '';
  let options = [];
  let correctAnswer = '';
  let explanation = '';
  let inQuestion = false;

  const renderQuestion = () => {
    if (currentQuestion) {
      checkNewPage(60);
      
      // Question
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      const questionLines = doc.splitTextToSize(currentQuestion, pageWidth - 40);
      questionLines.forEach((line) => {
        doc.text(line, 20, yPos);
        yPos += 6;
      });
      yPos += 3;

      // Options
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      options.forEach((option) => {
        checkNewPage(10);
        const optionLines = doc.splitTextToSize(option, pageWidth - 50);
        optionLines.forEach((line) => {
          doc.text(line, 25, yPos);
          yPos += 5;
        });
        yPos += 2;
      });

      yPos += 5;

      // Reset for next question
      currentQuestion = '';
      options = [];
      correctAnswer = '';
      explanation = '';
    }
  };

  lines.forEach((line) => {
    line = line.trim();
    
    if (line.match(/^Q\d+:/)) {
      renderQuestion();
      questionNumber++;
      currentQuestion = line;
      inQuestion = true;
    } else if (line.match(/^[A-D]\)/)) {
      options.push(line);
    } else if (line.startsWith('Correct Answer:')) {
      correctAnswer = line.replace('Correct Answer:', '').trim();
    } else if (line.startsWith('Explanation:')) {
      explanation = line.replace('Explanation:', '').trim();
    } else if (line && inQuestion && !line.match(/^(Q|Correct|Explanation)/)) {
      currentQuestion += ' ' + line;
    }
  });

  // Render last question
  renderQuestion();

  // Answer Key Section (New Page)
  doc.addPage();
  addPageBorder();
  yPos = 20;

  doc.setFillColor(99, 102, 241);
  doc.rect(15, yPos, pageWidth - 30, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Answer Key & Explanations', 20, yPos + 8);
  yPos += 20;

  // Parse answers and explanations
  const answerLines = mcqContent.split('\n');
  let qNum = 0;
  let currentAns = '';
  let currentExp = '';

  answerLines.forEach((line) => {
    line = line.trim();
    
    if (line.match(/^Q\d+:/)) {
      if (currentAns) {
        checkNewPage(25);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`Question ${qNum}:`, 20, yPos);
        doc.setTextColor(16, 185, 129);
        doc.text(currentAns, 50, yPos);
        yPos += 6;
        
        if (currentExp) {
          doc.setTextColor(60, 60, 60);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          const expLines = doc.splitTextToSize(currentExp, pageWidth - 50);
          expLines.forEach((expLine) => {
            doc.text(expLine, 25, yPos);
            yPos += 5;
          });
        }
        yPos += 5;
      }
      qNum++;
      currentAns = '';
      currentExp = '';
    } else if (line.startsWith('Correct Answer:')) {
      currentAns = line.replace('Correct Answer:', '').trim();
    } else if (line.startsWith('Explanation:')) {
      currentExp = line.replace('Explanation:', '').trim();
    }
  });

  // Last answer
  if (currentAns) {
    checkNewPage(25);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Question ${qNum}:`, 20, yPos);
    doc.setTextColor(16, 185, 129);
    doc.text(currentAns, 50, yPos);
    yPos += 6;
    
    if (currentExp) {
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const expLines = doc.splitTextToSize(currentExp, pageWidth - 50);
      expLines.forEach((expLine) => {
        doc.text(expLine, 25, yPos);
        yPos += 5;
      });
    }
  }

  // Add footers to all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Page border
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(1);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10, 'S');
    
    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(10, pageHeight - 15, pageWidth - 10, pageHeight - 15);
    
    // Footer text
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `igyan MCQ Assessment | ${classInfo} ${subject}`,
      15,
      pageHeight - 10
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 15,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  return doc;
};
