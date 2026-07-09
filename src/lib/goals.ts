import { useEffect, useState } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import type { AnnualGoal, QuarterlyMilestone, Project, Task } from "./types";

// ---------- Annual Goals ----------

const goalsCol = collection(db, "annualGoals");

export function useAnnualGoals() {
  const [goals, setGoals] = useState<AnnualGoal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(goalsCol, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setGoals(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AnnualGoal, "id">) })));
      setLoading(false);
    }, (err) => { console.error("useAnnualGoals error:", err); setLoading(false); });
    return unsub;
  }, []);

  return { goals, loading };
}

export async function addGoalDoc(goal: Omit<AnnualGoal, "id" | "createdAt">) {
  await addDoc(goalsCol, { ...goal, createdAt: Date.now() });
}
export async function updateGoalDoc(id: string, patch: Partial<Omit<AnnualGoal, "id">>) {
  await updateDoc(doc(db, "annualGoals", id), patch);
}
export async function deleteGoalDoc(id: string) {
  await deleteDoc(doc(db, "annualGoals", id));
}

// ---------- Quarterly Milestones ----------

const milestonesCol = collection(db, "milestones");

export function useMilestones() {
  const [milestones, setMilestones] = useState<QuarterlyMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(milestonesCol, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setMilestones(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<QuarterlyMilestone, "id">) })));
      setLoading(false);
    }, (err) => { console.error("useMilestones error:", err); setLoading(false); });
    return unsub;
  }, []);

  return { milestones, loading };
}

export async function addMilestoneDoc(m: Omit<QuarterlyMilestone, "id" | "createdAt">) {
  await addDoc(milestonesCol, { ...m, createdAt: Date.now() });
}
export async function updateMilestoneDoc(id: string, patch: Partial<Omit<QuarterlyMilestone, "id">>) {
  await updateDoc(doc(db, "milestones", id), patch);
}
export async function deleteMilestoneDoc(id: string) {
  await deleteDoc(doc(db, "milestones", id));
}

// ---------- Projects ----------

const projectsCol = collection(db, "projects");

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(projectsCol, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setProjects(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Project, "id">) })));
      setLoading(false);
    }, (err) => { console.error("useProjects error:", err); setLoading(false); });
    return unsub;
  }, []);

  return { projects, loading };
}

export async function addProjectDoc(p: Omit<Project, "id" | "createdAt">) {
  await addDoc(projectsCol, { ...p, createdAt: Date.now() });
}
export async function updateProjectDoc(id: string, patch: Partial<Omit<Project, "id">>) {
  await updateDoc(doc(db, "projects", id), patch);
}
export async function deleteProjectDoc(id: string) {
  await deleteDoc(doc(db, "projects", id));
}

// ---------- Shared lookup helpers ----------

export function findGoalById(goals: AnnualGoal[], id: string) {
  return goals.find((g) => g.id === id);
}
export function findMilestoneById(milestones: QuarterlyMilestone[], id: string) {
  return milestones.find((m) => m.id === id);
}

/** A milestone is "blocked" if it has any linked task or project that isn't Complete yet. */
export function isMilestoneBlocked(milestoneId: string, tasks: Task[], projects: Project[]): boolean {
  const openTasks = tasks.filter((t) => t.milestoneId === milestoneId && !t.archived && t.status !== "Complete");
  const openProjects = projects.filter((p) => p.milestoneId === milestoneId && p.status !== "Complete");
  return openTasks.length > 0 || openProjects.length > 0;
}

/**
 * An annual goal's progress is derived from how many of its milestones are both marked
 * Complete AND not blocked by open tasks/projects — a milestone's stored status alone
 * isn't trusted, since it can go stale if it was set Complete before this rule existed.
 */
export function computeGoalProgress(
  goalId: string,
  milestones: QuarterlyMilestone[],
  tasks: Task[],
  projects: Project[]
): number {
  const owned = milestones.filter((m) => m.annualGoalId === goalId);
  if (owned.length === 0) return 0;
  const done = owned.filter((m) => m.status === "Complete" && !isMilestoneBlocked(m.id, tasks, projects)).length;
  return Math.round((done / owned.length) * 100);
}