export async function compressImageForUpload(file, options = {}) {
  if (!file || !file.type?.startsWith('image/')) return file;

  const maxWidth = options.maxWidth || 1920;
  const maxHeight = options.maxHeight || 1920;
  const quality = options.quality ?? 0.78;
  const format = options.format || 'image/webp';
  const extension = format === 'image/jpeg' ? 'jpg' : 'webp';
  const keepIfUnderBytes = options.keepIfUnderBytes || 0;

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
    // Print uploads: a file that is already small enough is kept untouched.
    if (keepIfUnderBytes && scale === 1 && file.size <= keepIfUnderBytes) {
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d', { alpha: format !== 'image/jpeg' });
    if (format === 'image/jpeg' && ctx) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height); }
    if (!ctx) throw new Error('Could not create an image processing context.');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (result) => result ? resolve(result) : reject(new Error('Image conversion failed.')),
        format,
        quality
      );
    });

    const baseName = file.name.replace(/\.[^/.]+$/, '') || 'image';
    // Never return something bigger than what the customer picked.
    if (blob.size >= file.size && scale === 1) return file;
    return new File([blob], `${baseName}.${extension}`, {
      type: format,
      lastModified: Date.now()
    });
  } finally {
    bitmap.close?.();
  }
}
