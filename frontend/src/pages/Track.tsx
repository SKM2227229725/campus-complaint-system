import { useState } from "react";
import { api, errMsg } from "../api/api";

export default function Track() {
  const [token, setToken] = useState("");
  const [complaint, setComplaint] = useState<any>(null);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setComplaint(null);
    try {
      const res = await api.post("/public/track", { tracking_token: token });
      setComplaint(res.data);
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg border-t-4 border-[#0f172a]">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">Track Anonymous Complaint</h2>
        <p className="text-sm text-slate-500 text-center mb-6">Enter your secure tracking token below.</p>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleTrack} className="flex gap-2 mb-8">
          <input type="text" value={token} onChange={e => setToken(e.target.value)} className="flex-1 border p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Paste your token here..." required />
          <button type="submit" className="bg-[#0f172a] text-white px-6 rounded-lg font-bold hover:bg-slate-800">Track</button>
        </form>
        {complaint && (
          <div className="border rounded-lg p-5 bg-slate-50">
            <h3 className="font-bold text-lg text-slate-800 mb-1">Ref No: {complaint.reference_no}</h3>
            <p className="text-sm text-slate-600 mb-4">Current Status: <span className="font-bold text-[#1e3a8a] uppercase">{complaint.status}</span></p>
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">History</h4>
            <ul className="space-y-2">
              {complaint.history.map((h: any, i: number) => (
                <li key={i} className="text-sm text-slate-700 flex justify-between border-b pb-1">
                  <span>Moved to {h.to.replace("_", " ")}</span>
                  <span className="text-slate-400 text-xs">{new Date(h.at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}