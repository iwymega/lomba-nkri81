import React from 'react';

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
