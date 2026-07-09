/**
 * One-time seed script — run this once to populate Firestore with the
 * sample tasks that used to be hardcoded in MyWeek.tsx, so the board
 * isn't empty on first load.
 *
 * How to run:
 *   1. Make sure you're signed in to the app in your browser at least once
 *      (Firestore rules likely require auth — see note below).
 *   2. From the project root: npx tsx scripts/seedTasks.ts
 *      (if you don't have tsx: pnpm add -D tsx)
 *
 * Safe to delete this file after running it once.
 */
import { addTaskDoc } from "../src/lib/tasks";
import { getCurrentWeekStart } from "../src/lib/week";
import type { Task } from "../src/lib/types";

const weekOf = getCurrentWeekStart();

const seedTasks: Omit<Task, "id" | "createdAt">[] = [
  {
    name: "Review Q1 expense reports",
    startDate: "2026-06-18",
    dueDate: "2026-06-18",
    status: "Complete",
    priority: "High",
    assignee: "Sarah Mukama",
    department: "Finance",
    weekOf,
    completedAt: Date.now(),
    archived: false,
    milestoneId: null,
    comments: "",
  },
  {
    name: "Prepare budget forecast for Q3",
    startDate: "2026-06-19",
    dueDate: "2026-06-19",
    status: "In Progress",
    priority: "High",
    assignee: "Sarah Mukama",
    department: "Finance",
    weekOf,
    completedAt: null,
    archived: false,
    milestoneId: null,
    comments: "",
  },
  {
    name: "Update social media content calendar",
    startDate: "2026-06-20",
    dueDate: "2026-06-20",
    status: "In Progress",
    priority: "Medium",
    assignee: "Grace Uwase",
    department: "Marketing",
    weekOf,
    completedAt: null,
    archived: false,
    milestoneId: null,
    comments: "",
  },
  {
    name: "Deploy security patch to production",
    startDate: "2026-06-21",
    dueDate: "2026-06-21",
    status: "Not Started",
    priority: "High",
    assignee: "James Nkurunziza",
    department: "IT",
    weekOf,
    completedAt: null,
    archived: false,
    milestoneId: null,
    comments: "",
  },
  {
    name: "Conduct supplier negotiations",
    startDate: "2026-06-22",
    dueDate: "2026-06-22",
    status: "Pending",
    priority: "Medium",
    assignee: "Patrick Habimana",
    department: "Operations",
    weekOf,
    completedAt: null,
    archived: false,
    milestoneId: null,
    comments: "",
  },
  {
    name: "Create brand guidelines document",
    startDate: "2026-06-23",
    dueDate: "2026-06-23",
    status: "Not Started",
    priority: "Low",
    assignee: "Grace Uwase",
    department: "Marketing",
    weekOf,
    completedAt: null,
    archived: false,
    milestoneId: null,
    comments: "",
  },
];

async function run() {
  for (const task of seedTasks) {
    await addTaskDoc(task);
    console.log(`Added: ${task.name}`);
  }
  console.log("Done seeding.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});