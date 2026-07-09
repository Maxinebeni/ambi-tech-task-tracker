import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { Navigation } from "./Navigation";
import { Plus, X, Target, ChevronRight, Eye, EyeOff, Trash2, Pencil } from "lucide-react";
import { useAnnualGoals, useMilestones, useProjects, addProjectDoc, updateProjectDoc, deleteProjectDoc, findGoalById, findMilestoneById, computeGoalProgress } from "../../lib/goals";
import { useDepartments } from "../../lib/departments";
import { useTasks } from "../../lib/tasks";
import { useAuth } from "../../lib/AuthContext";
import { useMyAppUser } from "../../lib/users";
import type { Project, ProjectStatus, Quarter } from "../../lib/types";

const QUARTERS: Quarter[] = ["Q1", "Q2", "Q3", "Q4"];

function ProjectDetailModal({
  project,
  departments,
  goals,
  milestones,
  goalTitle,
  goalProgress,
  milestoneLabel,
  milestoneDue,
  onClose,
  onDelete,
  onUpdate,
}: {
  project: Project;
  departments: string[];
  goals: { id: string; title: string }[];
  milestones: { id: string; name: string; annualGoalId: string; quarter: string }[];
  goalTitle?: string;
  goalProgress?: number;
  milestoneLabel?: string;
  milestoneDue?: string;
  onClose: () => void;
  onDelete: () => void;
  onUpdate: (patch: Partial<Omit<Project, "id">>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [department, setDepartment] = useState(project.department);
  const [assigneeName, setAssigneeName] = useState(project.assignee.name);
  const [dueDate, setDueDate] = useState(project.dueDate);
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [quarter, setQuarter] = useState<Quarter>(project.quarter);
  const [annualGoalId, setAnnualGoalId] = useState(project.annualGoalId);
  const [milestoneId, setMilestoneId] = useState(project.milestoneId);
  const [description, setDescription] = useState(project.description);

  const milestonesForGoal = milestones.filter((m) => m.annualGoalId === annualGoalId);

  function initials(fullName: string) {
    return fullName.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
  }

  function selectMilestone(id: string) {
    setMilestoneId(id);
    const m = milestones.find((mi) => mi.id === id);
    if (m) setQuarter(m.quarter as Quarter);
  }

  function startEdit() {
    setName(project.name);
    setDepartment(project.department);
    setAssigneeName(project.assignee.name);
    setDueDate(project.dueDate);
    setStatus(project.status);
    setQuarter(project.quarter);
    setAnnualGoalId(project.annualGoalId);
    setMilestoneId(project.milestoneId);
    setDescription(project.description);
    setEditing(true);
  }

  function saveEdit() {
    onUpdate({
      name: name.trim() || project.name,
      department,
      assignee: { name: assigneeName.trim() || "Unassigned", initials: initials(assigneeName || "Unassigned") },
      dueDate,
      quarter,
      status,
      annualGoalId,
      milestoneId,
      description: description.trim(),
    });
    setEditing(false);
  }

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#0D1B3E]";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-xl w-full p-7 relative shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        {!editing ? (
          <>
            <span className={`text-xs px-3 py-1 rounded-full ${getDepartmentColor(project.department)} mb-3 inline-block`}>
              {project.department}
            </span>
            <h2 className="text-xl text-[#0D1B3E] mb-2">{project.name}</h2>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">{project.description || "No description yet."}</p>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Assignee</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#5CB85C] flex items-center justify-center text-white text-xs">
                    {project.assignee.initials}
                  </div>
                  <span className="text-gray-700">{project.assignee.name}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Due Date</p>
                <p className="text-gray-700">{project.dueDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Strategic Alignment</p>
              {goalTitle && (
                <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                  <Target className="w-4 h-4 text-[#0D1B3E] flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-0.5">Annual Goal</p>
                    <p className="text-sm text-[#0D1B3E] mb-2">{goalTitle}</p>
                    {goalProgress !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div className="bg-[#5CB85C] h-1.5 rounded-full" style={{ width: `${goalProgress}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{goalProgress}%</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {milestoneLabel && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 mb-0.5">Quarterly Milestone</p>
                  <p className="text-sm text-gray-700">{milestoneLabel}</p>
                  {milestoneDue && <p className="text-xs text-gray-400 mt-1">Due {milestoneDue}</p>}
                </div>
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => {
                  if (window.confirm(`Delete "${project.name}"? This can't be undone.`)) {
                    onDelete();
                    onClose();
                  }
                }}
                className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete project
              </button>
              <button
                onClick={startEdit}
                className="flex items-center gap-2 text-sm text-[#0D1B3E] hover:underline"
              >
                <Pencil className="w-4 h-4" />
                Edit project
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl text-[#0D1B3E] mb-5">Edit Project</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Project name</label>
                <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Department</label>
                  <select className={inputClass} value={department} onChange={(e) => setDepartment(e.target.value)}>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Status</label>
                  <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)}>
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Complete">Complete</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Assignee</label>
                  <input className={inputClass} value={assigneeName} onChange={(e) => setAssigneeName(e.target.value)} placeholder="Full name" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Due date</label>
                  <input type="date" className={inputClass} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Quarter</label>
                  <select className={inputClass} value={quarter} onChange={(e) => setQuarter(e.target.value as Quarter)}>
                    {QUARTERS.map((q) => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Annual goal</label>
                  <select
                    className={inputClass}
                    value={annualGoalId}
                    onChange={(e) => { setAnnualGoalId(e.target.value); setMilestoneId(""); }}
                  >
                    <option value="">None</option>
                    {goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Milestone</label>
                <select className={inputClass} value={milestoneId} onChange={(e) => selectMilestone(e.target.value)} disabled={!annualGoalId}>
                  <option value="">None</option>
                  {milestonesForGoal.map((m) => <option key={m.id} value={m.id}>{m.quarter}: {m.name}</option>)}
                </select>
                <p className="text-xs text-gray-400 mt-1">Picking a milestone sets the quarter to match it automatically.</p>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Description</label>
                <textarea className={`${inputClass} resize-none`} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setEditing(false)} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={saveEdit} className="px-4 py-2 rounded-lg bg-[#5CB85C] text-white text-sm hover:bg-[#4ea54e]">
                  Save changes
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NewProjectModal({
  departments,
  goals,
  milestones,
  onClose,
}: {
  departments: string[];
  goals: { id: string; title: string }[];
  milestones: { id: string; name: string; annualGoalId: string; quarter: string }[];
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [department, setDepartment] = useState(departments[0] ?? "");
  const [assigneeName, setAssigneeName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("Not Started");
  const [quarter, setQuarter] = useState<Quarter>("Q1");
  const [annualGoalId, setAnnualGoalId] = useState(goals[0]?.id ?? "");
  const [milestoneId, setMilestoneId] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const milestonesForGoal = milestones.filter((m) => m.annualGoalId === annualGoalId);

  function initials(fullName: string) {
    return fullName.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
  }

  function selectMilestone(id: string) {
    setMilestoneId(id);
    const m = milestones.find((mi) => mi.id === id);
    if (m) setQuarter(m.quarter as Quarter);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !department) return;
    setSubmitting(true);
    try {
      await addProjectDoc({
        name: name.trim(),
        department,
        assignee: { name: assigneeName.trim() || "Unassigned", initials: initials(assigneeName || "Unassigned") },
        dueDate: dueDate || new Date().toISOString().slice(0, 10),
        status,
        quarter,
        annualGoalId,
        milestoneId,
        description: description.trim(),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl max-w-lg w-full p-7 relative shadow-xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl text-[#0D1B3E] mb-2">New Project</h2>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Project name</label>
          <input
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0D1B3E]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0D1B3E]"
            >
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0D1B3E]"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Complete">Complete</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Assignee</label>
            <input
              value={assigneeName}
              onChange={(e) => setAssigneeName(e.target.value)}
              placeholder="Full name"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0D1B3E]"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0D1B3E]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Quarter</label>
            <select
              value={quarter}
              onChange={(e) => setQuarter(e.target.value as Quarter)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0D1B3E]"
            >
              {QUARTERS.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Annual goal</label>
            <select
              value={annualGoalId}
              onChange={(e) => { setAnnualGoalId(e.target.value); setMilestoneId(""); }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0D1B3E]"
            >
              <option value="">None</option>
              {goals.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Milestone</label>
          <select
            value={milestoneId}
            onChange={(e) => selectMilestone(e.target.value)}
            disabled={!annualGoalId}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0D1B3E] disabled:bg-gray-50"
          >
            <option value="">None</option>
            {milestonesForGoal.map((m) => <option key={m.id} value={m.id}>{m.quarter}: {m.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0D1B3E] resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-[#5CB85C] text-white text-sm hover:bg-[#4ea54e] disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Complete": return "bg-[#5CB85C] text-white";
    case "In Progress": return "bg-blue-500 text-white";
    default: return "bg-gray-200 text-gray-600";
  }
};

const getDepartmentColor = (department: string) => {
  const colors: Record<string, string> = {
    Finance: "bg-purple-100 text-purple-700",
    IT: "bg-blue-100 text-blue-700",
    Marketing: "bg-pink-100 text-pink-700",
    Operations: "bg-orange-100 text-orange-700",
  };
  return colors[department] || "bg-gray-100 text-gray-700";
};

export function Projects() {
  const { user } = useAuth();
  const { me } = useMyAppUser(user?.uid);
  const [searchParams] = useSearchParams();
  const { goals: annualGoals, loading: goalsLoading } = useAnnualGoals();
  const { milestones, loading: milestonesLoading } = useMilestones();
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();
  const { departments, loading: deptsLoading } = useDepartments();

  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filterGoal, setFilterGoal] = useState<string>("all");
  const [filterDept, setFilterDept] = useState<string>("All");
  const [filterQuarter, setFilterQuarter] = useState<string>("All");
  const appliedDefaultDept = useRef(false);
  const appliedDeepLink = useRef(false);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showGoalColumn, setShowGoalColumn] = useState(true);
  const [showMilestoneColumn, setShowMilestoneColumn] = useState(true);

  const loading = goalsLoading || milestonesLoading || projectsLoading || deptsLoading || tasksLoading;

  // Arriving from a link elsewhere in the app (e.g. Calendar) that points at one specific project.
  useEffect(() => {
    if (appliedDeepLink.current || loading) return;
    const projectId = searchParams.get("projectId");
    if (projectId) {
      const match = projects.find((p) => p.id === projectId);
      if (match) setSelectedProject(match);
    }
    appliedDeepLink.current = true;
  }, [searchParams, projects, loading]);


  // Soft default: managers/staff land on their own department; CEO/no-role sees all.
  useEffect(() => {
    if (appliedDefaultDept.current) return;
    if (!me || departments.length === 0) return;
    if ((me.role === "Manager" || me.role === "Staff") && me.department && departments.includes(me.department)) {
      setFilterDept(me.department);
    }
    appliedDefaultDept.current = true;
  }, [me, departments]);

  const filtered = projects.filter((p) => {
    const goalMatch = filterGoal === "all" || p.annualGoalId === filterGoal;
    const deptMatch = filterDept === "All" || p.department === filterDept;
    const quarterMatch = filterQuarter === "All" || (filterQuarter === "Unset" ? !p.quarter : p.quarter === filterQuarter);
    return goalMatch && deptMatch && quarterMatch;
  });

  const selectedGoal = selectedProject ? findGoalById(annualGoals, selectedProject.annualGoalId) : undefined;
  const selectedMilestone = selectedProject ? findMilestoneById(milestones, selectedProject.milestoneId) : undefined;

  const visibleColumnCount = 5 + (showGoalColumn ? 1 : 0) + (showMilestoneColumn ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50 pl-56">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl text-[#0D1B3E] mb-1">Projects</h1>
            <p className="text-gray-500 text-sm">Manage all company projects and initiatives</p>
          </div>
          <button
            onClick={() => setShowNewProject(true)}
            className="flex items-center gap-2 bg-[#5CB85C] text-white px-5 py-2.5 rounded-lg hover:bg-[#4ea54e] transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs text-gray-400 mr-1">Department:</span>
              {["All", ...departments].map((d) => (
                <button
                  key={d}
                  onClick={() => setFilterDept(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    filterDept === d
                      ? "bg-[#0D1B3E] text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs text-gray-400 mr-1">Quarter:</span>
              {["All", ...QUARTERS].map((q) => (
                <button
                  key={q}
                  onClick={() => setFilterQuarter(q)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    filterQuarter === q
                      ? "bg-[#0D1B3E] text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {q}
                </button>
              ))}
              {projects.some((p) => !p.quarter) && (
                <button
                  onClick={() => setFilterQuarter("Unset")}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    filterQuarter === "Unset"
                      ? "bg-orange-500 text-white"
                      : "bg-orange-50 text-orange-500 hover:bg-orange-100"
                  }`}
                >
                  No quarter set
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400 mr-1">Filter by goal:</span>
                <button
                  onClick={() => setFilterGoal("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                    filterGoal === "all"
                      ? "bg-[#0D1B3E] text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  All
                </button>
                {annualGoals.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setFilterGoal(g.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors max-w-[180px] truncate ${
                      filterGoal === g.id
                        ? "bg-[#0D1B3E] text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                    title={g.title}
                  >
                    {g.title}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {viewType === "list" && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowGoalColumn((v) => !v)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                        showGoalColumn ? "border-[#0D1B3E] text-[#0D1B3E] bg-blue-50" : "border-gray-200 text-gray-400"
                      }`}
                    >
                      {showGoalColumn ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      Annual Goal
                    </button>
                    <button
                      onClick={() => setShowMilestoneColumn((v) => !v)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                        showMilestoneColumn ? "border-[#0D1B3E] text-[#0D1B3E] bg-blue-50" : "border-gray-200 text-gray-400"
                      }`}
                    >
                      {showMilestoneColumn ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      Milestone
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setViewType("grid")}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      viewType === "grid"
                        ? "bg-[#0D1B3E] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewType("list")}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      viewType === "list"
                        ? "bg-[#0D1B3E] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-400 text-sm">
                No projects yet. Click "New Project" to create one.
              </div>
            ) : viewType === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((project) => {
                  const goal = findGoalById(annualGoals, project.annualGoalId);
                  const milestone = findMilestoneById(milestones, project.milestoneId);
                  return (
                    <div key={project.id} className="relative group">
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="w-full bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-[#0D1B3E] transition-all text-left"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs px-2.5 py-1 rounded-full ${getDepartmentColor(project.department)}`}>
                              {project.department}
                            </span>
                            <span className={`text-xs px-2.5 py-1 rounded-full ${project.quarter ? "bg-gray-100 text-gray-600" : "bg-orange-50 text-orange-500"}`}>
                              {project.quarter || "No quarter set"}
                            </span>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </div>

                        <h3 className="text-[#0D1B3E] mb-3">{project.name}</h3>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-7 h-7 rounded-full bg-[#5CB85C] flex items-center justify-center text-white text-xs">
                            {project.assignee.initials}
                          </div>
                          <span className="text-sm text-gray-600">{project.assignee.name}</span>
                        </div>

                        <p className="text-xs text-gray-400 mb-4">Due {project.dueDate}</p>

                        <div className="border-t border-gray-100 pt-3 space-y-1.5">
                          {goal && (
                            <div className="flex items-start gap-1.5">
                              <Target className="w-3.5 h-3.5 text-[#0D1B3E] flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-[#0D1B3E] leading-tight">{goal.title}</p>
                            </div>
                          )}
                          {milestone && (
                            <p className="text-xs text-gray-400 pl-5">{milestone.quarter}: {milestone.name}</p>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-end">
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0D1B3E] transition-colors" />
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete "${project.name}"? This can't be undone.`)) {
                            deleteProjectDoc(project.id);
                          }
                        }}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 bg-white/90 rounded-lg p-1.5 text-gray-400 hover:text-red-500 transition-all shadow-sm"
                        aria-label="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-5 py-3 text-gray-500 font-medium">Project</th>
                      <th className="text-left px-5 py-3 text-gray-500 font-medium">Dept</th>
                      <th className="text-left px-5 py-3 text-gray-500 font-medium">Qtr</th>
                      <th className="text-left px-5 py-3 text-gray-500 font-medium">Assignee</th>
                      <th className="text-left px-5 py-3 text-gray-500 font-medium">Due</th>
                      <th className="text-left px-5 py-3 text-gray-500 font-medium">Status</th>
                      {showGoalColumn && <th className="text-left px-5 py-3 text-gray-500 font-medium">Annual Goal</th>}
                      {showMilestoneColumn && <th className="text-left px-5 py-3 text-gray-500 font-medium">Milestone</th>}
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((project) => {
                      const goal = findGoalById(annualGoals, project.annualGoalId);
                      const milestone = findMilestoneById(milestones, project.milestoneId);
                      return (
                        <tr
                          key={project.id}
                          className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedProject(project)}
                        >
                          <td className="px-5 py-4 text-[#0D1B3E]">{project.name}</td>
                          <td className="px-5 py-4">
                            <span className={`text-xs px-2.5 py-1 rounded-full ${getDepartmentColor(project.department)}`}>
                              {project.department}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs px-2.5 py-1 rounded-full ${project.quarter ? "bg-gray-100 text-gray-600" : "bg-orange-50 text-orange-500"}`}>
                              {project.quarter || "No quarter set"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#5CB85C] flex items-center justify-center text-white text-xs">
                                {project.assignee.initials}
                              </div>
                              <span className="text-gray-700">{project.assignee.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-gray-500">{project.dueDate}</td>
                          <td className="px-5 py-4">
                            <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                          </td>
                          {showGoalColumn && (
                            <td className="px-5 py-4">
                              {goal && (
                                <div className="flex items-center gap-1.5 max-w-[200px]">
                                  <Target className="w-3.5 h-3.5 text-[#0D1B3E] flex-shrink-0" />
                                  <span className="text-xs text-[#0D1B3E] truncate">{goal.title}</span>
                                </div>
                              )}
                            </td>
                          )}
                          {showMilestoneColumn && (
                            <td className="px-5 py-4">
                              {milestone && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                  {milestone.quarter}: {milestone.name}
                                </span>
                              )}
                            </td>
                          )}
                          <td className="px-2 py-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Delete "${project.name}"? This can't be undone.`)) {
                                  deleteProjectDoc(project.id);
                                }
                              }}
                              className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded"
                              aria-label="Delete project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          departments={departments}
          goals={annualGoals.map((g) => ({ id: g.id, title: g.title }))}
          milestones={milestones.map((m) => ({ id: m.id, name: m.name, annualGoalId: m.annualGoalId, quarter: m.quarter }))}
          goalTitle={selectedGoal?.title}
          goalProgress={selectedGoal ? computeGoalProgress(selectedGoal.id, milestones, tasks, projects) : undefined}
          milestoneLabel={selectedMilestone ? `${selectedMilestone.quarter}: ${selectedMilestone.name}` : undefined}
          milestoneDue={selectedMilestone?.dueDate}
          onClose={() => setSelectedProject(null)}
          onDelete={() => deleteProjectDoc(selectedProject.id)}
          onUpdate={(patch) => updateProjectDoc(selectedProject.id, patch)}
        />
      )}

      {showNewProject && (
        <NewProjectModal
          departments={departments}
          goals={annualGoals.map((g) => ({ id: g.id, title: g.title }))}
          milestones={milestones.map((m) => ({ id: m.id, name: m.name, annualGoalId: m.annualGoalId, quarter: m.quarter }))}
          onClose={() => setShowNewProject(false)}
        />
      )}
    </div>
  );
}