/**
 * Client-side image compression utility to optimize uploaded product images.
 * Keeps image quality high while reducing size to ~30KB-80KB to fit seamlessly in storage.
 */
export const compressImageFile = (
  file: File,
  maxDimension = 800,
  quality = 0.76
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If it's an SVG file, data URL directly
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

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawResult);
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Attempt WebP compression first for smaller payload
          let compressed = canvas.toDataURL('image/webp', quality);
          if (!compressed.startsWith('data:image/webp')) {
            compressed = canvas.toDataURL('image/jpeg', quality);
          }

          // If still over 150KB, compress further to 550px / 0.68
          if (compressed.length > 200000) {
            const smallerCanvas = document.createElement('canvas');
            const scale = 550 / Math.max(width, height);
            smallerCanvas.width = Math.round(width * scale);
            smallerCanvas.height = Math.round(height * scale);
            const sCtx = smallerCanvas.getContext('2d');
            if (sCtx) {
              sCtx.drawImage(canvas, 0, 0, smallerCanvas.width, smallerCanvas.height);
              compressed = smallerCanvas.toDataURL('image/jpeg', 0.68);
            }
          }

          resolve(compressed);
        } catch (err) {
          // Fallback to original image data URL
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
