import React, { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { Activity, RotateCcw, Share2 } from 'lucide-react';
import CertificateStory from './CertificateStory';
import { shareOrDownloadCertificate } from '../utils/exportToImage';
import { submitScore } from '../utils/leaderboard';

const TOTAL_TIME = 14;

function getVerdict(tension) {
  if (tension >= 78) return 'Kapten Tarik Tambang';
  if (tension >= 52) return 'Juru Tensi Lapangan';
  if (tension >= 24) return 'Masih Menang Tipis';
  if (tension >= 0) return 'Pertahanan Cukup Kuat';
  return 'Lawan Terlalu Solid';
}

export default function TugOfWarGame({ playerName, region, onExit }) {
  const [phase, setPhase] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [ropeOffset, setRopeOffset] = useState(0);
  const [meter, setMeter] = useState(0);
  const [direction, setDirection] = useState(1);
  const [perfectHits, setPerfectHits] = useState(0);
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

    const timeTimer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timeTimer);
          setPhase('finished');
          confetti({ particleCount: 170, spread: 88, origin: { y: 0.62 } });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const meterTimer = window.setInterval(() => {
      setMeter((prev) => {
        const next = prev + direction * 13;
        if (next >= 100) {
          setDirection(-1);
          return 100;
        }
        if (next <= 0) {
          setDirection(1);
          return 0;
        }
        return next;
      });
    }, 90);

    return () => {
      window.clearInterval(timeTimer);
      window.clearInterval(meterTimer);
    };
  }, [phase, direction]);

  useEffect(() => {
    if (phase !== 'finished' || submitState !== 'idle') return;

    setSubmitState('submitting');
    submitScore({
      gameKey: 'tarik',
      playerName,
      region,
      score: ropeOffset,
      detailLabel: 'Perfect timing',
      detailValue: `${perfectHits} kali`,
      verdict: getVerdict(ropeOffset),
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
  }, [phase, submitState, playerName, region, ropeOffset, perfectHits]);

  const zone = useMemo(() => {
    if (meter >= 46 && meter <= 54) return 'perfect';
    if (meter >= 36 && meter <= 64) return 'good';
    return 'miss';
  }, [meter]);

  const handlePull = () => {
    if (phase !== 'playing') return;

    if (zone === 'perfect') {
      setRopeOffset((prev) => Math.min(100, prev + 9));
      setPerfectHits((prev) => prev + 1);
    } else if (zone === 'good') {
      setRopeOffset((prev) => Math.min(100, prev + 3));
    } else {
      setRopeOffset((prev) => Math.max(-100, prev - 11));
    }
  };

  const resetGame = () => {
    setPhase('countdown');
    setCountdown(3);
    setTimeLeft(TOTAL_TIME);
    setRopeOffset(0);
    setMeter(0);
    setDirection(1);
    setPerfectHits(0);
    setSubmitState('idle');
  };

  const handleShare = async () => {
    setIsSharing(true);
    await shareOrDownloadCertificate('certificate-tarik', playerName, ropeOffset);
    setIsSharing(false);
  };

  return (
    <main className="flex flex-1 flex-col px-4 pb-4">
      {phase === 'countdown' && (
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="festival-eyebrow mb-3">Arena 04 • Tarik Tambang</p>
          <div className="font-game text-[112px] font-black leading-none text-yellow-300">
            {countdown}
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/74">
            Tap saat indikator berada di zona emas. Semakin presisi timing-nya,
            semakin jauh tali bergeser ke kubu kamu.
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
              <span>Tegangan</span>
              <strong>{ropeOffset}</strong>
            </div>
            <div className="festival-stat-card">
              <span>Perfect</span>
              <strong>{perfectHits}</strong>
            </div>
          </div>

          <div className="tug-scene mt-4 flex-1">
            <div className="tug-sky"></div>
            <div className="tug-crowd"></div>
            <div className="tug-center-mark"></div>
            <div className="tug-rope" style={{ transform: `translateX(${ropeOffset}px)` }}>
              <span className="tug-knot"></span>
            </div>

            <div className="tug-meter-shell">
              <div className="tug-meter-track">
                <div className="tug-meter-perfect-zone"></div>
                <div className="tug-meter-good-zone"></div>
                <div className="tug-meter-pointer" style={{ left: `${meter}%` }}></div>
              </div>
              <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.22em] text-white/68">
                {zone === 'perfect' ? 'Zona emas' : zone === 'good' ? 'Masih aman' : 'Terlalu dini'}
              </p>
            </div>
          </div>

          <button type="button" onPointerDown={handlePull} className="festival-primary-button mt-4">
            <Activity className="h-5 w-5" />
            Tarik sekarang
          </button>
        </section>
      )}

      {phase === 'finished' && (
        <section className="flex flex-1 flex-col items-center text-center">
          <div className="mb-4">
            <CertificateStory
              id="certificate-tarik"
              name={playerName}
              region={region}
              gameName="Arena 04 • Tarik Tambang"
              headline="Tug of War Pulse"
              scoreLabel="Dominasi tarikan"
              scoreValue={ropeOffset}
              scoreUnit="tegangan"
              detailLabel="Perfect timing"
              detailValue={`${perfectHits} kali`}
              verdict={getVerdict(ropeOffset)}
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
