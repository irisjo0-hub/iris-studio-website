import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Keep this list aligned with the actual Supabase Storage bucket visibility.
export const PRIVATE_BUCKETS = [
  'payment-receipts',
  'graduation-orders',
  'printing-orders',
  'reels',
];

const DEFAULT_MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const IMAGE_MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function validateUploadFile(file) {
  if (!file || typeof file !== 'object') {
    throw new Error('A valid file is required.');
  }

  const size = Number(file.size || 0);
  if (!Number.isFinite(size) || size <= 0) {
    throw new Error('The file is empty or invalid.');
  }

  const type = String(file.type || '').toLowerCase();
  const isImage = type.startsWith('image/');
  const maxBytes = isImage ? IMAGE_MAX_UPLOAD_BYTES : DEFAULT_MAX_UPLOAD_BYTES;

  if (size > maxBytes) {
    throw new Error(`File exceeds the maximum allowed size of ${Math.round(maxBytes / (1024 * 1024))} MB.`);
  }

  if (isImage && !ALLOWED_IMAGE_TYPES.has(type)) {
    throw new Error('Only JPG, PNG, and WebP images are allowed.');
  }
}

/**
 * Upload a file to a Supabase storage bucket.
 * Returns a public URL for public buckets, or the storage path for private buckets.
 */
export async function uploadFile(bucket, path, file) {
  if (!bucket || typeof bucket !== 'string') {
    throw new Error('A valid storage bucket is required.');
  }
  if (!path || typeof path !== 'string') {
    throw new Error('A valid storage path is required.');
  }

  validateUploadFile(file);

  // Sanitize path segment-by-segment and reject traversal attempts.
  const sanitizedPath = path
    .split('/')
    .filter((segment) => segment && segment !== '.' && segment !== '..')
    .map((segment) => {
      const parts = segment.split('.');
      const ext = parts.length > 1 ? parts.pop().toLowerCase() : '';
      const base = parts.join('.');
      const cleanBase = base
        .replace(/[^a-zA-Z0-9-_]/g, '_')
        .replace(/__+/g, '_')
        .replace(/^_+|_+$/g, '');
      const finalBase = cleanBase.trim() || 'file';
      return ext ? `${finalBase}.${ext}` : finalBase;
    })
    .join('/');

  if (!sanitizedPath || sanitizedPath.length > 512) {
    throw new Error('The storage path is invalid.');
  }

  const isPrivate = PRIVATE_BUCKETS.includes(bucket);

  let finalPath = sanitizedPath;
  let uploadResult = await supabase.storage
    .from(bucket)
    .upload(finalPath, file, { upsert: false });

  if (uploadResult.error) {
    const statusCode = Number(uploadResult.error.statusCode ?? uploadResult.error.status);
    const message = String(uploadResult.error.message || '').toLowerCase();
    const isCollision = statusCode === 409 ||
      message.includes('already exists') ||
      message.includes('duplicate') ||
      message.includes('object exists');

    if (!isCollision) {
      throw uploadResult.error;
    }

    const parts = sanitizedPath.split('/');
    const filename = parts.pop() || 'file';
    const dotIndex = filename.lastIndexOf('.');
    const base = dotIndex > 0 ? filename.slice(0, dotIndex) : filename;
    const ext = dotIndex > 0 ? filename.slice(dotIndex) : '';
    const uniqueSuffix = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    parts.push(`${base}_${uniqueSuffix}${ext}`);
    finalPath = parts.join('/');

    uploadResult = await supabase.storage
      .from(bucket)
      .upload(finalPath, file, { upsert: false });

    if (uploadResult.error) throw uploadResult.error;
  }

  if (isPrivate) {
    return finalPath;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(finalPath);

  return data.publicUrl;
}

/** Get a public URL for public storage only. */
export function getPublicUrl(bucket, path) {
  if (!bucket || !path) return '';
  if (PRIVATE_BUCKETS.includes(bucket)) return '';

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  return data.publicUrl;
}

/** Create a fresh signed URL for a private storage object. */
export async function createSignedUrl(bucket, pathOrUrl, expiresIn = 3600) {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return null;
  if (!PRIVATE_BUCKETS.includes(bucket)) return getPublicUrl(bucket, pathOrUrl);

  const cleanPath = extractPathFromUrl(pathOrUrl, bucket) || (
    pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')
      ? null
      : pathOrUrl
  );

  if (!cleanPath) return null;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(cleanPath, expiresIn);

    if (error || !data?.signedUrl) {
      console.warn(`Could not create signed URL for bucket '${bucket}':`, error?.message || error);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.warn(`Exception creating signed URL for bucket '${bucket}':`, err);
    return null;
  }
}

/** Delete a file from a storage bucket. */
export async function deleteFile(bucket, path) {
  const cleanPath = extractPathFromUrl(path, bucket) || path;
  if (!bucket || !cleanPath) return;

  const { error } = await supabase.storage
    .from(bucket)
    .remove([cleanPath]);

  if (error) throw error;
}

/** Extract the storage object path from a full public/signed URL or return a plain path. */
export function extractPathFromUrl(url, bucket) {
  if (!url || typeof url !== 'string' || !bucket) return null;

  const publicMarker = `/storage/v1/object/public/${bucket}/`;
  const pIdx = url.indexOf(publicMarker);
  if (pIdx !== -1) {
    return url.substring(pIdx + publicMarker.length).split('?')[0];
  }

  const signMarker = `/storage/v1/object/sign/${bucket}/`;
  const sIdx = url.indexOf(signMarker);
  if (sIdx !== -1) {
    return url.substring(sIdx + signMarker.length).split('?')[0];
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return url.split('?')[0];
  }

  return null;
}
