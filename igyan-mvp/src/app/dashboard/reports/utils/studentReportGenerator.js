import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPageBorder, addLogo, addHeader, addFooter, addSectionBox, cleanText } from './pdfHelpers';

export const generateStudentReport = async (student, template) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Add logo
  addLogo(doc);
  
  // Add header
  addHeader(
    doc,
    template,
    pageWidth,
    'Student Performance Report',
    `${student.name} - Class ${student.class}`
  );
  
  addPageBorder(doc, template, pageWidth, pageHeight);
  
  // Student Information Box
  const studentInfo = [
    `Name: ${student.name}`,
    `Class: ${student.class}`,
    `Roll No: ${student.id.padStart(3, '0')}`,
    `Date of Birth: 15/08/2009`
  ];
  addSectionBox(doc, template, 15, 50, 85, 38, 'Student Information', studentInfo);

  // Performance Summary Box
  const performanceInfo = [
    `Overall Average: 98.5%`,
    `Class Rank: 1/35`,
    `Grade: A+`,
    `Attendance: 95%`
  ];
  addSectionBox(doc, template, 110, 50, 85, 38, 'Performance Summary', performanceInfo);
  
  // Achievement Highlights
  const achievements = [
    'Top Performer in Computer Science (100%)',
    'Consistent A+ grade throughout the year',
    'Best Academic Performance Award Recipient'
  ];
  addSectionBox(doc, template, 15, 95, pageWidth - 30, 28, 'Achievement Highlights', achievements, true);

  // Subject-wise Performance
  doc.setTextColor(...template.text);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Subject-wise Performance', 20, 135);

  const subjectData = [
    ['Mathematics', '99', 'A+', '48/50', 'Excellent problem-solving'],
    ['Science', '98', 'A+', '49/50', 'Strong practical skills'],
    ['English', '99', 'A+', '99/100', 'Outstanding communication'],
    ['History', '97', 'A+', '97/100', 'Great analytical thinking'],
    ['Geography', '98', 'A+', '98/100', 'Excellent map work'],
    ['Computer Science', '100', 'A+', '100/100', 'Exceptional coding'],
    ['Physical Education', '96', 'A+', '96/100', 'Very active participant'],
    ['Arts & Crafts', '98', 'A+', '49/50', 'Creative excellence'],
  ];

  autoTable(doc, {
    startY: 140,
    head: [['Subject', 'Score %', 'Grade', 'Marks', 'Teacher Comments']],
    body: subjectData,
    theme: 'striped',
    headStyles: { fillColor: template.primary, fontSize: 10, font: 'helvetica' },
    styles: { fontSize: 9, cellPadding: 2.5, font: 'helvetica' },
    margin: { left: 15, right: 15 },
  });

  // New Page for Detailed Analysis
  doc.addPage();
  addPageBorder(doc, template, pageWidth, pageHeight);
  
  // Skills Assessment
  doc.setTextColor(...template.text);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Skills Assessment Matrix', 20, 20);

  const skillsData = [
    ['Problem Solving', '95', 'Exceptional', 'Solves complex problems creatively'],
    ['Critical Thinking', '92', 'Excellent', 'Analyzes situations thoroughly'],
    ['Creativity', '90', 'Very Good', 'Innovative approach to tasks'],
    ['Communication', '94', 'Excellent', 'Articulates ideas clearly'],
    ['Teamwork', '88', 'Very Good', 'Collaborates well with peers'],
    ['Leadership', '90', 'Very Good', 'Shows initiative in groups'],
    ['Time Management', '93', 'Excellent', 'Meets deadlines consistently'],
    ['Digital Literacy', '98', 'Exceptional', 'Tech-savvy & proficient'],
  ];

  autoTable(doc, {
    startY: 30,
    head: [['Skill', 'Score', 'Rating', 'Teacher Observation']],
    body: skillsData,
    theme: 'grid',
    headStyles: { fillColor: template.primary, fontSize: 10, font: 'helvetica' },
    styles: { fontSize: 9, cellPadding: 3, font: 'helvetica' },
    margin: { left: 15, right: 15 },
  });
  
  // Monthly Performance Trend
  let finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Monthly Performance Trend', 20, finalY);
  
  const monthlyData = [
    ['January', '96.5', 'A+', 'Strong start'],
    ['February', '97.2', 'A+', 'Consistent improvement'],
    ['March', '97.8', 'A+', 'Excellent progress'],
    ['April', '98.1', 'A+', 'Outstanding'],
    ['May', '98.5', 'A+', 'Peak performance'],
    ['June', '98.3', 'A+', 'Maintained excellence'],
    ['July', '98.7', 'A+', 'Exceptional work'],
    ['August', '98.5', 'A+', 'Consistently brilliant'],
    ['September', '98.9', 'A+', 'Top performer'],
    ['October', '98.5', 'A+', 'Sustained excellence'],
  ];
  
  autoTable(doc, {
    startY: finalY + 5,
    head: [['Month', 'Score %', 'Grade', 'Remarks']],
    body: monthlyData,
    theme: 'striped',
    headStyles: { fillColor: template.primary, fontSize: 10, font: 'helvetica' },
    styles: { fontSize: 9, cellPadding: 2, font: 'helvetica' },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 30 },
      2: { cellWidth: 25 },
      3: { cellWidth: 'auto' }
    }
  });
  
  // Co-curricular Activities
  finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Co-curricular Activities & Achievements', 20, finalY);
  
  const activities = [
    ['Science Olympiad', '1st Position', 'Gold Medal'],
    ['Coding Competition', 'Winner', 'State Level'],
    ['Debate Club', 'President', 'Leadership'],
    ['Basketball Team', 'Captain', 'Sports'],
    ['Community Service', '50+ Hours', 'Social Work'],
  ];
  
  autoTable(doc, {
    startY: finalY + 5,
    head: [['Activity', 'Achievement', 'Recognition']],
    body: activities,
    theme: 'grid',
    headStyles: { fillColor: template.primary, fontSize: 10, font: 'helvetica' },
    styles: { fontSize: 9, cellPadding: 3, font: 'helvetica' },
    margin: { left: 15, right: 15 },
  });

  // Recommendations
  finalY = doc.lastAutoTable.finalY + 15;
  const recommendations = [
    'Exceptional student - Continue current study methods',
    'Ready for advanced placement courses in Computer Science',
    'Consider leadership roles in student council',
    'Excellent candidate for peer mentoring program',
    'Maintain balanced approach across all subjects',
    'Explore competitive exams and scholarships'
  ];
  addSectionBox(doc, template, 15, finalY, pageWidth - 30, 48, 'Teacher Recommendations', recommendations);
  
  // Signature Section
  finalY = finalY + 55;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...template.text);
  doc.text('_______________________', 20, finalY);
  doc.text('Class Teacher Signature', 20, finalY + 7);
  
  doc.text('_______________________', 90, finalY);
  doc.text('Principal Signature', 90, finalY + 7);
  
  doc.text('_______________________', 160, finalY);
  doc.text('Parent Signature', 160, finalY + 7);

  // Add footers to all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addFooter(doc, template, pageWidth, pageHeight, i, pageCount, `${student.name} - Class ${student.class}`);
  }

  return doc;
};
