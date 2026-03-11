/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Castle, 
  Waves, 
  Mountain, 
  Building2, 
  Map as MapIcon,
  Trophy,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LANDMARKS, Landmark } from './data';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Simple sound synthesizer for feedback
const playSound = (type: 'success' | 'error' | 'click' | 'pop') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (e) {
    console.warn('Audio not supported or blocked', e);
  }
};

const PearlTowerIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2v20" />
    <circle cx="12" cy="15" r="3" />
    <circle cx="12" cy="8" r="2" />
    <path d="M9 22h6" />
  </svg>
);

const BridgeIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Water line */}
    <path d="M2 20c2-1 4-1 6 0s4 1 6 0 4-1 6 0" />
    {/* Bridge deck */}
    <path d="M2 14h20" />
    {/* Pylons (Above) */}
    <path d="M8 14v-6" />
    <path d="M16 14v-6" />
    {/* Cables */}
    <path d="M8 8l-4 6" />
    <path d="M8 8l4 6" />
    <path d="M16 8l-4 6" />
    <path d="M16 8l4 6" />
    {/* Supports (Under) */}
    <path d="M8 14v6" />
    <path d="M16 14v6" />
    <path d="M4 14v5" />
    <path d="M12 14v6" />
    <path d="M20 14v5" />
  </svg>
);

const StatueIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Head with a topknot/halo feel */}
    <circle cx="12" cy="7" r="3" />
    {/* Seated Body/Shoulders */}
    <path d="M7 11c0-1 1-2 5-2s5 1 5 2v4" />
    {/* Seated Legs/Base (Wide) */}
    <path d="M5 20c0-3 2-5 7-5s7 2 7 5" />
    {/* Hands in lap/meditation pose */}
    <path d="M10 16h4" />
    {/* Base/Cliff edge */}
    <path d="M4 22h16" />
  </svg>
);

const IconMap: Record<string, React.ReactNode> = {
  Castle: <Castle className="w-6 h-6" />,
  Waves: <Waves className="w-6 h-6" />,
  Mountain: <Mountain className="w-6 h-6" />,
  Tower: <PearlTowerIcon className="w-6 h-6" />,
  Statue: <StatueIcon className="w-6 h-6" />,
  Bridge: <BridgeIcon className="w-6 h-6" />,
};

type Step = 'map' | 'challenge-type' | 'challenge-explanation' | 'challenge-question' | 'pride-fact';

export default function App() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'finished'>('start');
  const [foundLandmarks, setFoundLandmarks] = useState<string[]>([]);
  const [activeLandmark, setActiveLandmark] = useState<Landmark | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('map');
  const [error, setError] = useState<string | null>(null);
  const [questionInput, setQuestionInput] = useState('');
  const [rewardStep, setRewardStep] = useState(0);

  const isAllFound = foundLandmarks.length === LANDMARKS.length;

  const handleStart = () => {
    playSound('pop');
    setGameState('playing');
  };

  const handleLandmarkClick = (landmark: Landmark) => {
    if (foundLandmarks.includes(landmark.id)) return;
    playSound('click');
    setActiveLandmark(landmark);
    setCurrentStep('challenge-type');
    setQuestionInput('');
    setError(null);
  };

  const handleTypeAnswer = (type: 'Man-made' | 'Natural') => {
    if (!activeLandmark) return;
    if (type === activeLandmark.type) {
      playSound('success');
      setCurrentStep('challenge-explanation');
      setError(null);
    } else {
      playSound('error');
      setError("Try again! Is it made by people or nature?");
    }
  };

  const handleTypedQuestion = (input: string) => {
    if (!activeLandmark) return;
    
    const lowerInput = input.toLowerCase();
    const isCapitalized = input.startsWith('H');
    const hasHow = lowerInput.startsWith('how');
    const isHowLong = lowerInput === 'how long';
    const isHowHigh = lowerInput === 'how high' || lowerInput === 'how tall';

    const expectedType = activeLandmark.questionType;

    if (hasHow && !isCapitalized) {
      playSound('error');
      setError("Check your capital letters — questions always start with one!");
      return;
    }

    if (!hasHow) {
      playSound('error');
      setError("Try again! Start with 'How...'");
      return;
    }

    if (expectedType === 'length') {
      if (isHowHigh) {
        playSound('error');
        setError("Hint: Think about length or height");
      } else if (isHowLong) {
        handleQuestionAnswer('length');
      } else {
        playSound('error');
        setError("Try again! Look at the picture: does it stretch far, or does it rise tall?");
      }
    } else {
      if (isHowLong) {
        playSound('error');
        setError("Hint: Think about length or height");
      } else if (isHowHigh) {
        handleQuestionAnswer('height');
      } else {
        playSound('error');
        setError("Try again! Look at the picture: does it stretch far, or does it rise tall?");
      }
    }
  };

  const handleQuestionAnswer = (answer: 'length' | 'height') => {
    if (!activeLandmark) return;
    if (answer === activeLandmark.questionType) {
      playSound('success');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setCurrentStep('pride-fact');
      setFoundLandmarks(prev => [...prev, activeLandmark.id]);
      setError(null);
    } else {
      playSound('error');
      const correct = activeLandmark.questionType === 'height' ? "'How high' or 'How tall'" : "'How long'";
      setError(`Wait! For this wonder, we ask ${correct}. Try again!`);
    }
  };

  const closeInteraction = () => {
    playSound('pop');
    setActiveLandmark(null);
    setCurrentStep('map');
    setQuestionInput('');
    if (foundLandmarks.length === LANDMARKS.length) {
      setGameState('finished');
      setRewardStep(0);
      // Extra celebratory confetti
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.3 }
        });
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6E3] font-sans text-stone-800 overflow-hidden relative selection:bg-orange-200">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-orange-400 rounded-full" />
        <div className="absolute bottom-20 right-20 w-48 h-48 border-4 border-blue-400 rounded-full" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-emerald-400 rounded-lg rotate-12" />
      </div>

      <AnimatePresence mode="wait">
        {gameState === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center min-h-screen p-6 text-center z-10 relative"
          >
            <div className="bg-white p-12 rounded-[3rem] shadow-2xl border-8 border-orange-100 max-w-3xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-50 rounded-full opacity-50" />
              
              <div className="flex items-center justify-center gap-6 mb-6">
                <h1 className="text-5xl font-black text-orange-600 tracking-tight">
                  China's Hidden Wonders
                </h1>
                <motion.img 
                  initial={{ rotate: -10, scale: 0.9 }}
                  animate={{ rotate: 5, scale: 1 }}
                  transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
                  src="https://img.freepik.com/premium-vector/boy-girl-are-sitting-their-suitcases_1022901-118696.jpg?semt=ais_rp_progressive&w=740&q=80"
                  alt="Cute Explorer"
                  className="w-40 h-40 rounded-3xl border-4 border-orange-200 shadow-xl object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-2xl mb-10 text-stone-600 leading-relaxed">
                Welcome, Explorer! 🌏<br />
                I have hidden <span className="underline decoration-orange-300 decoration-4 underline-offset-4 font-bold text-orange-600 bg-orange-50 px-1 rounded-md">6 wonders</span> on the map of <span className="underline decoration-orange-300 decoration-4 underline-offset-4 font-bold text-orange-600 bg-orange-50 px-1 rounded-md">China</span>.<br />
                Tell me which one you want to find first!
              </p>
              <button
                onClick={handleStart}
                className="bg-orange-500 hover:bg-orange-600 text-white text-2xl font-bold py-6 px-12 rounded-full shadow-lg transform transition hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
              >
                Let's Explore! <ArrowRight className="w-8 h-8" />
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 md:p-8 flex flex-col items-center h-screen"
          >
            <header className="w-full max-w-5xl flex justify-between items-center mb-8 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-stone-200">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <MapIcon className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-xl font-bold text-stone-700">China Explorer</h2>
              </div>
              <div className="relative bg-white/50 rounded-2xl border border-stone-200 overflow-hidden p-3 shadow-inner flex gap-3 items-center">
                <img 
                  src="https://chinamap360.com/img/0/blank-map-of-china.jpg"
                  className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale pointer-events-none"
                  alt=""
                  referrerPolicy="no-referrer"
                />
                {LANDMARKS.map((l) => (
                  <div 
                    key={l.id}
                    className={cn(
                      "relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 z-10",
                      foundLandmarks.includes(l.id) 
                        ? "bg-emerald-500 text-white scale-110 shadow-md" 
                        : "bg-white/80 text-stone-400 shadow-sm"
                    )}
                  >
                    {foundLandmarks.includes(l.id) ? <CheckCircle2 className="w-6 h-6" /> : IconMap[l.icon]}
                  </div>
                ))}
              </div>
            </header>

            <main className="flex-1 w-full max-w-5xl relative bg-white rounded-[2.5rem] shadow-xl border-4 border-stone-100 overflow-hidden">
              {/* Detailed Map Image of China (Asia Odyssey Travel version) */}
              <div className="absolute inset-0 w-full h-full p-4 flex items-center justify-center bg-blue-50/20">
                <img 
                  src="https://www.asiaodysseytravel.com/images/china-maps/china-map-with-cities.jpg"
                  alt="Detailed Map of China"
                  className="w-full h-full object-contain opacity-95"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to a high-quality administrative map if the first one fails
                    (e.target as HTMLImageElement).src = "https://worldmapwithcountries.net/wp-content/uploads/2020/03/Outline-Map.jpg";
                  }}
                />
              </div>

              {/* Landmark Markers */}
              {LANDMARKS.map((landmark) => (
                <motion.button
                  key={landmark.id}
                  style={{ left: `${landmark.x}%`, top: `${landmark.y}%` }}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 p-4 rounded-2xl shadow-lg transition-all z-20 group overflow-hidden",
                    foundLandmarks.includes(landmark.id) 
                      ? "bg-emerald-100 border-2 border-emerald-500 opacity-60 cursor-default" 
                      : `${landmark.color} hover:scale-110 hover:rotate-3 cursor-pointer`
                  )}
                  onClick={() => handleLandmarkClick(landmark)}
                  whileHover={foundLandmarks.includes(landmark.id) ? {} : { y: -5 }}
                >
                  <img 
                    src="https://chinamap360.com/img/0/blank-map-of-china.jpg"
                    className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale pointer-events-none"
                    alt=""
                    referrerPolicy="no-referrer"
                  />
                  <div className={cn(
                    "relative z-10",
                    foundLandmarks.includes(landmark.id) ? "text-emerald-600" : "text-white"
                  )}>
                    {IconMap[landmark.icon]}
                    {!foundLandmarks.includes(landmark.id) && (
                      <span className="absolute -top-2 -right-2 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                      </span>
                    )}
                  </div>
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-stone-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {landmark.name}
                  </div>
                </motion.button>
              ))}

            </main>

            {/* Interaction Modal */}
            <AnimatePresence>
              {activeLandmark && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md"
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border-8 border-white"
                  >
                    <div className="relative h-80 overflow-hidden">
                      <motion.img 
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        src={activeLandmark.image} 
                        alt={activeLandmark.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-transparent flex flex-col p-10">
                        <motion.div
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="max-w-[80%]"
                        >
                          <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] mb-3 inline-block shadow-lg">
                            Wonder of China
                          </span>
                          <h3 className="text-5xl font-black text-white tracking-tight drop-shadow-2xl leading-tight">
                            {activeLandmark.name}
                          </h3>
                        </motion.div>
                      </div>
                      <button 
                        onClick={closeInteraction}
                        className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full text-white transition-all hover:rotate-90"
                      >
                        <XCircle className="w-8 h-8" />
                      </button>
                    </div>

                    <div className="p-10 relative">
                      {/* Immersive Background for Content */}
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                        <img 
                          src={activeLandmark.image} 
                          alt="" 
                          className="w-full h-full object-cover blur-xl"
                        />
                      </div>
                      
                      <div className="relative z-10">
                        {/* Mini Location Map in Modal */}
                        <div className="mb-8 flex items-center gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-stone-100 shadow-sm">
                          <div className="w-24 h-16 bg-stone-50 rounded-xl border border-stone-200 relative overflow-hidden flex-shrink-0">
                            <img 
                              src="https://chinamap360.com/img/0/blank-map-of-china.jpg"
                              className="w-full h-full object-cover opacity-30 grayscale"
                              alt="China Map"
                              referrerPolicy="no-referrer"
                            />
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              style={{ left: `${activeLandmark.x}%`, top: `${activeLandmark.y}%` }}
                              className={cn("absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-sm", activeLandmark.color.replace('bg-', 'bg-'))}
                            />
                          </div>
                          <div className="text-sm">
                            <p className="font-black text-stone-400 uppercase tracking-[0.1em] text-[10px]">Location Discovery</p>
                            <p className="font-bold text-stone-700">Found on your explorer map!</p>
                          </div>
                        </div>

                        {currentStep === 'challenge-type' && (
                          <div className="text-center">
                            <p className="text-2xl font-bold mb-8 text-stone-700">
                              Is this wonder made by people or by nature?
                            </p>
                          <div className="grid grid-cols-2 gap-6">
                            <button
                              onClick={() => handleTypeAnswer('Man-made')}
                              className="bg-orange-100 hover:bg-orange-200 text-orange-700 p-8 rounded-3xl border-4 border-orange-200 transition-all hover:scale-105 active:scale-95 group"
                            >
                              <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:rotate-6 transition">
                                <Building2 className="w-8 h-8" />
                              </div>
                              <span className="text-xl font-black">Man-made</span>
                            </button>
                            <button
                              onClick={() => handleTypeAnswer('Natural')}
                              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 p-8 rounded-3xl border-4 border-emerald-200 transition-all hover:scale-105 active:scale-95 group"
                            >
                              <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:-rotate-6 transition">
                                <Mountain className="w-8 h-8" />
                              </div>
                              <span className="text-xl font-black">Natural</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {currentStep === 'challenge-explanation' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-center"
                        >
                          <div className="bg-orange-50 p-8 rounded-3xl border-4 border-orange-100 mb-8">
                            <h4 className="text-2xl font-black text-orange-700 mb-4">
                              That's Correct! 🌟
                            </h4>
                            <p className="text-xl text-stone-700 leading-relaxed font-medium">
                              {activeLandmark.typeHint}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              playSound('click');
                              setCurrentStep('challenge-question');
                            }}
                            className="bg-orange-500 hover:bg-orange-600 text-white py-4 px-12 rounded-full text-xl font-bold transition-all flex items-center gap-2 mx-auto shadow-lg"
                          >
                            Next Step <ArrowRight className="w-6 h-6" />
                          </button>
                        </motion.div>
                      )}

                      {currentStep === 'challenge-question' && (
                        <div className="text-center">
                          <p className="text-2xl font-bold mb-8 text-stone-700">
                            Great! Now type the question words:
                          </p>
                          <div className="max-w-3xl mx-auto">
                            <div className="flex items-center justify-center gap-4 mb-10 whitespace-nowrap">
                              <input
                                autoFocus
                                type="text"
                                value={questionInput}
                                onChange={(e) => setQuestionInput(e.target.value)}
                                placeholder="Type here..."
                                className="w-72 p-5 text-2xl rounded-2xl border-4 border-stone-200 focus:border-orange-400 outline-none transition-all text-center font-bold shadow-inner"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleTypedQuestion(questionInput.trim());
                                  }
                                }}
                              />
                              <span className="text-3xl font-black text-stone-600">
                                is {activeLandmark.name}?
                              </span>
                            </div>
                            <button
                              onClick={() => handleTypedQuestion(questionInput.trim())}
                              className="bg-orange-500 hover:bg-orange-600 text-white py-4 px-12 rounded-full text-2xl font-black transition-all shadow-lg hover:scale-105 active:scale-95"
                            >
                              Check Answer
                            </button>
                          </div>
                        </div>
                      )}

                      {currentStep === 'pride-fact' && (
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="text-center"
                        >
                          <div className="bg-yellow-50 border-4 border-yellow-200 p-8 rounded-[2rem] mb-8 relative overflow-hidden">
                            <div className="absolute -top-4 -right-4 text-yellow-200 rotate-12">
                              <Trophy className="w-24 h-24" />
                            </div>
                            <h4 className="text-3xl font-black text-yellow-700 mb-4 flex items-center justify-center gap-2">
                              Pride Fact! ✨
                            </h4>
                            <p className="text-2xl text-stone-700 mb-4 font-medium italic">
                              "{activeLandmark.prideFact}"
                            </p>
                            <div className="bg-white/60 inline-block px-6 py-2 rounded-full text-xl font-bold text-stone-600 border border-yellow-100">
                              Measurement: {activeLandmark.measurement}
                            </div>
                          </div>
                          <div className="flex justify-center">
                            <button
                              onClick={closeInteraction}
                              className="bg-stone-800 hover:bg-stone-900 text-white py-4 px-10 rounded-full text-xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                              Back to Map <ArrowRight className="w-6 h-6" />
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {/* Error Message */}
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 justify-center border border-red-100"
                          >
                            <XCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="font-bold">{error}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          </motion.div>
        )}

        {gameState === 'finished' && (
          <motion.div
            key="finished"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-screen p-6 text-center z-10 relative bg-emerald-50/30"
          >
            <div className="max-w-4xl w-full relative">
              {/* Characters and Speech Bubbles */}
              <div className="flex justify-between items-end mb-12 h-64 relative">
                {/* Panda */}
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="relative flex flex-col items-center"
                >
                  <AnimatePresence>
                    {rewardStep === 0 && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute -top-32 left-0 bg-white p-6 rounded-3xl shadow-xl border-4 border-emerald-200 w-64 z-20"
                      >
                        <p className="text-lg font-bold text-emerald-700">
                          "Wow! You found all the wonders from the Great Wall to the Giant Buddha!"
                        </p>
                        <div className="absolute -bottom-4 left-10 w-8 h-8 bg-white border-r-4 border-b-4 border-emerald-200 rotate-45" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="text-8xl">🐼</div>
                  <div className="mt-2 font-black text-emerald-600">Ping the Panda</div>
                </motion.div>

                {/* Dragon */}
                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="relative flex flex-col items-center"
                >
                  <AnimatePresence>
                    {rewardStep === 1 && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute -top-32 right-0 bg-white p-6 rounded-3xl shadow-xl border-4 border-red-200 w-64 z-20"
                      >
                        <p className="text-lg font-bold text-red-700">
                          "You even conquered Mount Everest! You are a true Master Explorer!"
                        </p>
                        <div className="absolute -bottom-4 right-10 w-8 h-8 bg-white border-r-4 border-b-4 border-red-200 rotate-45" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="text-8xl">🐲</div>
                  <div className="mt-2 font-black text-red-600">Long the Dragon</div>
                </motion.div>
              </div>

              {/* Main Reward Card */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="bg-white p-12 rounded-[4rem] shadow-2xl border-8 border-yellow-200 relative overflow-hidden"
              >
                {rewardStep < 2 ? (
                  <div className="py-12">
                    <h2 className="text-4xl font-black text-stone-700 mb-8 tracking-tight">
                      The characters have something to say...
                    </h2>
                    <button
                      onClick={() => {
                        playSound('click');
                        setRewardStep(prev => prev + 1);
                        if (rewardStep === 1) {
                          confetti({
                            particleCount: 200,
                            spread: 120,
                            origin: { y: 0.5 }
                          });
                        }
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-2xl font-bold py-6 px-12 rounded-full shadow-lg transform transition hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
                    >
                      Next <ArrowRight className="w-8 h-8" />
                    </button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative mb-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-tr from-yellow-400 via-orange-400 to-yellow-400 rounded-full opacity-20 blur-2xl"
                      />
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="relative bg-gradient-to-b from-yellow-300 to-orange-400 p-8 rounded-full shadow-2xl border-8 border-white"
                      >
                        <Trophy className="w-32 h-32 text-white" />
                      </motion.div>
                      <div className="absolute -top-4 -right-4 bg-red-500 text-white text-xl font-black px-4 py-2 rounded-full shadow-lg rotate-12">
                        MASTER
                      </div>
                    </div>

                    <h1 className="text-5xl font-black mb-4 text-orange-600 tracking-tight">
                      Master Explorer Badge!
                    </h1>
                    <p className="text-2xl mb-10 text-stone-600 font-medium">
                      Congratulations! You've mastered the wonders of China!
                    </p>

                    <div className="relative w-full h-48 bg-stone-50 rounded-3xl border-2 border-stone-100 mb-12 overflow-hidden p-4">
                      <img 
                        src="https://chinamap360.com/img/0/blank-map-of-china.jpg"
                        className="w-full h-full object-cover opacity-20 grayscale absolute inset-0"
                        alt="China Map"
                        referrerPolicy="no-referrer"
                      />
                      {LANDMARKS.map(l => (
                        <motion.div
                          key={l.id}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 2 + (LANDMARKS.indexOf(l) * 0.1) }}
                          style={{ left: `${l.x}%`, top: `${l.y}%` }}
                          className={cn("absolute w-6 h-6 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg border-2 border-white flex items-center justify-center text-[10px] text-white", l.color)}
                        >
                          {IconMap[l.icon]}
                        </motion.div>
                      ))}
                      <div className="absolute bottom-2 right-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        Your Discovery Map
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        playSound('pop');
                        setFoundLandmarks([]);
                        setGameState('start');
                        setRewardStep(0);
                      }}
                      className="bg-stone-800 hover:bg-stone-900 text-white text-2xl font-bold py-6 px-12 rounded-full shadow-lg transform transition hover:scale-105 active:scale-95"
                    >
                      Explore Again!
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Audio Toggle (Optional but nice) */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => playSound('click')}
          className="bg-white/80 backdrop-blur-md p-4 rounded-full shadow-lg border border-stone-200 text-stone-400 hover:text-orange-500 transition-colors"
        >
          <Volume2 className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
