import { useState } from "react";
import { X, Link as LinkIcon, CheckCircle, CheckCheck } from "lucide-react";
import { addApprovalDoc } from "../../lib/approvals";
import { sendSlackNotification } from "../../lib/slack";
import { useUsers } from "../../lib/users";
import { useAuth } from "../../lib/AuthContext";

interface TaskCompletionModalProps {
  taskId: string;
  taskName: string;
  department: string;
  onClose: () => void;
}

type Mode = "choose" | "review" | "done";

function initialsOf(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export function TaskCompletionModal({ taskId: _taskId, taskName, department, onClose }: TaskCompletionModalProps) {
  const { user } = useAuth();
  const { users } = useUsers();

  const [mode, setMode] = useState<Mode>("choose");
  const [link, setLink] = useState("");
  const [notes, setNotes] = useState("");
  const [approverId, setApproverId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const otherUsers = users.filter((u) => u.id !== user?.uid);

  function handleMarkComplete() {
    setMode("done");
    setTimeout(onClose, 1500);
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!approverId) {
      setError("Pick who should review this.");
      return;
    }
    if (!link.trim()) {
      setError("Paste a link to your proof of work.");
      return;
    }

    const approver = users.find((u) => u.id === approverId);
    const submitterName = user?.displayName || user?.email || "Someone";

    setSubmitting(true);
    try {
      await addApprovalDoc({
        taskName,
        submitter: { name: submitterName, initials: initialsOf(submitterName) },
        submittedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        department,
        proofType: "link",
        proofName: link.trim(),
        proofUrl: link.trim(),
        notes: notes.trim() || undefined,
        approverId,
        approverName: approver?.name || "Unknown",
      });

      sendSlackNotification(
        `:white_check_mark: *${submitterName}* submitted *"${taskName}"* for review by *${approver?.name || "someone"}*.`
      );

      setMode("done");
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error("Failed to submit for review:", err);
      setError("Something went wrong submitting this — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        {mode === "choose" && (
          <>
            <h2 className="text-2xl text-[#0D1B3E] mb-1">Complete Task</h2>
            <p className="text-gray-500 text-sm mb-6">"{taskName}" — how would you like to mark this done?</p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleMarkComplete}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-[#5CB85C] hover:bg-green-50 transition-all group text-center"
              >
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <CheckCheck className="w-6 h-6 text-[#5CB85C]" />
                </div>
                <div>
                  <p className="text-[#0D1B3E] font-medium text-sm">Mark Complete</p>
                  <p className="text-gray-400 text-xs mt-0.5">No proof needed</p>
                </div>
              </button>

              <button
                onClick={() => setMode("review")}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-[#0D1B3E] hover:bg-blue-50 transition-all group text-center"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <LinkIcon className="w-6 h-6 text-[#0D1B3E]" />
                </div>
                <div>
                  <p className="text-[#0D1B3E] font-medium text-sm">Submit for Review</p>
                  <p className="text-gray-400 text-xs mt-0.5">Attach a link to your work</p>
                </div>
              </button>
            </div>
          </>
        )}

        {mode === "review" && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <button onClick={() => setMode("choose")} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
            </div>
            <h2 className="text-2xl text-[#0D1B3E] mb-1">Submit for Review</h2>
            <p className="text-gray-500 text-sm mb-6">Link to proof of work for "{taskName}"</p>

            <form onSubmit={handleSubmitReview} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm mb-2 text-gray-700">Send to</label>
                <select
                  required
                  value={approverId}
                  onChange={(e) => setApproverId(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0D1B3E] focus:border-transparent text-sm"
                >
                  <option value="">Choose a reviewer...</option>
                  {otherUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}{u.email ? ` (${u.email})` : ""}</option>
                  ))}
                </select>
                {otherUsers.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    No other teammates have signed in yet — once they do, they'll show up here.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Link to proof of work</label>
                <input
                  type="url"
                  required
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://docs.google.com/... or a Drive link"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0D1B3E] focus:border-transparent text-sm"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  File upload isn't set up yet — for now, share a Google Drive, Docs, or similar link.
                </p>
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-700">Notes (optional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any comments or context..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0D1B3E] focus:border-transparent resize-none text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#5CB85C] text-white py-3 px-4 rounded-lg hover:bg-[#4ea54e] transition-colors disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit for Review"}
              </button>
            </form>
          </>
        )}

        {mode === "done" && (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-[#5CB85C]" />
            </div>
            <h3 className="text-xl text-[#0D1B3E] mb-2">Task Completed!</h3>
            <p className="text-gray-500 text-sm">Well done.</p>
          </div>
        )}
      </div>
    </div>
  );
}