import { useEffect, useState } from "react";
import { api, errMsg } from "../api/api";

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadAllComplaints();
  }, []);

  async function loadAllComplaints() {
    try {
      const res = await api.get("/complaints/"); 
      setComplaints(res.data.results || res.data);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: number, newStatus: string) {
    try {
      await api.post(`/complaints/${id}/status/`, { status: newStatus });
      loadAllComplaints();
    } catch (err) {
      alert(errMsg(err));
    }
  }

  const getAvailableStatuses = (currentStatus: string) => {
    switch (currentStatus) {
      case "awaiting_review":
        return [
          { value: "assigned", label: "Assign / Approve" },
          { value: "rejected", label: "Reject" }
        ];
      case "assigned":
        return [
          { value: "in_progress", label: "In Progress" },
          { value: "rejected", label: "Reject" }
        ];
      case "in_progress":
        return [{ value: "resolved", label: "Resolved" }];
      case "resolved":
        return [
          { value: "closed", label: "Close" },
          { value: "reopened", label: "Reopen" }
        ];
      case "closed":
        return [{ value: "reopened", label: "Reopen" }];
      case "submitted":
        return [
          { value: "awaiting_review", label: "Send to Review" },
          { value: "rejected", label: "Reject" }
        ];
      default:
        return [];
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-600 text-white";
      case "HIGH":
        return "bg-red-100 text-red-800 border border-red-200";
      case "MEDIUM":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      default:
        return "bg-green-100 text-green-800 border border-green-200";
    }
  };

  const filteredComplaints = filterStatus === "all" 
    ? complaints 
    : complaints.filter(c => c.status === filterStatus);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Admin Data...</div>;
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded max-w-xl mx-auto mt-8">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a]">Admin Dashboard</h1>
          <p className="text-slate-500">Monitor and track all campus complaints.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Filter Status:</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border p-2 rounded-lg bg-white shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Complaints</option>
            <option value="awaiting_review">Awaiting Review</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600">
          <p className="text-sm text-slate-500 font-medium">Total Complaints</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{complaints.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-amber-500">
          <p className="text-sm text-slate-500 font-medium">Pending / In Progress</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">
            {complaints.filter(c => c.status === "in_progress" || c.status === "assigned" || c.status === "awaiting_review").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-600">
          <p className="text-sm text-slate-500 font-medium">Resolved</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">
            {complaints.filter(c => c.status === "resolved" || c.status === "closed").length}
          </p>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                <th className="p-4">Ref No</th>
                <th className="p-4">Title & Details</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No complaints found for this filter.</td>
                </tr>
              ) : (
                filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono text-sm text-slate-600">{c.reference_no}</td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{c.title}</p>
                      <p className="text-xs text-slate-500">{c.description.substring(0, 50)}...</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityBadge(c.severity)}`}>
                        {c.severity || "LOW"}
                      </span>
                      {c.duplicate_of && (
                        <span className="block text-xs text-blue-600 mt-1 font-semibold">
                          ⚠️ Duplicate of {c.duplicate_of}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        c.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                        c.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {c.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-4">
                      <select 
                        onChange={(e) => updateStatus(c.id, e.target.value)} 
                        value="" 
                        className="border text-sm rounded p-1 bg-white hover:bg-slate-50 outline-none"
                      >
                        <option value="" disabled>Change Status...</option>
                        {getAvailableStatuses(c.status).map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}