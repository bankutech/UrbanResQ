import React, { useState } from 'react';
import { api } from '../api/client';

export const CitizenReportApp: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'RESCUE',
    urgency: 'MEDIUM',
    zone_id: '5d7af07d-c950-11f1-ab19-3822e20f83b9', // Adyar Riverbank
    latitude: '13.0827', // Chennai Metropolitan Region
    longitude: '80.2707',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Submitting...');
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessResult(null);

    if (imageFile) {
      setLoadingMessage('Uploading image and running AI Assessment...');
    } else {
      setLoadingMessage('Submitting emergency report...');
    }

    try {
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formPayload.append(key, value);
      });
      if (imageFile) {
        formPayload.append('image', imageFile);
      }

      const res = await api.post('/public/emergency-requests', formPayload);

      setSuccessResult(res.data);
      
      setFormData({
        title: '',
        description: '',
        category: 'RESCUE',
        urgency: 'MEDIUM',
        zone_id: '5d7af07d-c950-11f1-ab19-3822e20f83b9',
        latitude: '13.0827',
        longitude: '80.2707',
      });
      setImageFile(null);
      if (document.getElementById('image-upload')) {
        (document.getElementById('image-upload') as HTMLInputElement).value = '';
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-x-hidden bg-black text-gray-100 flex flex-col font-sans selection:bg-red-500/30 overflow-y-auto">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-black" />
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "radial-gradient(#4b5563 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="absolute -top-[300px] left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-[100%] bg-red-600/10 blur-[120px]" />
      </div>

      {/* Sleek Scanner / Radar (Red Theme) */}
      <div className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 h-[700px] w-[700px] opacity-[0.25] mix-blend-screen z-0">
        <svg viewBox="0 0 400 400" className="h-full w-full animate-[spin_60s_linear_infinite]">
          <defs>
            <radialGradient id="rzpSweepRed" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="200" r="100" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
          <circle cx="200" cy="200" r="160" fill="none" stroke="#ef4444" strokeWidth="1" opacity="0.2" />
          <line x1="200" y1="0" x2="200" y2="400" stroke="#ef4444" strokeWidth="1" opacity="0.15" />
          <line x1="0" y1="200" x2="400" y2="200" stroke="#ef4444" strokeWidth="1" opacity="0.15" />
          <path d="M200,200 L200,40 A160,160 0 0,1 313.1,86.9 Z" fill="url(#rzpSweepRed)" />
          {/* Scanning blips */}
          <circle cx="280" cy="120" r="3" fill="#f5a524" className="animate-pulse" />
          <circle cx="150" cy="280" r="3" fill="#ef4444" className="animate-pulse" style={{ animationDelay: "1s" }} />
        </svg>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 w-full">
        <div className="w-full max-w-md flex-shrink-0">
          <div className="relative rounded-md border border-white/[0.12] bg-[#0A0A0A] p-7 shadow-[0_0_40px_rgba(0,0,0,1)]">
            <div className="absolute inset-x-0 top-0 h-[2px] bg-red-500 opacity-50" />
            
            <h1 className="font-display text-2xl font-semibold tracking-tight text-white mb-1">Emergency Report</h1>
            <p className="text-[13px] text-gray-400 mb-6">Please provide details about the emergency. Help will be dispatched as soon as possible.</p>
            
            {successResult && (
              <div className="mb-6 p-4 bg-green-500/10 text-green-400 rounded border border-green-500/30">
                <strong className="block mb-1">Success! Your report has been submitted.</strong>
                {successResult.ai_assessed && (
                  <div className="mt-2 text-sm bg-black/50 p-3 rounded shadow-sm border border-green-500/20">
                    <span className="font-semibold text-gray-200">🤖 AI Assessment Complete:</span><br/>
                    <span className="block mt-1 italic text-gray-400">"{successResult.ai_notes}"</span>
                    <div className="mt-2 flex gap-2">
                      <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-mono text-xs">Urgency: {successResult.urgency}</span>
                      <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono text-xs">Category: {successResult.category}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-500/10 text-red-400 rounded border border-red-500/30">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-gray-400">Emergency Title</label>
                <div className="relative overflow-hidden rounded-md border border-white/[0.1] bg-[#111] transition-colors duration-200 focus-within:border-red-500">
                  <input 
                    required
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-transparent px-4 py-3 text-sm text-gray-100 placeholder:text-gray-600 outline-none" 
                    placeholder="e.g. Building Fire on 5th Ave" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-gray-400">Category</label>
                <div className="relative overflow-hidden rounded-md border border-white/[0.1] bg-[#111] transition-colors duration-200 focus-within:border-red-500">
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-transparent px-4 py-3 text-sm text-gray-100 outline-none appearance-none"
                  >
                    <option value="RESCUE" className="bg-[#111]">Rescue / Fire / Structural</option>
                    <option value="MEDICAL" className="bg-[#111]">Medical Emergency</option>
                    <option value="SECURITY" className="bg-[#111]">Police / Security</option>
                    <option value="EVACUATION" className="bg-[#111]">Evacuation</option>
                    <option value="OTHER" className="bg-[#111]">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-gray-400">Urgency</label>
                <div className="relative overflow-hidden rounded-md border border-white/[0.1] bg-[#111] transition-colors duration-200 focus-within:border-red-500">
                  <select 
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleChange}
                    className="w-full bg-transparent px-4 py-3 text-sm text-gray-100 outline-none appearance-none"
                  >
                    <option value="LOW" className="bg-[#111]">Low - Needs attention soon</option>
                    <option value="MEDIUM" className="bg-[#111]">Medium - Immediate but not life-threatening</option>
                    <option value="HIGH" className="bg-[#111]">High - Life-threatening emergency</option>
                    <option value="CRITICAL" className="bg-[#111]">Critical - Mass casualty or severe threat</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-gray-400">Photo Evidence (Optional)</label>
                <div className="text-[10px] text-gray-500 mb-1">Our AI will automatically assess severity if an image is provided.</div>
                <div className="relative overflow-hidden rounded-md border border-white/[0.1] bg-[#111] transition-colors duration-200 focus-within:border-red-500 p-2">
                  <input 
                    type="file" 
                    id="image-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-red-500/10 file:text-red-400 hover:file:bg-red-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-gray-400">Description</label>
                <div className="relative overflow-hidden rounded-md border border-white/[0.1] bg-[#111] transition-colors duration-200 focus-within:border-red-500">
                  <textarea 
                    required
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-transparent px-4 py-3 text-sm text-gray-100 placeholder:text-gray-600 outline-none resize-none"
                    placeholder="Describe the situation in detail..."
                  ></textarea>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`group relative flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-3 text-[14px] font-bold text-white transition-all hover:bg-red-700 active:scale-[0.98] disabled:opacity-70 mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? loadingMessage : 'Submit Emergency Report'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
