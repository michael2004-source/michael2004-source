
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

  // Initialize Audio Context on first interaction
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
      }
    } catch (err) {
      console.error("Failed to open key selector", err);
    }
  };

  // Logic: Generating a new number
  const startNewRound = useCallback(async () => {
    initAudio();
    
    // Validate range
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
      
      if (errorMessage.includes("Requested entity was not found") || errorMessage.includes("API_KEY")) {
        setNeedsApiKey(true);
        setFeedback({ 
          type: 'error', 
          message: 'The API key is missing or invalid for this model. Please select a valid API key from a paid project.' 
        });
      } else {
        setFeedback({ 
          type: 'error', 
          message: `API Error: ${errorMessage}` 
        });
      }
      setCurrentNumber(null);
    } finally {
      setIsGenerating(false);
    }
  }, [minRange, maxRange, language, voice]);

  // Logic: Playing/Replaying the audio
  const playAudio = (buffer: AudioBuffer) => {
    if (!audioContextRef.current) return;

    // Stop existing audio
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

  // Logic: Submitting an answer
  const handleSubmit = () => {
    if (currentNumber === null) return;
    if (isScored) {
      setFeedback({ type: 'info', message: 'This round is already scored. Start a new round to continue!' });
      return;
    }

    const trimmedInput = userInput.trim();
    if (trimmedInput === '') {
       setFeedback({ type: 'error', message: 'Please enter a number before submitting.' });
       return;
    }

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
        ? `Correct! The number was indeed ${currentNumber}.` 
        : `Incorrect. The spoken number was ${currentNumber}.`
    });
  };

  // Logic: Setting changes reset the round (Anti-Cheat)
  useEffect(() => {
    setCurrentNumber(null);
    setCurrentAudioBuffer(null);
    setUserInput('');
    setIsScored(false);
    setFeedback(null);
  }, [language, minRange, maxRange]);

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Settings */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="mb-2">
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Polyglot <span className="text-indigo-600">Numbers</span>
            </h1>
            <p className="text-slate-500 mt-2 leading-relaxed text-sm">
              Master hearing numbers in foreign languages with high-fidelity TTS.
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

          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
             <h4 className="text-indigo-900 font-bold text-sm mb-1 flex items-center gap-2">
               <i className="fa-solid fa-circle-info"></i> How it works
             </h4>
             <ul className="text-indigo-700 text-[11px] space-y-1.5 opacity-90 leading-tight">
               <li>• Start a round to hear a random number.</li>
               <li>• Listen carefully and type the number.</li>
               <li>• You can replay the number as many times as you like.</li>
               <li>• Every round can be scored exactly once.</li>
             </ul>
          </div>
        </div>

        {/* Main Interaction Area */}
        <main className="lg:col-span-8 flex flex-col">
          <StatsTracker stats={stats} />

          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 flex-1 flex flex-col justify-center items-center text-center">
            {needsApiKey ? (
              <div className="py-12">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500 text-3xl">
                  <i className="fa-solid fa-key"></i>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">API Key Required</h2>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto text-sm">
                  This tool requires a valid API key from a paid project to access Gemini TTS models.
                </p>
                <button
                  onClick={handleOpenSelectKey}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-rose-100"
                >
                  Select API Key
                </button>
                <p className="mt-4 text-xs text-slate-400">
                  Documentation: <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline">ai.google.dev/gemini-api/docs/billing</a>
                </p>
              </div>
            ) : !currentNumber && !isGenerating ? (
              <div className="py-12">
                <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-400 text-4xl shadow-inner">
                  <i className="fa-solid fa-play"></i>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Ready to Start?</h2>
                <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                  Click below to generate a random number in <strong>{language.name}</strong>.
                </p>
                <button
                  onClick={startNewRound}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-indigo-100 transition-all transform hover:-translate-y-1 active:scale-95 text-lg"
                >
                  Start Round
                </button>
              </div>
            ) : isGenerating ? (
              <div className="py-12">
                <div className="relative w-16 h-16 mx-auto mb-6">
                   <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                   <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                </div>
                <h2 className="text-xl font-bold text-slate-700">Speaking...</h2>
                <p className="text-slate-400 mt-2 text-sm">Generating audio via Gemini API</p>
              </div>
            ) : (
              <div className="w-full max-w-md">
                <div className="mb-10">
                  <button
                    onClick={() => currentAudioBuffer && playAudio(currentAudioBuffer)}
                    className="group relative w-24 h-24 bg-indigo-50 hover:bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 shadow-sm"
                  >
                    <i className="fa-solid fa-volume-high text-3xl text-indigo-600 group-hover:text-white transition-colors"></i>
                    <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
                      Replay
                    </span>
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-left text-xs font-bold text-slate-400 uppercase mb-2 ml-1">
                      Your Answer
                    </label>
                    <input
                      type="number"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      placeholder="?"
                      disabled={isScored}
                      autoFocus
                      className="w-full text-4xl font-bold py-4 px-6 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none text-center transition-all disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={startNewRound}
                      disabled={isGenerating}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-xl transition-all"
                    >
                      New Round
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isScored || isGenerating || !userInput}
                      className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 transition-all disabled:bg-slate-300 disabled:shadow-none"
                    >
                      Check Answer
                    </button>
                  </div>
                </div>

                {feedback && (
                  <div className={`mt-8 p-5 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300 border ${
                    feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    feedback.type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                    'bg-sky-50 text-sky-700 border-sky-100'
                  }`}>
                    <div className="flex items-start gap-3">
                      <i className={`fa-solid mt-0.5 ${
                        feedback.type === 'success' ? 'fa-circle-check text-emerald-500' :
                        feedback.type === 'error' ? 'fa-circle-exclamation text-rose-500' :
                        'fa-circle-info text-sky-500'
                      } text-lg`}></i>
                      <p className="text-left flex-1">{feedback.message}</p>
                    </div>
                    {isScored && (
                      <button 
                        onClick={startNewRound}
                        className="mt-4 w-full py-2 bg-white/50 hover:bg-white text-indigo-600 rounded-lg font-bold transition-all border border-indigo-100"
                      >
                        Next Challenge →
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
