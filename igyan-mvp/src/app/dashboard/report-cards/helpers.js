import { GRADING_SYSTEMS } from "./constants";

export function calcGrade(percentage, system = "cbse") {
  const grades = GRADING_SYSTEMS[system]?.grades || GRADING_SYSTEMS.cbse.grades;
  for (const g of grades) {
    if (percentage >= g.min && percentage <= g.max) return g;
  }
  return { grade: "F", gp: 0 };
}

export function generateSampleCsv() {
  return `StudentName,Mathematics,Science,English,Hindi,Social Studies
Rahul Sharma,85,90,78,88,92
Priya Singh,92,88,95,79,85
Amit Kumar,76,82,68,91,73
Sneha Patel,88,75,92,84,90
Rohan Gupta,65,70,80,72,68`;
}

export function downloadCsvFile(content, filename) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
