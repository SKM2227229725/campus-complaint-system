import { useEffect, useState } from "react";
import { api, errMsg } from "../api/api";

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/complaints/").then(res => setComplaints(res.data.results || res.data)).catch(err => setError(errMsg(err))).finally(() => setLoading(false));
  }, []);

  async function updateStatus(id: number, newStatus: string) {
    try {
      await api.post(`/complaints/${id}/status/`, { status: newStatus });
      const res = await api.get("/complaints/");
      setComplaints(res.data.results || res.data);
    } catch (err) {
      alert(errMsg(err));
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Loading assigned complaints...</div>;
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded max-w-xl mx-auto mt-8">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Officer Dashboard</h1>
      <div className="space-y-4">
        {complaints.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed text-slate-500">No complaints assigned to you.</div>
        ) : (
          complaints.map(c => (
            <div key={c.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-semibold text-lg text-slate-800">{c.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{c.reference_no} • {c.category_name}</p>
                <p className="text-sm text-slate-600 mt-2">{c.description}</p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded uppercase text-slate-600">{c.status}</span>
                <select onChange={(e) => updateStatus(c.id, e.target.value)} value="" className="border rounded p-1 text-sm bg-white">
                  <option value="" disabled>Change Status...</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}