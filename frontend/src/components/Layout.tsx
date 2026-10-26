import { Link, Outlet, useNavigate } from "react-router-dom";

export default function Layout() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("access");

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-[#0f172a] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            {/* Asli College Logo */}
            <img 
              src="/images/logo.png" 
              alt="REC Logo" 
              className="w-10 h-10 bg-white rounded-full p-1 object-contain"
              onError={(e) => {
                // Agar image na mile to fallback text dikhe
                e.currentTarget.style.display = 'none'; 
                e.currentTarget.parentElement.insertAdjacentHTML('afterbegin', '<div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#0f172a] font-bold text-xs">REC</div>');
              }}
            />
            <div>
              <h1 className="text-lg font-bold leading-tight">REC Sonbhadra</h1>
              <p className="text-xs text-gray-400">Grievance Portal</p>
            </div>
          </Link>
          
          <div className="flex gap-4 items-center">
            <Link to="/" className="text-sm hover:text-gray-300">Home</Link>
            {token && (
              <button onClick={handleLogout} className="bg-red-600 px-3 py-1.5 rounded text-xs hover:bg-red-700 transition">
                Logout
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <footer className="bg-[#0f172a] text-gray-400 py-4 text-center text-xs">
        <p>© 2026 Rajkiya Engineering College, Sonbhadra. All Rights Reserved.</p>
      </footer>
    </div>
  );
}