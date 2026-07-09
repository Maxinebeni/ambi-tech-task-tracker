import { useState } from "react";
import { Navigation } from "./Navigation";
import { Users, UserPlus, X, Mail } from "lucide-react";
import { useUsers, updateUserRoleDoc, deleteUserDoc } from "../../lib/users";
import { useInvites, inviteUser, deleteInvite } from "../../lib/invites";
import { useDepartments } from "../../lib/departments";
import type { AppRole } from "../../lib/types";

const ROLES: AppRole[] = ["CEO", "Manager", "Staff"];

const roleColor: Record<AppRole, string> = {
  CEO: "bg-[#0D1B3E] text-white",
  Manager: "bg-blue-100 text-blue-700",
  Staff: "bg-gray-100 text-gray-600",
};

function InviteForm({ departments }: { departments: string[] }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole | "">("");
  const [department, setDepartment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await inviteUser(email, role || undefined, department || undefined);
      setEmail("");
      setRole("");
      setDepartment("");
      setSent(true);
      setTimeout(() => setSent(false), 2500);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <UserPlus className="w-4 h-4 text-[#0D1B3E]" />
        <h2 className="text-sm text-[#0D1B3E]">Add a teammate</h2>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        This sets up their role ahead of time. They still need to actually sign into the app themselves
        (with this same email) for their account to be created — there's no way to log in on someone
        else's behalf.
      </p>
      <form onSubmit={handleSubmit} className="flex items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-500 mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0D1B3E]"
          />
        </div>
        <div className="w-32">
          <label className="block text-xs text-gray-500 mb-1.5">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AppRole | "")}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0D1B3E]"
          >
            <option value="">Not set</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="w-36">
          <label className="block text-xs text-gray-500 mb-1.5">Department</label>
          <select
            value={department}
            disabled={role === "CEO"}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#0D1B3E] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Not set</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg bg-[#5CB85C] text-white text-sm hover:bg-[#4ea54e] disabled:opacity-60"
        >
          {submitting ? "Adding..." : sent ? "Added ✓" : "Add"}
        </button>
      </form>
    </div>
  );
}

export function Team() {
  const { users, loading: usersLoading } = useUsers();
  const { invites, loading: invitesLoading } = useInvites();
  const { departments, loading: deptsLoading } = useDepartments();
  const loading = usersLoading || deptsLoading || invitesLoading;

  const invitedEmails = new Set(users.map((u) => u.email.toLowerCase()));
  const pendingInvites = invites.filter((i) => !invitedEmails.has(i.email.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 pl-56">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl text-[#0D1B3E] mb-1">Team</h1>
          <p className="text-gray-500 text-sm">
            Set each person's role and department. This shapes what pages default to showing them —
            it's a convenience setting, not a hard access restriction.
          </p>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <>
            <InviteForm departments={departments} />

            {pendingInvites.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                  Invited, not joined yet
                </h3>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
                  {pendingInvites.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-700">{inv.email}</p>
                          <p className="text-xs text-gray-400">
                            {inv.role ? inv.role : "No role set"}{inv.department ? ` · ${inv.department}` : ""}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteInvite(inv.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors p-1"
                        aria-label="Cancel invite"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {users.length === 0 ? (
              <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-sm text-center">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">No one has signed in yet.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-5 py-3 text-gray-500 font-medium">Person</th>
                      <th className="text-left px-5 py-3 text-gray-500 font-medium w-40">Role</th>
                      <th className="text-left px-5 py-3 text-gray-500 font-medium w-44">Department</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#5CB85C] flex items-center justify-center text-white text-xs flex-shrink-0">
                              {u.name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("")}
                            </div>
                            <div className="min-w-0">
                              <p className="text-gray-800 truncate">{u.name}</p>
                              <p className="text-xs text-gray-400 truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={u.role ?? ""}
                            onChange={(e) => updateUserRoleDoc(u.id, { role: (e.target.value || undefined) as AppRole | undefined })}
                            className={`text-xs px-2.5 py-1.5 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0D1B3E] ${
                              u.role ? roleColor[u.role] : "bg-gray-50 text-gray-400"
                            }`}
                          >
                            <option value="">Not set</option>
                            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={u.department ?? ""}
                            disabled={u.role === "CEO"}
                            onChange={(e) => updateUserRoleDoc(u.id, { department: e.target.value || undefined })}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-600 border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0D1B3E] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">Not set</option>
                            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-4 text-right">
                          <button
                            onClick={() => {
                              if (window.confirm(`Remove ${u.name} from the team directory? This doesn't delete their login — if they sign in again, they'll just show up unconfigured.`)) {
                                deleteUserDoc(u.id);
                              }
                            }}
                            className="text-gray-300 hover:text-red-400 transition-colors p-1"
                            aria-label="Remove from team"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}