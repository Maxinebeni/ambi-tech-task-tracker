import { useEffect, useState } from "react";
import { collection, doc, getDoc, setDoc, deleteDoc, deleteField, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import type { AppUser } from "./types";
import type { User as FirebaseUser } from "firebase/auth";
import { findInviteByEmail } from "./invites";

const usersCol = collection(db, "users");

/** Call this whenever someone signs in, so the app builds a real user directory over time. */
export async function upsertCurrentUserDoc(user: FirebaseUser) {
  const name = user.displayName || user.email || "Unnamed user";
  const userRef = doc(db, "users", user.uid);

  const existing = await getDoc(userRef);
  const alreadyHasRole = existing.exists() && !!existing.data()?.role;

  // First time this person signs in and an admin pre-assigned them a role via an
  // invite (matched by email), adopt it. Never overwrites a role that was already
  // set — either from a previous login or a manual edit on the Team page.
  let inviteRole: AppUser["role"] | undefined;
  let inviteDepartment: string | undefined;
  if (!alreadyHasRole && user.email) {
    const invite = await findInviteByEmail(user.email).catch(() => null);
    if (invite) {
      inviteRole = invite.role;
      inviteDepartment = invite.department;
    }
  }

  await setDoc(
    userRef,
    {
      name,
      email: user.email || "",
      photoURL: user.photoURL || null,
      updatedAt: Date.now(),
      ...(inviteRole ? { role: inviteRole } : {}),
      ...(inviteDepartment ? { department: inviteDepartment } : {}),
    },
    { merge: true }
  );
}

export function useUsers() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(usersCol, orderBy("name", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setUsers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AppUser, "id">) })));
        setLoading(false);
      },
      (err) => { console.error("useUsers error:", err); setLoading(false); }
    );
    return unsub;
  }, []);

  return { users, loading };
}

/** Convenience hook: finds the signed-in user's own directory record (with role/department). */
export function useMyAppUser(userId: string | undefined) {
  const { users, loading } = useUsers();
  const me = users.find((u) => u.id === userId);
  return { me, loading };
}

export async function updateUserRoleDoc(uid: string, patch: { role?: AppUser["role"]; department?: string }) {
  const data: Record<string, unknown> = {};
  if ("role" in patch) data.role = patch.role === undefined ? deleteField() : patch.role;
  if ("department" in patch) data.department = patch.department === undefined ? deleteField() : patch.department;
  await setDoc(doc(db, "users", uid), data, { merge: true });
}

/**
 * Removes someone from the app's team directory only — this does NOT delete their
 * actual Firebase Auth login. If they sign in again afterward, they'll simply
 * reappear here as a fresh, unconfigured entry.
 */
export async function deleteUserDoc(uid: string) {
  await deleteDoc(doc(db, "users", uid));
}