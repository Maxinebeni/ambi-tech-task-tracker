import { useMemo, useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Navigation } from "./Navigation";
import { Plus, Trash2, AlertTriangle, X, User, Clock, Target, History } from "lucide-react";
import { TaskCompletionModal } from "./TaskCompletionModal";
import { useTasks, addTaskDoc, updateTaskDoc, deleteTaskDoc } from "../../lib/tasks";
import { useDepartments } from "../../lib/departments";
import { useMilestones } from "../../lib/goals";
import { usePersonalTasks, addPersonalTaskDoc, updatePersonalTaskDoc, deletePersonalTaskDoc } from "../../lib/personalTasks";
import { useAuth } from "../../lib/AuthContext";
import { useMyAppUser } from "../../lib/users";
import { getCurrentWeekStart, formatWeekLabel } from "../../lib/week";
import type { Task, TaskStatus, Priority } from "../../lib/types";

function PersonalTasks() {
  const { user } = useAuth();
  const { tasks, loading } = usePersonalTasks(user?.uid);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function addPersonalTask() {
    if (!user) return;
    await addPersonalTaskDoc({
      userId: user.uid,
      name: "New personal task",
      dueDate: new Date().toISOString().slice(0, 10),
      done: false,
    });
  }

  async function toggleDone(id: string, current: boolean) {
    await updatePersonalTaskDoc(id, { done: !current });
  }

  async function updateName(id: string, name: string) {
    if (!name.trim()) return;
    await updatePersonalTaskDoc(id, { name: name.trim() });
  }

  async function updateDate(id: string, dueDate: string) {
    await updatePersonalTaskDoc(id, { dueDate });
  }

  async function deleteTask(id: string) {
    await deletePersonalTaskDoc(id);
  }

  const active = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-4 h-4 text-gray-400" />
        <h2 className="text-base text-[#0D1B3E]">Personal Tasks</h2>
        <span className="text-xs text-gray-400">— just for you, not linked to company goals</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-gray-400 text-sm px-4 py-6">Loading...</p>
        ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="w-10 px-4 py-3" />
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Task</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium w-36">Due Date</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {active.map((task) => (
              <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() => toggleDone(task.id, task.done)}
                    className="w-4 h-4 accent-[#5CB85C] cursor-pointer"
                  />
                </td>
                <td className="px-4 py-3">
                  {editingId === task.id ? (
                    <input
                      autoFocus
                      className="w-full border border-[#0D1B3E] rounded px-2 py-1 text-gray-800 focus:outline-none"
                      defaultValue={task.name}
                      onBlur={(e) => { updateName(task.id, e.target.value); setEditingId(null); }}
                      onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                    />
                  ) : (
                    <span
                      className="cursor-text text-gray-700 hover:underline decoration-dashed underline-offset-2"
                      onClick={() => setEditingId(task.id)}
                    >
                      {task.name}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <input
                    type="date"
                    value={task.dueDate}
                    onChange={(e) => updateDate(task.id, e.target.value)}
                    className="border border-gray-200 rounded px-2 py-1 text-gray-600 text-sm focus:outline-none focus:border-[#0D1B3E] cursor-pointer"
                  />
                </td>
                <td className="px-2 py-3 text-right">
                  <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-400 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}

            <tr>
              <td colSpan={4} className="px-4 py-2 border-t border-gray-100">
                <button
                  onClick={addPersonalTask}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#0D1B3E] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add personal task
                </button>
              </td>
            </tr>

            {done.length > 0 && (
              <>
                <tr>
                  <td colSpan={4} className="px-4 pt-5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Done</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{done.length}</span>
                      <div className="flex-1 border-t border-gray-100" />
                    </div>
                  </td>
                </tr>
                {done.map((task) => (
                  <tr key={task.id} className="border-b border-gray-100 opacity-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked onChange={() => toggleDone(task.id, task.done)} className="w-4 h-4 accent-[#5CB85C] cursor-pointer" />
                    </td>
                    <td className="px-4 py-3 line-through text-gray-400">{task.name}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{task.dueDate}</td>
                    <td className="px-2 py-3 text-right">
                      <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-400 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}

const priorityColors: Record<Priority, string> = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-blue-100 text-blue-700",
};

const statusColors: Record<TaskStatus, string> = {
  Complete: "bg-green-100 text-green-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Pending: "bg-orange-100 text-orange-700",
  "Not Started": "bg-gray-100 text-gray-600",
};

const statusOptions: TaskStatus[] = ["Not Started", "In Progress", "Pending", "Complete"];

export function MyWeek() {
  const { user } = useAuth();
  const { me } = useMyAppUser(user?.uid);
  const [searchParams] = useSearchParams();
  const { tasks, loading: tasksLoading } = useTasks();
  const { departments, loading: deptsLoading, addDepartment: addDeptDoc, removeDepartment: removeDeptDoc } = useDepartments();
  const { milestones, loading: milestonesLoading } = useMilestones();

  const linkedDept = searchParams.get("department");
  const [activeTab, setActiveTab] = useState(linkedDept || "All");
  const appliedDefaultTab = useRef(!!linkedDept); // an explicit link wins over the soft role default

  // Soft default: managers/staff land on their own department first; CEOs (or anyone
  // without a role set yet) see everything. Skipped entirely if arriving via a direct
  // link to a specific department (e.g. from Calendar). Still fully switchable.
  useEffect(() => {
    if (appliedDefaultTab.current) return;
    if (!me || departments.length === 0) return;
    if ((me.role === "Manager" || me.role === "Staff") && me.department && departments.includes(me.department)) {
      setActiveTab(me.department);
    }
    appliedDefaultTab.current = true;
  }, [me, departments]);

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completingTask, setCompletingTask] = useState<Task | null>(null);
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof Task } | null>(null);
  const [addingDept, setAddingDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const newDeptInputRef = useRef<HTMLInputElement>(null);
  const [viewingWeek, setViewingWeek] = useState<string | null>(null); // null = current week

  const currentWeekStart = getCurrentWeekStart();
  const todayStr = new Date().toISOString().slice(0, 10);
  const effectiveWeek = viewingWeek ?? currentWeekStart;
  const isPastWeek = viewingWeek !== null;

  // Distinct earlier weeks that have tasks, most recent first — a lightweight
  // way to look back before the full archive/completion-% view is built.
  const pastWeeks = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.weekOf && t.weekOf < currentWeekStart) set.add(t.weekOf);
    });
    return Array.from(set).sort((a, b) => (a < b ? 1 : -1));
  }, [tasks, currentWeekStart]);

  // Only this week's tasks on the board (or a past week's, if browsing history)
  const boardTasks = tasks.filter((t) => !t.archived && t.weekOf === effectiveWeek);

  const allTabs = ["All", ...departments];
  const filteredTasks = (
    activeTab === "All" ? boardTasks : boardTasks.filter((t) => t.department === activeTab)
  ).slice().sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));
  const activeTasks = filteredTasks.filter((t) => t.status !== "Complete");
  const completedTasks = filteredTasks.filter((t) => t.status === "Complete");

  // Per-department completion stats for the week being viewed
  const deptStats = (activeTab === "All" ? departments : [activeTab]).map((dept) => {
    const deptTasks = boardTasks.filter((t) => t.department === dept);
    const done = deptTasks.filter((t) => t.status === "Complete").length;
    const pct = deptTasks.length ? Math.round((done / deptTasks.length) * 100) : 0;
    return { dept, total: deptTasks.length, done, pct };
  });

  function isOverdue(task: Task) {
    return task.status !== "Complete" && task.dueDate < todayStr;
  }

  function milestonesForDept(dept: string) {
    return milestones.filter((m) => m.department === dept);
  }

  function milestoneLabel(milestoneId: string | null) {
    if (!milestoneId) return null;
    const m = milestones.find((mi) => mi.id === milestoneId);
    return m ? `${m.quarter}: ${m.name}` : null;
  }

  async function addDepartment() {
    const name = newDeptName.trim();
    setAddingDept(false);
    setNewDeptName("");
    if (!name) return;
    await addDeptDoc(name);
    setActiveTab(name);
  }

  async function removeDepartment(dept: string) {
    await removeDeptDoc(dept);
    if (activeTab === dept) setActiveTab("All");
  }

  async function addTask() {
    const department = activeTab === "All" ? departments[0] ?? "General" : activeTab;
    await addTaskDoc({
      name: "New task",
      startDate: todayStr,
      dueDate: todayStr,
      status: "Not Started",
      priority: "Medium",
      assignee: "",
      department,
      weekOf: currentWeekStart,
      completedAt: null,
      archived: false,
      milestoneId: null,
      comments: "",
    });
  }

  async function updateTask(id: string, field: keyof Task, value: string) {
    if (field === "status") {
      const newStatus = value as TaskStatus;
      await updateTaskDoc(id, {
        status: newStatus,
        completedAt: newStatus === "Complete" ? Date.now() : null,
      });
      if (newStatus === "Complete") {
        const task = tasks.find((t) => t.id === id);
        if (task) {
          setCompletingTask(task);
          setShowCompletionModal(true);
        }
      }
      return;
    }
    if (field === "milestoneId") {
      await updateTaskDoc(id, { milestoneId: value || null });
      return;
    }
    await updateTaskDoc(id, { [field]: value } as Partial<Task>);
  }

  async function deleteTask(id: string) {
    await deleteTaskDoc(id);
  }

  function isEditing(id: string, field: keyof Task) {
    return editingCell?.id === id && editingCell.field === field;
  }

  const loading = tasksLoading || deptsLoading || milestonesLoading;

  function renderTaskRow(task: Task, idx: number, completed: boolean) {
    const linkedLabel = milestoneLabel(task.milestoneId);
    const deptMilestones = milestonesForDept(task.department);

    return (
      <tr
        key={task.id}
        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
          !completed && isOverdue(task) ? "bg-red-50/40" : ""
        } ${completed ? "opacity-60" : ""}`}
      >
        <td className="px-4 py-3 text-gray-400">{idx + 1}</td>

        <td className="px-4 py-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {!completed && !isPastWeek && isEditing(task.id, "name") ? (
                <input
                  autoFocus
                  className="w-full border border-[#0D1B3E] rounded px-2 py-1 text-gray-800 focus:outline-none"
                  defaultValue={task.name}
                  onBlur={(e) => { updateTask(task.id, "name", e.target.value); setEditingCell(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                />
              ) : (
                <span
                  className={`${completed ? "line-through text-gray-400" : "text-gray-800"} ${
                    !isPastWeek ? "cursor-text hover:underline decoration-dashed underline-offset-2" : ""
                  }`}
                  onClick={() => !completed && !isPastWeek && setEditingCell({ id: task.id, field: "name" })}
                >
                  {task.name}
                </span>
              )}
              {!completed && isOverdue(task) && (
                <span className="flex items-center gap-0.5 text-xs text-red-600 bg-red-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                  <AlertTriangle className="w-3 h-3" />
                  Overdue
                </span>
              )}
              {!completed && task.status === "Pending" && (
                <span className="flex items-center gap-0.5 text-xs text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded whitespace-nowrap" title="Halted — waiting on a third party">
                  <Clock className="w-3 h-3" />
                  Waiting
                </span>
              )}
            </div>

            {/* Lightweight link to the broader goal this task feeds — no full milestone list, just this one tag */}
            {isPastWeek || completed ? (
              linkedLabel && (
                <span className="flex items-center gap-1 text-xs text-gray-400 w-fit">
                  <Target className="w-3 h-3" />
                  {linkedLabel}
                </span>
              )
            ) : (
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3 text-gray-300 flex-shrink-0" />
                <select
                  className="text-xs bg-transparent text-gray-400 border-0 focus:outline-none cursor-pointer max-w-[220px]"
                  value={task.milestoneId ?? ""}
                  onChange={(e) => updateTask(task.id, "milestoneId", e.target.value)}
                >
                  <option value="">Not linked to a goal</option>
                  {deptMilestones.map((m) => (
                    <option key={m.id} value={m.id}>{m.quarter}: {m.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </td>

        <td className="px-4 py-3">
          <input
            type="date"
            disabled={isPastWeek}
            className="border border-gray-200 rounded px-2 py-1 text-gray-700 text-sm focus:outline-none focus:border-[#0D1B3E] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            value={task.startDate}
            onChange={(e) => updateTask(task.id, "startDate", e.target.value)}
          />
        </td>

        <td className="px-4 py-3">
          <input
            type="date"
            disabled={isPastWeek}
            className="border border-gray-200 rounded px-2 py-1 text-gray-700 text-sm focus:outline-none focus:border-[#0D1B3E] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            value={task.dueDate}
            onChange={(e) => updateTask(task.id, "dueDate", e.target.value)}
          />
        </td>

        <td className="px-4 py-3">
          {!completed && !isPastWeek && isEditing(task.id, "comments") ? (
            <input
              autoFocus
              className="w-full border border-[#0D1B3E] rounded px-2 py-1 text-gray-800 focus:outline-none text-sm"
              defaultValue={task.comments}
              placeholder="Add a comment..."
              onBlur={(e) => { updateTask(task.id, "comments", e.target.value); setEditingCell(null); }}
              onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
            />
          ) : (
            <span
              className={`text-sm ${completed ? "text-gray-400" : "text-gray-600"} ${!isPastWeek && !completed ? "cursor-text hover:underline decoration-dashed underline-offset-2" : ""}`}
              onClick={() => !completed && !isPastWeek && setEditingCell({ id: task.id, field: "comments" })}
            >
              {task.comments || <span className="text-gray-400 italic">Add a comment...</span>}
            </span>
          )}
        </td>

        <td className="px-4 py-3">
          <select
            disabled={isPastWeek}
            className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0D1B3E] disabled:cursor-not-allowed ${priorityColors[task.priority]}`}
            value={task.priority}
            onChange={(e) => updateTask(task.id, "priority", e.target.value as Priority)}
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </td>

        <td className="px-4 py-3">
          <select
            disabled={isPastWeek}
            className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0D1B3E] disabled:cursor-not-allowed ${statusColors[task.status]}`}
            value={task.status}
            onChange={(e) => updateTask(task.id, "status", e.target.value)}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s === "Pending" ? "Pending (3rd party)" : s}</option>
            ))}
          </select>
        </td>

        <td className="px-4 py-3">
          <select
            disabled={isPastWeek}
            className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0D1B3E] disabled:cursor-not-allowed"
            value={task.department}
            onChange={(e) => updateTask(task.id, "department", e.target.value)}
          >
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </td>

        <td className="px-2 py-3 text-right">
          {!isPastWeek && (
            <button
              onClick={() => deleteTask(task.id)}
              className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded"
              aria-label="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </td>
      </tr>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pl-56">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl text-[#0D1B3E] mb-1">My Week</h1>
            <p className="text-gray-500 text-sm">
              {isPastWeek ? "Viewing an earlier week" : "Week of"} {formatWeekLabel(effectiveWeek)}
            </p>
          </div>

          {(pastWeeks.length > 0 || isPastWeek) && (
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-gray-400" />
              <select
                value={viewingWeek ?? ""}
                onChange={(e) => setViewingWeek(e.target.value || null)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#0D1B3E] cursor-pointer bg-white"
              >
                <option value="">This week ({formatWeekLabel(currentWeekStart)})</option>
                {pastWeeks.map((w) => (
                  <option key={w} value={w}>{formatWeekLabel(w)}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {isPastWeek && (
          <div className="mb-4 text-xs bg-blue-50 text-[#0D1B3E] px-4 py-2 rounded-lg">
            You're viewing a past week — read-only. Tasks here are kept for reference; use the selector above to get back to this week.
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <>
            {/* Department Tabs */}
            <div className="mb-6 flex items-center gap-2 flex-wrap">
              {allTabs.map((dept) => (
                <div key={dept} className="relative group flex items-center">
                  <button
                    onClick={() => setActiveTab(dept)}
                    className={`px-5 py-2 rounded-lg text-sm transition-colors ${
                      dept !== "All" ? "pr-7" : ""
                    } ${
                      activeTab === dept
                        ? "bg-[#0D1B3E] text-white"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {dept}
                  </button>

                  {dept !== "All" && !isPastWeek && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeDepartment(dept); }}
                      className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center transition-opacity ${
                        activeTab === dept
                          ? "text-white/70 hover:text-white opacity-0 group-hover:opacity-100"
                          : "text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
                      }`}
                      title={`Remove ${dept}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}

              {!isPastWeek && (
                addingDept ? (
                  <div className="flex items-center gap-1">
                    <input
                      ref={newDeptInputRef}
                      autoFocus
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addDepartment();
                        if (e.key === "Escape") { setAddingDept(false); setNewDeptName(""); }
                      }}
                      placeholder="Department name"
                      className="px-3 py-2 rounded-lg border border-[#0D1B3E] text-sm text-gray-800 focus:outline-none w-40"
                    />
                    <button onClick={addDepartment} className="px-3 py-2 rounded-lg bg-[#5CB85C] text-white text-sm hover:bg-green-600 transition-colors">
                      Add
                    </button>
                    <button onClick={() => { setAddingDept(false); setNewDeptName(""); }} className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-gray-500 text-sm hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingDept(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-dashed border-gray-300 text-gray-400 text-sm hover:border-[#0D1B3E] hover:text-[#0D1B3E] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add department
                  </button>
                )
              )}
            </div>

            {/* Department completion rate strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {deptStats.map(({ dept, total, done, pct }) => (
                <button
                  key={dept}
                  onClick={() => setActiveTab(dept)}
                  className={`bg-white rounded-xl border p-4 text-left transition-all hover:shadow-sm ${
                    activeTab === dept ? "border-[#0D1B3E]" : "border-gray-200"
                  }`}
                >
                  <p className="text-xs text-gray-400 mb-1">{dept}</p>
                  <p className="text-2xl text-[#0D1B3E] leading-none mb-2">{pct}<span className="text-sm text-gray-400">%</span></p>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        pct >= 60 ? "bg-[#5CB85C]" : pct >= 30 ? "bg-yellow-400" : "bg-red-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">{done}/{total} tasks done</p>
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-4 py-3 text-gray-600 font-medium w-8">#</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium">Task</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium w-32">Start Date</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium w-32">Due Date</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium w-44">Comments</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium w-28">Priority</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium w-36">Status</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium w-28">Dept</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {activeTasks.map((task, idx) => renderTaskRow(task, idx, false))}

                    {activeTasks.length === 0 && completedTasks.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-gray-400 text-sm">
                          {isPastWeek ? "No tasks recorded for this week" : "No tasks for this department this week"}
                        </td>
                      </tr>
                    )}

                    {!isPastWeek && (
                      <tr>
                        <td colSpan={9} className="px-4 py-2 border-t border-gray-100">
                          <button
                            onClick={addTask}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#0D1B3E] transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Add task
                          </button>
                        </td>
                      </tr>
                    )}

                    {completedTasks.length > 0 && (
                      <>
                        <tr>
                          <td colSpan={9} className="px-4 pt-6 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Completed</span>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{completedTasks.length}</span>
                              <div className="flex-1 border-t border-gray-100" />
                            </div>
                          </td>
                        </tr>
                        {completedTasks.map((task, idx) => renderTaskRow(task, idx, true))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {!isPastWeek && <PersonalTasks />}

            <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
              <span>Click any cell to edit inline</span>
              <span>·</span>
              <span>The small target icon links a task to a quarterly goal</span>
            </div>
          </>
        )}
      </div>

      {showCompletionModal && completingTask && (
        <TaskCompletionModal
          taskId={completingTask.id}
          taskName={completingTask.name}
          department={completingTask.department}
          onClose={() => { setShowCompletionModal(false); setCompletingTask(null); }}
        />
      )}
    </div>
  );
}