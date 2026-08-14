📄 Product Requirement Document (PRD) — Lomba Kemerdekaan Digital (HUT RI ke-81)Nama Produk: Lomba Kemerdekaan Digital — HUT RI ke-81Target Rilis: Agustus 2026Tech Stack: Vite, React.js, Tailwind CSS, html-to-image, framer-motion, VercelStatus Dokumen: Approved / Production-Ready📌 1. Executive Summary & Visi ProdukMemperingati Hari Ulang Tahun Kemerdekaan Republik Indonesia ke-81, aplikasi web ini dirancang sebagai platform mini game web kasual bertema lomba tradisional 17-an.Tujuan Utama: Menghasilkan engagement dan viralitas tinggi melalui integrasi Instagram Story Share (rasio 9:16) yang cepat, estetik, dan presisi tanpa perlu arsitektur backend yang rumit.Target Pengguna: Seluruh masyarakat Indonesia pengguna smartphone, khususnya pengguna aktif media sosial (Instagram, WhatsApp, TikTok).Nilai Unggul: Dioptimalkan penuh untuk In-App Browser (Instagram & WhatsApp Webview), tanpa perlu instalasi aplikasi, bebas lag, serta mengusung mekanisme one-tap play.🛠️ 2. Tech Stack & Ketergantungan (Dependencies)LayerTeknologi / LibraryAlasan PemilihanBuild Tool & UIVite + React.jsPerforma build super cepat, HMR responsif, bundle size minimal.StylingTailwind CSS v3 / v4Kemudahan styling utility-first, responsif, dan fleksibilitas animasi.AnimationFramer Motion + Canvas-ConfettiAnimasi UI yang sehalus aplikasi native dan efek selebrasi kemenangan.Image Generationhtml-to-imageKonversi elemen DOM HTML/Tailwind ke gambar PNG 1080x1920 di browser client.Icons & AudioLucide-React + HTML5 Audio APIIkon modern dan SFX ringan tanpa menambah beban dependensi.Hosting & CDNVercelDeployment otomatis dari GitHub, SSL gratis, Edge CDN berkecepatan tinggi.📁 3. Arsitektur Berkas & Struktur Proyeklomba-kemerdekaan/
├── public/
│   ├── audio/
│   │   ├── kriuk.mp3            # SFX saat kerupuk di-tap
│   │   ├── cheer.mp3            # SFX selebrasi game over
│   │   └── countdown.mp3        # SFX hitung mundur 3..2..1
│   ├── favicon.ico
│   └── og-banner.png            # Preview link di WhatsApp / Medsos
├── src/
│   ├── assets/
│   │   ├── kerupuk.png          # Asset gambar kerupuk HD
│   │   ├── flag-bg.svg          # Elemen dekorasi Merah Putih
│   │   └── badge-gold.svg       # Lencana juara
│   ├── components/
│   │   ├── CertificateStory.jsx # Layout Sertifikat 9:16 (Target html-to-image)
│   │   ├── CountdownOverlay.jsx # Overlay animasi 3..2..1
│   │   ├── KerupukGame.jsx      # Area bermain & logika tap
│   │   ├── LeaderboardModal.jsx # Modal skor tertinggi
│   │   └── ShareDrawer.jsx      # Bottom-sheet/Modal untuk opsi share & download
│   ├── hooks/
│   │   ├── useAudio.js          # Hook pengelola SFX & mute/unmute
│   │   └── useVibration.js      # Hook haptic feedback HP
│   ├── utils/
│   │   ├── exportToImage.js     # Engine html-to-image & Web Share API
│   │   ├── titleCalculator.js   # Algoritma penentu gelar berdasarkan skor
│   │   └── storage.js           # Helper localStorage
│   ├── App.jsx                  # Main State Machine Router
│   ├── index.css                # Custom Utility Tailwind & Anti-Touch Bug
│   └── main.jsx
├── tailwind.config.js
├── vite.config.js
├── vercel.json
├── package.json
└── PRD.md
🔄 4. User Flow & State Machine Lifecycle4.1. Alur Pengguna (User Journey)[ 1. Landing Page ]
        │
        ▼
[ 2. Input Nama & Daerah ]
        │
        ▼
[ 3. Countdown (3..2..1) ] ──> Audio Context Initialized
        │
        ▼
[ 4. Playing Phase (15 Detik Tap Rapidly) ] ──> Haptic + SFX + Combo
        │
        ▼
[ 5. Game Over Phase ] ──> Trigger Confetti & Kalkulasi Gelar
        │
        ▼
[ 6. Result & IG Story Canvas Preview ]
        │
        ├───> [ Web Share API (Direct Share to IG/WA) ]
        └───> [ Fallback: Download High-Res PNG (1080x1920) ]
4.2. Definisikan State Machine (gameState)StateTrigger MasukPerilaku SystemAkses Tombol / InteraksiIDLEAplikasi dibuka / ResetTampilan form registrasi & tutorial singkat.Input nama aktif, tombol "Mulai" aktif.COUNTDOWNUser klik "Mulai Lomba"Memutar audio countdown, hitung mundur 3 ke 1 di layar.Seluruh tombol di-lock (mencegah curi start).PLAYINGCountdown selesai (timer === 0)Timer 15s berjalan mundur, deteksi tap pengguna, hitung skor & combo.Area tap aktif penuh, tombol reset nonaktif.FINISHEDTimer bermain habis (timer === 0)Mencegah tap lanjutan, putar SFX cheer, hitung gelar, render komponen sertifikat.Tombol "Bagikan ke IG Story" & "Main Lagi" aktif.🎯 5. Spesifikasi Fitur Detail5.1. Landing Page & RegistrasiInput Nama: Form nama panggilan (Min. 2 karakter, Maks. 15 karakter).Input Daerah (Opsional): Nama RT/RW/Kota (Maks. 20 karakter).High Score Badge: Memunculkan rekor pribadi tertinggi pengguna dari localStorage.Sound Toggle: Switcher On/Off untuk SFX.5.2. Core Game: Lomba Makan Kerupuk TapperBatas Waktu Game: Tepat 15 Detik.Mekanisme Tap & Visual:Setiap tap mengurangi area fisik kerupuk (efek CSS clip-path atau gambar kerupuk berganti dari Utuh -> Setengah -> Tinggal Tali).Efek visual remahan kerupuk (crumb particle explosion) setiap kali di-tap.Mekanisme Combo Multiplier:Jika jarak antar-tap < 200ms sebanyak 5x berturut-turut, Combo Multiplier aktif (Skor +2 per tap).Indikator teks "COMBO 2x!", "SUPER SPEED!" muncul bergoyang di layar.Haptic Feedback: Vibrasi HP 10ms setiap tap berhasil (navigator.vibrate(10)).5.3. Sertifikat IG Story 9:16 (Client-Side Canvas Exporter)Ukuran Asli Canvas Exporter: 1080px x 1920px (Rasio 9:16 presisi standar Instagram Story).Logika Penentuan Gelar (Title Algorithm):0 - 30 Tap: Warga Kerupuk Melempem 🥣31 - 70 Tap: Warga RT Teladan 🇮🇩71 - 110 Tap: Juara Lomba Kemerdekaan 🏆111 - 150 Tap: Suhu Makan Kerupuk ⚡151+ Tap: Pahlawan Nasional Makan Kerupuk 🎖️> 250 Tap: Tersangka Auto-Clicker 🤖 (Sistem deteksi bot).Komponen Visual Sertifikat:Header Kemerdekaan RI Ke-81 dengan pita Merah Putih.Nama Pengguna & Asal Daerah.Total Poin & Nilai Tap Per Second (TPS).Badge Gelar Kehormatan.Stempel Resmi "Tergokil 17 Agustus 2026".QR Code / Text Link: lomba-81.vercel.app.5.4. Native Web Share API & Fallback EngineAlur Utama (Mobile Modern Browser):html-to-image mengonversi DOM #certificate-story menjadi Base64 Data URL.Data URL diubah menjadi Blob, kemudian dibungkus sebagai File (image/png).Memanggil navigator.share({ files: [file], title: '...', text: '...' }).Alur Fallback (In-App Browser WA/IG / Desktop):Jika navigator.canShare bernilai false, sistem otomatis memicu modal:Android/Desktop: Otomatis download file Sertifikat-17an-[Nama].png.iOS Safari/In-App Browser: Membuka gambar di tab baru / popup modal dengan instruksi: "Tahan Gambar, lalu pilih Simpan ke Foto / Salin".5.5. Leaderboard System (Local & Anti-Cheat)Local Leaderboard: Menyimpan 5 rekor tertinggi di browser perangkat via localStorage.Proteksi Anti-Curang (Simple Anti-Bot):Kecepatan tap manusia maksimal adalah ~15-18 TPS (Tap Per Second).Jika total tap > 250 dalam 15 detik (>16.6 TPS), skor ditandai sebagai Invalid Score dan gelar otomatis diubah menjadi "Tersangka Auto-Clicker 🤖".🎨 6. Sistem Desain & Panduan UI/UX6.1. Palette Warna (Tailwind CSS Mapping)Nama WarnaHex CodeTailwind ClassPeruntukan UIMerah Bendera#DC2626bg-red-600Primary Button, Header, Sertifikat BGMerah Tua Gelap#991B1Bbg-red-800Border Accent, Gradient OverlayKuning Emas#FACC15bg-yellow-400Badge Gelar, Trofi, Text HighlightPutih Bersih#FFFFFFbg-whiteCard Background, Sertifikat BodyHitam Slate#0F172Atext-slate-900Typography Utama6.2. TipografiFont Utama UI: Poppins, sans-serif (Legible & Modern).Font Judul & Skor: Fredoka / Titan One / Impact (Gaya gamified & tegas).⚡ 7. Penanganan Bug, Edge Cases & Constraint Mobile BrowserNoPotensi Bug / Isu MobilePenyebab UtamaSolusi Teknis / Fix Code1Double-Tap ZoomingFitur bawaan Safari/Chrome HP saat layar di-tap cepat.Tambahkan touch-action: manipulation; dan meta tag user-scalable=no.2Text Selection & HighlightTeks/gambar terblokir biru saat di-tap bertubi-tubi.Tambahkan CSS -webkit-user-select: none; pada area bermain.3Autoplay Audio BlockedBrowser memblokir sound effect jika belum ada interaksi pengguna.Inisialisasi Audio Context tepat pada tombol onClick "Mulai Game".4Webview Share BlockedIn-App browser Instagram tidak mengizinkan trigger intent share aplikasi lain.Gunakan Fallback Modal dengan instruksi Download Direct / Long-press Save Image.5Render Font Rusak di PNGhtml-to-image gagal meload custom font dari Google Fonts saat export.Load Google Fonts menggunakan sintaks <link> standar HTML dan tunggu document.fonts.ready sebelum export.💻 8. Implementasi Kode Komponen Kunci8.1. Setup CSS Anti-Zoom & Anti-Selection (src/index.css)@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  /* Class wajib dipasang di container area game tapper */
  .game-touch-prevent {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
}

@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Poppins:wght@400;600;800&display=swap');

body {
  font-family: 'Poppins', sans-serif;
  overflow-x: hidden;
  background-color: #7f1d1d;
}

.font-game {
  font-family: 'Fredoka', cursive, sans-serif;
}
8.2. Helper Export IG Story (src/utils/exportToImage.js)import { toPng } from 'html-to-image';

export async function shareOrDownloadCertificate(elementId, playerName, score) {
  const node = document.getElementById(elementId);
  if (!node) {
    alert('Elemen sertifikat tidak ditemukan!');
    return;
  }

  try {
    await document.fonts.ready;

    const dataUrl = await toPng(node, {
      pixelRatio: 3,
      cacheBust: true,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
      },
    });

    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const fileName = `Sertifikat-17an-${playerName.replace(/\s+/g, '_')}.png`;
    const file = new File([blob], fileName, { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Hasil Lomba 17-an Ku!',
        text: `Gue dapet skor ${score} di Lomba Makan Kerupuk Kemerdekaan RI ke-81! Cobain juga di lomba-81.vercel.app`,
      });
      return { success: true, mode: 'shared' };
    } 

    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    link.click();
    return { success: true, mode: 'downloaded' };

  } catch (err) {
    console.error('Gagal memproses gambar sertifikat:', err);
    return { success: false, error: err };
  }
}
8.3. Komponen Sertifikat IG Story (src/components/CertificateStory.jsx)import React from 'react';

export default function CertificateStory({ name, region, score, title }) {
  return (
    <div
      id="certificate-story"
      className="w-[360px] h-[640px] bg-gradient-to-b from-red-600 via-red-700 to-red-900 p-6 flex flex-col justify-between items-center text-white relative overflow-hidden game-touch-prevent"
      style={{ aspectRatio: '9/16' }}
    >
      {/* Background Ornament Merah Putih */}
      <div className="absolute top-0 left-0 w-full h-3 bg-white"></div>
      <div className="absolute top-3 left-0 w-full h-3 bg-red-600"></div>

      {/* Header */}
      <div className="text-center z-10 mt-6">
        <span className="bg-yellow-400 text-red-950 font-black text-[11px] px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
          Peringatan HUT RI Ke-81 🇲🇨
        </span>
        <h1 className="text-2xl font-game font-bold mt-3 tracking-wide drop-shadow-md">
          SERTIFIKAT LOMBA
        </h1>
        <p className="text-[10px] text-red-100 font-medium">Edisi Resmi Digital • 17 Agustus 2026</p>
      </div>

      {/* Body Card */}
      <div className="w-full bg-white text-slate-900 rounded-2xl p-5 shadow-2xl z-10 text-center border-4 border-yellow-400 relative">
        <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider">
          Sertifikat Ini Diberikan Kepada:
        </p>
        <h2 className="text-xl font-black text-red-600 my-1 truncate font-game">
          {name || 'Warga Merdeka'}
        </h2>
        {region && (
          <p className="text-xs text-slate-500 font-medium -mt-1 mb-2">
            📍 {region}
          </p>
        )}

        <div className="my-3 py-3 bg-red-50 rounded-xl border border-red-100 shadow-inner">
          <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
            Hasil Skor Lomba Makan Kerupuk
          </p>
          <p className="text-4xl font-game font-black text-red-600 my-1">
            {score} <span className="text-xs font-sans font-semibold text-slate-600">Gigitan</span>
          </p>
        </div>

        <p className="text-[10px] text-gray-400 font-semibold uppercase">Gelar Resmi Warga:</p>
        <div className="mt-1 bg-yellow-400 text-red-950 font-game font-bold text-sm py-2 px-3 rounded-xl shadow">
          {title}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="text-center z-10 mb-3">
        <p className="text-xs font-bold text-yellow-300 drop-shadow">
          Bisa ngalahin rekor gue?
        </p>
        <p className="text-[10px] text-red-100 font-mono mt-0.5">
          Mainkan di: <span className="underline">lomba-81.vercel.app</span>
        </p>
      </div>
    </div>
  );
}
8.4. Komponen Utama Game (src/components/KerupukGame.jsx)import React, { useState, useEffect, useRef } from 'react';
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
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-red-950 font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95"
            >
              {isSharing ? 'Memproses Gambar...' : '📸 Bagikan ke Instagram Story'}
            </button>
            <button
              onClick={onReset}
              className="w-full bg-red-700 hover:bg-red-600 text-white font-semibold py-2 rounded-xl transition-all"
            >
              🔄 Main Lagi / Ganti Nama
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
🧪 9. QA Checklist & Testing Strategy[ ] A. Performance & Mobile UX[ ] Aplikasi dimuat dalam waktu < 2 detik pada jaringan 4G.[ ] Tidak terjadi zooming saat layar di-tap bertubi-tubi (10+ tap/detik).[ ] Efek getar (haptic feedback) terdistribusi baik di Android Chrome.[ ] B. Image Export & Web Share[ ] File PNG hasil ekspor berukuran tepat 1080px x 1920px.[ ] Teks nama, skor, dan gelar tidak mengalami text overflow.[ ] Fallback download berjalan lancar jika dibuka via WhatsApp In-App Webview.[ ] C. Anti-Cheat & Game Logic[ ] Countdown 3..2..1 mengunci seluruh aksi input.[ ] Skor > 250 tap dalam 15s mendeteksi status bot secara otomatis.🚀 10. Deployment & Quick Start Guide# 1. Clone & Setup Project
npm create vite@latest lomba-kemerdekaan -- --template react
cd lomba-kemerdekaan

# 2. Install Dependencies
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install html-to-image framer-motion canvas-confetti lucide-react

# 3. Development Mode
npm run dev

# 4. Deploy to Vercel
npm install -g vercel
vercel --prod
