import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Navigation } from "./Navigation";
import { TrendingUp, AlertCircle, CheckCircle2, Clock, X, ChevronRight, Target } from "lucide-react";
import { useAnnualGoals, useMilestones, useProjects, findGoalById, computeGoalProgress } from "../../lib/goals";
import { useTasks } from "../../lib/tasks";
import { useApprovals } from "../../lib/approvals";
import { useAuth } from "../../lib/AuthContext";
import { useMyAppUser } from "../../lib/users";
import { useDepartments } from "../../lib/departments";
import { getTimeOfDayGreeting, getFirstName } from "../../lib/greeting";
import type { QuarterlyMilestone, Quarter } from "../../lib/types";

const MILESTONE_PREVIEW_COUNT = 3;

const statusColor = (status: string) => {
  switch (status) {
    case "On Track":
    case "Complete": return "bg-[#5CB85C] text-white";
    case "At Risk": return "bg-yellow-500 text-white";
    case "Behind": return "bg-red-500 text-white";
    case "Not Started": return "bg-gray-300 text-gray-700";
    default: return "bg-gray-300 text-gray-700";
  }
};

const statusDot = (status: string) => {
  switch (status) {
    case "On Track":
    case "Complete": return "bg-[#5CB85C]";
    case "At Risk": return "bg-yellow-500";
    case "Behind": return "bg-red-500";
    default: return "bg-gray-400";
  }
};

function MilestoneDetailModal({
  milestone,
  goalTitle,
  goalProgress,
  onClose,
}: {
  milestone: QuarterlyMilestone;
  goalTitle?: string;
  goalProgress?: number;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-xl w-full p-7 relative shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3 mb-5">
          <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${statusDot(milestone.status)}`} />
          <div>
            <p className="text-xs text-gray-400 mb-1">{milestone.quarter} Milestone · {milestone.department}</p>
            <h2 className="text-xl text-[#0D1B3E]">{milestone.name}</h2>
          </div>
        </div>

        <span className={`text-xs px-3 py-1 rounded-full ${statusColor(milestone.status)} mb-5 inline-block`}>
          {milestone.status}
        </span>

        <p className="text-gray-600 text-sm leading-relaxed mb-6">{milestone.description}</p>

        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Key Results</p>
          <ul className="space-y-2">
            {milestone.keyResults.map((kr, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-[#5CB85C] flex-shrink-0" />
                {kr}
              </li>
            ))}
          </ul>
        </div>

        {goalTitle && (
          <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
            <Target className="w-4 h-4 text-[#0D1B3E] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Feeds into annual goal</p>
              <p className="text-sm text-[#0D1B3E]">{goalTitle}</p>
              {goalProgress !== undefined && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div className="bg-[#5CB85C] h-1.5 rounded-full" style={{ width: `${goalProgress}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{goalProgress}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4">Due: {milestone.dueDate}</p>
      </div>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { me } = useMyAppUser(user?.uid);
  const { goals: annualGoals, loading: goalsLoading } = useAnnualGoals();
  const { milestones, loading: milestonesLoading } = useMilestones();
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks();
  const { approvals, loading: approvalsLoading } = useApprovals();
  const { departments: realDepartments, loading: deptsLoading } = useDepartments();

  const [activeTab, setActiveTab] = useState<string>("All");
  const appliedDefaultTab = useRef(false);
  const [activeQuarter, setActiveQuarter] = useState<Quarter>("Q2");
  const [selectedMilestone, setSelectedMilestone] = useState<QuarterlyMilestone | null>(null);
  const [showAllMilestones, setShowAllMilestones] = useState(false);

  const departments = ["All", ...realDepartments];
  const quarters: Quarter[] = ["Q1", "Q2", "Q3", "Q4"];

  const loading = goalsLoading || milestonesLoading || projectsLoading || tasksLoading || approvalsLoading || deptsLoading;

  // Soft default: managers/staff land on their own department; CEO/no-role sees all.
  useEffect(() => {
    if (appliedDefaultTab.current) return;
    if (!me || realDepartments.length === 0) return;
    if ((me.role === "Manager" || me.role === "Staff") && me.department && realDepartments.includes(me.department)) {
      setActiveTab(me.department);
    }
    appliedDefaultTab.current = true;
  }, [me, realDepartments]);

  // Real numbers computed from Firestore data, scoped to the active department tab
  const todayStr = new Date().toISOString().slice(0, 10);

  const deptProjects = activeTab === "All" ? projects : projects.filter((p) => p.department === activeTab);
  const deptTasks = activeTab === "All" ? tasks : tasks.filter((t) => t.department === activeTab);
  const deptApprovals = activeTab === "All" ? approvals : approvals.filter((a) => a.department === activeTab);

  const activeProjectsCount = deptProjects.filter((p) => p.status !== "Complete").length;
  const overdueTasksCount = deptTasks.filter((t) => !t.archived && t.status !== "Complete" && t.dueDate < todayStr).length;
  const weeklyCompletionPct = (() => {
    const boardTasks = deptTasks.filter((t) => !t.archived);
    if (boardTasks.length === 0) return 0;
    const done = boardTasks.filter((t) => t.status === "Complete").length;
    return Math.round((done / boardTasks.length) * 100);
  })();

  const pendingApprovalsCount = deptApprovals.filter((a) => a.status === "Pending").length;

  const summaryCards = [
    { label: "Active Projects", value: String(activeProjectsCount), icon: TrendingUp, color: "bg-blue-50 text-blue-600" },
    { label: "Weekly Completion", value: `${weeklyCompletionPct}%`, icon: CheckCircle2, color: "bg-green-50 text-[#5CB85C]" },
    { label: "Pending Approvals", value: String(pendingApprovalsCount), icon: Clock, color: "bg-yellow-50 text-yellow-600" },
    { label: "Overdue Tasks", value: String(overdueTasksCount), icon: AlertCircle, color: "bg-red-50 text-red-600" },
  ];

  const visibleMilestones = milestones.filter((m) => {
    const quarterMatch = m.quarter === activeQuarter;
    const deptMatch = activeTab === "All" || m.department === activeTab;
    return quarterMatch && deptMatch;
  });

  const milestonesToShow = showAllMilestones
    ? visibleMilestones
    : visibleMilestones.slice(0, MILESTONE_PREVIEW_COUNT);

  const selectedGoal = selectedMilestone ? findGoalById(annualGoals, selectedMilestone.annualGoalId) : undefined;

  const visibleGoals = activeTab === "All"
    ? annualGoals
    : annualGoals.filter((g) => (g.department ?? "General") === activeTab);

  function goToMilestoneInStrategy(m: QuarterlyMilestone) {
    navigate(`/strategy?quarter=${m.quarter}&milestoneId=${m.id}`);
  }

  return (
    <div className="min-h-screen bg-gray-50 pl-56">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl text-[#0D1B3E] mb-2">
            {getTimeOfDayGreeting()}, {getFirstName(user?.displayName, user?.email)}
          </h1>
          <p className="text-gray-500 text-sm">Overview of all company projects and progress</p>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <>
            {/* Department Tabs */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => { setActiveTab(dept); setShowAllMilestones(false); }}
                  className={`px-6 py-2 rounded-lg whitespace-nowrap text-sm transition-colors ${
                    activeTab === dept
                      ? "bg-[#0D1B3E] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {summaryCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">{card.label}</span>
                      <div className={`p-2 rounded-lg ${card.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-3xl text-[#0D1B3E]">{card.value}</div>
                  </div>
                );
              })}
            </div>

            {/* Quarterly Milestones — capped preview with "See more" */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl text-[#0D1B3E]">Quarterly Milestones</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Click any milestone for details</p>
                </div>
                <div className="flex gap-2">
                  {quarters.map((q) => (
                    <button
                      key={q}
                      onClick={() => { setActiveQuarter(q); setShowAllMilestones(false); }}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        activeQuarter === q
                          ? "bg-[#0D1B3E] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {milestonesToShow.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {milestonesToShow.map((m) => {
                      const goal = findGoalById(annualGoals, m.annualGoalId);
                      return (
                        <button
                          key={m.id}
                          onClick={() => setSelectedMilestone(m)}
                          className="w-full text-left flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-[#0D1B3E] hover:bg-gray-50 transition-all group"
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusDot(m.status)}`} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className="text-gray-800 text-sm">{m.name}</span>
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{m.department}</span>
                              </div>
                              {goal && (
                                <p className="text-xs text-gray-400 truncate">
                                  Annual goal: {goal.title}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-0.5">Due {m.dueDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                            <span className={`text-xs px-3 py-1 rounded-full ${statusColor(m.status)}`}>
                              {m.status}
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0D1B3E] transition-colors" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {visibleMilestones.length > MILESTONE_PREVIEW_COUNT && !showAllMilestones && (
                    <button
                      onClick={() => setShowAllMilestones(true)}
                      className="mt-4 w-full text-center text-sm text-[#0D1B3E] hover:underline py-2"
                    >
                      See {visibleMilestones.length - MILESTONE_PREVIEW_COUNT} more in {activeQuarter} →
                    </button>
                  )}

                  {visibleMilestones.length > MILESTONE_PREVIEW_COUNT && showAllMilestones && (
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        onClick={() => setShowAllMilestones(false)}
                        className="text-sm text-gray-400 hover:text-[#0D1B3E]"
                      >
                        Show less
                      </button>
                      <button
                        onClick={() => navigate(`/strategy?quarter=${activeQuarter}`)}
                        className="text-sm text-[#0D1B3E] hover:underline"
                      >
                        View all {activeQuarter} milestones in Strategy →
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-gray-400 py-8 text-sm">No milestones for {activeQuarter} {activeTab !== "All" ? `· ${activeTab}` : ""}</p>
              )}
            </div>

            {/* Annual Goals */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-[#0D1B3E]">2026 Annual Goals</h2>
                <span className="text-xs text-gray-400">{visibleGoals.length} goal{visibleGoals.length === 1 ? "" : "s"}</span>
              </div>
              {visibleGoals.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">
                  {activeTab === "All" ? "No annual goals yet." : `No annual goals for ${activeTab} yet.`}
                </p>
              ) : (
                <div className="space-y-6">
                  {visibleGoals.map((goal) => {
                    const pct = computeGoalProgress(goal.id, milestones, tasks, projects);
                    return (
                    <div key={goal.id}>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 text-sm mb-0.5">{goal.title}</p>
                          <p className="text-xs text-gray-400">{goal.owner}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-sm text-gray-500">{pct}%</span>
                          <span className={`text-xs px-3 py-1 rounded-full ${statusColor(goal.status)}`}>
                            {goal.status}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-[#5CB85C] h-2 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {milestones
                          .filter((m) => m.annualGoalId === goal.id)
                          .map((m) => (
                            <button
                              key={m.id}
                              onClick={() => setSelectedMilestone(m)}
                              className="text-xs px-2 py-0.5 rounded bg-gray-50 border border-gray-200 text-gray-500 hover:border-[#0D1B3E] hover:text-[#0D1B3E] transition-colors"
                            >
                              {m.quarter}: {m.name}
                            </button>
                          ))}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {selectedMilestone && (
        <MilestoneDetailModal
          milestone={selectedMilestone}
          goalTitle={selectedGoal?.title}
          goalProgress={selectedGoal?.progress}
          onClose={() => setSelectedMilestone(null)}
        />
      )}
    </div>
  );
}