import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPageBorder, addLogo, addHeader, addFooter, addSectionBox, cleanText, addGradeChart } from './pdfHelpers';

export const generateClassReport = async (selectedClass, template) => {
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
    `Class ${selectedClass} Performance Report`,
    `Generated on ${new Date().toLocaleDateString()}`
  );
  
  addPageBorder(doc, template, pageWidth, pageHeight);
  
  // Overall Summary Box
  const summaryContent = [
    `Total Students: 35`,
    `Average Score: 85.4%`,
    `Pass Rate: 94.3%`,
    `Attendance Rate: 92.1%`,
    `Top Scorer: Alice Johnson (98.5%)`,
    `Class Rank: 2nd out of 12 sections`
  ];
  addSectionBox(doc, template, 15, 50, pageWidth - 30, 42, 'Overall Summary', summaryContent);

  // Grade Distribution Chart
  doc.setTextColor(...template.text);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Grade Distribution', 20, 105);
  addGradeChart(doc, template, 25, 110);

  // Student Performance Table
  doc.setTextColor(...template.text);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Top 15 Student Performance', 20, 175);

  const tableData = [
    ['Alice Johnson', '98.5', 'A+', '95%', 'Excellent', '1st'],
    ['Bob Smith', '97.3', 'A+', '93%', 'Excellent', '2nd'],
    ['Carol Davis', '96.7', 'A+', '91%', 'Excellent', '3rd'],
    ['David Wilson', '95.2', 'A+', '89%', 'Very Good', '4th'],
    ['Emma Brown', '94.1', 'A+', '94%', 'Very Good', '5th'],
    ['Frank Miller', '92.5', 'A+', '90%', 'Very Good', '6th'],
    ['Grace Lee', '91.8', 'A+', '88%', 'Very Good', '7th'],
    ['Henry Clark', '90.3', 'A+', '92%', 'Very Good', '8th'],
    ['Ivy Martinez', '88.7', 'A', '87%', 'Good', '9th'],
    ['Jack Anderson', '87.2', 'A', '89%', 'Good', '10th'],
    ['Kelly White', '85.9', 'A', '91%', 'Good', '11th'],
    ['Liam Harris', '84.3', 'A', '86%', 'Good', '12th'],
    ['Mia Thompson', '82.8', 'A', '88%', 'Satisfactory', '13th'],
    ['Noah Garcia', '81.5', 'A', '85%', 'Satisfactory', '14th'],
    ['Olivia Moore', '80.2', 'A', '87%', 'Satisfactory', '15th'],
  ];

  autoTable(doc, {
    startY: 180,
    head: [['Student Name', 'Score', 'Grade', 'Attendance', 'Remarks', 'Rank']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: template.primary, fontSize: 10, font: 'helvetica' },
    styles: { fontSize: 9, cellPadding: 2, font: 'helvetica' },
    margin: { left: 15, right: 15 },
  });

  // New Page for Subject Analysis
  doc.addPage();
  addPageBorder(doc, template, pageWidth, pageHeight);
  
  // Subject-wise Performance
  doc.setTextColor(...template.text);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Subject-wise Performance Analysis', 20, 20);

  const subjectData = [
    ['Mathematics', '88.5', 'Strong', '32/35', 'Algebra needs focus'],
    ['Science', '85.2', 'Good', '30/35', 'Lab work excellent'],
    ['English', '90.1', 'Excellent', '34/35', 'Creative writing superb'],
    ['History', '82.7', 'Satisfactory', '28/35', 'More reading required'],
    ['Geography', '78.9', 'Needs Focus', '25/35', 'Map work weak'],
    ['Computer Science', '92.3', 'Excellent', '35/35', 'Outstanding coding'],
    ['Physical Education', '87.6', 'Very Good', '33/35', 'Great participation'],
    ['Arts & Crafts', '89.4', 'Very Good', '34/35', 'Creative excellence'],
  ];

  autoTable(doc, {
    startY: 30,
    head: [['Subject', 'Avg Score', 'Status', 'Pass Rate', 'Teacher Notes']],
    body: subjectData,
    theme: 'grid',
    headStyles: { fillColor: template.primary, fontSize: 10, font: 'helvetica' },
    styles: { fontSize: 9, cellPadding: 3, font: 'helvetica' },
    margin: { left: 15, right: 15 },
  });
  
  // Attendance Chart
  let finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Monthly Attendance Trends', 20, finalY);
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const attendance = [92, 94, 91, 89, 93, 95, 94, 92, 90, 93, 92, 94];
  
  autoTable(doc, {
    startY: finalY + 5,
    head: [['Month', 'Attendance %', 'Status']],
    body: months.map((month, i) => [
      month,
      attendance[i] + '%',
      attendance[i] >= 90 ? 'Good' : 'Needs Improvement'
    ]),
    theme: 'striped',
    headStyles: { fillColor: template.primary, fontSize: 10, font: 'helvetica' },
    styles: { fontSize: 9, cellPadding: 2, font: 'helvetica' },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 35 },
      2: { cellWidth: 'auto' }
    }
  });
  
  // Recommendations
  finalY = doc.lastAutoTable.finalY + 15;
  const recommendations = [
    'Focus on Geography: Arrange additional map reading sessions',
    'Maintain excellence in Computer Science and English',
    'Improve attendance: Target 95%+ in remaining months',
    'Peer tutoring: Top students to help struggling learners',
    'Parent-teacher meetings for students below 70%'
  ];
  addSectionBox(doc, template, 15, finalY, pageWidth - 30, 42, 'Recommendations & Action Items', recommendations);

  // Add footers to all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addFooter(doc, template, pageWidth, pageHeight, i, pageCount, `Class ${selectedClass} Report`);
  }

  return doc;
};
