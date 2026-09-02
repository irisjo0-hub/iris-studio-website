/**
 * Client-Side Video Compressor & Optimizer for IRIS Studio Admin
 * Automatically compresses high-res/heavy videos (e.g. 50MB-250MB) down to ~10MB-25MB 
 * with crisp 1080p resolution before uploading to Supabase Storage.
 */

export async function compressVideoIfNeeded(file, onProgress = () => {}) {
  // If not a file or not a video, or already small (<= 15MB), return immediately
  if (!file || !file.type.startsWith('video/') && !/\.(mp4|mov|webm|m4v|mkv)$/i.test(file.name)) {
    return file;
  }

  const isHeavy = file.size > 15 * 1024 * 1024; // > 15MB
  if (!isHeavy) {
    onProgress(100, 'الملف بحجم مناسب ولا يحتاج لضغط');
    return file;
  }

  // Check browser support for MediaRecorder & HTMLCanvasElement
  if (typeof window === 'undefined' || !window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
    console.warn("Browser does not support client-side video compression, proceeding with original file.");
    return file;
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
        resolve(file);
      };

      video.onloadedmetadata = () => {
        const duration = video.duration;
        if (!duration || !isFinite(duration) || duration <= 0) {
          return handleFallback("Invalid video duration");
        }

        // Target Dimensions: Max 1080px width, 1920px height
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

        // Ensure even numbers for video dimensions
        width = width % 2 === 0 ? width : width - 1;
        height = height % 2 === 0 ? height : height - 1;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return handleFallback("Canvas 2D context unavailable");
        }

        // 30 FPS Canvas Stream
        const stream = canvas.captureStream(30);

        // Try to preserve audio track if accessible
        try {
          const videoAudioStream = video.captureStream ? video.captureStream() : (video.mozCaptureStream ? video.mozCaptureStream() : null);
          if (videoAudioStream) {
            const audioTracks = videoAudioStream.getAudioTracks();
            if (audioTracks && audioTracks.length > 0) {
              stream.addTrack(audioTracks[0]);
            }
          }
        } catch (e) {
          console.log("Audio track capture skipped:", e);
        }

        // Supported Codec Selection
        let selectedMime = 'video/webm;codecs=vp9,opus';
        if (!MediaRecorder.isTypeSupported(selectedMime)) {
          selectedMime = 'video/webm;codecs=vp8,opus';
        }
        if (!MediaRecorder.isTypeSupported(selectedMime)) {
          selectedMime = 'video/webm';
        }
        if (!MediaRecorder.isTypeSupported(selectedMime)) {
          selectedMime = 'video/mp4';
        }

        const options = {
          mimeType: MediaRecorder.isTypeSupported(selectedMime) ? selectedMime : '',
          videoBitsPerSecond: 2500000 // 2.5 Mbps bitrate (Crisp 1080p @ small size)
        };

        try {
          mediaRecorder = new MediaRecorder(stream, options);
        } catch (err) {
          return handleFallback("MediaRecorder instantiation error: " + err.message);
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
            const originalMB = (file.size / (1024 * 1024)).toFixed(1);
            const compressedMB = (blob.size / (1024 * 1024)).toFixed(1);
            console.log(`✅ Compressed video from ${originalMB}MB to ${compressedMB}MB`);

            const cleanBase = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const compressedFile = new File(
              [blob], 
              `${cleanBase}_opt${ext}`, 
              { type: selectedMime }
            );
            resolve(compressedFile);
          } else {
            // Compressed size was larger or empty, use original
            resolve(file);
          }
        };

        // Start playback and frame recording
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
            onProgress(percent, `جاري تحسين وضغط الفيديو... (${percent}%)`);

            if (video.currentTime < duration && !video.ended) {
              animFrameId = requestAnimationFrame(renderFrame);
            }
          };

          renderFrame();

          video.onended = () => {
            onProgress(100, 'تم معالجة الفيديو بنجاح! جاري الرفع...');
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
            }
          };

          // Maximum safety timeout
          setTimeout(() => {
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
              onProgress(100, 'تم المعالجة، جاري التجهيز...');
              mediaRecorder.stop();
            }
          }, (duration + 3) * 1000);
        }).catch((err) => {
          handleFallback("Playback launch failed: " + err.message);
        });
      };

      video.onerror = (e) => {
        handleFallback("Video loading error");
      };
    } catch (err) {
      console.warn("Compression exception caught:", err);
      resolve(file);
    }
  });
}
