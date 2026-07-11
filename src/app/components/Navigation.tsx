import { Link, useLocation, useNavigate } from "react-router";
import { LogoFull } from "./Logo";
import { LayoutDashboard, FolderKanban, Calendar, CheckSquare, Bell, Compass, LogOut, Users } from "lucide-react";
import { useAuth } from "../../lib/AuthContext";

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/strategy", label: "Strategy", icon: Compass },
    { path: "/projects", label: "Projects", icon: FolderKanban },
    { path: "/my-week", label: "My Week", icon: CheckSquare },
    { path: "/calendar", label: "Calendar", icon: Calendar },
    { path: "/approvals", label: "Approvals", icon: Bell },
    { path: "/team", label: "Team", icon: Users },
  ];

  const displayName = user?.displayName || user?.email || "Signed in";
  const initials = getInitials(user?.displayName, user?.email);

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-56 bg-white border-r border-gray-200 flex flex-col z-30">
      {/* Brand */}
      <Link to="/dashboard" className="flex items-center px-5 py-5 border-b border-gray-100">
        <LogoFull height={32} />
      </Link>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                isActive
                  ? "bg-[#0D1B3E] text-white"
                  : "text-gray-600 hover:bg-[#1D6B78]/[0.06] hover:text-[#1D6B78]"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-[#8ED3DB]" />
              )}
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User at bottom */}
      <div className="px-5 py-4 border-t border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#5CB85C] flex items-center justify-center text-white text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-[#0D1B3E] truncate">{displayName}</p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          title="Sign out"
          className="text-gray-400 hover:text-[#0D1B3E] transition-colors flex-shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
  }
  if (email) return email[0]?.toUpperCase() ?? "?";
  return "?";
}