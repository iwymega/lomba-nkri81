import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Share2 } from 'lucide-react';
import CertificateStory from './CertificateStory';
import { shareOrDownloadCertificate } from '../utils/exportToImage';
import { submitScore } from '../utils/leaderboard';

const TOTAL_TIME = 14;
const FINISH_DISTANCE = 100;

function getVerdict(distance) {
  if (distance >= 100) return 'Roket Karung Senja';
  if (distance >= 88) return 'Sprinter RT Favorit';
  if (distance >= 66) return 'Lompatan Mulai Rapi';
  if (distance >= 44) return 'Langkah Masih Hati-hati';
  return 'Belum Menemukan Ritme';
}

export default function SackRaceGame({ playerName, region, onExit }) {
  const [phase, setPhase] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [distance, setDistance] = useState(0);
  const [expectedSide, setExpectedSide] = useState('left');
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [flash, setFlash] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [submitState, setSubmitState] = useState('idle');

  useEffect(() => {
    if (phase !== 'countdown') return undefined;

    if (countdown === 0) {
      setPhase('playing');
      return undefined;
    }

    const timer = window.setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== 'playing') return undefined;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setPhase('finished');
          confetti({ particleCount: 160, spread: 80, origin: { y: 0.64 } });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'finished' || submitState !== 'idle') return;

    setSubmitState('submitting');
    submitScore({
      gameKey: 'karung',
      playerName,
      region,
      score: Math.round(distance),
      detailLabel: 'Ritme terbaik',
      detailValue: `${bestStreak} langkah rapi`,
      verdict: getVerdict(distance),
    })
      .then((result) => {
        if (result?.skipped) {
          setSubmitState('missing-config');
          return;
        }
        setSubmitState('saved');
      })
      .catch(() => {
        setSubmitState('error');
      });
  }, [phase, submitState, playerName, region, distance, bestStreak]);

  const handleStep = (side) => {
    if (phase !== 'playing') return;

    if (side === expectedSide) {
      const nextStreak = streak + 1;
      const gain = Math.min(10, 5 + Math.floor(nextStreak / 4));
      setDistance((prev) => Math.min(FINISH_DISTANCE, prev + gain));
      setExpectedSide(side === 'left' ? 'right' : 'left');
      setStreak(nextStreak);
      setBestStreak((prev) => Math.max(prev, nextStreak));
      setFlash('clean');
    } else {
      setDistance((prev) => Math.max(0, prev - 8));
      setStreak(0);
      setFlash('slip');
    }

    window.setTimeout(() => setFlash(''), 200);
  };

  const resetGame = () => {
    setPhase('countdown');
    setCountdown(3);
    setTimeLeft(TOTAL_TIME);
    setDistance(0);
    setExpectedSide('left');
    setStreak(0);
    setBestStreak(0);
    setFlash('');
    setSubmitState('idle');
  };

  const handleShare = async () => {
    setIsSharing(true);
    await shareOrDownloadCertificate('certificate-karung', playerName, Math.round(distance));
    setIsSharing(false);
  };

  return (
    <main className="flex flex-1 flex-col px-4 pb-4">
      {phase === 'countdown' && (
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="festival-eyebrow mb-3">Arena 03 • Balap Karung</p>
          <div className="font-game text-[112px] font-black leading-none text-yellow-300">
            {countdown}
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/74">
            Tap <strong>kiri</strong> dan <strong>kanan</strong> bergantian.
            Kalau ritmenya putus, karung akan oleng dan laju melambat.
          </p>
        </section>
      )}

      {phase === 'playing' && (
        <section className="flex flex-1 flex-col">
          <div className="grid grid-cols-3 gap-2">
            <div className="festival-stat-card">
              <span>Waktu</span>
              <strong>{timeLeft}s</strong>
            </div>
            <div className="festival-stat-card">
              <span>Jarak</span>
              <strong>{Math.round(distance)}m</strong>
            </div>
            <div className="festival-stat-card">
              <span>Streak</span>
              <strong>{bestStreak}x</strong>
            </div>
          </div>

          <div className={`race-scene mt-4 flex-1 ${flash === 'slip' ? 'race-scene-slip' : ''}`}>
            <div className="race-sky"></div>
            <div className="race-track"></div>
            <div className="race-finish-line"></div>
            <div className="race-runner" style={{ left: `calc(${distance}% - 26px)` }}>
              <div className={`race-runner-body ${flash === 'clean' ? 'race-runner-jump' : ''}`}></div>
            </div>

            <div className="race-banner">
              <p className="festival-eyebrow mb-1">Instruksi langkah</p>
              <p className="text-sm font-semibold text-white">
                Giliran sekarang: <span className="text-yellow-300">{expectedSide.toUpperCase()}</span>
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" onPointerDown={() => handleStep('left')} className="festival-action-pad">
              Kiri
            </button>
            <button type="button" onPointerDown={() => handleStep('right')} className="festival-action-pad">
              Kanan
            </button>
          </div>
        </section>
      )}

      {phase === 'finished' && (
        <section className="flex flex-1 flex-col items-center text-center">
          <div className="mb-4">
            <CertificateStory
              id="certificate-karung"
              name={playerName}
              region={region}
              gameName="Arena 03 • Balap Karung"
              headline="Sack Race Dash"
              scoreLabel="Jarak tempuh"
              scoreValue={Math.round(distance)}
              scoreUnit="meter"
              detailLabel="Ritme terbaik"
              detailValue={`${bestStreak} langkah rapi`}
              verdict={getVerdict(distance)}
            />
          </div>

          <div className="grid w-full gap-2">
            <button type="button" onClick={handleShare} disabled={isSharing} className="festival-primary-button">
              <Share2 className="h-5 w-5" />
              {isSharing ? 'Memproses poster...' : 'Bagikan hasil arena'}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={resetGame} className="festival-secondary-button">
                <RotateCcw className="h-4 w-4" />
                Main lagi
              </button>
              <button type="button" onClick={onExit} className="festival-ghost-button h-full justify-center">
                Pilih arena lain
              </button>
            </div>

            <p className="text-center text-[12px] text-white/62">
              {submitState === 'submitting' && 'Menyimpan skor ke leaderboard global...'}
              {submitState === 'saved' && 'Skor berhasil tersimpan ke leaderboard global.'}
              {submitState === 'missing-config' && 'Leaderboard global belum aktif di environment ini.'}
              {submitState === 'error' && 'Skor gagal tersimpan. Cek koneksi atau konfigurasi database.'}
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
