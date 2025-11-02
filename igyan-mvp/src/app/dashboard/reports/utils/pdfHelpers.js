// Helper functions for PDF generation

export const addPageBorder = (doc, template, pageWidth, pageHeight) => {
  doc.setDrawColor(...template.primary);
  doc.setLineWidth(1);
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10, 'S');
};

export const addLogo = (doc) => {
  try {
    // Try to add logo - will fail silently if not found
    doc.addImage('/logo.png', 'PNG', 10, 10, 25, 25);
  } catch (e) {
    try {
      doc.addImage('/logo.jpg', 'JPEG', 10, 10, 25, 25);
    } catch (e2) {
      console.log('Logo not found, skipping...');
    }
  }
};

export const addHeader = (doc, template, pageWidth, title, subtitle, year = '2024-2025') => {
  // Header background
  doc.setFillColor(...template.primary);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, 22, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, pageWidth / 2, 32, { align: 'center' });
  doc.text(`Academic Year ${year}`, pageWidth / 2, 39, { align: 'center' });
};

export const addFooter = (doc, template, pageWidth, pageHeight, pageNumber, totalPages, footerText) => {
  // Page border
  doc.setDrawColor(...template.primary);
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
    `igyan Education Platform | ${footerText}`,
    15,
    pageHeight - 12
  );
  doc.text(
    `Page ${pageNumber} of ${totalPages}`,
    pageWidth - 15,
    pageHeight - 12,
    { align: 'right' }
  );
};

export const addSectionBox = (doc, template, x, y, width, height, title, content, isHighlight = false) => {
  // Box with rounded corners
  doc.setDrawColor(...template.primary);
  const fillColor = isHighlight ? [255, 250, 230] : [245, 247, 250];
  doc.setFillColor(...fillColor);
  doc.roundedRect(x, y, width, height, 3, 3, 'FD');
  
  // Title
  doc.setTextColor(...template.text);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, x + 5, y + 10);
  
  // Content
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let yPos = y + 18;
  content.forEach((line) => {
    doc.text(line, x + 5, yPos);
    yPos += 7;
  });
};

export const cleanText = (text) => {
  // Remove special characters and emojis that cause PDF issues
  return text
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Remove emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Remove misc symbols
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Remove transport symbols
    .replace(/[\u{2600}-\u{26FF}]/gu, '') // Remove misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '') // Remove dingbats
    .replace(/✓|✗|•|→|←|↑|↓/g, '') // Remove common symbols
    .trim();
};

export const addGradeChart = (doc, template, x, y) => {
  const grades = [
    { label: 'A+ (90-100)', count: 8, width: 60, color: [16, 185, 129] },
    { label: 'A (80-89)', count: 12, width: 80, color: [99, 102, 241] },
    { label: 'B (70-79)', count: 10, width: 55, color: [251, 146, 60] },
    { label: 'C (60-69)', count: 4, width: 25, color: [251, 191, 36] },
    { label: 'D & F', count: 1, width: 10, color: [239, 68, 68] },
  ];
  
  let currentY = y;
  grades.forEach((grade) => {
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(...grade.color);
    doc.rect(x, currentY, grade.width, 8, 'FD');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${grade.label}: ${grade.count} students`, x + 2, currentY + 5);
    currentY += 10;
  });
};
