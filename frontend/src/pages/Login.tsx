import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setTokens, errMsg } from "../api/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { username, password });
      setTokens(res.data.access, res.data.refresh);
      
      const me = await api.get("/auth/me");
      
      // Role-Based Redirect
      if (me.data.role === "student") {
        navigate("/student");
      } else if (me.data.role === "sysadmin") {
        navigate("/admin");
      } else {
        navigate("/staff"); // For officers, HODs, etc.
      }
      
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full border-t-4 border-[#0f172a]">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">REC Sonbhadra</h2>
          <p className="text-slate-500 text-xs mt-1">Sign in to Grievance Portal</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 p-2 rounded mb-4 text-xs">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="mt-1 w-full border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <button type="submit" className="w-full bg-[#0f172a] text-white py-2 rounded font-bold hover:bg-slate-800 text-sm">Log In</button>
        </form>
        <div className="mt-4 text-center">
          <a href="/track" className="text-xs text-blue-600 hover:underline">Track anonymous complaint</a>
        </div>
      </div>
    </div>
  );
}