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
import type { Task } from "./types";

const tasksCol = collection(db, "tasks");

/** Realtime subscription to all (non-archived and archived) tasks. */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(tasksCol, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setTasks(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Task, "id">) })));
        setLoading(false);
      },
      (err) => {
        console.error("useTasks subscription error:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  return { tasks, loading };
}

export async function addTaskDoc(task: Omit<Task, "id" | "createdAt">) {
  await addDoc(tasksCol, { ...task, createdAt: Date.now() });
}

export async function updateTaskDoc(id: string, patch: Partial<Omit<Task, "id">>) {
  await updateDoc(doc(db, "tasks", id), patch);
}

export async function deleteTaskDoc(id: string) {
  await deleteDoc(doc(db, "tasks", id));
}