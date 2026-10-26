import { useState } from "react";

const knowledgeBase = [
  {
    keywords: ["bh1", "boys hostel 1", "prashant"],
    answer: "The Warden of Boys Hostel 1 (BH-1) is Dr. Prashant Pandey (Assistant Professor). Contact: 9532986987."
  },
  {
    keywords: ["bh2", "boys hostel 2", "mainejar"],
    answer: "The Warden of Boys Hostel 2 (BH-2) is Dr. Mainejar Yadav (Assistant Professor). Contact: 8874774393."
  },
  {
    keywords: ["bh3", "boys hostel 3", "anurag"],
    answer: "The Warden of Boys Hostel 3 (BH-3) is Dr. Anurag Sewak (Assistant Professor). Contact: 9554840555."
  },
  {
    keywords: ["gh", "girls hostel", "bhavna"],
    answer: "The Warden of the Girls Hostel is Dr. Bhavna Arora (Assistant Professor). Contact: 8299341001."
  },
  {
    keywords: ["cse", "computer science", "amod"],
    answer: "The Head of the Computer Science & Engineering (CSE) Department is Dr. Amod Kumar Tiwari (Associate Professor)."
  },
  {
    keywords: ["ee", "electronics", "devendra"],
    answer: "The Head of the Electronics Engineering (EE) Department is Dr. Devendra Kumar Tripathi (Associate Professor)."
  },
  {
    keywords: ["el", "electrical", "ram ishwar"],
    answer: "The Head of the Electrical Engineering (EL) Department is Mr. Ram Ishwar Vais (Assistant Professor)."
  },
  {
    keywords: ["mining", "arvind"],
    answer: "The Head of the Mining Engineering Department is Dr. Arvind Tiwari (Assistant Professor)."
  },
  {
    keywords: ["complaint", "submit", "how to"],
    answer: "To submit a complaint, click 'Login to Submit' on the Home page. After logging in, click '+ New Complaint' and select the category (Hostel/Academic/Canteen)."
  },
  {
    keywords: ["anonymous", "track"],
    answer: "To track an anonymous complaint, click 'Track Anonymous' on the Home page and enter your secure tracking token."
  },
  {
    keywords: ["college", "rec", "about"],
    answer: "Rajkiya Engineering College (REC) Sonbhadra is an AICTE-approved Government Engineering College affiliated with AKTU Lucknow (College Code 841)."
  }
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ text: "Hello! I am the REC Sonbhadra Assistant. Ask me about wardens, HODs, or the complaint process.", sender: "bot" }]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const lowerInput = userMsg.text.toLowerCase();
      let botResponse = "I'm not sure about that. You can ask me about hostel wardens, department HODs, or how to file a complaint.";

      for (const item of knowledgeBase) {
        if (item.keywords.some(k => lowerInput.includes(k))) {
          botResponse = item.answer;
          break;
        }
      }
      
      setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="bg-white w-80 sm:w-96 rounded-xl shadow-2xl border border-gray-200 overflow-hidden mb-4 flex flex-col">
          <div className="bg-[#0f172a] text-white p-4 font-bold flex justify-between items-center">
            <span>REC Assistant</span>
            <button onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">✕</button>
          </div>
          <div className="h-64 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[80%] p-3 rounded-lg text-sm ${m.sender === "user" ? "bg-blue-100 text-blue-900 self-end" : "bg-white border text-gray-700 self-start"}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="p-3 bg-white border-t flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Ask something..." className="flex-1 border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={handleSend} className="bg-[#0f172a] text-white px-4 rounded hover:bg-slate-800">Send</button>
          </div>
        </div>
      )}
      
      <button onClick={() => setIsOpen(!isOpen)} className="bg-[#0f172a] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-slate-800 transition transform hover:scale-105 ml-auto">
        💬
      </button>
    </div>
  );
}