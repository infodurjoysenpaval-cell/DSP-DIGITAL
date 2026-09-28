/**
 * Utility to compress document photos (NID, Trade License, ID cards)
 * before saving to LocalStorage or Firestore.
 * Reduces 5MB-10MB mobile uploads down to ~60KB-120KB without losing legibility.
 */
export async function compressDocumentImage(
  file: File,
  maxWidth = 1000,
  quality = 0.72
): Promise<{ dataUrl: string; sizeFormatted: string }> {
  return new Promise((resolve) => {
    // If it's a PDF or non-image, read directly
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve({
          dataUrl: result,
          sizeFormatted: `${(file.size / 1024).toFixed(0)} KB`,
        });
      };
      reader.onerror = () => {
        resolve({ dataUrl: '', sizeFormatted: '0 KB' });
      };
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          const fallback = e.target?.result as string;
          resolve({
            dataUrl: fallback,
            sizeFormatted: `${(file.size / 1024).toFixed(0)} KB`,
          });
          return;
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const approxSizeKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);

        resolve({
          dataUrl: compressedDataUrl,
          sizeFormatted: `${approxSizeKb} KB (Optimized)`,
        });
      };
      img.onerror = () => {
        const fallback = e.target?.result as string;
        resolve({
          dataUrl: fallback,
          sizeFormatted: `${(file.size / 1024).toFixed(0)} KB`,
        });
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      resolve({ dataUrl: '', sizeFormatted: '0 KB' });
    };
    reader.readAsDataURL(file);
  });
}
