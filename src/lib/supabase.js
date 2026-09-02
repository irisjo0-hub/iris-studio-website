import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Compress image before upload for ultra-fast performance.
 */
export function compressImage(file, maxWidth = 1400, maxHeight = 1400, quality = 0.82) {
  return new Promise((resolve) => {
    if (!file || !file.type || !file.type.startsWith('image/')) {
      return resolve(file);
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

/**
 * Upload a file to a Supabase storage bucket.
 * @param {string} bucket - Bucket name
 * @param {string} path - File path within the bucket (e.g. 'receipts/123.jpg')
 * @param {File|Blob} file - The file to upload
 * @returns {Promise<string>} Public URL of the uploaded file
 */
export async function uploadFile(bucket, path, file) {
  // Compress image if it's an image file to make upload lightning fast (< 1s)
  const fileToUpload = (file && file.type && file.type.startsWith('image/')) 
    ? await compressImage(file) 
    : file;

  // Sanitize path: split by folder slashes, sanitize base name and extension of each part, then join back
  const sanitizedPath = path.split('/').map(segment => {
    if (!segment) return '';
    const parts = segment.split('.');
    const ext = parts.length > 1 ? parts.pop().toLowerCase() : '';
    const base = parts.join('.');
    
    const cleanBase = base
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .replace(/__+/g, '_')
      .replace(/^_+|_+$/g, '');
      
    const finalBase = cleanBase.trim() || 'file';
    return ext ? `${finalBase}.${ext}` : finalBase;
  }).filter(Boolean).join('/');

  const options = {
    upsert: true,
    contentType: fileToUpload.type || 'image/jpeg'
  };

  let uploadResult = await supabase.storage
    .from(bucket)
    .upload(sanitizedPath, fileToUpload, options);

  if (uploadResult.error) {
    console.warn('Upsert upload failed, retrying standard upload:', uploadResult.error);
    uploadResult = await supabase.storage
      .from(bucket)
      .upload(sanitizedPath, file, { ...options, upsert: false });
  }

  if (uploadResult.error) throw uploadResult.error;

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(sanitizedPath);

  return data.publicUrl;
}

/**
 * Get the public URL for a file already in storage.
 * @param {string} bucket
 * @param {string} path
 * @returns {string}
 */
export function getPublicUrl(bucket, path) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete a file from a storage bucket.
 * @param {string} bucket
 * @param {string} path
 */
export async function deleteFile(bucket, path) {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  if (error) console.error('Failed to delete file:', error);
}

/**
 * Extract the storage path from a full public URL.
 * E.g. "https://xxx.supabase.co/storage/v1/object/public/portfolio/img.jpg" → "img.jpg"
 * @param {string} url
 * @param {string} bucket
 * @returns {string|null}
 */
export function extractPathFromUrl(url, bucket) {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.substring(idx + marker.length);
}
