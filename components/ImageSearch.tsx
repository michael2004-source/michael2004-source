
import React, { useState, useEffect } from 'react';
import { analyzeImage } from '../services/imageService.ts';
import { ImageAnalysisResult } from '../types.ts';

const ImageSearch: React.FC = () => {
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ImageAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ImageAnalysisResult[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('teeth_search_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveToHistory = (newResult: ImageAnalysisResult) => {
    const newHistory = [newResult, ...history.filter(h => h.imageUrl !== newResult.imageUrl)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('teeth_search_history', JSON.stringify(newHistory));
  };

  const handleAnalyze = async () => {
    if (!url) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const res = await analyzeImage(url);
      setResult(res);
      saveToHistory(res);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-6 md:p-12 overflow-hidden">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-slate-800 mb-2">Teeth Detector</h2>
          <p className="text-slate-500 mb-8 font-medium">
            Paste an image URL to check if it contains teeth or a smile.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 p-4 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-[8px] focus:ring-indigo-50 outline-none transition-all text-slate-700"
            />
            <button
              onClick={handleAnalyze}
              disabled={analyzing || !url}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-indigo-100 whitespace-nowrap"
            >
              {analyzing ? (
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-circle-notch animate-spin"></i> Analyzing
                </span>
              ) : "Analyze Image"}
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-100 text-rose-700 text-sm font-medium mb-8">
              <i className="fa-solid fa-circle-exclamation mr-2"></i> {error}
              <p className="mt-2 text-xs text-rose-500 opacity-80">Note: External images may fail due to CORS restrictions of the hosting server.</p>
            </div>
          )}

          {result && (
            <div className="bg-slate-50 rounded-3xl p-6 border-2 border-slate-100 animate-in zoom-in-95 duration-300">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="aspect-video bg-slate-200 rounded-2xl overflow-hidden shadow-inner">
                  <img src={result.imageUrl} alt="Analyzed" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-4 text-left">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                      result.is_teeth ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {result.is_teeth ? "Teeth Detected" : "No Teeth Detected"}
                    </span>
                    <h3 className="text-xl font-bold text-slate-800">Analysis Result</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{result.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Confidence</span>
                    <span className="text-indigo-600 font-black">{(result.confidence_score * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-slate-400"></i> Recent History
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {history.map((item, idx) => (
              <button
                key={item.timestamp}
                onClick={() => {
                  setUrl(item.imageUrl || '');
                  setResult(item);
                }}
                className="group bg-white p-3 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all text-left overflow-hidden"
              >
                <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden mb-2">
                   <img src={item.imageUrl} alt="History" className="w-full h-full object-cover" />
                </div>
                <p className={`text-[10px] font-bold uppercase truncate ${item.is_teeth ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {item.is_teeth ? 'Teeth' : 'No Teeth'}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageSearch;
