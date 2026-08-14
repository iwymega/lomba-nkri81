import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { shareOrDownloadCertificate } from '../utils/exportToImage';
import CertificateStory from './CertificateStory';

export default function KerupukGame({ playerName, region, onReset }) {
  const [gameState, setGameState] = useState('COUNTDOWN');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(15);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [isSharing, setIsSharing] = useState(false);

  const lastTapTime = useRef(0);

  const getTitle = (s) => {
    if (s > 250) return 'Tersangka Auto-Clicker 🤖';
    if (s >= 151) return 'Pahlawan Makan Kerupuk 🎖️';
    if (s >= 111) return 'Suhu Makan Kerupuk ⚡';
    if (s >= 71) return 'Juara Lomba Kemerdekaan 🏆';
    if (s >= 31) return 'Warga RT Teladan 🇮🇩';
    return 'Warga Kerupuk Melempem 🥣';
  };

  useEffect(() => {
    if (gameState === 'COUNTDOWN') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState('PLAYING');
      }
    }
  }, [gameState, countdown]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      if (timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setGameState('FINISHED');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    }
  }, [gameState, timeLeft]);

  const handleTap = () => {
    if (gameState !== 'PLAYING') return;

    const now = Date.now();
    const timeDiff = now - lastTapTime.current;
    lastTapTime.current = now;

    if (navigator.vibrate) navigator.vibrate(10);

    if (timeDiff < 200) {
      setCombo((prev) => prev + 1);
    } else {
      setCombo(0);
    }

    const addedScore = combo > 5 ? 2 : 1;
    setScore((prev) => prev + addedScore);
  };

  const handleShare = async () => {
    setIsSharing(true);
    await shareOrDownloadCertificate('certificate-story', playerName, score);
    setIsSharing(false);
  };

  return (
    <div className="min-h-screen bg-red-900 flex flex-col items-center justify-center p-4 game-touch-prevent">
      {gameState === 'COUNTDOWN' && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">SIAP-SIAP...</h2>
          <div className="text-8xl font-game font-black text-yellow-400 animate-bounce">
            {countdown}
          </div>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div className="flex flex-col items-center w-full max-w-sm">
          <div className="flex justify-between w-full bg-red-800 text-white p-4 rounded-xl border border-red-700 mb-6">
            <div>
              <p className="text-xs text-red-200">SISA WAKTU</p>
              <p className="text-3xl font-game text-yellow-400">{timeLeft}s</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-red-200">SKOR</p>
              <p className="text-3xl font-game text-white">{score}</p>
            </div>
          </div>

          {combo > 5 && (
            <div className="text-yellow-300 font-game text-sm animate-pulse mb-2">
              🔥 COMBO 2x SPEED! 🔥
            </div>
          )}

          <button
            onClick={handleTap}
            className="w-64 h-64 bg-yellow-100 rounded-full border-8 border-yellow-400 flex items-center justify-center shadow-2xl active:scale-95 transition-transform cursor-pointer relative overflow-hidden"
          >
            <span className="text-6xl select-none">🍘</span>
            <span className="absolute bottom-4 text-xs font-bold text-yellow-800 bg-yellow-300 px-3 py-1 rounded-full">
              TAP SECEPATNYA!
            </span>
          </button>
        </div>
      )}

      {gameState === 'FINISHED' && (
        <div className="flex flex-col items-center w-full max-w-md">
          <h2 className="text-xl font-bold text-white mb-3">🎉 Lomba Selesai! 🎉</h2>

          <div className="shadow-2xl rounded-2xl overflow-hidden mb-4 border-2 border-yellow-400">
            <CertificateStory
              name={playerName}
              region={region}
              score={score}
              title={getTitle(score)}
            />
          </div>

          <div className="flex flex-col gap-2 w-full px-6">
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-red-950 font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              {isSharing ? 'Memproses Gambar...' : '📸 Bagikan ke Instagram Story'}
            </button>
            <button
              onClick={onReset}
              className="w-full bg-red-700 hover:bg-red-600 text-white font-semibold py-2 rounded-xl transition-all cursor-pointer"
            >
              🔄 Main Lagi / Ganti Nama
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
