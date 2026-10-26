import { useEffect, useState } from "react";
import { api, errMsg } from "../api/api";

export default function StudentDashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [trackingToken, setTrackingToken] = useState("");
  
  const [step, setStep] = useState(1);
  const [mainCategory, setMainCategory] = useState("");
  const [subLocation, setSubLocation] = useState("");
  const [problemType, setProblemType] = useState("");
  const [roomNo, setRoomNo] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    try {
      const res = await api.get("/complaints/");
      setComplaints(res.data.results || res.data);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  }

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    
    // 1. Backend IDs mapping
    let finalCategoryId = 5; // Academic
    if (mainCategory === "Hostel") finalCategoryId = 4;
    if (mainCategory === "Canteen/Ground") finalCategoryId = 6;

    const finalTitle = `${mainCategory} - ${subLocation} - ${problemType}`;
    const finalDesc = `${description} ${roomNo ? `(Room No: ${roomNo})` : ""}`;

    try {
      // 2. Django Backend mein save karo (Image aur Tracking ke liye)
      const formData = new FormData();
      formData.append("category", finalCategoryId.toString());
      formData.append("title", finalTitle);
      formData.append("description", finalDesc);
      formData.append("extra_data", JSON.stringify({ lab: subLocation || "N/A" }));

      if (image) {
        formData.append("attachment", image);
      }

      const res = await api.post("/complaints/", formData);

      // 3. Formspree pe data bhejo (Email ke liye)
      await fetch("https://formspree.io/f/mrpppkvz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: "Student Complaint",
          category: mainCategory,
          title: finalTitle,
          description: finalDesc,
          location: subLocation,
          problem_type: problemType
        })
      });

      // 4. Success handling
      if (res.data.tracking_token) {
        setTrackingToken(res.data.tracking_token);
      } else {
        setShowForm(false);
        resetForm();
        loadComplaints();
      }
    } catch (err) {
      setFormError(errMsg(err));
    }
  }

  function resetForm() {
    setStep(1);
    setMainCategory("");
    setSubLocation("");
    setProblemType("");
    setRoomNo("");
    setDescription("");
    setImage(null);
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Loading your complaints...</div>;
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded max-w-xl mx-auto mt-8">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Complaints</h1>
        <button onClick={() => { setShowForm(!showForm); resetForm(); }} className="bg-[#0f172a] text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition">
          {showForm ? "Close Form" : "+ New Complaint"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border-t-4 border-[#1e3a8a]">
          <h2 className="text-xl font-semibold mb-6 text-slate-800">Submit a Complaint</h2>
          
          {trackingToken ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="font-bold text-green-800 mb-2">Complaint Submitted Successfully!</p>
              <p className="text-sm text-green-700 mb-2">Save this tracking token securely:</p>
              <code className="block bg-white p-3 rounded border font-mono text-sm">{trackingToken}</code>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && <div className="text-red-600 bg-red-50 p-3 rounded text-sm">{formError}</div>}

              {/* Step 1 */}
              {step === 1 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">What is the issue related to?</label>
                  <div className="grid grid-cols-2 gap-4">
                    {["Academic", "Hostel", "Canteen/Ground"].map((cat) => (
                      <button type="button" key={cat} onClick={() => { setMainCategory(cat); handleNext(); }} className={`p-4 border rounded-lg text-center hover:bg-slate-50 transition ${mainCategory === cat ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Please select the location ({mainCategory})</label>
                  <div className="grid grid-cols-2 gap-4">
                    {mainCategory === "Hostel" && ["BH1", "BH2", "BH3", "Girls Hostel"].map(loc => (
                      <button type="button" key={loc} onClick={() => { setSubLocation(loc); handleNext(); }} className="p-3 border rounded-lg hover:bg-slate-50">{loc}</button>
                    ))}
                    {mainCategory === "Academic" && ["CSE", "EE", "Mining", "EL"].map(loc => (
                      <button type="button" key={loc} onClick={() => { setSubLocation(loc); handleNext(); }} className="p-3 border rounded-lg hover:bg-slate-50">{loc}</button>
                    ))}
                    {mainCategory === "Canteen/Ground" && ["Canteen", "Football Ground", "Cricket Ground", "Other"].map(loc => (
                      <button type="button" key={loc} onClick={() => { setSubLocation(loc); handleNext(); }} className="p-3 border rounded-lg hover:bg-slate-50">{loc}</button>
                    ))}
                  </div>
                  <button type="button" onClick={handleBack} className="mt-4 text-sm text-slate-500 hover:text-slate-800">← Back</button>
                </div>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">What type of problem are you facing?</label>
                  <div className="grid grid-cols-2 gap-4">
                    {mainCategory === "Hostel" && ["Mess / Food", "Safai / Cleanliness", "Water Supply", "Electricity / Fan", "Washroom Problem", "Room Issue", "Other"].map(prob => (
                      <button type="button" key={prob} onClick={() => { setProblemType(prob); handleNext(); }} className="p-3 border rounded-lg hover:bg-slate-50">{prob}</button>
                    ))}
                    {mainCategory === "Academic" && ["Faculty Issue", "Lab Equipment", "Classroom", "Other"].map(prob => (
                      <button type="button" key={prob} onClick={() => { setProblemType(prob); handleNext(); }} className="p-3 border rounded-lg hover:bg-slate-50">{prob}</button>
                    ))}
                    {mainCategory === "Canteen/Ground" && ["Not good quality", "Price is too high", "Overcharging", "Hygiene issue", "Need Equipment", "Other"].map(prob => (
                      <button type="button" key={prob} onClick={() => { setProblemType(prob); handleNext(); }} className="p-3 border rounded-lg hover:bg-slate-50">{prob}</button>
                    ))}
                  </div>
                  <button type="button" onClick={handleBack} className="mt-4 text-sm text-slate-500 hover:text-slate-800">← Back</button>
                </div>
              )}

              {/* Step 4 */}
              {step === 4 && (
                <div className="space-y-4">
                  {(mainCategory === "Hostel" && problemType === "Room Issue") && (
                     <div>
                       <label className="block text-sm font-medium mb-1">Room Number</label>
                       <input type="text" value={roomNo} onChange={e => setRoomNo(e.target.value)} className="w-full border p-2 rounded-lg" placeholder="e.g. 101" required />
                     </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1">Brief Description</label>
                    <textarea required rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-2 rounded-lg" placeholder="Explain the issue in detail..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Upload Photo (Optional)</label>
                    <input type="file" accept="image/*" onChange={e => setImage(e.target.files ? e.target.files[0] : null)} className="w-full border p-2 rounded-lg bg-slate-50" />
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button type="button" onClick={handleBack} className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50">Back</button>
                    <button type="submit" className="px-6 py-2 bg-[#1e3a8a] text-white rounded-lg hover:bg-blue-800 font-medium">Submit Complaint</button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      )}

      {/* Complaint List */}
      <div className="space-y-4">
        {complaints.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed text-slate-500">No complaints found. Click "New Complaint" to submit one.</div>
        ) : (
          complaints.map(c => (
            <div key={c.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg text-slate-800">{c.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{c.reference_no} • {c.category_name || "Category"}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${c.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{c.status.replace("_", " ")}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}