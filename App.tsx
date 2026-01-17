
import React, { useState, useCallback, useEffect } from 'react';
import { Language, PlaybackSpeed, Stats, Feedback } from './types.ts';
import { LANGUAGES, DEFAULT_MIN, DEFAULT_MAX } from './constants.ts';
import SettingsPanel from './components/SettingsPanel.tsx';
import StatsTracker from './components/StatsTracker.tsx';
import ImageSearch from './components/ImageSearch.tsx';
import { speakLocally } from './services/ttsService.ts';

type View = 'practice' | 'image-search';

const App: React.FC = () => {
  const [view, setView] = useState<View>('practice');

  // Core Practice State
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [isScored, setIsScored] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // Settings State
  const [language, setLanguage] = useState<Language>(LANGUAGES[0]);
  const [minRange, setMinRange] = useState<number>(DEFAULT_MIN);
  const [maxRange, setMaxRange] = useState<number>(DEFAULT_MAX);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1.0);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>('');

  // Stats State
  const [stats, setStats] = useState<Stats>({ attempts: 0, correct: 0 });

  const replaySpeech = useCallback(async (num: number) => {
    if (num === null) return;
    setIsSpeaking(true);
    try {
      await speakLocally({
        text: num.toString(),
        lang: language.code,
        rate: speed,
        voiceName: selectedVoiceName
      });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsSpeaking(false);
    }
  }, [language.code, speed, selectedVoiceName]);

  const startNewRound = useCallback(async () => {
    if (minRange > maxRange) {
      setFeedback({ type: 'error', message: 'Invalid range: Min > Max.' });
      return;
    }

    setFeedback(null);
    setUserInput('');
    setIsScored(false);

    const randomNum = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
    setCurrentNumber(randomNum);
    
    // Auto-play the number
    await replaySpeech(randomNum);
  }, [minRange, maxRange, replaySpeech]);

  const handleSubmit = () => {
    if (currentNumber === null) return;
    if (isScored) return;

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
        ? `Correct! It was ${currentNumber}.` 
        : `Not quite! The number was ${currentNumber}.`
    });
  };

  useEffect(() => {
    setCurrentNumber(null);
    setUserInput('');
    setIsScored(false);
    setFeedback(null);
  }, [language, minRange, maxRange, view]);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-slate-50 flex flex-col items-center">
      <nav className="max-w-5xl w-full flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl">
            <i className="fa-solid fa-language"></i>
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Polyglot <span className="text-indigo-600">Numbers</span>
          </h1>
        </div>
        <div className="flex gap-2 p-1 bg-slate-200 rounded-2xl">
          <button
            onClick={() => setView('practice')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              view === 'practice' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Practice
          </button>
          <button
            onClick={() => setView('image-search')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              view === 'image-search' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Teeth Detector
          </button>
        </div>
      </nav>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {view === 'practice' && (
          <>
            <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-8">
              <SettingsPanel
                language={language}
                onLanguageChange={setLanguage}
                min={minRange}
                onMinChange={setMinRange}
                max={maxRange}
                onMaxChange={setMaxRange}
                speed={speed}
                onSpeedChange={setSpeed}
                selectedVoiceName={selectedVoiceName}
                onVoiceChange={setSelectedVoiceName}
                isGenerating={isSpeaking}
              />
              
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                 <h4 className="text-slate-900 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                   <i className="fa-solid fa-circle-info text-indigo-500"></i> Local Engine
                 </h4>
                 <p className="text-slate-500 text-[10px] leading-relaxed">
                   Using your device's built-in text-to-speech for maximum reliability. 
                   Gemini is still active for the Teeth Detector tool.
                 </p>
              </div>
            </div>

            <main className="lg:col-span-8 flex flex-col h-full">
              <StatsTracker stats={stats} />

              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-white p-6 md:p-12 flex-1 flex flex-col justify-center items-center relative overflow-hidden text-center min-h-[400px]">
                {!currentNumber ? (
                  <div className="py-12 relative z-10 w-full animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white text-4xl shadow-2xl shadow-indigo-200 transform rotate-6">
                      <i className="fa-solid fa-play ml-1"></i>
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 mb-3">Auditory Training</h2>
                    <p className="text-slate-500 mb-10 max-w-xs mx-auto font-medium">
                      Hear numbers in <span className="text-indigo-600 font-bold">{language.name}</span> using local synthesis.
                    </p>
                    <button
                      onClick={startNewRound}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 px-12 rounded-2xl shadow-2xl shadow-indigo-200 transition-all transform hover:-translate-y-1 active:scale-95 text-xl"
                    >
                      Listen Now
                    </button>
                  </div>
                ) : (
                  <div className="w-full max-w-sm relative z-10 mx-auto">
                    <div className="mb-12">
                      <button
                        onClick={() => replaySpeech(currentNumber)}
                        disabled={isSpeaking}
                        className={`group relative w-32 h-32 rounded-full flex items-center justify-center mx-auto transition-all duration-300 shadow-inner border-8 border-white ${
                          isSpeaking ? 'bg-indigo-50 scale-105' : 'bg-slate-50 hover:bg-indigo-600'
                        }`}
                      >
                        <i className={`fa-solid ${isSpeaking ? 'fa-waveform animate-pulse' : 'fa-volume-high'} text-4xl ${isSpeaking ? 'text-indigo-400' : 'text-indigo-600 group-hover:text-white'} transition-colors`}></i>
                        <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                          {isSpeaking ? 'Speaking...' : 'Click to Replay'}
                        </span>
                      </button>
                    </div>

                    <div className="space-y-8">
                      <input
                        type="number"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="Type number..."
                        disabled={isScored}
                        autoFocus
                        className="w-full text-5xl font-black py-6 px-4 rounded-3xl border-2 border-slate-100 focus:border-indigo-500 focus:ring-[12px] focus:ring-indigo-50 outline-none text-center transition-all disabled:bg-slate-50 disabled:text-slate-300"
                      />

                      <div className="flex gap-4">
                        <button
                          onClick={startNewRound}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all"
                        >
                          Skip
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={isScored || !userInput}
                          className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all disabled:opacity-50"
                        >
                          Check
                        </button>
                      </div>
                    </div>

                    {feedback && (
                      <div className={`mt-10 p-6 rounded-3xl text-sm font-semibold border-2 animate-in slide-in-from-top-4 duration-300 ${
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
                            Next Round <i className="fa-solid fa-arrow-right text-xs"></i>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </main>
          </>
        )}

        {view === 'image-search' && (
          <div className="lg:col-span-12">
            <ImageSearch />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
