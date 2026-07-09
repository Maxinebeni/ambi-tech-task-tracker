import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../../lib/AuthContext";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}