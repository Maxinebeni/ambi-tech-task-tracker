import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Navigation } from "./Navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTasks } from "../../lib/tasks";
import { useProjects } from "../../lib/goals";
import { useDepartments } from "../../lib/departments";
import { useAuth } from "../../lib/AuthContext";
import { useMyAppUser } from "../../lib/users";

type View = "My tasks" | "Company-wide";

interface CalendarEvent {
  id: string;
  refId: string; // raw task or project id, for navigating to it
  title: string;
  date: Date;
  department: string;
  type: "project" | "task";
  assignee: string;
}

const PALETTE = ["bg-purple-500", "bg-blue-500", "bg-pink-500", "bg-orange-500", "bg-teal-500", "bg-indigo-500", "bg-rose-500"];

function parseDueDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (iso) {
    const [, y, m, d] = iso;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function Calendar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { me } = useMyAppUser(user?.uid);
  const { tasks, loading: tasksLoading } = useTasks();
  const { projects, loading: projectsLoading } = useProjects();
  const { departments, loading: deptsLoading } = useDepartments();

  const [currentView, setCurrentView] = useState<View>("Company-wide");
  const [filterDept, setFilterDept] = useState<string>("All");
  const appliedDefaultDept = useRef(false);
  const today = useMemo(() => new Date(), []);

  function goToEvent(event: CalendarEvent) {
    if (event.type === "project") {
      navigate(`/projects?projectId=${event.refId}`);
    } else {
      navigate(`/my-week?department=${encodeURIComponent(event.department)}`);
    }
  }
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const loading = tasksLoading || projectsLoading || deptsLoading;

  // Soft default: managers/staff land on their own department; CEO/no-role sees all.
  useEffect(() => {
    if (appliedDefaultDept.current) return;
    if (!me || departments.length === 0) return;
    if ((me.role === "Manager" || me.role === "Staff") && me.department && departments.includes(me.department)) {
      setFilterDept(me.department);
    }
    appliedDefaultDept.current = true;
  }, [me, departments]);

  const departmentColor = useMemo(() => {
    const map: Record<string, string> = {};
    departments.forEach((d, i) => { map[d] = PALETTE[i % PALETTE.length]; });
    return map;
  }, [departments]);

  function getDepartmentColor(department: string) {
    return departmentColor[department] || "bg-gray-500";
  }

  // Best-effort "is this mine" check: match on display name or email prefix.
  const myIdentifiers = useMemo(() => {
    const ids: string[] = [];
    if (user?.displayName) ids.push(user.displayName.toLowerCase());
    if (user?.email) ids.push(user.email.split("@")[0].toLowerCase());
    return ids;
  }, [user]);

  function isMine(assignee: string) {
    if (!assignee) return false;
    const a = assignee.toLowerCase();
    return myIdentifiers.some((id) => a.includes(id) || id.includes(a));
  }

  const allEvents: CalendarEvent[] = useMemo(() => {
    const taskEvents: CalendarEvent[] = tasks
      .filter((t) => !t.archived)
      .map((t): CalendarEvent | null => {
        const date = parseDueDate(t.dueDate);
        return date ? { id: `task-${t.id}`, refId: t.id, title: t.name, date, department: t.department, type: "task", assignee: t.assignee } : null;
      })
      .filter((e): e is CalendarEvent => e !== null);

    const projectEvents: CalendarEvent[] = projects
      .map((p): CalendarEvent | null => {
        const date = parseDueDate(p.dueDate);
        return date ? { id: `project-${p.id}`, refId: p.id, title: p.name, date, department: p.department, type: "project", assignee: p.assignee.name } : null;
      })
      .filter((e): e is CalendarEvent => e !== null);

    return [...taskEvents, ...projectEvents];
  }, [tasks, projects]);

  const visibleEvents = (currentView === "My tasks" ? allEvents.filter((e) => isMine(e.assignee)) : allEvents)
    .filter((e) => filterDept === "All" || e.department === filterDept);

  function getEventsForDay(day: number) {
    const target = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return visibleEvents.filter((e) => sameDay(e.date, target));
  }

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay(); // 0 = Sunday
  const totalCells = Math.ceil((daysInMonth + startDay) / 7) * 7;
  const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  function goToPrevMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  function goToNextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }
  function goToToday() {
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  const upcoming = visibleEvents
    .filter((e) => e.date >= new Date(today.getFullYear(), today.getMonth(), today.getDate()))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 pl-56">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl text-[#0D1B3E] mb-2">Calendar</h1>
          <p className="text-gray-600">View all project deadlines and task schedules</p>
        </div>

        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView("My tasks")}
              className={`px-6 py-2 rounded-lg transition-colors ${
                currentView === "My tasks"
                  ? "bg-[#0D1B3E] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              My tasks
            </button>
            <button
              onClick={() => setCurrentView("Company-wide")}
              className={`px-6 py-2 rounded-lg transition-colors ${
                currentView === "Company-wide"
                  ? "bg-[#0D1B3E] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              Company-wide
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={goToPrevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Previous month">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={goToToday} className="text-lg text-[#0D1B3E] min-w-[160px] text-center hover:underline">
              {monthLabel}
            </button>
            <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Next month">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2 flex-wrap">
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

        {currentView === "My tasks" && myIdentifiers.length === 0 && (
          <p className="mb-4 text-xs text-gray-400">
            Set a display name on your account to match tasks assigned to you — showing all for now.
          </p>
        )}

        {/* Legend */}
        <div className="mb-6 flex flex-wrap gap-4 text-sm">
          {departments.map((dept) => (
            <div key={dept} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${getDepartmentColor(dept)}`} />
              <span className="text-gray-600">{dept}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <>
            {/* Calendar Grid */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="grid grid-cols-7 border-b border-gray-200">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="py-3 text-center text-sm text-gray-600 bg-gray-50">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {Array.from({ length: totalCells }, (_, i) => {
                  const dayNumber = i - startDay + 1;
                  const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
                  const dayEvents = isValidDay ? getEventsForDay(dayNumber) : [];
                  const isToday = isValidDay && sameDay(new Date(viewDate.getFullYear(), viewDate.getMonth(), dayNumber), today);

                  return (
                    <div
                      key={i}
                      className={`min-h-[120px] border-b border-r border-gray-200 p-2 ${
                        !isValidDay ? "bg-gray-50" : "bg-white hover:bg-gray-50"
                      } ${isToday ? "bg-blue-50" : ""}`}
                    >
                      {isValidDay && (
                        <>
                          <div
                            className={`text-sm mb-2 ${
                              isToday
                                ? "w-6 h-6 bg-[#0D1B3E] text-white rounded-full flex items-center justify-center"
                                : "text-gray-700"
                            }`}
                          >
                            {dayNumber}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 3).map((event) => (
                              <button
                                key={event.id}
                                onClick={() => goToEvent(event)}
                                className={`w-full text-left text-xs p-1 rounded text-white truncate hover:opacity-80 transition-opacity ${getDepartmentColor(event.department)}`}
                                title={`${event.title} — click to open`}
                              >
                                {event.title}
                              </button>
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-xs text-gray-500 pl-1">
                                +{dayEvents.length - 3} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl text-[#0D1B3E] mb-4">Upcoming Deadlines</h3>
              {upcoming.length === 0 ? (
                <p className="text-sm text-gray-400">Nothing upcoming.</p>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => goToEvent(event)}
                      className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-[#0D1B3E] transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-1 h-12 rounded ${getDepartmentColor(event.department)}`} />
                        <div>
                          <p className="text-gray-800">{event.title}</p>
                          <p className="text-sm text-gray-500">
                            {event.department} • {event.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {event.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}