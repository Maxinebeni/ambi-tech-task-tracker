import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

const slackDocRef = doc(db, "settings", "slack");

export async function getSlackWebhookUrl(): Promise<string | null> {
  const snap = await getDoc(slackDocRef);
  if (!snap.exists()) return null;
  return (snap.data().webhookUrl as string) || null;
}

export async function setSlackWebhookUrl(url: string) {
  await setDoc(slackDocRef, { webhookUrl: url }, { merge: true });
}

/**
 * Fires a one-way message to Slack via an Incoming Webhook.
 * Uses text/plain content-type to avoid a CORS preflight, which Slack's
 * webhook endpoint doesn't handle from a browser. Silently no-ops if no
 * webhook URL has been configured yet.
 */
export async function sendSlackNotification(text: string) {
  const url = await getSlackWebhookUrl();
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    console.error("Slack notification failed:", err);
  }
}