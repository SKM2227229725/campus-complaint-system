import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import OfficerDashboard from "./pages/OfficerDashboard";
import AdminDashboard from "./pages/AdminDashboard"; // <-- Nayi import
import Track from "./pages/Track";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/track" element={<Track />} />
        <Route element={<Layout />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/staff" element={<OfficerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} /> {/* <-- Nayi route */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;