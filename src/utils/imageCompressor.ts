/**
 * Highly optimized client-side image compression utility.
 * Compresses images quickly using HTML5 Canvas to lightweight WebP/JPEG (~20KB-45KB).
 * Frees canvas memory immediately to prevent browser memory leaks or sluggishness.
 */
export const compressImageFile = (
  file: File,
  maxDimension = 720,
  quality = 0.74
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If it's already an SVG, pass directly
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read SVG file'));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawResult = e.target?.result as string;
      if (!rawResult) {
        reject(new Error('Failed to load file contents'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(width, 1);
          canvas.height = Math.max(height, 1);

          const ctx = canvas.getContext('2d', { alpha: true });
          if (!ctx) {
            resolve(rawResult);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'medium';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Test WebP support first for minimum byte size
          let compressed = '';
          try {
            compressed = canvas.toDataURL('image/webp', quality);
          } catch {}

          if (!compressed || !compressed.startsWith('data:image/webp')) {
            compressed = canvas.toDataURL('image/jpeg', quality);
          }

          // If still over 150KB, reduce dimension to 480px
          if (compressed.length > 180000) {
            const smallerCanvas = document.createElement('canvas');
            const scale = 480 / Math.max(width, height);
            smallerCanvas.width = Math.round(width * scale);
            smallerCanvas.height = Math.round(height * scale);
            const sCtx = smallerCanvas.getContext('2d');
            if (sCtx) {
              sCtx.imageSmoothingEnabled = true;
              sCtx.drawImage(canvas, 0, 0, smallerCanvas.width, smallerCanvas.height);
              compressed = smallerCanvas.toDataURL('image/jpeg', 0.68);
              smallerCanvas.width = 1;
              smallerCanvas.height = 1;
            }
          }

          // Immediately clear canvas dimensions to release GPU & RAM memory
          canvas.width = 1;
          canvas.height = 1;

          resolve(compressed);
        } catch {
          resolve(rawResult);
        }
      };

      img.onerror = () => {
        resolve(rawResult);
      };

      img.src = rawResult;
    };

    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};
