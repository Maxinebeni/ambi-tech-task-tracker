/**
 * One-time seed script — populates Firestore with the sample annual
 * goals, quarterly milestones, and projects that used to be hardcoded
 * in src/app/data/goals.ts.
 *
 * Run once: npx tsx scripts/seedGoals.ts
 * Safe to delete after running.
 */
import { collection, addDoc } from "firebase/firestore";
import { db } from "../src/lib/firebase";
import type { AnnualGoal, QuarterlyMilestone, Project } from "../src/lib/types";

const goalsCol = collection(db, "annualGoals");
const milestonesCol = collection(db, "milestones");
const projectsCol = collection(db, "projects");

const goalsSeed = [
  { localId: "ag1", title: "Increase agent registrations by 40%", description: "Grow our agent network across all districts by aggressively recruiting and onboarding new agents through targeted campaigns and streamlined processes.", progress: 65, status: "On Track" as const, owner: "Sarah Mukama" },
  { localId: "ag2", title: "Launch new mobile app platform", description: "Design, build, and release a mobile-first platform that enables agents and clients to interact with Ambi-Tech services from any device.", progress: 42, status: "On Track" as const, owner: "James Nkurunziza" },
  { localId: "ag3", title: "Reduce operational costs by 15%", description: "Identify and eliminate inefficiencies across the supply chain, procurement, and internal operations to reach a 15% cost reduction by year-end.", progress: 28, status: "At Risk" as const, owner: "Patrick Habimana" },
  { localId: "ag4", title: "Expand to 3 new districts", description: "Establish full operational presence in 3 additional districts in Rwanda, including hiring local staff, securing premises, and meeting compliance requirements.", progress: 20, status: "Behind" as const, owner: "Alice Uwimana" },
];

const milestonesSeed = [
  { localId: "m1", name: "Complete Q1 financial audit", quarter: "Q1" as const, department: "Finance", dueDate: "Mar 31, 2026", status: "Complete" as const, description: "Full financial audit of Q1 transactions to ensure compliance and surface cost-saving opportunities that directly support agent registration growth.", keyResults: ["Audit report delivered", "3 cost-saving areas identified", "Board sign-off received"], goalLocalId: "ag1" },
  { localId: "m2", name: "Implement new expense tracking system", quarter: "Q2" as const, department: "Finance", dueDate: "Jun 30, 2026", status: "On Track" as const, description: "Deploy a real-time expense tracking system that gives department heads visibility into spend and enables faster budget reallocation toward agent acquisition.", keyResults: ["System deployed", "All dept heads trained", "First monthly report generated"], goalLocalId: "ag1" },
  { localId: "m3", name: "Mobile app beta launch", quarter: "Q2" as const, department: "IT", dueDate: "Jun 30, 2026", status: "On Track" as const, description: "Release a beta version of the mobile app to 50 internal users for feedback collection before the public launch.", keyResults: ["Beta released to 50 users", "Feedback survey completed", "Critical bugs resolved"], goalLocalId: "ag2" },
  { localId: "m4", name: "Cybersecurity audit implementation", quarter: "Q2" as const, department: "IT", dueDate: "Jun 30, 2026", status: "Behind" as const, description: "Ensure the mobile platform meets all security requirements by completing a third-party cybersecurity audit and remediating all high-severity findings.", keyResults: ["Audit completed", "High-severity findings resolved", "Security certificate obtained"], goalLocalId: "ag2" },
  { localId: "m5", name: "Optimize supply chain process", quarter: "Q2" as const, department: "Operations", dueDate: "Jun 15, 2026", status: "On Track" as const, description: "Map and re-engineer the end-to-end supply chain to eliminate bottlenecks and reduce per-unit costs by at least 8% this quarter.", keyResults: ["Process map completed", "8% cost reduction achieved", "Vendor contracts renegotiated"], goalLocalId: "ag3" },
  { localId: "m6", name: "Hire 2 operations managers", quarter: "Q2" as const, department: "Operations", dueDate: "Jun 30, 2026", status: "At Risk" as const, description: "Recruit and onboard two experienced operations managers to oversee district expansion activities and ensure cost controls are maintained.", keyResults: ["2 candidates identified", "Interviews completed", "Offers accepted"], goalLocalId: "ag3" },
  { localId: "m7", name: "Launch social media campaign", quarter: "Q2" as const, department: "Marketing", dueDate: "May 20, 2026", status: "Complete" as const, description: "Run a targeted social media campaign in the 3 target districts to build brand awareness ahead of physical expansion.", keyResults: ["Campaign live in all 3 districts", "10,000+ impressions", "200+ leads captured"], goalLocalId: "ag4" },
  { localId: "m8", name: "District expansion site selection", quarter: "Q3" as const, department: "Operations", dueDate: "Aug 15, 2026", status: "Not Started" as const, description: "Identify and secure premises in the 3 target districts, complete regulatory filings, and hire initial local staff.", keyResults: ["3 sites selected", "Leases signed", "Local staff hired"], goalLocalId: "ag4" },
];

const projectsSeed = [
  { localId: "p1", quarter: "Q1" as const, name: "Q1 Financial Audit Review", department: "Finance", assignee: { name: "Sarah Mukama", initials: "SM" }, dueDate: "May 15, 2026", status: "Complete" as const, description: "Comprehensive review of Q1 financial statements and internal controls.", goalLocalId: "ag1", milestoneLocalId: "m1" },
  { localId: "p2", quarter: "Q2" as const, name: "Mobile App Beta Testing", department: "IT", assignee: { name: "James Nkurunziza", initials: "JN" }, dueDate: "Jun 30, 2026", status: "In Progress" as const, description: "End-to-end testing of the mobile application with internal beta users.", goalLocalId: "ag2", milestoneLocalId: "m3" },
  { localId: "p3", quarter: "Q2" as const, name: "Social Media Campaign Launch", department: "Marketing", assignee: { name: "Grace Uwase", initials: "GU" }, dueDate: "Jun 15, 2026", status: "In Progress" as const, description: "Multi-channel social media campaign targeting new districts.", goalLocalId: "ag4", milestoneLocalId: "m7" },
  { localId: "p4", quarter: "Q2" as const, name: "Supply Chain Optimization", department: "Operations", assignee: { name: "Patrick Habimana", initials: "PH" }, dueDate: "Jul 01, 2026", status: "Not Started" as const, description: "Process re-engineering to cut supply chain costs by 8% this quarter.", goalLocalId: "ag3", milestoneLocalId: "m5" },
  { localId: "p5", quarter: "Q2" as const, name: "Cybersecurity Audit Implementation", department: "IT", assignee: { name: "David Mugisha", initials: "DM" }, dueDate: "Jun 30, 2026", status: "In Progress" as const, description: "Third-party security audit and remediation for the mobile platform.", goalLocalId: "ag2", milestoneLocalId: "m4" },
  { localId: "p6", quarter: "Q3" as const, name: "District Expansion Planning", department: "Operations", assignee: { name: "Alice Uwimana", initials: "AU" }, dueDate: "Aug 15, 2026", status: "Not Started" as const, description: "Site selection, regulatory compliance, and staffing for 3 new districts.", goalLocalId: "ag4", milestoneLocalId: "m8" },
];

async function run() {
  // 1. Create annual goals first, capture real Firestore IDs
  const goalIdMap = new Map<string, string>();
  for (const { localId, ...g } of goalsSeed) {
    const ref = await addDoc(goalsCol, { ...g, createdAt: Date.now() });
    goalIdMap.set(localId, ref.id);
    console.log(`Goal added: ${g.title} -> ${ref.id}`);
  }

  // 2. Create milestones, linking to real goal IDs; capture milestone IDs
  const milestoneIdMap = new Map<string, string>();
  for (const { localId, goalLocalId, ...m } of milestonesSeed) {
    const annualGoalId = goalIdMap.get(goalLocalId)!;
    const ref = await addDoc(milestonesCol, {
      ...m,
      annualGoalId,
      linkedProjectIds: [], // back-filled in step 3
      createdAt: Date.now(),
    });
    milestoneIdMap.set(localId, ref.id);
    console.log(`Milestone added: ${m.name} -> ${ref.id}`);
  }

  // 3. Create projects, linking to real goal + milestone IDs
  for (const { localId, goalLocalId, milestoneLocalId, ...p } of projectsSeed) {
    const annualGoalId = goalIdMap.get(goalLocalId)!;
    const milestoneId = milestoneIdMap.get(milestoneLocalId)!;
    const ref = await addDoc(projectsCol, { ...p, annualGoalId, milestoneId, createdAt: Date.now() });
    console.log(`Project added: ${p.name} -> ${ref.id}`);
  }

  console.log("Done seeding goals, milestones, and projects.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});