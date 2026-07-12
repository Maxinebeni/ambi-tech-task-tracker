import { useState } from "react";
import { Navigation } from "./Navigation";
import { FileText, Link as LinkIcon, CheckCircle2, X } from "lucide-react";
import { useApprovals, decideApprovalDoc } from "../../lib/approvals";
import { useAuth } from "../../lib/AuthContext";

const getDepartmentColor = (department: string) => {
  const colors: Record<string, string> = {
    Finance: "bg-purple-100 text-purple-700",
    IT: "bg-blue-100 text-blue-700",
    Marketing: "bg-pink-100 text-pink-700",
    Operations: "bg-orange-100 text-orange-700",
  };
  return colors[department] || "bg-gray-100 text-gray-700";
};

export function Approvals() {
  const { user } = useAuth();
  const { approvals: allApprovals, loading } = useApprovals();
  const approvals = allApprovals.filter((a) => a.status === "Pending" && a.approverId === user?.uid);

  async function handleApprove(id: string) {
    await decideApprovalDoc(id, "Approved");
  }

  async function handleReject(id: string) {
    await decideApprovalDoc(id, "Rejected");
  }

  return (
    <div className="min-h-screen bg-gray-50 pl-56">
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl text-[#0D1B3E] mb-2">Pending Approvals</h1>
          <p className="text-gray-600">Review and approve tasks that were sent to you</p>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <>
            <div className="mb-6 flex items-center gap-2">
              <div className="bg-[#5CB85C] text-white px-4 py-2 rounded-lg">
                {approvals.length} pending for you
              </div>
            </div>

            <div className="space-y-4">
              {approvals.length === 0 ? (
                <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-sm text-center">
                  <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No pending approvals</p>
                  <p className="text-sm text-gray-400 mt-1">All caught up!</p>
                </div>
              ) : (
                approvals.map((approval) => (
                  <div
                    key={approval.id}
                    className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg text-[#0D1B3E]">{approval.taskName}</h3>
                          <span
                            className={`text-xs px-3 py-1 rounded-full ${getDepartmentColor(
                              approval.department
                            )}`}
                          >
                            {approval.department}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#5CB85C] flex items-center justify-center text-white text-xs">
                              {approval.submitter.initials}
                            </div>
                            <span>{approval.submitter.name}</span>
                          </div>
                          <span className="text-gray-400">|</span>
                          <span>Submitted {approval.submittedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        {approval.proofType === "file" ? (
                          <FileText className="w-5 h-5 text-[#0D1B3E]" />
                        ) : (
                          <LinkIcon className="w-5 h-5 text-[#0D1B3E]" />
                        )}
                        <span className="text-sm text-gray-700">Proof of work:</span>
                      </div>
                      {approval.proofUrl ? (
                        <a
                          href={approval.proofUrl}
                          className="text-[#0D1B3E] hover:underline break-all"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {approval.proofName}
                        </a>
                      ) : (
                        <span className="text-gray-700 break-all">{approval.proofName}</span>
                      )}
                      {approval.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-600 italic">"{approval.notes}"</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(approval.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#5CB85C] text-white py-3 px-4 rounded-lg hover:bg-[#4ea54e] transition-colors"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReject(approval.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-red-500 text-red-600 py-3 px-4 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <X className="w-5 h-5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}