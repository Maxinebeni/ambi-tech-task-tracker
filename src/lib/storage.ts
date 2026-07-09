import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

/** Uploads a proof-of-work file and returns its public download URL. */
export async function uploadApprovalFile(file: File, taskId: string): Promise<string> {
  const safeName = file.name.replace(/[^\w.\-]/g, "_");
  const path = `approval-proofs/${taskId}-${Date.now()}-${safeName}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}