export interface QuarterlyMilestone {
  id: string;
  name: string;
  quarter: "Q1" | "Q2" | "Q3" | "Q4";
  department: string;
  dueDate: string;
  status: "Complete" | "On Track" | "At Risk" | "Behind" | "Not Started";
  annualGoalId: string;
  description: string;
  keyResults: string[];
  linkedProjectIds: string[];
}

export interface AnnualGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: "On Track" | "At Risk" | "Behind" | "Complete";
  owner: string;
  milestoneIds: string[];
}

export interface Project {
  id: string;
  name: string;
  department: string;
  assignee: { name: string; initials: string };
  dueDate: string;
  status: "Not Started" | "In Progress" | "Complete";
  annualGoalId: string;
  milestoneId: string;
  description: string;
}

export const annualGoals: AnnualGoal[] = [
  {
    id: "ag1",
    title: "Increase agent registrations by 40%",
    description: "Grow our agent network across all districts by aggressively recruiting and onboarding new agents through targeted campaigns and streamlined processes.",
    progress: 65,
    status: "On Track",
    owner: "Sarah Mukama",
    milestoneIds: ["m1", "m2"],
  },
  {
    id: "ag2",
    title: "Launch new mobile app platform",
    description: "Design, build, and release a mobile-first platform that enables agents and clients to interact with Ambi-Tech services from any device.",
    progress: 42,
    status: "On Track",
    owner: "James Nkurunziza",
    milestoneIds: ["m3", "m4"],
  },
  {
    id: "ag3",
    title: "Reduce operational costs by 15%",
    description: "Identify and eliminate inefficiencies across the supply chain, procurement, and internal operations to reach a 15% cost reduction by year-end.",
    progress: 28,
    status: "At Risk",
    owner: "Patrick Habimana",
    milestoneIds: ["m5", "m6"],
  },
  {
    id: "ag4",
    title: "Expand to 3 new districts",
    description: "Establish full operational presence in 3 additional districts in Rwanda, including hiring local staff, securing premises, and meeting compliance requirements.",
    progress: 20,
    status: "Behind",
    owner: "Alice Uwimana",
    milestoneIds: ["m7", "m8"],
  },
];

export const milestones: QuarterlyMilestone[] = [
  {
    id: "m1",
    name: "Complete Q1 financial audit",
    quarter: "Q1",
    department: "Finance",
    dueDate: "Mar 31, 2026",
    status: "Complete",
    annualGoalId: "ag1",
    description: "Full financial audit of Q1 transactions to ensure compliance and surface cost-saving opportunities that directly support agent registration growth.",
    keyResults: ["Audit report delivered", "3 cost-saving areas identified", "Board sign-off received"],
    linkedProjectIds: ["p1"],
  },
  {
    id: "m2",
    name: "Implement new expense tracking system",
    quarter: "Q2",
    department: "Finance",
    dueDate: "Jun 30, 2026",
    status: "On Track",
    annualGoalId: "ag1",
    description: "Deploy a real-time expense tracking system that gives department heads visibility into spend and enables faster budget reallocation toward agent acquisition.",
    keyResults: ["System deployed", "All dept heads trained", "First monthly report generated"],
    linkedProjectIds: ["p1"],
  },
  {
    id: "m3",
    name: "Mobile app beta launch",
    quarter: "Q2",
    department: "IT",
    dueDate: "Jun 30, 2026",
    status: "On Track",
    annualGoalId: "ag2",
    description: "Release a beta version of the mobile app to 50 internal users for feedback collection before the public launch.",
    keyResults: ["Beta released to 50 users", "Feedback survey completed", "Critical bugs resolved"],
    linkedProjectIds: ["p2"],
  },
  {
    id: "m4",
    name: "Cybersecurity audit implementation",
    quarter: "Q2",
    department: "IT",
    dueDate: "Jun 30, 2026",
    status: "Behind",
    annualGoalId: "ag2",
    description: "Ensure the mobile platform meets all security requirements by completing a third-party cybersecurity audit and remediating all high-severity findings.",
    keyResults: ["Audit completed", "High-severity findings resolved", "Security certificate obtained"],
    linkedProjectIds: ["p5"],
  },
  {
    id: "m5",
    name: "Optimize supply chain process",
    quarter: "Q2",
    department: "Operations",
    dueDate: "Jun 15, 2026",
    status: "On Track",
    annualGoalId: "ag3",
    description: "Map and re-engineer the end-to-end supply chain to eliminate bottlenecks and reduce per-unit costs by at least 8% this quarter.",
    keyResults: ["Process map completed", "8% cost reduction achieved", "Vendor contracts renegotiated"],
    linkedProjectIds: ["p4"],
  },
  {
    id: "m6",
    name: "Hire 2 operations managers",
    quarter: "Q2",
    department: "Operations",
    dueDate: "Jun 30, 2026",
    status: "At Risk",
    annualGoalId: "ag3",
    description: "Recruit and onboard two experienced operations managers to oversee district expansion activities and ensure cost controls are maintained.",
    keyResults: ["2 candidates identified", "Interviews completed", "Offers accepted"],
    linkedProjectIds: ["p6"],
  },
  {
    id: "m7",
    name: "Launch social media campaign",
    quarter: "Q2",
    department: "Marketing",
    dueDate: "May 20, 2026",
    status: "Complete",
    annualGoalId: "ag4",
    description: "Run a targeted social media campaign in the 3 target districts to build brand awareness ahead of physical expansion.",
    keyResults: ["Campaign live in all 3 districts", "10,000+ impressions", "200+ leads captured"],
    linkedProjectIds: ["p3"],
  },
  {
    id: "m8",
    name: "District expansion site selection",
    quarter: "Q3",
    department: "Operations",
    dueDate: "Aug 15, 2026",
    status: "Not Started",
    annualGoalId: "ag4",
    description: "Identify and secure premises in the 3 target districts, complete regulatory filings, and hire initial local staff.",
    keyResults: ["3 sites selected", "Leases signed", "Local staff hired"],
    linkedProjectIds: ["p6"],
  },
];

export const projects: Project[] = [
  {
    id: "p1",
    name: "Q1 Financial Audit Review",
    department: "Finance",
    assignee: { name: "Sarah Mukama", initials: "SM" },
    dueDate: "May 15, 2026",
    status: "Complete",
    annualGoalId: "ag1",
    milestoneId: "m1",
    description: "Comprehensive review of Q1 financial statements and internal controls.",
  },
  {
    id: "p2",
    name: "Mobile App Beta Testing",
    department: "IT",
    assignee: { name: "James Nkurunziza", initials: "JN" },
    dueDate: "Jun 30, 2026",
    status: "In Progress",
    annualGoalId: "ag2",
    milestoneId: "m3",
    description: "End-to-end testing of the mobile application with internal beta users.",
  },
  {
    id: "p3",
    name: "Social Media Campaign Launch",
    department: "Marketing",
    assignee: { name: "Grace Uwase", initials: "GU" },
    dueDate: "Jun 15, 2026",
    status: "In Progress",
    annualGoalId: "ag4",
    milestoneId: "m7",
    description: "Multi-channel social media campaign targeting new districts.",
  },
  {
    id: "p4",
    name: "Supply Chain Optimization",
    department: "Operations",
    assignee: { name: "Patrick Habimana", initials: "PH" },
    dueDate: "Jul 01, 2026",
    status: "Not Started",
    annualGoalId: "ag3",
    milestoneId: "m5",
    description: "Process re-engineering to cut supply chain costs by 8% this quarter.",
  },
  {
    id: "p5",
    name: "Cybersecurity Audit Implementation",
    department: "IT",
    assignee: { name: "David Mugisha", initials: "DM" },
    dueDate: "Jun 30, 2026",
    status: "In Progress",
    annualGoalId: "ag2",
    milestoneId: "m4",
    description: "Third-party security audit and remediation for the mobile platform.",
  },
  {
    id: "p6",
    name: "District Expansion Planning",
    department: "Operations",
    assignee: { name: "Alice Uwimana", initials: "AU" },
    dueDate: "Aug 15, 2026",
    status: "Not Started",
    annualGoalId: "ag4",
    milestoneId: "m8",
    description: "Site selection, regulatory compliance, and staffing for 3 new districts.",
  },
];

export function getGoalById(id: string) {
  return annualGoals.find((g) => g.id === id);
}

export function getMilestoneById(id: string) {
  return milestones.find((m) => m.id === id);
}
