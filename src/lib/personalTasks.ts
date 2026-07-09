import { useEffect, useState } from "react";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import type { PersonalTask } from "./types";

const personalTasksCol = collection(db, "personalTasks");

/** Realtime subscription to only the signed-in user's own personal tasks. */
export function usePersonalTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<PersonalTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    const q = query(personalTasksCol, where("userId", "==", userId), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setTasks(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PersonalTask, "id">) })));
        setLoading(false);
      },
      (err) => { console.error("usePersonalTasks error:", err); setLoading(false); }
    );
    return unsub;
  }, [userId]);

  return { tasks, loading };
}

export async function addPersonalTaskDoc(task: Omit<PersonalTask, "id" | "createdAt">) {
  await addDoc(personalTasksCol, { ...task, createdAt: Date.now() });
}

export async function updatePersonalTaskDoc(id: string, patch: Partial<Omit<PersonalTask, "id" | "userId">>) {
  await updateDoc(doc(db, "personalTasks", id), patch);
}

export async function deletePersonalTaskDoc(id: string) {
  await deleteDoc(doc(db, "personalTasks", id));
}