export async function compressImageForUpload(file, options = {}) {
  if (!file || !file.type?.startsWith('image/')) return file;

  const maxWidth = options.maxWidth || 1920;
  const maxHeight = options.maxHeight || 1920;
  const quality = options.quality ?? 0.78;

  // Browser-native WebP conversion keeps this dependency-free and works in Vite.
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(
      1,
      maxWidth / bitmap.width,
      maxHeight / bitmap.height
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    // Avoid a needless re-encode for already-small WebP files.
    if (file.type === 'image/webp' && scale === 1 && file.size <= 300 * 1024) {
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) throw new Error('Could not create an image processing context.');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => result ? resolve(result) : reject(new Error('WebP conversion failed.')),
        'image/webp',
        quality
      );
    });

    const baseName = file.name.replace(/\.[^/.]+$/, '') || 'image';
    return new File([blob], `${baseName}.webp`, {
      type: 'image/webp',
      lastModified: Date.now()
    });
  } finally {
    bitmap.close?.();
  }
}
