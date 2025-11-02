'use client';

import { jsPDF } from 'jspdf';

export const generatePDF = async (content, title, template) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Helper to convert RGB array to string
    const rgbToString = (rgb) => `rgb(${rgb.join(',')})`;

    // Title Page
    doc.setFillColor(...template.colors.primary);
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(template.fonts.title);
    doc.setFont(undefined, 'bold');
    const titleLines = doc.splitTextToSize(title || 'AI Generated Document', maxWidth);
    doc.text(titleLines, pageWidth / 2, 30, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont(undefined, 'italic');
    doc.text('Powered by igyan AI', pageWidth / 2, 50, { align: 'center' });

    yPosition = 80;
    doc.setTextColor(...template.colors.text);

    // Content
    const sections = content.split('\n\n').filter(section => section.trim());
    
    sections.forEach((section) => {
      const lines = section.split('\n');
      
      lines.forEach((line) => {
        const isHeading = line.includes(':') || line.startsWith('#');
        
        if (isHeading) {
          // Add some space before heading
          yPosition += 5;
          
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          
          doc.setFont(undefined, 'bold');
          doc.setFontSize(template.fonts.heading);
          doc.setTextColor(...template.colors.primary);
        } else {
          doc.setFont(undefined, 'normal');
          doc.setFontSize(template.fonts.body);
          doc.setTextColor(...template.colors.text);
        }
        
        const textLines = doc.splitTextToSize(line.replace('#', '').trim(), maxWidth);
        
        if (yPosition + textLines.length * 7 > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.text(textLines, margin, yPosition);
        yPosition += textLines.length * 7 + 3;
      });
      
      yPosition += 5;
    });

    // Footer on each page
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(10);
    doc.setTextColor(...template.colors.secondary);
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    const fileName = `${title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`;
    doc.save(fileName);
    
    return fileName;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
