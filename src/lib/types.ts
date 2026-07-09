export type TaskStatus = "Not Started" | "In Progress" | "Pending" | "Complete";
export type Priority = "High" | "Medium" | "Low";

export interface Task {
  id: string;
  name: string;
  startDate: string; // "YYYY-MM-DD"
  dueDate: string; // "YYYY-MM-DD"
  status: TaskStatus;
  priority: Priority;
  assignee: string;
  department: string;
  weekOf: string; // "YYYY-MM-DD" — Monday of the week this task belongs to
  completedAt: number | null; // ms timestamp, set when status becomes "Complete"
  archived: boolean; // true once swept into a weekly archive
  milestoneId: string | null; // optional link to a QuarterlyMilestone this task feeds into
  comments: string;
  createdAt?: number;
}

export type GoalStatus = "On Track" | "At Risk" | "Behind" | "Complete";
export type MilestoneStatus = "Complete" | "On Track" | "At Risk" | "Behind" | "Not Started";
export type Quarter = "Q1" | "Q2" | "Q3" | "Q4";
export type ProjectStatus = "Not Started" | "In Progress" | "Complete";

export interface AnnualGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: GoalStatus;
  owner: string;
  department?: string;
  createdAt?: number;
}

export interface QuarterlyMilestone {
  id: string;
  name: string;
  quarter: Quarter;
  department: string;
  dueDate: string;
  status: MilestoneStatus;
  annualGoalId: string;
  description: string;
  keyResults: string[];
  linkedProjectIds: string[];
  owner?: string;
  createdAt?: number;
}

export interface Project {
  id: string;
  name: string;
  department: string;
  assignee: { name: string; initials: string };
  dueDate: string;
  status: ProjectStatus;
  quarter: Quarter;
  annualGoalId: string;
  milestoneId: string;
  description: string;
  createdAt?: number;
}

export type ApprovalStatus = "Pending" | "Approved" | "Rejected";
export type ProofType = "file" | "link";

export interface Approval {
  id: string;
  taskName: string;
  submitter: { name: string; initials: string };
  submittedDate: string;
  department: string;
  proofType: ProofType;
  proofName: string;
  proofUrl?: string;
  notes?: string;
  status: ApprovalStatus;
  approverId: string;
  approverName: string;
  createdAt?: number;
  decidedAt?: number | null;
}

export type AppRole = "CEO" | "Manager" | "Staff";

export interface AppUser {
  id: string; // Firebase Auth uid
  name: string;
  email: string;
  photoURL?: string | null;
  role?: AppRole;
  department?: string; // relevant when role === "Manager" or "Staff"
  updatedAt?: number;
}

export interface PersonalTask {
  id: string;
  userId: string; // Firebase Auth uid of the owner — private to them
  name: string;
  dueDate: string;
  done: boolean;
  createdAt?: number;
}

export interface Invite {
  id: string; // normalized email, used as the doc id
  email: string;
  role?: AppRole;
  department?: string;
  invitedAt?: number;
}