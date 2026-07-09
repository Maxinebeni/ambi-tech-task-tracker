import { useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const DEFAULT_DEPARTMENTS = ["Finance", "Operations", "Marketing", "IT"];
const deptDocRef = doc(db, "settings", "departments");

export function useDepartments() {
  const [departments, setDepartments] = useState<string[]>(DEFAULT_DEPARTMENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      deptDocRef,
      (snap) => {
        if (snap.exists()) {
          setDepartments((snap.data().names as string[]) ?? DEFAULT_DEPARTMENTS);
        } else {
          // First run — seed the doc so future reads/writes have something to merge into.
          setDoc(deptDocRef, { names: DEFAULT_DEPARTMENTS }).catch((err) =>
            console.error("Failed to seed departments doc:", err)
          );
        }
        setLoading(false);
      },
      (err) => {
        console.error("useDepartments subscription error:", err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  async function addDepartment(name: string) {
    if (!name.trim() || departments.includes(name)) return;
    await setDoc(deptDocRef, { names: [...departments, name] });
  }

  async function removeDepartment(name: string) {
    await setDoc(deptDocRef, { names: departments.filter((d) => d !== name) });
  }

  return { departments, loading, addDepartment, removeDepartment };
}