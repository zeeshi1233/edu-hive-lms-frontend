// Board and Course/Subject Constants

const rawBoards = [
  "Grade V",
  "Grade VI",
  "Grade VII",
  "Grade VIII",
  "Grade IX",
  "Olevel GCE Cambridge",
  "Olevel IGCSE Cambridge",
  "Olevel IGCSE Pearson",
  "As level Cambridge",
  "A Level Cambridge",
  "IAs Level Pearson",
  "IA Level Pearson",
  "Test Preparation",
  "Cambridge",
  "Pearson",
  "Edexcel",
];

// Deduplicate board list to prevent any duplicate entries
export const BOARD_LIST = Array.from(
  new Set(rawBoards.map((item) => item.trim()))
).filter(Boolean);

export const boardOptions = BOARD_LIST.map((board) => ({
  value: board,
  label: board,
}));

const rawCourses = [
  "Physics",
  "Biology",
  "Chemistry",
  "English Language",
  "English Literature",
  "English Lang+Lit",
  "Additional Maths",
  "Fur.Pure Maths",
  "Maths",
  "Pure Maths",
  "General Maths",
  "First Award Sci",
  "Double Award Sci",
  "Combined Sci",
  "Science",
  "Computer",
];

// Deduplicate course/subject list to prevent any duplicate entries
export const COURSE_LIST = Array.from(
  new Set(rawCourses.map((item) => item.trim()))
).filter(Boolean);

export const courseOptions = COURSE_LIST.map((course) => ({
  value: course,
  label: course,
}));
