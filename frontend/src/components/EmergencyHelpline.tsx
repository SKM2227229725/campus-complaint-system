import { useState } from "react";

export default function EmergencyHelpline() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 left-6 z-50">
      <div className="bg-white rounded-xl shadow-2xl border border-red-200 w-64 overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 text-white p-3 flex justify-between items-center">
          <h3 className="font-bold text-sm">Emergency Helplines</h3>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-white hover:text-gray-200 font-bold text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-3 space-y-3 bg-red-50">
          <a href="tel:112" className="flex items-center gap-3 p-2 bg-white rounded border border-red-100 hover:bg-red-100 transition">
            <span className="text-xl">🚨</span>
            <div>
              <p className="text-xs text-gray-500 font-medium">National Emergency</p>
              <p className="font-bold text-red-700 text-sm">112</p>
            </div>
          </a>

          <a href="tel:108" className="flex items-center gap-3 p-2 bg-white rounded border border-red-100 hover:bg-red-100 transition">
            <span className="text-xl">🚑</span>
            <div>
              <p className="text-xs text-gray-500 font-medium">Ambulance</p>
              <p className="font-bold text-red-700 text-sm">108</p>
            </div>
          </a>

          <a href="tel:100" className="flex items-center gap-3 p-2 bg-white rounded border border-red-100 hover:bg-red-100 transition">
            <span className="text-xl">👮</span>
            <div>
              <p className="text-xs text-gray-500 font-medium">Police</p>
              <p className="font-bold text-red-700 text-sm">100</p>
            </div>
          </a>

          <a href="tel:1090" className="flex items-center gap-3 p-2 bg-white rounded border border-red-100 hover:bg-red-100 transition">
            <span className="text-xl">👩</span>
            <div>
              <p className="text-xs text-gray-500 font-medium">Women Helpline</p>
              <p className="font-bold text-red-700 text-sm">1090</p>
            </div>
          </a>

          <a href="tel:18001805290" className="flex items-center gap-3 p-2 bg-white rounded border border-red-100 hover:bg-red-100 transition">
            <span className="text-xl">🎓</span>
            <div>
              <p className="text-xs text-gray-500 font-medium">AKTU Helpline</p>
              <p className="font-bold text-red-700 text-sm">1800 180 5290</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}