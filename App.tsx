
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, Stats, GameStatus } from './types.ts';
import { DEFAULT_SETTINGS } from './constants.ts';
import { generateSpeech } from './services/ttsService.ts';
import { playAudio } from './utils/audio.ts';
import StatsTracker from './components/StatsTracker.tsx';
import SettingsPanel from './components/SettingsPanel.tsx';

// Helper to generate a random number
const getRandomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<Stats>({ total: 0, correct: 0, incorrect: 0, streak: 0 });
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [userGuess, setUserGuess] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateNewNumber = useCallback(() => {
    const newNumber = getRandomNumber(settings.min, settings.max);
    setCurrentNumber(newNumber);
    setUserGuess('');
    setStatus('idle');
    inputRef.current?.focus();
  }, [settings]);

  useEffect(() => {
    generateNewNumber();
  }, [generateNewNumber]);

  const handlePlaySound = useCallback(async () => {
    if (currentNumber === null) return;
    setIsLoading(true);
    try {
      // FIX: Pass the language name to the service to ensure the model speaks in the correct language
      const audioContent = await generateSpeech(
        String(currentNumber), 
        settings.language.voice, 
        settings.language.name
      );
      await playAudio(audioContent);
    } catch (error) {
      alert("Failed to generate audio. Please check your network connection and try again.");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [currentNumber, settings.language.voice, settings.language.name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userGuess) return;

    const guessNumber = parseInt(userGuess, 10);
    if (guessNumber === currentNumber) {
      setStatus('correct');
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        correct: prev.correct + 1,
        streak: prev.streak + 1
      }));
      setTimeout(generateNewNumber, 1500);
    } else {
      setStatus('incorrect');
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        incorrect: prev.incorrect + 1,
        streak: 0
      }));
    }
  };

  const statusStyles: Record<GameStatus, { border: string; icon: string; iconColor: string; bg: string }> = {
    idle: { border: 'border-slate-300', icon: 'fa-volume-high', iconColor: 'text-slate-500', bg: 'bg-white' },
    correct: { border: 'border-emerald-500', icon: 'fa-check-circle', iconColor: 'text-emerald-500', bg: 'bg-emerald-50' },
    incorrect: { border: 'border-rose-500', icon: 'fa-times-circle', iconColor: 'text-rose-500', bg: 'bg-rose-50' },
  };

  const currentStyle = statusStyles[status];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800">Polyglot Number Master</h1>
        <p className="text-slate-600 mt-2">Train your ears to numbers in new languages.</p>
      </div>

      <div className={`relative w-full max-w-xl p-8 transition-all duration-300 rounded-2xl shadow-lg border-2 ${currentStyle.border} ${currentStyle.bg}`}>
        <button onClick={() => setIsSettingsOpen(true)} className="absolute top-4 right-4 text-slate-400 hover:text-indigo-600 transition">
          <i className="fas fa-cog fa-lg"></i>
        </button>

        <div className="flex justify-between items-center mb-6">
            <p className="font-semibold text-slate-700">Language: <span className="text-indigo-600">{settings.language.name}</span></p>
            <p className="font-semibold text-slate-700">Range: <span className="text-indigo-600">{settings.min} - {settings.max}</span></p>
        </div>

        <div className="text-center my-8">
            <button
                onClick={handlePlaySound}
                disabled={isLoading}
                className="w-24 h-24 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transform hover:scale-105 transition-transform"
                aria-label="Play number sound"
            >
                {isLoading ? (
                    <i className="fas fa-spinner fa-spin fa-2x"></i>
                ) : (
                    <i className="fas fa-play fa-2x"></i>
                )}
            </button>
        </div>

        <form onSubmit={handleSubmit}>
            <input
                ref={inputRef}
                type="number"
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value)}
                placeholder="What number did you hear?"
                disabled={status === 'correct'}
                className="w-full text-center text-2xl p-4 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
            {status === 'incorrect' && (
                <p className="text-center text-rose-600 font-semibold mt-3">
                    Correct answer was: {currentNumber}
                </p>
            )}
             {status === 'correct' && (
                <p className="text-center text-emerald-600 font-semibold mt-3">
                    Correct! Well done!
                </p>
            )}
            <button type="submit" className="w-full mt-4 p-4 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-colors" disabled={status === 'correct'}>
                Submit Guess
            </button>
        </form>
      </div>

      <StatsTracker stats={stats} />
      
      <SettingsPanel
        isOpen={isSettingsOpen}
        settings={settings}
        onSettingsChange={setSettings}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default App;
