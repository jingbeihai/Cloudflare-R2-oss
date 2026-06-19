const THUMBNAIL_SIZE = 144;

export async function generateThumbnail(file) {
  const canvas = document.createElement("canvas");
  canvas.width = THUMBNAIL_SIZE;
  canvas.height = THUMBNAIL_SIZE;
  var ctx = canvas.getContext("2d");

  if (file.type.startsWith("image/")) {
    const image = await new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.src = URL.createObjectURL(file);
    });
    ctx.drawImage(image, 0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);
  } else if (file.type === "video/mp4") {
    const video = await new Promise(async (resolve, reject) => {
      const video = document.createElement("video");
      video.muted = true;
      video.src = URL.createObjectURL(file);
      setTimeout(() => reject(new Error("Video load timeout")), 2000);
      await video.play();
      await video.pause();
      video.currentTime = 0;
      resolve(video);
    });
    ctx.drawImage(video, 0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);
  }

  const thumbnailBlob = await new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob))
  );

  return thumbnailBlob;
}

export async function blobDigest(blob) {
  const digest = await crypto.subtle.digest("SHA-1", await blob.arrayBuffer());
  const digestArray = Array.from(new Uint8Array(digest));
  const digestHex = digestArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return digestHex;
}

export const SIZE_LIMIT = 100 * 1000 * 1000;

export async function multipartUpload(key, file, options) {
  const headers = options?.headers || {};
  headers["content-type"] = file.type;

  const uploadId = await axios
    .post(`/api/write/items/${key}?uploads`, "", { headers })
    .then((res) => res.data.uploadId);
  const totalChunks = Math.ceil(file.size / SIZE_LIMIT);

  const promiseGenerator = function* () {
    for (let i = 1; i <= totalChunks; i++) {
      const chunk = file.slice((i - 1) * SIZE_LIMIT, i * SIZE_LIMIT);
      const searchParams = new URLSearchParams({ partNumber: i, uploadId });
      yield axios
        .put(`/api/write/items/${key}?${searchParams}`, chunk, {
          onUploadProgress(progressEvent) {
            if (typeof options?.onUploadProgress !== "function") return;
            options.onUploadProgress({
              loaded: (i - 1) * SIZE_LIMIT + progressEvent.loaded,
              total: file.size,
            });
          },
        })
        .then((res) => ({
          partNumber: i,
          etag: res.headers.etag,
        }));
    }
  };

  const uploadedParts = [];
  for (const part of promiseGenerator()) {
    const { partNumber, etag } = await part;
    uploadedParts[partNumber - 1] = { partNumber, etag };
  }
  const completeParams = new URLSearchParams({ uploadId });
  await axios.post(`/api/write/items/${key}?${completeParams}`, {
    parts: uploadedParts,
  });
}

export function initParticles(canvas, opts = {}) {
  const ctx = canvas.getContext("2d");
  const color = opts.color || "#7c5bf0";
  const count = opts.count || 40;
  const connectionDistance = opts.connectionDistance || 120;
  const speed = opts.speed || 0.3;
  let animId = null;
  let particles = [];

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.scale(dpr, dpr);
  }

  function createParticle() {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      r: Math.random() * 1.5 + 0.5,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = window.innerWidth;
      if (p.x > window.innerWidth) p.x = 0;
      if (p.y < 0) p.y = window.innerHeight;
      if (p.y > window.innerHeight) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.4;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDistance) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = color;
          ctx.globalAlpha = (1 - dist / connectionDistance) * 0.15;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    animId = requestAnimationFrame(draw);
  }

  resize();
  particles = Array.from({ length: count }, createParticle);
  draw();

  window.addEventListener("resize", () => {
    resize();
    particles = Array.from({ length: count }, createParticle);
  });

  return () => {
    if (animId) cancelAnimationFrame(animId);
  };
}

export function drawStorageChart(canvas, percent) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.width / dpr;
  const h = canvas.height / dpr;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(cx, cy) - 3;
  const lineWidth = 5;

  const bgColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--bg-tertiary").trim() || "#e8e5f8";
  const accentColor = getComputedStyle(document.documentElement)
    .getPropertyValue("--accent").trim() || "#7c5bf0";

  ctx.beginPath();
  ctx.arc(cx, cy, r - lineWidth / 2, 0, Math.PI * 2);
  ctx.strokeStyle = bgColor;
  ctx.lineWidth = lineWidth;
  ctx.stroke();

  const angle = (percent / 100) * Math.PI * 2;
  ctx.beginPath();
  ctx.arc(cx, cy, r - lineWidth / 2, -Math.PI / 2, -Math.PI / 2 + angle);
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.font = `bold ${r * 0.55}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = getComputedStyle(document.documentElement)
    .getPropertyValue("--text-primary").trim() || "#1a1a2e";
  ctx.fillText(`${percent}%`, cx, cy - 1);
}

export function drawRipple(canvas, x, y) {
  const ctx = canvas.getContext("2d");
  const startTime = performance.now();
  const duration = 1000;

  function animate(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const radius = progress * 100;
    const alpha = 1 - progress;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = getComputedStyle(document.documentElement)
      .getPropertyValue("--accent").trim() || "#7c5bf0";
    ctx.globalAlpha = alpha * 0.3;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}
