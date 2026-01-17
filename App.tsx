
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Language, PlaybackSpeed, Stats, Feedback } from './types';
import { LANGUAGES, DEFAULT_MIN, DEFAULT_MAX } from './constants';
import SettingsPanel from './components/SettingsPanel';
import StatsTracker from './components/StatsTracker';
import { generateSpokenNumber } from './services/geminiService';
import { decodeBase64, decodeAudioData } from './utils/audio';

const App: React.FC = () => {
  // Core Practice State
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [isScored, setIsScored] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentAudioBuffer, setCurrentAudioBuffer] = useState<AudioBuffer | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState<boolean>(false);

  // Settings State
  const [language, setLanguage] = useState<Language>(LANGUAGES[0]);
  const [minRange, setMinRange] = useState<number>(DEFAULT_MIN);
  const [maxRange, setMaxRange] = useState<number>(DEFAULT_MAX);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1.0);
  const [voice, setVoice] = useState<string>('Kore');

  // Stats State
  const [stats, setStats] = useState<Stats>({ attempts: 0, correct: 0 });

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const handleOpenSelectKey = async () => {
    try {
      if ((window as any).aistudio?.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
        setNeedsApiKey(false);
        setFeedback(null);
        // Prompt for immediate start after key selection
        setFeedback({ type: 'info', message: 'API key updated. You can now start the round.' });
      }
    } catch (err) {
      console.error("Failed to open key selector", err);
    }
  };

  const startNewRound = useCallback(async () => {
    initAudio();
    
    if (minRange > maxRange) {
      setFeedback({ type: 'error', message: 'Invalid range: Minimum cannot be greater than maximum.' });
      return;
    }

    setIsGenerating(true);
    setFeedback(null);
    setUserInput('');
    setIsScored(false);
    setNeedsApiKey(false);

    try {
      const randomNum = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
      const base64Audio = await generateSpokenNumber(randomNum, language.name, voice);
      
      const audioBytes = decodeBase64(base64Audio);
      const buffer = await decodeAudioData(audioBytes, audioContextRef.current!);
      
      setCurrentNumber(randomNum);
      setCurrentAudioBuffer(buffer);
      playAudio(buffer);
    } catch (error: any) {
      const errorMessage = error?.message || "An unknown error occurred.";
      console.error("Round Start Error:", error);
      
      // Handle the specific error indicating an API key issue or quota problem
      if (errorMessage.includes("Requested entity was not found") || 
          errorMessage.includes("API_KEY") || 
          errorMessage.includes("401") ||
          errorMessage.includes("403")) {
        setNeedsApiKey(true);
        setFeedback({ 
          type: 'error', 
          message: 'The model requires a valid API key from a paid project. Please select or refresh your key.' 
        });
      } else {
        setFeedback({ 
          type: 'error', 
          message: errorMessage.includes("non-audio response") 
            ? "Gemini attempted to reply with text instead of speech. Retrying usually helps."
            : `API Error: ${errorMessage}` 
        });
      }
      setCurrentNumber(null);
    } finally {
      setIsGenerating(false);
    }
  }, [minRange, maxRange, language, voice]);

  const playAudio = (buffer: AudioBuffer) => {
    if (!audioContextRef.current) return;

    if (activeSourceRef.current) {
      try { activeSourceRef.current.stop(); } catch(e) {}
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = speed;
    source.connect(audioContextRef.current.destination);
    source.start();
    activeSourceRef.current = source;
  };

  const handleSubmit = () => {
    if (currentNumber === null) return;
    if (isScored) {
      setFeedback({ type: 'info', message: 'Round already scored. Try a new one!' });
      return;
    }

    const trimmedInput = userInput.trim();
    if (trimmedInput === '') return;

    const parsedInput = parseInt(trimmedInput);
    const isCorrect = parsedInput === currentNumber;

    setStats(prev => ({
      attempts: prev.attempts + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
    }));

    setIsScored(true);
    setFeedback({
      type: isCorrect ? 'success' : 'error',
      message: isCorrect 
        ? `Perfect! It was ${currentNumber}.` 
        : `Nope! The number spoken was ${currentNumber}.`
    });
  };

  useEffect(() => {
    setCurrentNumber(null);
    setCurrentAudioBuffer(null);
    setUserInput('');
    setIsScored(false);
    setFeedback(null);
  }, [language, minRange, maxRange, voice]);

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center bg-slate-50">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Settings */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-8">
          <div className="px-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
              Polyglot <span className="text-indigo-600 block sm:inline">Numbers</span>
            </h1>
            <p className="text-slate-500 mt-3 text-sm font-medium">
              Listen, understand, and master hearing numbers in any language.
            </p>
          </div>

          <SettingsPanel
            language={language}
            onLanguageChange={setLanguage}
            min={minRange}
            onMinChange={setMinRange}
            max={maxRange}
            onMaxChange={setMaxRange}
            speed={speed}
            onSpeedChange={setSpeed}
            voice={voice}
            onVoiceChange={setVoice}
            isGenerating={isGenerating}
          />

          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
             <h4 className="text-slate-900 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
               <i className="fa-solid fa-graduation-cap text-indigo-500"></i> Learning Tips
             </h4>
             <ul className="text-slate-600 text-xs space-y-2.5 leading-relaxed">
               <li><span className="font-semibold text-slate-800">Range Control:</span> Start with 1-10 to learn basics, then expand to 1-1000.</li>
               <li><span className="font-semibold text-slate-800">Speed Adjust:</span> Use 0.5x if you are struggling with fast pronunciations.</li>
               <li><span className="font-semibold text-slate-800">Replay often:</span> There is no penalty for re-listening before you submit.</li>
             </ul>
          </div>
        </div>

        {/* Main Area */}
        <main className="lg:col-span-8 flex flex-col h-full">
          <StatsTracker stats={stats} />

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-6 md:p-12 flex-1 flex flex-col justify-center items-center relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-50 rounded-full -ml-24 -mb-24 opacity-50 blur-3xl"></div>

            {needsApiKey ? (
              <div className="py-8 relative z-10">
                <div className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-600 text-3xl rotate-3 shadow-lg shadow-rose-100">
                  <i className="fa-solid fa-key"></i>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">API Key Required</h2>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                  The high-fidelity TTS models require an API key associated with a paid Google Cloud project.
                </p>
                <button
                  onClick={handleOpenSelectKey}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                  Configure API Key
                </button>
                <div className="mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="hover:text-indigo-600 transition-colors">Billing Documentation ↗</a>
                </div>
              </div>
            ) : !currentNumber && !isGenerating ? (
              <div className="py-12 relative z-10">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white text-4xl shadow-2xl shadow-indigo-200 transform rotate-6">
                  <i className="fa-solid fa-play ml-1"></i>
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-3">Begin Round</h2>
                <p className="text-slate-500 mb-10 max-w-xs mx-auto font-medium">
                  Practice hearing numbers in <span className="text-indigo-600">{language.name}</span>.
                </p>
                <button
                  onClick={startNewRound}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 px-12 rounded-2xl shadow-2xl shadow-indigo-200 transition-all transform hover:-translate-y-1 active:scale-95 text-xl"
                >
                  Start Now
                </button>
              </div>
            ) : isGenerating ? (
              <div className="py-12 relative z-10">
                <div className="w-16 h-16 mx-auto mb-8 relative">
                   <div className="absolute inset-0 rounded-full border-[6px] border-indigo-50"></div>
                   <div className="absolute inset-0 rounded-full border-[6px] border-indigo-600 border-t-transparent animate-spin"></div>
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Generating Audio...</h2>
                <p className="text-slate-400 mt-3 font-medium animate-pulse">Requesting voice synthesis</p>
              </div>
            ) : (
              <div className="w-full max-w-sm relative z-10">
                <div className="mb-12">
                  <button
                    onClick={() => currentAudioBuffer && playAudio(currentAudioBuffer)}
                    className="group relative w-32 h-32 bg-slate-50 hover:bg-indigo-600 rounded-full flex items-center justify-center mx-auto transition-all duration-500 shadow-inner border-8 border-white"
                  >
                    <i className="fa-solid fa-volume-high text-4xl text-indigo-600 group-hover:text-white transition-colors"></i>
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-100 group-hover:scale-110 group-hover:opacity-0 transition-all duration-500"></div>
                    <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
                      Replay Number
                    </span>
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="relative">
                    <input
                      type="number"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      placeholder="Enter the digits..."
                      disabled={isScored}
                      autoFocus
                      className="w-full text-5xl font-black py-6 px-4 rounded-3xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-[12px] focus:ring-indigo-50 outline-none text-center transition-all disabled:bg-slate-50 disabled:text-slate-300 placeholder:text-slate-200 placeholder:font-bold"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={startNewRound}
                      disabled={isGenerating}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all active:scale-95"
                    >
                      Skip
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isScored || isGenerating || !userInput}
                      className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all disabled:bg-slate-300 disabled:shadow-none active:scale-95"
                    >
                      Submit Answer
                    </button>
                  </div>
                </div>

                {feedback && (
                  <div className={`mt-10 p-6 rounded-3xl text-sm font-semibold animate-in fade-in zoom-in-95 duration-500 border-2 ${
                    feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    feedback.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                    'bg-slate-50 text-slate-700 border-slate-100'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                         feedback.type === 'success' ? 'bg-emerald-500 text-white' :
                         feedback.type === 'error' ? 'bg-rose-500 text-white' :
                         'bg-slate-500 text-white'
                      }`}>
                        <i className={`fa-solid ${
                          feedback.type === 'success' ? 'fa-check' :
                          feedback.type === 'error' ? 'fa-xmark' :
                          'fa-info'
                        }`}></i>
                      </div>
                      <p className="text-left flex-1 leading-snug">{feedback.message}</p>
                    </div>
                    {isScored && (
                      <button 
                        onClick={startNewRound}
                        className="mt-5 w-full py-3 bg-white hover:bg-indigo-50 text-indigo-600 rounded-xl font-black transition-all border-2 border-slate-100 shadow-sm flex items-center justify-center gap-2"
                      >
                        Try Another One <i className="fa-solid fa-arrow-right text-xs"></i>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
