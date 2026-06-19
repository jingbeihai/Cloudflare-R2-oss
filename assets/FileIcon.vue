<script setup>
import { computed } from 'vue';

const props = defineProps({
  file: Object,
  size: { type: Number, default: 32 },
});

const emoji = computed(() => {
  const ct = (props.file.httpMetadata?.contentType || '').toLowerCase();
  const ext = (props.file.key || '').split('.').pop().toLowerCase();
  if (ct.startsWith('image/') || /^(png|jpg|jpeg|gif|webp|svg|bmp|ico|avif)$/.test(ext)) return { e: '🖼️', cls: 'image' };
  if (ct.startsWith('video/') || /^(mp4|avi|mkv|mov|wmv|flv|webm)$/.test(ext)) return { e: '🎬', cls: 'video' };
  if (ct.startsWith('audio/') || /^(mp3|wav|flac|aac|ogg|wma)$/.test(ext)) return { e: '🎵', cls: 'audio' };
  if (ct.includes('zip') || ct.includes('rar') || ct.includes('gzip') || ct.includes('tar') || /^(zip|rar|7z|tar|gz|bz2)$/.test(ext)) return { e: '📦', cls: 'archive' };
  if (ct.startsWith('application/pdf') || ct.includes('document') || ct.includes('spreadsheet') || ct.includes('presentation') || /^(pdf|doc|docx|xls|xlsx|ppt|pptx)$/.test(ext)) return { e: '📄', cls: 'doc' };
  if (/^(txt|md|json|js|ts|py|html|css|xml|yaml|yml|toml|ini|cfg|log)$/.test(ext)) return { e: '📝', cls: 'text' };
  return { e: '📄', cls: 'file' };
});

const thumbnail = computed(() => {
  const t = props.file.customMetadata?.thumbnail;
  return t ? `/raw/_$flaredrive$/thumbnails/${t}.png` : null;
});
</script>

<template>
  <img v-if="thumbnail" :src="thumbnail" loading="lazy" :width="size" :height="size"
    class="fi fi-thumb" />
  <span v-else class="fi" :class="'fi-' + emoji.cls" :style="{ fontSize: size * 0.7 + 'px', width: size + 'px', height: size + 'px' }">
    {{ emoji.e }}
  </span>
</template>

<style>
.fi {
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 8px; flex-shrink: 0;
}
.fi-thumb { border-radius: 6px; object-fit: cover; }
.fi-image { background: color-mix(in oklch, #22c55e 15%, transparent); }
.fi-video { background: color-mix(in oklch, #ef4444 12%, transparent); }
.fi-audio { background: color-mix(in oklch, #a855f7 12%, transparent); }
.fi-archive { background: color-mix(in oklch, #f59e0b 12%, transparent); }
.fi-doc { background: color-mix(in oklch, #3b82f6 12%, transparent); }
.fi-text { background: color-mix(in oklch, #6b7280 12%, transparent); }
.fi-file { background: color-mix(in oklch, var(--accent) 8%, transparent); }
.fi-folder { background: color-mix(in oklch, var(--accent) 10%, transparent); }
</style>
