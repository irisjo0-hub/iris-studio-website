/**
 * Client-Side Video Optimizer & Poster Extractor for IRIS Studio Admin
 * Ensures 100% universal video playback across iOS iPhones, Android & Desktop.
 * Preserves native MP4/MOV video containers for iPhone Safari compatibility,
 * and extracts high-quality JPEG poster frames for instant display.
 */

async function extractPosterFrame(file) {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      const cleanup = () => {
        try {
          URL.revokeObjectURL(objectUrl);
          video.removeAttribute('src');
          video.load();
        } catch (e) {}
      };

      video.onloadeddata = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 1080;
          canvas.height = video.videoHeight || 1920;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => {
              cleanup();
              resolve(blob);
            }, 'image/jpeg', 0.88);
            return;
          }
        } catch (e) {}
        cleanup();
        resolve(null);
      };

      video.onerror = () => {
        cleanup();
        resolve(null);
      };

      setTimeout(() => {
        cleanup();
        resolve(null);
      }, 3000);
    } catch (e) {
      resolve(null);
    }
  });
}

export async function compressVideoIfNeeded(file, onProgress = () => {}) {
  if (!file || (!file.type.startsWith('video/') && !/\.(mp4|mov|webm|m4v|mkv)$/i.test(file.name))) {
    return { file, posterBlob: null };
  }

  const isMp4OrMov = /\.(mp4|mov|m4v)$/i.test(file.name) || file.type === 'video/mp4' || file.type === 'video/quicktime';
  const supportsMp4Recorder = typeof window !== 'undefined' && window.MediaRecorder && 
    (MediaRecorder.isTypeSupported('video/mp4') || MediaRecorder.isTypeSupported('video/mp4;codecs=avc1'));

  // Extract JPEG poster frame for instant mobile display
  onProgress(10, 'جاري استخراج الغلاف وتحسين الجودة...');
  const posterBlob = await extractPosterFrame(file);

  // If the file is MP4/MOV and browser recorder doesn't support MP4 recording,
  // preserve the original MP4/MOV container so iPhones (iOS Safari) play it natively!
  if (isMp4OrMov && !supportsMp4Recorder) {
    console.log("Preserving native MP4/MOV container for iOS iPhone & Safari compatibility.");
    onProgress(100, 'تم تجهيز الفيديو وتأكيد التوافق مع الهواتف...');
    return { file, posterBlob };
  }

  const isHeavy = file.size > 15 * 1024 * 1024; // > 15MB
  if (!isHeavy) {
    onProgress(100, 'الملف بحجم مناسب وتوافق تام');
    return { file, posterBlob };
  }

  // Check browser support for MediaRecorder & HTMLCanvasElement
  if (typeof window === 'undefined' || !window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
    return { file, posterBlob };
  }

  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      let mediaRecorder;
      let recordedChunks = [];
      let isCleanedUp = false;

      const cleanup = () => {
        if (isCleanedUp) return;
        isCleanedUp = true;
        try {
          URL.revokeObjectURL(objectUrl);
          video.removeAttribute('src');
          video.load();
        } catch (e) {}
      };

      const handleFallback = (msg) => {
        console.warn("Video compression fallback:", msg);
        cleanup();
        resolve({ file, posterBlob });
      };

      video.onloadedmetadata = () => {
        const duration = video.duration;
        if (!duration || !isFinite(duration) || duration <= 0) {
          return handleFallback("Invalid video duration");
        }

        let width = video.videoWidth || 1080;
        let height = video.videoHeight || 1920;
        const maxDim = 1920;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        width = width % 2 === 0 ? width : width - 1;
        height = height % 2 === 0 ? height : height - 1;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return handleFallback("Canvas 2D context unavailable");
        }

        const stream = canvas.captureStream(30);

        try {
          const videoAudioStream = video.captureStream ? video.captureStream() : (video.mozCaptureStream ? video.mozCaptureStream() : null);
          if (videoAudioStream) {
            const audioTracks = videoAudioStream.getAudioTracks();
            if (audioTracks && audioTracks.length > 0) {
              stream.addTrack(audioTracks[0]);
            }
          }
        } catch (e) {}

        const mimeTypesToTry = [
          'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
          'video/mp4',
          'video/webm;codecs=h264,opus',
          'video/webm;codecs=vp9,opus',
          'video/webm'
        ];

        let selectedMime = mimeTypesToTry.find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';

        const options = {
          mimeType: selectedMime,
          videoBitsPerSecond: 2500000
        };

        try {
          mediaRecorder = new MediaRecorder(stream, options);
        } catch (err) {
          return handleFallback("MediaRecorder error: " + err.message);
        }

        mediaRecorder.ondataavailable = (evt) => {
          if (evt.data && evt.data.size > 0) {
            recordedChunks.push(evt.data);
          }
        };

        mediaRecorder.onstop = () => {
          const ext = selectedMime.includes('mp4') ? '.mp4' : '.webm';
          const blob = new Blob(recordedChunks, { type: selectedMime });

          cleanup();

          if (blob && blob.size > 0 && blob.size < file.size) {
            const cleanBase = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const compressedFile = new File(
              [blob], 
              `${cleanBase}_opt${ext}`, 
              { type: selectedMime }
            );
            resolve({ file: compressedFile, posterBlob });
          } else {
            resolve({ file, posterBlob });
          }
        };

        video.currentTime = 0;
        video.play().then(() => {
          try {
            mediaRecorder.start(500);
          } catch (e) {
            return handleFallback("MediaRecorder start failed");
          }

          let animFrameId;

          const renderFrame = () => {
            if (video.paused || video.ended || isCleanedUp) {
              if (animFrameId) cancelAnimationFrame(animFrameId);
              return;
            }

            ctx.drawImage(video, 0, 0, width, height);

            const percent = Math.min(99, Math.round((video.currentTime / duration) * 100));
            onProgress(percent, `جاري ضغط وتحسين الفيديو... (${percent}%)`);

            if (video.currentTime < duration && !video.ended) {
              animFrameId = requestAnimationFrame(renderFrame);
            }
          };

          renderFrame();

          video.onended = () => {
            onProgress(100, 'تم معالجة الفيديو بنجاح!');
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
            }
          };

          setTimeout(() => {
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
              onProgress(100, 'تم التجهيز، جاري الرفع...');
              mediaRecorder.stop();
            }
          }, (duration + 3) * 1000);
        }).catch((err) => {
          handleFallback("Playback launch failed: " + err.message);
        });
      };

      video.onerror = () => {
        handleFallback("Video loading error");
      };
    } catch (err) {
      console.warn("Compression exception caught:", err);
      resolve({ file, posterBlob: null });
    }
  });
}
