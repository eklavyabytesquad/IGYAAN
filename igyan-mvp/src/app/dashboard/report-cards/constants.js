export const ALLOWED_ROLES = ["super_admin", "co_admin", "faculty"];

export const GRADING_SYSTEMS = {
  cbse: {
    name: "CBSE (10-Point)",
    grades: [
      { min: 91, max: 100, grade: "A1", gp: 10 },
      { min: 81, max: 90, grade: "A2", gp: 9 },
      { min: 71, max: 80, grade: "B1", gp: 8 },
      { min: 61, max: 70, grade: "B2", gp: 7 },
      { min: 51, max: 60, grade: "C1", gp: 6 },
      { min: 41, max: 50, grade: "C2", gp: 5 },
      { min: 33, max: 40, grade: "D", gp: 4 },
      { min: 0, max: 32, grade: "E (Fail)", gp: 0 },
    ],
  },
  icse: {
    name: "ICSE",
    grades: [
      { min: 90, max: 100, grade: "A+", gp: 10 },
      { min: 80, max: 89, grade: "A", gp: 9 },
      { min: 70, max: 79, grade: "B+", gp: 8 },
      { min: 60, max: 69, grade: "B", gp: 7 },
      { min: 50, max: 59, grade: "C", gp: 6 },
      { min: 40, max: 49, grade: "D", gp: 5 },
      { min: 0, max: 39, grade: "F (Fail)", gp: 0 },
    ],
  },
  percentage: {
    name: "Percentage Based",
    grades: [
      { min: 90, max: 100, grade: "A+", gp: 10 },
      { min: 80, max: 89, grade: "A", gp: 9 },
      { min: 70, max: 79, grade: "B+", gp: 8 },
      { min: 60, max: 69, grade: "B", gp: 7 },
      { min: 50, max: 59, grade: "C", gp: 6 },
      { min: 40, max: 49, grade: "D", gp: 5 },
      { min: 33, max: 39, grade: "E", gp: 4 },
      { min: 0, max: 32, grade: "F (Fail)", gp: 0 },
    ],
  },
};

export const EXAM_TYPES = [
  "Unit Test 1",
  "Unit Test 2",
  "Unit Test 3",
  "Unit Test 4",
  "Quarterly",
  "Half Yearly",
  "Annual / Final",
  "Pre-Board",
  "Other",
];

export const REPORT_TEMPLATES = [
  { id: "classic", name: "Classic", desc: "Traditional indigo theme with formal layout", color: "#4F46E5" },
  { id: "modern", name: "Modern", desc: "Contemporary teal gradient design", color: "#0D9488" },
  { id: "minimal", name: "Minimal", desc: "Clean black & white professional style", color: "#374151" },
  { id: "colorful", name: "Colorful", desc: "Vibrant multi-color design for primary schools", color: "#DC2626" },
];

export const TEMPLATE_STYLES = {
  classic: {
    headerBg: [79, 70, 229],
    accentColor: [79, 70, 229],
    infoBg: [245, 245, 250],
    altRowBg: [248, 248, 255],
    tableTheme: "grid",
  },
  modern: {
    headerBg: [13, 148, 136],
    accentColor: [13, 148, 136],
    infoBg: [240, 253, 250],
    altRowBg: [245, 255, 252],
    tableTheme: "striped",
  },
  minimal: {
    headerBg: [55, 65, 81],
    accentColor: [55, 65, 81],
    infoBg: [249, 250, 251],
    altRowBg: [249, 250, 251],
    tableTheme: "plain",
  },
  colorful: {
    headerBg: [220, 38, 38],
    accentColor: [220, 38, 38],
    infoBg: [255, 251, 235],
    altRowBg: [254, 249, 195],
    tableTheme: "grid",
  },
};
