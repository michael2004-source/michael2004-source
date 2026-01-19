
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, Stats, GameStatus } from './types.ts';
import { DEFAULT_SETTINGS } from './constants.ts';
import { translateNumberToWords } from './services/geminiService.ts';
import { speak } from './services/ttsService.ts';
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
    // Ensure min is not greater than max before generating
    const min = Math.min(settings.min, settings.max);
    const max = Math.max(settings.min, settings.max);
    const newNumber = getRandomNumber(min, max);
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
      // 1. Translate number to words using browser's Intl API
      const numberAsWords = translateNumberToWords(currentNumber, settings.language.code);
      
      // 2. Use Web Speech API to speak the words
      await speak(numberAsWords, settings.language.code);

    } catch (error) {
      if (error instanceof Error) {
          alert(`Failed to play audio: ${error.message}`);
      } else {
          alert("An unknown error occurred while playing audio.");
      }
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [currentNumber, settings.language.code]);

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800">Spoken Number Practice</h1>
        <p className="text-slate-600 mt-2">Train your ears to numbers in different languages.</p>
      </div>

      <div className={`relative w-full max-w-xl p-8 transition-all duration-300 rounded-2xl shadow-lg border-2 ${status === 'correct' ? 'border-emerald-500 bg-emerald-50' : status === 'incorrect' ? 'border-rose-500 bg-rose-50' : 'border-slate-300 bg-white'}`}>
        <button onClick={() => setIsSettingsOpen(true)} className="absolute top-4 right-4 text-slate-400 hover:text-indigo-600 transition">
          <i className="fas fa-cog fa-lg"></i>
        </button>

        <div className="flex justify-center items-center mb-6 text-center flex-wrap gap-2">
            <div className="bg-slate-200 text-slate-700 text-sm font-semibold px-3 py-1 rounded-full">{settings.language.name}</div>
            <div className="bg-slate-200 text-slate-700 text-sm font-semibold px-3 py-1 rounded-full">{settings.min} - {settings.max}</div>
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