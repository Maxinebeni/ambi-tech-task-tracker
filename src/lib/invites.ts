import { useEffect, useState } from "react";
import { collection, doc, setDoc, deleteDoc, getDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import type { Invite, AppRole } from "./types";

const invitesCol = collection(db, "invites");

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function useInvites() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(invitesCol, orderBy("invitedAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setInvites(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Invite, "id">) })));
        setLoading(false);
      },
      (err) => { console.error("useInvites error:", err); setLoading(false); }
    );
    return unsub;
  }, []);

  return { invites, loading };
}

export async function inviteUser(email: string, role?: AppRole, department?: string) {
  const id = normalizeEmail(email);
  const data: Record<string, unknown> = { email: id, invitedAt: Date.now() };
  if (role !== undefined) data.role = role;
  if (department !== undefined) data.department = department;
  await setDoc(doc(db, "invites", id), data);
}

export async function deleteInvite(id: string) {
  await deleteDoc(doc(db, "invites", id));
}

/** Looks up a pending invite by email — used when someone signs in for the first time. */
export async function findInviteByEmail(email: string): Promise<Invite | null> {
  const snap = await getDoc(doc(db, "invites", normalizeEmail(email)));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Invite, "id">) };
}