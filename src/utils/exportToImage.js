import { toPng } from 'html-to-image';

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
    const safeName = (playerName || 'Pemain_Merdeka').replace(/\s+/g, '_');
    const fileName = `Sertifikat-17an-${safeName}.png`;
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
