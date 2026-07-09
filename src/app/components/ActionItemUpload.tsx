import { useState } from "react";
import { Navigation } from "./Navigation";
import { Upload, FileText, CheckCircle2 } from "lucide-react";

interface ParsedTask {
  task: string;
  department: string;
  assignee: string;
  dueDate: string;
}

export function ActionItemUpload() {
  const [showPreview, setShowPreview] = useState(false);

  const parsedTasks: ParsedTask[] = [
    {
      task: "Complete budget review for Q3",
      department: "Finance",
      assignee: "Sarah Mukama",
      dueDate: "Jun 30, 2026",
    },
    {
      task: "Update expense tracking system",
      department: "Finance",
      assignee: "Eric Tuyisenge",
      dueDate: "Jul 05, 2026",
    },
    {
      task: "Launch Instagram ad campaign",
      department: "Marketing",
      assignee: "Grace Uwase",
      dueDate: "Jun 25, 2026",
    },
    {
      task: "Design new company brochure",
      department: "Marketing",
      assignee: "Grace Uwase",
      dueDate: "Jul 10, 2026",
    },
    {
      task: "Optimize warehouse logistics",
      department: "Operations",
      assignee: "Patrick Habimana",
      dueDate: "Jun 28, 2026",
    },
    {
      task: "Negotiate supplier contracts",
      department: "Operations",
      assignee: "Alice Uwimana",
      dueDate: "Jul 15, 2026",
    },
  ];

  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      Finance: "bg-purple-100 text-purple-700",
      Marketing: "bg-pink-100 text-pink-700",
      Operations: "bg-orange-100 text-orange-700",
      IT: "bg-blue-100 text-blue-700",
    };
    return colors[department] || "bg-gray-100 text-gray-700";
  };

  const handleUpload = () => {
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 pl-56">
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-[#0D1B3E] mb-2">Upload Action Items</h1>
          <p className="text-gray-600">
            Upload meeting notes or paste content to automatically create tasks
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mb-8">
          <div className="mb-6">
            <h3 className="text-lg text-[#0D1B3E] mb-4">Upload Document</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-[#0D1B3E] transition-colors cursor-pointer">
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Click to upload or drag and drop meeting notes
              </p>
              <p className="text-sm text-gray-400">
                PDF, DOCX, TXT, or Google Docs export
              </p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-gray-500 text-sm">OR</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>
          </div>

          <div>
            <h3 className="text-lg text-[#0D1B3E] mb-4">Paste Text</h3>
            <textarea
              rows={8}
              placeholder="Paste meeting notes or action items here...&#10;&#10;Example:&#10;- Finance team: Sarah to complete budget review by June 30&#10;- Marketing: Grace to launch Instagram campaign by June 25&#10;- Operations: Patrick to optimize warehouse logistics by June 28"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0D1B3E] focus:border-transparent resize-none"
            />
          </div>

          <button
            onClick={handleUpload}
            className="mt-6 w-full bg-[#5CB85C] text-white py-3 px-4 rounded-lg hover:bg-[#4ea54e] transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            <span>Process & Preview Tasks</span>
          </button>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl text-[#0D1B3E]">Extracted Tasks Preview</h3>
              <div className="flex items-center gap-2 text-[#5CB85C]">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm">6 tasks identified</span>
              </div>
            </div>

            <div className="space-y-6">
              {["Finance", "Marketing", "Operations"].map((department) => (
                <div key={department}>
                  <h4 className="text-lg text-gray-700 mb-3 flex items-center gap-2">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${getDepartmentColor(
                        department
                      )}`}
                    >
                      {department}
                    </span>
                  </h4>
                  <div className="space-y-3">
                    {parsedTasks
                      .filter((task) => task.department === department)
                      .map((task, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 hover:border-[#0D1B3E] transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="text-gray-800 mb-2">{task.task}</p>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span>Assignee: {task.assignee}</span>
                                <span className="text-gray-400">|</span>
                                <span>Due: {task.dueDate}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-4">
              <button className="flex-1 bg-[#0D1B3E] text-white py-3 px-4 rounded-lg hover:bg-[#1a2d5f] transition-colors">
                Confirm & Create Tasks
              </button>
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Edit Tasks
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
