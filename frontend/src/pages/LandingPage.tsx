import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Chatbot from "../components/Chatbot";
import EmergencyHelpline from "../components/EmergencyHelpline";

// Hero Slider Images
const heroImages = [
  "/images/hero1.png",
  "/images/hero2.png",
  "/images/hero3.png",
];

export default function LandingPage() {
  const [currentImage, setCurrentImage] = useState(0);

  // Auto-slide effect for hero section
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative font-sans">
      
      {/* Top Info Bar */}
      <div className="bg-slate-100 text-xs py-2 px-8 flex justify-between text-slate-600 border-b">
        <div className="flex gap-4">
          <span>📞 +91 05444-252002</span>
          <span>✉️ contact@recsonbhadra.ac.in</span>
        </div>
        <div className="flex gap-4 font-medium">
          <Link to="/login" className="hover:text-blue-700">Student Login</Link>
          <span>|</span>
          <Link to="/track" className="hover:text-blue-700">Track Complaint</Link>
        </div>
      </div>

      {/* Header with Logo */}
      <header className="bg-white py-4 px-8 flex items-center gap-6 border-b shadow-sm">
        <img 
          src="/images/logo.png" 
          alt="REC Sonbhadra Logo" 
          className="w-20 h-20 object-contain"
          onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/80?text=REC"; }}
        />
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0f172a] tracking-tight">Rajkiya Engineering College</h1>
          <p className="text-md text-slate-700 font-medium">Sonbhadra, Uttar Pradesh</p>
          <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">An AICTE Approved Government Engineering College</p>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-[#0f172a] text-white px-8 py-3 flex gap-6 text-sm font-medium sticky top-0 z-40 shadow-md">
        <Link to="/" className="hover:text-blue-400">Home</Link>
        <a href="#departments" className="hover:text-blue-400">Departments</a>
        <a href="#hostels" className="hover:text-blue-400">Hostels</a>
        <a href="#canteen" className="hover:text-blue-400">Canteen & Ground</a>
      </nav>

      {/* HERO SECTION */}
      <div className="relative h-[500px] overflow-hidden bg-slate-900">
        {heroImages.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Campus ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentImage ? "opacity-100" : "opacity-0"
            }`}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ))}
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">Campus Complaint Portal</h2>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-blue-100 drop-shadow-md">
            A transparent and intelligent platform to resolve your campus issues quickly.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/login" className="bg-white text-[#0f172a] px-6 py-3 rounded font-bold hover:bg-gray-100 transition shadow-lg">Login to Submit</Link>
            <Link to="/login?direct=true" className="bg-blue-600 text-white px-6 py-3 rounded font-bold hover:bg-blue-700 transition shadow-lg border border-blue-500">Direct Complaint</Link>
            <Link to="/track" className="bg-transparent border-2 border-white text-white px-6 py-3 rounded font-bold hover:bg-white/20 transition">Track Anonymous</Link>
          </div>
        </div>

        {/* Slider Dots */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
          {heroImages.map((_, i) => (
            <button key={i} onClick={() => setCurrentImage(i)} className={`w-3 h-3 rounded-full transition ${i === currentImage ? "bg-white scale-125" : "bg-white/50"}`} />
          ))}
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto py-16 px-4 space-y-20">
        
        {/* Departments */}
        <div id="departments">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-[#0f172a] inline-block border-b-4 border-blue-600 pb-2">Our Departments</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* CSE */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 flex flex-col md:flex-row">
              <img src="/images/cse.png" alt="CSE" className="w-full md:w-1/3 h-48 md:h-auto object-cover" onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/300x200?text=CSE"; }} />
              <div className="p-6 flex flex-col justify-between w-full md:w-2/3">
                <div>
                  <h4 className="font-bold text-xl text-[#0f172a] mb-1">Computer Science & Engineering</h4>
                  <p className="text-sm font-semibold text-blue-700 mb-2">HOD: Dr. Amod Kumar Tiwari</p>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-3">The Department of CSE is committed to academic excellence and innovation.</p>
                </div>
                <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700 text-center w-full md:w-auto self-start">Report CSE Issue</Link>
              </div>
            </div>

            {/* EE */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 flex flex-col md:flex-row">
              <img src="/images/ee.png" alt="EE" className="w-full md:w-1/3 h-48 md:h-auto object-cover" onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/300x200?text=EE"; }} />
              <div className="p-6 flex flex-col justify-between w-full md:w-2/3">
                <div>
                  <h4 className="font-bold text-xl text-[#0f172a] mb-1">Electronics Engineering</h4>
                  <p className="text-sm font-semibold text-blue-700 mb-2">HOD: Dr. Devendra Kumar Tripathi</p>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-3">Committed to providing high-quality education and research in electronics.</p>
                </div>
                <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700 text-center w-full md:w-auto self-start">Report EE Issue</Link>
              </div>
            </div>

            {/* EL */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 flex flex-col md:flex-row">
              <img src="/images/el.png" alt="EL" className="w-full md:w-1/3 h-48 md:h-auto object-cover" onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/300x200?text=EL"; }} />
              <div className="p-6 flex flex-col justify-between w-full md:w-2/3">
                <div>
                  <h4 className="font-bold text-xl text-[#0f172a] mb-1">Electrical Engineering</h4>
                  <p className="text-sm font-semibold text-blue-700 mb-2">HOD: Mr. Ram Ishwar Vais</p>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-3">Dedicated to providing quality education and research in electrical engineering.</p>
                </div>
                <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700 text-center w-full md:w-auto self-start">Report EL Issue</Link>
              </div>
            </div>

            {/* Mining */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 flex flex-col md:flex-row">
              <img src="/images/mining.png" alt="Mining" className="w-full md:w-1/3 h-48 md:h-auto object-cover" onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/300x200?text=Mining"; }} />
              <div className="p-6 flex flex-col justify-between w-full md:w-2/3">
                <div>
                  <h4 className="font-bold text-xl text-[#0f172a] mb-1">Mining Engineering</h4>
                  <p className="text-sm font-semibold text-blue-700 mb-2">HOD: Dr. Arvind Tiwari</p>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-3">Focused on sustainable and safe mining practices with modern technologies.</p>
                </div>
                <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700 text-center w-full md:w-auto self-start">Report Mining Issue</Link>
              </div>
            </div>

          </div>
        </div>

        {/* Hostels */}
        <div id="hostels">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-[#0f172a] inline-block border-b-4 border-amber-500 pb-2">Our Hostels</h3>
            <p className="text-slate-600 mt-2">Providing guidance, care, and supervision to ensure a safe residential environment.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* BH-1 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 flex flex-col">
              <img src="/images/hostel1.png" alt="Boys Hostel 1" className="w-full h-40 object-cover" />
              <div className="p-5 flex-grow">
                <h4 className="font-bold text-lg text-[#0f172a] mb-2">Boy's Hostel 1</h4>
                <p className="text-xs text-slate-500 mb-4 line-clamp-3">Accommodates up to 250 students. Well-furnished rooms with beds, study tables, and 24/7 internet.</p>
                <div className="bg-slate-50 p-3 rounded text-sm mb-4">
                  <p className="font-semibold text-slate-800">Warden: Dr. Prashant Pandey</p>
                  <p className="text-slate-600">📞 9532986987</p>
                </div>
                <Link to="/login" className="bg-amber-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-amber-700 w-full block text-center">Report BH-1 Issue</Link>
              </div>
            </div>

            {/* BH-2 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 flex flex-col">
              <img src="/images/hostel2.png" alt="Boys Hostel 2" className="w-full h-40 object-cover" />
              <div className="p-5 flex-grow">
                <h4 className="font-bold text-lg text-[#0f172a] mb-2">Boy's Hostel 2</h4>
                <p className="text-xs text-slate-500 mb-4 line-clamp-3">Safe and disciplined environment with indoor sports, common room, and healthy mess food.</p>
                <div className="bg-slate-50 p-3 rounded text-sm mb-4">
                  <p className="font-semibold text-slate-800">Warden: Dr. Mainejar Yadav</p>
                  <p className="text-slate-600">📞 8874774393</p>
                </div>
                <Link to="/login" className="bg-amber-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-amber-700 w-full block text-center">Report BH-2 Issue</Link>
              </div>
            </div>

            {/* BH-3 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 flex flex-col">
              <img src="/images/hostel3.png" alt="Boys Hostel 3" className="w-full h-40 object-cover" />
              <div className="p-5 flex-grow">
                <h4 className="font-bold text-lg text-[#0f172a] mb-2">Boy's Hostel 3</h4>
                <p className="text-xs text-slate-500 mb-4 line-clamp-3">Modern facilities, water coolers on each floor, and a vibrant environment for students.</p>
                <div className="bg-slate-50 p-3 rounded text-sm mb-4">
                  <p className="font-semibold text-slate-800">Warden: Dr. Anurag Sewak</p>
                  <p className="text-slate-600">📞 9554840555</p>
                </div>
                <Link to="/login" className="bg-amber-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-amber-700 w-full block text-center">Report BH-3 Issue</Link>
              </div>
            </div>

            {/* Girls Hostel */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 flex flex-col border-t-4 border-pink-500">
              <img src="/images/girlhostel.png" alt="Girls Hostel" className="w-full h-40 object-cover" />
              <div className="p-5 flex-grow">
                <h4 className="font-bold text-lg text-[#0f172a] mb-2">Girl's Hostel</h4>
                <p className="text-xs text-slate-500 mb-4 line-clamp-3">Secure environment, gym area, water coolers, and healthy mess meals for up to 250 students.</p>
                <div className="bg-slate-50 p-3 rounded text-sm mb-4">
                  <p className="font-semibold text-slate-800">Warden: Dr. Bhavna Arora</p>
                  <p className="text-slate-600">📞 8299341001</p>
                </div>
                <Link to="/login" className="bg-pink-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-pink-700 w-full block text-center">Report GH Issue</Link>
              </div>
            </div>

          </div>

          {/* Chief Wardens Info */}
          <div className="mt-8 bg-[#1e3a8a] text-white p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h4 className="font-bold text-xl mb-1">Chief Wardens</h4>
              <p className="text-blue-200 text-sm">Providing guidance, care, and supervision.</p>
            </div>
            <div className="flex gap-8">
              <div>
                <p className="text-sm font-semibold">Mr. Deepak Sigroha (Boys)</p>
                <p className="text-xs text-blue-200">📞 9478856526</p>
              </div>
              <div>
                <p className="text-sm font-semibold">Dr. Bhavna Arora (Girls)</p>
                <p className="text-xs text-blue-200">📞 8299341001</p>
              </div>
            </div>
          </div>
        </div>

        {/* Canteen & Ground */}
        <div id="canteen">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-[#0f172a] inline-block border-b-4 border-green-500 pb-2">Campus & Canteen</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-slate-200 h-64 flex items-center justify-center text-slate-500">
                <img src="/images/canteen.png" alt="Canteen" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.innerHTML = 'Canteen Photo'; }} />
              </div>
              <div className="p-6">
                <h4 className="font-bold text-xl text-slate-800 mb-2">College Canteen</h4>
                <p className="text-slate-600 text-sm mb-4">Enjoy hygienic food and a vibrant atmosphere. If you face any issues with food quality or hygiene, report it immediately.</p>
                <Link to="/login" className="bg-green-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-700">Report Canteen Issue</Link>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-slate-200 h-64 flex items-center justify-center text-slate-500">
                <img src="/images/ground.png" alt="Ground" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.innerHTML = 'Ground Photo'; }} />
              </div>
              <div className="p-6">
                <h4 className="font-bold text-xl text-slate-800 mb-2">Sports Ground & Out Campus</h4>
                <p className="text-slate-600 text-sm mb-4">Our campus features a football ground, cricket pitch, and basketball court. Report any damage or maintenance issues here.</p>
                <Link to="/login" className="bg-amber-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-amber-700">Report Ground Issue</Link>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Premium Footer */}
      <footer className="bg-[#0f172a] text-slate-300 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center md:text-left">
            <div className="flex justify-center md:justify-start items-center gap-3 mb-4">
              <img src="/images/logo.png" alt="REC Logo" className="w-12 h-12 bg-white rounded-full p-1" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <h2 className="text-lg font-bold text-white">REC Sonbhadra</h2>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">Committed to providing quality education and fostering innovation.</p>
          </div>
          <div>
            <h3 className="text-md font-semibold text-white mb-4 border-b border-slate-700 pb-2">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/login" className="hover:text-white">Student Login</Link></li>
              <li><Link to="/track" className="hover:text-white">Track Complaint</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-md font-semibold text-white mb-4 border-b border-slate-700 pb-2">Contact Information</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>📍 REC Sonbhadra, UP - 231206</li>
              <li>📞 +91 05444-252002</li>
              <li>✉️ contact@recsonbhadra.ac.in</li>
            </ul>
          </div>
          <div>
            <h3 className="text-md font-semibold text-white mb-4 border-b border-slate-700 pb-2">Our Location</h3>
            <div className="bg-slate-800 h-24 rounded flex items-center justify-center text-slate-500 text-xs">Map Placeholder</div>
          </div>
        </div>
        <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-500">
          <p>© 2026 Rajkiya Engineering College, Sonbhadra. All Rights Reserved.</p>
        </div>
      </footer>
      
      <EmergencyHelpline />
      <Chatbot />
    </div>
  );
}