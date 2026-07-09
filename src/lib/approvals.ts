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
import type { Approval } from "./types";

const approvalsCol = collection(db, "approvals");

export function useApprovals() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(approvalsCol, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setApprovals(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Approval, "id">) })));
        setLoading(false);
      },
      (err) => { console.error("useApprovals error:", err); setLoading(false); }
    );
    return unsub;
  }, []);

  return { approvals, loading };
}

export async function addApprovalDoc(a: Omit<Approval, "id" | "createdAt" | "decidedAt" | "status">) {
  await addDoc(approvalsCol, { ...a, status: "Pending", createdAt: Date.now(), decidedAt: null });
}

export async function decideApprovalDoc(id: string, status: "Approved" | "Rejected") {
  await updateDoc(doc(db, "approvals", id), { status, decidedAt: Date.now() });
}

export async function deleteApprovalDoc(id: string) {
  await deleteDoc(doc(db, "approvals", id));
}