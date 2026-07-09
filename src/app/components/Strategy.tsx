import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { Navigation } from "./Navigation";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Target,
  Flag,
  X,
  ListChecks,
} from "lucide-react";
import {
  useAnnualGoals,
  useMilestones,
  useProjects,
  addGoalDoc,
  updateGoalDoc,
  deleteGoalDoc,
  addMilestoneDoc,
  updateMilestoneDoc,
  deleteMilestoneDoc,
  computeGoalProgress,
  isMilestoneBlocked,
} from "../../lib/goals";
import { useDepartments } from "../../lib/departments";
import { useTasks } from "../../lib/tasks";
import { useAuth } from "../../lib/AuthContext";
import { useMyAppUser } from "../../lib/users";
import type { AnnualGoal, QuarterlyMilestone, Project, Task, GoalStatus, MilestoneStatus, Quarter } from "../../lib/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const goalStatusColor: Record<GoalStatus, string> = {
  "On Track": "bg-green-100 text-green-700",
  "At Risk": "bg-yellow-100 text-yellow-700",
  Behind: "bg-red-100 text-red-700",
  Complete: "bg-[#5CB85C] text-white",
};

const milestoneStatusColor: Record<MilestoneStatus, string> = {
  "Not Started": "bg-gray-100 text-gray-500",
  "On Track": "bg-green-100 text-green-700",
  "At Risk": "bg-yellow-100 text-yellow-700",
  Behind: "bg-red-100 text-red-700",
  Complete: "bg-[#5CB85C] text-white",
};

const quarterLabel: Record<Quarter, string> = { Q1: "Jan–Mar", Q2: "Apr–Jun", Q3: "Jul–Sep", Q4: "Oct–Dec" };
const QUARTERS: Quarter[] = ["Q1", "Q2", "Q3", "Q4"];

function departmentColor(dept: string) {
  const colors: Record<string, string> = {
    Finance: "bg-purple-100 text-purple-700",
    IT: "bg-blue-100 text-blue-700",
    Marketing: "bg-pink-100 text-pink-700",
    Operations: "bg-orange-100 text-orange-700",
  };
  return colors[dept] || "bg-gray-100 text-gray-600";
}

// ─── Small inline editable field ─────────────────────────────────────────────

function InlineText({
  value,
  onSave,
  className = "",
  placeholder = "Click to edit",
  multiline = false,
}: {
  value: string;
  onSave: (v: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function commit() {
    onSave(draft.trim());
    setEditing(false);
  }

  if (editing) {
    if (multiline) {
      return (
        <textarea
          autoFocus
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          className={`w-full border border-[#0D1B3E] rounded px-2 py-1 text-sm resize-none focus:outline-none ${className}`}
        />
      );
    }
    return (
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        className={`border border-[#0D1B3E] rounded px-2 py-1 text-sm focus:outline-none w-full ${className}`}
      />
    );
  }

  return (
    <span
      onClick={(e) => { e.stopPropagation(); setDraft(value); setEditing(true); }}
      className={`cursor-text hover:underline decoration-dashed underline-offset-2 ${!value ? "italic text-gray-400" : ""} ${className}`}
    >
      {value || placeholder}
    </span>
  );
}

function ProgressBar({ pct, thin = false }: { pct: number; thin?: boolean }) {
  const h = thin ? "h-1.5" : "h-2";
  const color = pct >= 60 ? "bg-[#5CB85C]" : pct >= 30 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className={`w-full bg-gray-100 rounded-full ${h}`}>
      <div className={`${h} rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Milestone card (the old "quarterly goal" level, now flat & Firestore-backed) ─

function MilestoneCard({
  milestone,
  tasks,
  projects,
  departments,
  linkedTaskCount,
  autoExpand,
  onChange,
  onDelete,
}: {
  milestone: QuarterlyMilestone;
  tasks: Task[];
  projects: Project[];
  departments: string[];
  linkedTaskCount: number;
  autoExpand: boolean;
  onChange: (patch: Partial<QuarterlyMilestone>) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(autoExpand);
  const [newKeyResult, setNewKeyResult] = useState("");

  const linkedTasks = tasks.filter((t) => t.milestoneId === milestone.id && !t.archived);
  const linkedProjects = projects.filter((p) => p.milestoneId === milestone.id);
  const incompleteTasks = linkedTasks.filter((t) => t.status !== "Complete");
  const incompleteProjects = linkedProjects.filter((p) => p.status !== "Complete");
  const canComplete = incompleteTasks.length === 0 && incompleteProjects.length === 0;

  // Self-heal: if this milestone's status says Complete but it's actually still blocked
  // (e.g. it was marked Complete before this rule existed, or a task got reopened after),
  // correct the stored status rather than let the UI show something that isn't true.
  useEffect(() => {
    if (milestone.status === "Complete" && !canComplete) {
      onChange({ status: "On Track" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestone.status, canComplete]);

  function handleStatusChange(value: string) {
    if (value === "Complete" && !canComplete) {
      const parts: string[] = [];
      if (incompleteTasks.length > 0) parts.push(`${incompleteTasks.length} task${incompleteTasks.length === 1 ? "" : "s"}`);
      if (incompleteProjects.length > 0) parts.push(`${incompleteProjects.length} project${incompleteProjects.length === 1 ? "" : "s"}`);
      window.alert(`"${milestone.name}" still has ${parts.join(" and ")} not marked Complete yet — finish those first.`);
      return;
    }
    onChange({ status: value as MilestoneStatus });
  }

  function addKeyResult() {
    const v = newKeyResult.trim();
    if (!v) return;
    onChange({ keyResults: [...milestone.keyResults, v] });
    setNewKeyResult("");
  }

  function removeKeyResult(idx: number) {
    onChange({ keyResults: milestone.keyResults.filter((_, i) => i !== idx) });
  }

  return (
    <div className="group border border-gray-200 rounded-xl overflow-hidden bg-white">
      <div
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-[#0D1B3E]/8 flex flex-col items-center justify-center">
          <span className="text-[10px] font-bold text-[#0D1B3E] leading-none">{milestone.quarter}</span>
          <span className="text-[8px] text-gray-400 leading-none">{quarterLabel[milestone.quarter]}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <InlineText
              value={milestone.name}
              onSave={(v) => onChange({ name: v || milestone.name })}
              className="text-sm text-[#0D1B3E]"
              placeholder="Milestone name"
            />
            <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${departmentColor(milestone.department)}`}>
              {milestone.department}
            </span>
          </div>
          {linkedTaskCount > 0 && (
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <ListChecks className="w-3 h-3" />
              {linkedTaskCount} task{linkedTaskCount === 1 ? "" : "s"} linked
            </p>
          )}
          {!canComplete && (
            <p className="text-xs text-orange-500 mt-0.5">
              Blocked from completing: {[
                incompleteTasks.length > 0 ? `${incompleteTasks.length} task${incompleteTasks.length === 1 ? "" : "s"}` : null,
                incompleteProjects.length > 0 ? `${incompleteProjects.length} project${incompleteProjects.length === 1 ? "" : "s"}` : null,
              ].filter(Boolean).join(", ")} still open
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
          <select
            value={milestone.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`text-xs px-2.5 py-1 rounded-full border-0 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0D1B3E] ${milestoneStatusColor[milestone.status]}`}
          >
            {(["Not Started", "On Track", "At Risk", "Behind", "Complete"] as MilestoneStatus[]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={onDelete}
            className="text-gray-300 hover:text-red-400 transition-colors p-1 opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setExpanded((v) => !v)}>
            {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 bg-gray-50/50 space-y-4">
          <div className="flex items-center gap-6 flex-wrap text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-gray-400" />
              <InlineText value={milestone.owner ?? ""} onSave={(v) => onChange({ owner: v })} className="text-xs" placeholder="Owner" />
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-gray-400">Due</span>
              <input
                type="date"
                value={milestone.dueDate}
                onChange={(e) => onChange({ dueDate: e.target.value })}
                className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 focus:outline-none focus:border-[#0D1B3E] cursor-pointer"
              />
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-gray-400">Dept</span>
              <select
                value={milestone.department}
                onChange={(e) => onChange({ department: e.target.value })}
                className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 focus:outline-none focus:border-[#0D1B3E] cursor-pointer bg-white"
              >
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </span>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1.5">Description</p>
            <InlineText
              value={milestone.description}
              onSave={(v) => onChange({ description: v })}
              className="text-sm text-gray-700"
              placeholder="What does this milestone cover?"
              multiline
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Key Results</p>
            <div className="space-y-1 mb-2">
              {milestone.keyResults.length === 0 && (
                <p className="text-xs text-gray-400 italic">No key results yet</p>
              )}
              {milestone.keyResults.map((kr, i) => (
                <div key={i} className="flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5CB85C] flex-shrink-0" />
                  <InlineText
                    value={kr}
                    onSave={(v) => {
                      const next = [...milestone.keyResults];
                      if (v) next[i] = v; else next.splice(i, 1);
                      onChange({ keyResults: next });
                    }}
                    className="text-sm text-gray-700 flex-1"
                  />
                  <button
                    onClick={() => removeKeyResult(i)}
                    className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={newKeyResult}
                onChange={(e) => setNewKeyResult(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addKeyResult()}
                placeholder="Add a key result..."
                className="flex-1 text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#0D1B3E]"
              />
              <button onClick={addKeyResult} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Annual Goal card ─────────────────────────────────────────────────────────

function AnnualGoalCard({
  goal,
  milestones,
  allMilestones,
  tasks,
  projects,
  departments,
  taskCounts,
  highlightMilestoneId,
  defaultExpanded,
  onChangeGoal,
  onDeleteGoal,
  onAddMilestone,
  onChangeMilestone,
  onDeleteMilestone,
}: {
  goal: AnnualGoal;
  milestones: QuarterlyMilestone[];
  allMilestones: QuarterlyMilestone[];
  tasks: Task[];
  projects: Project[];
  departments: string[];
  taskCounts: Record<string, number>;
  highlightMilestoneId: string | null;
  defaultExpanded: boolean;
  onChangeGoal: (patch: Partial<AnnualGoal>) => void;
  onDeleteGoal: () => void;
  onAddMilestone: (quarter: Quarter) => void;
  onChangeMilestone: (id: string, patch: Partial<QuarterlyMilestone>) => void;
  onDeleteMilestone: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [addingMilestone, setAddingMilestone] = useState(false);
  const computedProgress = computeGoalProgress(goal.id, allMilestones, tasks, projects);
  const canCompleteGoal = allMilestones.length > 0 && computedProgress === 100;

  function handleGoalStatusChange(value: string) {
    if (value === "Complete" && !canCompleteGoal) {
      window.alert(
        allMilestones.length === 0
          ? `"${goal.title}" has no milestones yet — add at least one and complete it before marking the goal Complete.`
          : `"${goal.title}" is only ${computedProgress}% done — every milestone under it needs to be Complete first.`
      );
      return;
    }
    onChangeGoal({ status: value as GoalStatus });
  }

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div
        className="flex items-start gap-4 px-6 py-5 cursor-pointer hover:bg-gray-50/60 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <span onClick={(e) => e.stopPropagation()}>
              <select
                value={goal.department ?? "General"}
                onChange={(e) => onChangeGoal({ department: e.target.value })}
                className={`text-xs px-2.5 py-1 rounded-full border-0 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0D1B3E] ${departmentColor(goal.department ?? "General")}`}
              >
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                <option value="General">General</option>
              </select>
            </span>
            <InlineText
              value={goal.title}
              onSave={(v) => onChangeGoal({ title: v || goal.title })}
              className="text-lg text-[#0D1B3E]"
              placeholder="Annual goal title"
            />
          </div>

          <div onClick={(e) => e.stopPropagation()} className="mb-3">
            <InlineText
              value={goal.description}
              onSave={(v) => onChangeGoal({ description: v })}
              className="text-sm text-gray-500 leading-relaxed"
              placeholder="What is this goal about?"
              multiline
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3" onClick={(e) => e.stopPropagation()}>
            <Flag className="w-3.5 h-3.5 text-gray-400" />
            <InlineText value={goal.owner} onSave={(v) => onChangeGoal({ owner: v })} className="text-xs" placeholder="Owner" />
          </div>

          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <ProgressBar pct={computedProgress} />
            <span className="text-sm text-gray-600 w-10 text-right flex-shrink-0">{computedProgress}%</span>
            <select
              value={goal.status}
              onChange={(e) => handleGoalStatusChange(e.target.value)}
              className={`text-xs px-2.5 py-0.5 rounded-full flex-shrink-0 border-0 cursor-pointer focus:outline-none ${goalStatusColor[goal.status]}`}
            >
              {(["On Track", "At Risk", "Behind", "Complete"] as GoalStatus[]).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {!canCompleteGoal && (
            <p className="text-xs text-gray-400 mt-1.5">
              {allMilestones.length === 0
                ? "Add a milestone to start tracking progress"
                : `${computedProgress}% — complete every milestone to finish this goal`}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 mt-1">
          <button
            onClick={(e) => { e.stopPropagation(); onDeleteGoal(); }}
            className="text-gray-300 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {expanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-6 py-5 space-y-3">
          {milestones.length === 0 && (
            <p className="text-sm text-gray-400 italic">No milestones yet — add one below</p>
          )}

          {milestones.map((m) => (
            <MilestoneCard
              key={m.id}
              milestone={m}
              tasks={tasks}
              projects={projects}
              departments={departments}
              linkedTaskCount={taskCounts[m.id] ?? 0}
              autoExpand={m.id === highlightMilestoneId}
              onChange={(patch) => onChangeMilestone(m.id, patch)}
              onDelete={() => onDeleteMilestone(m.id)}
            />
          ))}

          {addingMilestone ? (
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <span className="text-xs text-gray-400 mr-1">Which quarter?</span>
              {QUARTERS.map((q) => (
                <button
                  key={q}
                  onClick={() => { onAddMilestone(q); setAddingMilestone(false); }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-[#0D1B3E] hover:text-[#0D1B3E] transition-colors"
                >
                  {q}
                </button>
              ))}
              <button
                onClick={() => setAddingMilestone(false)}
                className="text-xs px-2 py-1.5 text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingMilestone(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-[#0D1B3E] hover:text-[#0D1B3E] transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add milestone
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Add Annual Goal modal ────────────────────────────────────────────────────

function AddGoalModal({ departments, onAdd, onClose }: { departments: string[]; onAdd: (g: Omit<AnnualGoal, "id" | "createdAt">) => void; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [department, setDepartment] = useState(departments[0] ?? "General");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), description: description.trim(), owner: owner.trim(), department, progress: 0, status: "On Track" });
    onClose();
  }

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#0D1B3E] transition-colors";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full p-7 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-[#0D1B3E]">New Annual Goal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Goal Title *</label>
            <input className={inputClass} placeholder="e.g. Increase revenue by 30%" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Description</label>
            <textarea className={`${inputClass} resize-none`} rows={2} placeholder="Brief context or motivation…" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Owner</label>
              <input className={inputClass} placeholder="Name" value={owner} onChange={(e) => setOwner(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Department</label>
              <select className={inputClass} value={department} onChange={(e) => setDepartment(e.target.value)}>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                <option value="General">General</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-[#0D1B3E] text-white py-3 rounded-lg hover:bg-[#1a2d5f] transition-colors text-sm mt-2">
            Add Annual Goal
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Strategy page ───────────────────────────────────────────────────────

export function Strategy() {
  const { user } = useAuth();
  const { me } = useMyAppUser(user?.uid);
  const { goals, loading: goalsLoading } = useAnnualGoals();
  const { milestones, loading: milestonesLoading } = useMilestones();
  const { projects, loading: projectsLoading } = useProjects();
  const { departments, loading: deptsLoading } = useDepartments();
  const { tasks, loading: tasksLoading } = useTasks();
  const [searchParams] = useSearchParams();

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterDept, setFilterDept] = useState<string>("All");
  const [filterQuarter, setFilterQuarter] = useState<string>(searchParams.get("quarter") || "All");
  const appliedDefaultDept = useRef(false);

  const highlightMilestoneId = searchParams.get("milestoneId");
  const loading = goalsLoading || milestonesLoading || projectsLoading || deptsLoading || tasksLoading;

  // Soft default: managers/staff land on their own department; CEO/no-role sees all.
  useEffect(() => {
    if (appliedDefaultDept.current) return;
    if (!me || departments.length === 0) return;
    if (!searchParams.get("quarter") && (me.role === "Manager" || me.role === "Staff") && me.department && departments.includes(me.department)) {
      setFilterDept(me.department);
    }
    appliedDefaultDept.current = true;
  }, [me, departments, searchParams]);


  const taskCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    if (t.milestoneId) taskCounts[t.milestoneId] = (taskCounts[t.milestoneId] ?? 0) + 1;
  });

  const filteredGoals = goals.filter((g) => filterDept === "All" || (g.department ?? "General") === filterDept);

  const totalMilestones = milestones.filter((m) => filteredGoals.some((g) => g.id === m.annualGoalId));
  const doneMilestones = totalMilestones.filter((m) => m.status === "Complete" && !isMilestoneBlocked(m.id, tasks, projects)).length;
  const overallPct = totalMilestones.length ? Math.round((doneMilestones / totalMilestones.length) * 100) : 0;

  async function handleAddMilestone(goal: AnnualGoal, quarter: Quarter) {
    await addMilestoneDoc({
      name: "New milestone",
      quarter,
      department: goal.department ?? departments[0] ?? "General",
      dueDate: "",
      status: "Not Started",
      annualGoalId: goal.id,
      description: "",
      keyResults: [],
      linkedProjectIds: [],
      owner: goal.owner,
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 pl-56">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl text-[#0D1B3E] mb-1">Strategy</h1>
            <p className="text-gray-500 text-sm">Annual goals → quarterly milestones</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#5CB85C] text-white px-5 py-2.5 rounded-lg hover:bg-[#4ea54e] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Goal
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-8 text-sm">
                  <div className="text-center">
                    <p className="text-2xl text-[#0D1B3E]">{filteredGoals.length}</p>
                    <p className="text-xs text-gray-400">Annual Goals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl text-[#0D1B3E]">{doneMilestones}<span className="text-base text-gray-400">/{totalMilestones.length}</span></p>
                    <p className="text-xs text-gray-400">Milestones Done</p>
                  </div>
                  <div className="text-center min-w-[80px]">
                    <p className="text-2xl text-[#0D1B3E]">{overallPct}%</p>
                    <p className="text-xs text-gray-400">Overall Progress</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100 flex-wrap">
                <span className="text-xs text-gray-400 mr-1">Department:</span>
                {["All", ...departments].map((d) => (
                  <button
                    key={d}
                    onClick={() => setFilterDept(d)}
                    className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                      filterDept === d ? "bg-[#0D1B3E] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="text-xs text-gray-400 mr-1">Quarter:</span>
                {["All", ...QUARTERS].map((q) => (
                  <button
                    key={q}
                    onClick={() => setFilterQuarter(q)}
                    className={`px-3 py-1 rounded-lg text-xs transition-colors ${
                      filterQuarter === q ? "bg-[#0D1B3E] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {filteredGoals.length > 0 && (
                <div className="mt-4">
                  <ProgressBar pct={overallPct} />
                </div>
              )}
            </div>

            <div className="space-y-5">
              {filteredGoals.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <Target className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                  <p className="text-sm">
                    {filterDept !== "All" ? `No ${filterDept} goals yet` : "No annual goals yet"}
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 text-sm text-[#0D1B3E] underline underline-offset-2 hover:no-underline"
                  >
                    Add your first annual goal
                  </button>
                </div>
              )}

              {filteredGoals.map((goal) => {
                const goalMilestones = milestones.filter(
                  (m) => m.annualGoalId === goal.id && (filterQuarter === "All" || m.quarter === filterQuarter)
                );
                return (
                  <AnnualGoalCard
                    key={goal.id}
                    goal={goal}
                    milestones={goalMilestones}
                    allMilestones={milestones.filter((m) => m.annualGoalId === goal.id)}
                    tasks={tasks}
                    projects={projects}
                    departments={departments}
                    taskCounts={taskCounts}
                    highlightMilestoneId={highlightMilestoneId}
                    defaultExpanded={goal.id === goals[0]?.id || goalMilestones.some((m) => m.id === highlightMilestoneId)}
                    onChangeGoal={(patch) => updateGoalDoc(goal.id, patch)}
                    onDeleteGoal={() => {
                      if (window.confirm(`Delete "${goal.title}" and all its milestones? This can't be undone.`)) {
                        deleteGoalDoc(goal.id);
                        goalMilestones.forEach((m) => deleteMilestoneDoc(m.id));
                      }
                    }}
                    onAddMilestone={(quarter) => handleAddMilestone(goal, quarter)}
                    onChangeMilestone={(id, patch) => updateMilestoneDoc(id, patch)}
                    onDeleteMilestone={(id) => {
                      if (window.confirm("Delete this milestone? This can't be undone.")) {
                        deleteMilestoneDoc(id);
                      }
                    }}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      {showAddModal && (
        <AddGoalModal
          departments={departments}
          onAdd={(g) => addGoalDoc(g)}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}