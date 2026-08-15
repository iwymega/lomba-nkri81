import React, { useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Gauge, RotateCcw, Share2, Sparkles } from 'lucide-react';
import CertificateStory from './CertificateStory';
import { shareOrDownloadCertificate } from '../utils/exportToImage';
import { submitScore } from '../utils/leaderboard';

const TOTAL_TIME = 18;
const CRACKER_COUNT = 9;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getVerdict(score) {
  if (score >= 120) return 'Legenda Kerupuk Gantung';
  if (score >= 90) return 'Bintang Panggung Sore';
  if (score >= 65) return 'Jagoan Habis Sebelum Senja';
  if (score >= 40) return 'Makin Panas, Makin Mantap';
  return 'Pemanasan Belum Kelar';
}

export default function KerupukGame({ playerName, region, onExit }) {
  const [phase, setPhase] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [feverProgress, setFeverProgress] = useState(0);
  const [isFever, setIsFever] = useState(false);
  const [tps, setTps] = useState('0.0');
  const [burstSeed, setBurstSeed] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [submitState, setSubmitState] = useState('idle');

  const lastTapTime = useRef(0);
  const submittedRef = useRef(false);

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
          confetti({ particleCount: 180, spread: 96, origin: { y: 0.65 } });
          return 0;
        }
        return prev - 1;
      });

      setFeverProgress((prev) => clamp(prev - 18, 0, 100));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const elapsed = TOTAL_TIME - timeLeft;
    setTps(elapsed > 0 ? (score / elapsed).toFixed(1) : '0.0');
  }, [phase, score, timeLeft]);

  useEffect(() => {
    if (feverProgress >= 100 && !isFever) {
      setIsFever(true);
    } else if (feverProgress < 30 && isFever) {
      setIsFever(false);
    }
  }, [feverProgress, isFever]);

  useEffect(() => {
    if (phase !== 'finished' || submittedRef.current) return;

    submittedRef.current = true;
    setSubmitState('submitting');

    submitScore({
      gameKey: 'kerupuk',
      playerName,
      region,
      score,
      detailLabel: 'Kecepatan rata-rata',
      detailValue: `${tps} TPS`,
      verdict: getVerdict(score),
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
  }, [phase, playerName, region, score, tps]);

  const crackerLeft = useMemo(
    () => Math.max(0, CRACKER_COUNT - Math.floor(score / 12)),
    [score]
  );

  const handleTap = (event) => {
    event.preventDefault();
    if (phase !== 'playing') return;

    const now = Date.now();
    const timeDiff = now - lastTapTime.current;
    lastTapTime.current = now;

    const isFastTap = timeDiff > 0 && timeDiff < 170;
    const nextCombo = isFastTap ? combo + 1 : 1;
    const nextFeverProgress = clamp(
      feverProgress + (isFastTap ? 14 : -6),
      0,
      100
    );
    const feverForThisTap = isFever || nextFeverProgress >= 100;
    const addedScore = feverForThisTap ? 2 : 1;

    if (navigator.vibrate) navigator.vibrate(12);

    setCombo(nextCombo);
    setFeverProgress(nextFeverProgress);
    setIsFever(feverForThisTap || nextFeverProgress >= 30);
    setScore((prev) => prev + addedScore);
    setBurstSeed((prev) => prev + 1);
  };

  const resetGame = () => {
    setPhase('countdown');
    setCountdown(3);
    setTimeLeft(TOTAL_TIME);
    setScore(0);
    setCombo(0);
    setFeverProgress(0);
    setIsFever(false);
    setTps('0.0');
    setBurstSeed(0);
    setSubmitState('idle');
    submittedRef.current = false;
    lastTapTime.current = 0;
  };

  const handleShare = async () => {
    setIsSharing(true);
    await shareOrDownloadCertificate('certificate-kerupuk', playerName, score);
    setIsSharing(false);
  };

  return (
    <main className="flex flex-1 flex-col px-4 pb-3">
      {phase === 'countdown' && (
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="festival-eyebrow mb-3">Arena 01 • Makan Kerupuk</p>
          <div className="font-game text-[96px] font-black leading-none text-yellow-300 drop-shadow-[0_16px_30px_rgba(0,0,0,0.45)]">
            {countdown}
          </div>
          <div className="festival-panel mt-4 w-full max-w-sm text-left">
            <p className="mb-1.5 flex items-center gap-2 text-sm font-bold text-yellow-300">
              <Sparkles className="h-4 w-4" />
              Target permainan
            </p>
            <p className="text-[13px] leading-5 text-white/74">
              Jaga ritme tap untuk menaikkan <strong>fever</strong>, lalu habiskan
              kerupuk gantung dengan tempo cepat dan stabil.
            </p>
          </div>
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
              <span>Skor</span>
              <strong>{score}</strong>
            </div>
            <div className="festival-stat-card">
              <span>TPS</span>
              <strong>{tps}</strong>
            </div>
          </div>

          <div className="mt-2.5 rounded-[24px] border border-white/10 bg-black/20 p-2.5 shadow-[0_20px_40px_rgba(0,0,0,0.22)]">
            <div className="mb-2 overflow-hidden rounded-full border border-white/10 bg-white/6 p-1">
              <div
                className="h-3 rounded-full bg-[linear-gradient(90deg,#facc15,#fb923c,#ef4444)] transition-all duration-150"
                style={{ width: `${feverProgress}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-white/58">
              <span>Crowd Heat</span>
              <span>{isFever ? 'Fever x2 aktif' : `Combo ${combo}x`}</span>
            </div>
          </div>

          <div className={`kerupuk-scene mt-3 flex-1 ${isFever ? 'kerupuk-scene-fever' : ''}`}>
            <div className="kerupuk-scene-glow"></div>
            <div className="kerupuk-crowd"></div>
            <div className="kerupuk-rope"></div>
            <div className="kerupuk-hook"></div>

            <button
              type="button"
              onPointerDown={handleTap}
              className="kerupuk-ring-button"
              aria-label="Tap untuk menggigit kerupuk"
            >
              <div className="kerupuk-ring">
                {Array.from({ length: CRACKER_COUNT }).map((_, index) => {
                  const visible = index < crackerLeft;
                  const angle = (360 / CRACKER_COUNT) * index;
                  return (
                    <span
                      key={`${burstSeed}-${index}`}
                      className={`kerupuk-chip ${visible ? '' : 'kerupuk-chip-gone'}`}
                      style={{ transform: `rotate(${angle}deg) translateY(-86px)` }}
                    ></span>
                  );
                })}
              </div>

              <div className="kerupuk-center-label">
                <span className="font-game text-lg font-black text-red-950">
                  TAP
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-950/70">
                  gigitan cepat
                </span>
              </div>

              <div key={burstSeed} className="kerupuk-crumb-burst">
                {Array.from({ length: 10 }).map((_, index) => (
                  <span
                    key={index}
                    className="kerupuk-crumb"
                    style={{ '--crumb-angle': `${index * 36}deg` }}
                  ></span>
                ))}
              </div>
            </button>

            <div className="kerupuk-stage-info">
              <div>
                <p className="festival-eyebrow mb-1">Visual Core</p>
                <p className="text-[13px] leading-[1.15rem] text-white/78">
                  Arena digeser ke hanging ring dengan depth, rope, crowd, dan
                  burst remah agar terasa lebih hidup.
                </p>
              </div>
              <div className="flex items-center gap-2 text-yellow-300">
                <Gauge className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-[0.24em]">
                  Realistic motion
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {phase === 'finished' && (
        <section className="flex flex-1 flex-col items-center text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-yellow-300/50 bg-yellow-300/12 px-4 py-1.5 text-xs font-black uppercase tracking-[0.26em] text-yellow-300">
            <Flame className="h-4 w-4" />
            Arena selesai
          </div>

          <div className="mb-3 scale-[0.94] origin-top">
            <CertificateStory
              id="certificate-kerupuk"
              name={playerName}
              region={region}
              gameName="Arena 01 • Makan Kerupuk"
              headline="Kerupuk Sprint"
              scoreLabel="Total gigitan"
              scoreValue={score}
              scoreUnit="poin"
              detailLabel="Kecepatan rata-rata"
              detailValue={`${tps} TPS`}
              verdict={getVerdict(score)}
            />
          </div>

          <div className="grid w-full gap-2">
            <button
              type="button"
              onClick={handleShare}
              disabled={isSharing}
              className="festival-primary-button"
            >
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
