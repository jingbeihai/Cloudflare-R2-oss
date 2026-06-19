<template>
  <div class="main" @dragenter.prevent @dragover.prevent @drop.prevent="onDrop">
    <!-- Title Bar -->
    <div class="title-bar">
      <div class="title-left">
        <h1 class="title-text">📁 文件库</h1>
        <span class="title-domain">drive.7988798.xyz</span>
      </div>
      <div class="title-right">
        <button class="title-btn" @click="toggleTheme" :title="currentTheme === 'dark' ? '切换浅色' : '切换深色'">
          {{ currentTheme === 'dark' ? '☀️' : '🌙' }}
        </button>
        <button class="title-btn" @click="showMenu = true">⚙️</button>
        <Menu
          v-model="showMenu"
          :items="menuItems"
          @click="onMenuClick"
        />
      </div>
    </div>

    <!-- Storage Bar -->
    <div class="storage-bar-wrap">
      <div class="storage-info">
        <span>已用 {{ formatSize(storageUsed) }} / {{ formatSize(storageTotal) }}</span>
        <span>{{ storagePercent }}%</span>
      </div>
      <div class="storage-bar">
        <div class="storage-bar-fill" :style="{ width: storagePercent + '%' }"></div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <input type="search" v-model="search" placeholder="🔍 搜索文件..." class="toolbar-search" />
      <div class="toolbar-actions">
        <button class="tb-btn primary" @click="showUploadPopup = true">📤 上传</button>
        <button class="tb-btn" @click="createFolder">📁 新建</button>
        <button class="tb-btn" @click="fetchFiles">🔄 刷新</button>
        <button class="tb-btn" @click="batchMode = !batchMode">{{ batchMode ? '✅ 完成' : '📋 批量' }}</button>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button class="ftab" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">全部</button>
      <button class="ftab" :class="{ active: activeFilter === 'folder' }" @click="activeFilter = 'folder'">📁 文件夹</button>
      <button class="ftab" :class="{ active: activeFilter === 'image' }" @click="activeFilter = 'image'">🖼️ 图片</button>
      <button class="ftab" :class="{ active: activeFilter === 'video' }" @click="activeFilter = 'video'">🎬 视频</button>
      <button class="ftab" :class="{ active: activeFilter === 'doc' }" @click="activeFilter = 'doc'">📄 文档</button>
      <button class="ftab" :class="{ active: activeFilter === 'archive' }" @click="activeFilter = 'archive'">📦 压缩包</button>
      <button class="ftab" :class="{ active: activeFilter === 'audio' }" @click="activeFilter = 'audio'">🎵 音频</button>
    </div>

    <!-- Upload Popup -->
    <UploadPopup v-model="showUploadPopup" @upload="onUploadClicked" @createFolder="createFolder" />

    <!-- File Table Header -->
    <div class="table-header">
      <div class="th-icon"></div>
      <div class="th-name">文件名</div>
      <div class="th-date">修改日期</div>
      <div class="th-size">大小</div>
      <div class="th-more"></div>
    </div>

    <!-- File List -->
    <div class="table-body">
      <div v-if="cwd !== ''" class="table-row" @click="cwd = cwd.replace(/[^\/]+\/$/, '')">
        <div class="td-icon"><span class="fi fi-folder">📁</span></div>
        <div class="td-name"><span class="file-label">..</span></div>
        <div class="td-date">—</div>
        <div class="td-size">—</div>
        <div class="td-more"></div>
      </div>
      <div v-for="folder in filteredFolders" :key="folder" class="table-row"
        @click="cwd = folder"
        @contextmenu.prevent="openContextMenu(folder)">
        <div class="td-icon"><span class="fi fi-folder">📁</span></div>
        <div class="td-name"><span class="file-label" v-text="folder.match(/.*?([^/]*)\/?$/)[1]"></span></div>
        <div class="td-date">—</div>
        <div class="td-size">—</div>
        <div class="td-more">
          <button class="row-more" @click.stop="openContextMenu(folder)">⋯</button>
        </div>
      </div>
      <div v-for="file in filteredFiles" :key="file.key" class="table-row"
        @dblclick="preview(`/raw/${file.key}`)"
        @contextmenu.prevent="openContextMenu(file)">
        <div class="td-icon"><FileIcon :file="file" /></div>
        <div class="td-name">
          <span class="file-label" v-text="file.key.split('/').pop()"></span>
        </div>
        <div class="td-date" v-text="formatDate(file.uploaded)"></div>
        <div class="td-size" v-text="formatSize(file.size)"></div>
        <div class="td-more">
          <button class="row-more" @click.stop="openContextMenu(file)">⋯</button>
        </div>
      </div>
      <div v-if="loading" class="table-loading"><span>加载中...</span></div>
      <div v-else-if="!filteredFiles.length && !filteredFolders.length && !cwd" class="table-empty">没有文件</div>
    </div>

    <!-- Context Menu -->
    <Dialog v-model="showContextMenu">
      <div v-text="ctxItem?.key || ctxItem" class="ctx-filename" @click.stop.prevent></div>
      <ul v-if="typeof ctxItem === 'string'" class="ctx-list">
        <li><button @click="copyLink(`/?p=${encodeURIComponent(ctxItem)}`)">复制链接</button></li>
        <li><button @click="moveFile(ctxItem + '_$folder$')">移动</button></li>
        <li><button class="danger" @click="removeFile(ctxItem + '_$folder$')">删除</button></li>
      </ul>
      <ul v-else class="ctx-list">
        <li><button @click="renameFile(ctxItem.key)">重命名</button></li>
        <li><a :href="`/raw/${ctxItem.key}`" target="_blank" download>下载</a></li>
        <li><button @click="clipboard = ctxItem.key">复制</button></li>
        <li><button @click="moveFile(ctxItem.key)">移动</button></li>
        <li><button @click="copyLink(`/raw/${ctxItem.key}`)">复制链接</button></li>
        <li><button class="danger" @click="removeFile(ctxItem.key)">删除</button></li>
      </ul>
    </Dialog>

    <!-- Upload Tab -->
    <div class="upload-tab" v-if="uploadItems.length">
      <div class="utab-header" @click="uploadPanelOpen = !uploadPanelOpen">
        <div class="utab-left">
          <span>📤 上传进度</span>
          <span class="utab-badge">{{ activeUploads }}</span>
        </div>
        <span class="utab-arrow" :class="{ open: uploadPanelOpen }">▾</span>
      </div>
      <div class="utab-body" v-show="uploadPanelOpen">
        <div class="utab-item" v-for="item in uploadItems" :key="item.id">
          <span class="uti-icon">{{ fileEmoji(item.file) }}</span>
          <div class="uti-info">
            <div class="uti-name" v-text="item.file.name"></div>
            <div class="uti-bar">
              <div class="uti-bar-fill" :class="{ done: item.status === 'done', error: item.status === 'error' }" :style="{ width: item.progress + '%' }"></div>
            </div>
          </div>
          <span class="uti-status" v-text="item.status === 'done' ? '✅' : item.status === 'error' ? '❌' : item.progress + '%'"></span>
        </div>
      </div>
    </div>

    <!-- FAB -->
    <button class="fab" @click="showUploadPopup = true">+</button>
  </div>
</template>

<script>
import { generateThumbnail, blobDigest, multipartUpload, SIZE_LIMIT } from "/assets/main.mjs";
import Dialog from "./Dialog.vue";
import Menu from "./Menu.vue";
import UploadPopup from "./UploadPopup.vue";
import FileIcon from "./FileIcon.vue";

const CONCURRENCY = 3;

export default {
  data: () => ({
    cwd: new URL(window.location).searchParams.get("p") || "",
    files: [],
    folders: [],
    clipboard: null,
    ctxItem: null,
    loading: false,
    order: null,
    search: "",
    activeFilter: 'all',
    showContextMenu: false,
    showMenu: false,
    showUploadPopup: false,
    batchMode: false,
    uploadPanelOpen: true,
    uploadItems: [],
    uploadIdSeq: 0,
    activeUploads: 0,
    storageUsed: 3.7 * 1024 * 1024 * 1024,
    storageTotal: 10 * 1024 * 1024 * 1024,
  }),

  computed: {
    currentTheme() {
      return document.documentElement.dataset.theme || 'light';
    },
    storagePercent() {
      return Math.round((this.storageUsed / this.storageTotal) * 100);
    },
    menuItems() {
      return [
        { text: '名称 A-Z' },
        { text: '大小 ↑' },
        { text: '大小 ↓' },
        { text: '粘贴' },
      ];
    },
    filteredFolders() {
      let list = this.folders;
      if (this.search) list = list.filter(f => f.includes(this.search));
      if (this.activeFilter !== 'all' && this.activeFilter !== 'folder') return [];
      return list;
    },
    filteredFiles() {
      let list = this.files;
      if (this.search) list = list.filter(f => f.key.split('/').pop().includes(this.search));
      if (this.order === 'size_asc') list = [...list].sort((a, b) => a.size - b.size);
      else if (this.order === 'size_desc') list = [...list].sort((a, b) => b.size - a.size);
      else list = [...list].sort((a, b) => a.key.localeCompare(b.key));
      if (this.activeFilter === 'all') return list;
      return list.filter(f => {
        const ct = (f.httpMetadata?.contentType || '').toLowerCase();
        const ext = f.key.split('.').pop().toLowerCase();
        if (this.activeFilter === 'image') return ct.startsWith('image/') || /^(png|jpg|jpeg|gif|webp|svg|bmp|ico|avif)$/.test(ext);
        if (this.activeFilter === 'video') return ct.startsWith('video/') || /^(mp4|avi|mkv|mov|wmv|flv|webm)$/.test(ext);
        if (this.activeFilter === 'doc') return ct.startsWith('application/pdf') || ct.includes('document') || ct.includes('spreadsheet') || ct.includes('presentation') || /^(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|md)$/.test(ext);
        if (this.activeFilter === 'archive') return ct.includes('zip') || ct.includes('rar') || ct.includes('gzip') || ct.includes('tar') || /^(zip|rar|7z|tar|gz|bz2)$/.test(ext);
        if (this.activeFilter === 'audio') return ct.startsWith('audio/') || /^(mp3|wav|flac|aac|ogg|wma)$/.test(ext);
        return true;
      });
    },
  },

  methods: {
    toggleTheme() {
      const html = document.documentElement;
      const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
      html.dataset.theme = next;
      localStorage.setItem('drive-theme', next);
    },

    formatDate(ts) {
      try {
        return new Date(ts).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
      } catch { return ts; }
    },

    formatSize(size) {
      if (!size && size !== 0) return '—';
      const units = ["B", "KB", "MB", "GB", "TB"];
      let i = 0;
      let s = size;
      while (s >= 1024 && i < units.length - 1) { s /= 1024; i++; }
      return `${s.toFixed(1)} ${units[i]}`;
    },

    fileEmoji(file) {
      const type = file.type || '';
      if (type.startsWith('image/')) return '🖼️';
      if (type.startsWith('video/')) return '🎬';
      if (type.startsWith('audio/')) return '🎵';
      const ext = (file.name || '').split('.').pop().toLowerCase();
      if (/^(zip|rar|7z|tar|gz|bz2)$/.test(ext)) return '📦';
      if (/^(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|md)$/.test(ext)) return '📄';
      return '📄';
    },

    getFileCategory(file) {
      const ct = (file.httpMetadata?.contentType || '').toLowerCase();
      const ext = file.key.split('.').pop().toLowerCase();
      if (ct.startsWith('image/') || /^(png|jpg|jpeg|gif|webp|svg|bmp|ico|avif)$/.test(ext)) return 'image';
      if (ct.startsWith('video/') || /^(mp4|avi|mkv|mov|wmv|flv|webm)$/.test(ext)) return 'video';
      if (ct.startsWith('audio/') || /^(mp3|wav|flac|aac|ogg|wma)$/.test(ext)) return 'audio';
      if (ct.includes('zip') || ct.includes('rar') || ct.includes('gzip') || ct.includes('tar') || /^(zip|rar|7z|tar|gz|bz2)$/.test(ext)) return 'archive';
      if (ct.startsWith('application/pdf') || ct.includes('document') || ct.includes('spreadsheet') || ct.includes('presentation') || /^(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|md)$/.test(ext)) return 'doc';
      return 'file';
    },

    openContextMenu(item) {
      this.ctxItem = item;
      this.showContextMenu = true;
    },

    copyLink(link) {
      const url = new URL(link, window.location.origin);
      navigator.clipboard.writeText(url.toString());
    },

    async copyPaste(source, target) {
      await axios.put(`/api/write/items/${target}`, "", {
        headers: { "x-amz-copy-source": encodeURIComponent(source) },
      });
    },

    async createFolder() {
      const name = window.prompt("请输入文件夹名称");
      if (!name) return;
      this.showUploadPopup = false;
      try {
        await axios.put(`/api/write/items/${this.cwd}${name}/_$folder$`, "");
        this.fetchFiles();
      } catch {
        fetch("/api/write/").then(r => { if (r.redirected) window.location.href = r.url; }).catch(() => {});
      }
    },

    fetchFiles() {
      this.files = [];
      this.folders = [];
      this.loading = true;
      fetch(`/api/children/${this.cwd}`)
        .then(r => r.json())
        .then(data => {
          this.files = data.value || [];
          this.folders = data.folders || [];
          this.loading = false;
        })
        .catch(() => { this.loading = false; });
    },

    onDrop(ev) {
      let files;
      if (ev.dataTransfer.items) {
        files = [...ev.dataTransfer.items].filter(i => i.kind === "file").map(i => i.getAsFile());
      } else {
        files = ev.dataTransfer.files;
      }
      this.uploadFiles(files);
    },

    onMenuClick(text) {
      switch (text) {
        case '名称 A-Z': this.order = null; break;
        case '大小 ↑': this.order = 'size_asc'; break;
        case '大小 ↓': this.order = 'size_desc'; break;
        case '粘贴': return this.pasteFile();
      }
    },

    onUploadClicked(fileElement) {
      if (!fileElement.value) return;
      this.uploadFiles(fileElement.files);
      this.showUploadPopup = false;
      fileElement.value = null;
    },

    preview(path) { window.open(path); },

    async pasteFile() {
      if (!this.clipboard) return;
      let name = window.prompt("重命名为:");
      if (name === null) return;
      if (name === "") name = this.clipboard.split("/").pop();
      await this.copyPaste(this.clipboard, `${this.cwd}${name}`);
      this.fetchFiles();
    },

    /* Concurrent Upload System */
    uploadFiles(files) {
      if (this.cwd && !this.cwd.endsWith("/")) this.cwd += "/";
      for (const file of Array.from(files)) {
        const id = ++this.uploadIdSeq;
        this.uploadItems.push({ id, file, basedir: this.cwd, progress: 0, status: 'queued' });
      }
      this.uploadPanelOpen = true;
      this.processUploadQueue();
    },

    async processUploadQueue() {
      const pending = this.uploadItems.filter(i => i.status === 'queued');
      if (!pending.length) return;
      const batch = pending.slice(0, CONCURRENCY - this.uploadItems.filter(i => i.status === 'uploading').length);
      if (!batch.length) return;
      this.activeUploads = this.uploadItems.filter(i => i.status === 'uploading' || i.status === 'queued').length;
      await Promise.all(batch.map(item => this.uploadSingle(item)));
      this.processUploadQueue();
    },

    async uploadSingle(item) {
      item.status = 'uploading';
      this.activeUploads = this.uploadItems.filter(i => i.status === 'uploading' || i.status === 'queued').length;
      let thumbnailDigest = null;

      if (item.file.type.startsWith('image/') || item.file.type === 'video/mp4') {
        try {
          const thumb = await generateThumbnail(item.file);
          const digest = await blobDigest(thumb);
          await axios.put(`/api/write/items/_$flaredrive$/thumbnails/${digest}.png`, thumb);
          thumbnailDigest = digest;
        } catch (e) {
          console.log('Thumbnail failed', e);
        }
      }

      try {
        const url = `/api/write/items/${item.basedir}${item.file.name}`;
        const headers = {};
        if (thumbnailDigest) headers['fd-thumbnail'] = thumbnailDigest;
        const onProgress = (e) => {
          item.progress = Math.round((e.loaded * 100) / e.total);
        };
        if (item.file.size >= SIZE_LIMIT) {
          await multipartUpload(`${item.basedir}${item.file.name}`, item.file, { headers, onUploadProgress: onProgress });
        } else {
          await axios.put(url, item.file, { headers, onUploadProgress: onProgress });
        }
        item.progress = 100;
        item.status = 'done';
      } catch (err) {
        item.status = 'error';
        fetch("/api/write/").then(r => { if (r.redirected) window.location.href = r.url; }).catch(() => {});
      }
      this.activeUploads = this.uploadItems.filter(i => i.status === 'uploading' || i.status === 'queued').length;
      if (this.activeUploads === 0) {
        this.fetchFiles();
        setTimeout(() => {
          this.uploadItems = [];
        }, 5000);
      }
    },

    async removeFile(key) {
      if (!window.confirm(`确定要删除 ${key} 吗？`)) return;
      await axios.delete(`/api/write/items/${key}`);
      this.fetchFiles();
    },

    async renameFile(key) {
      const name = window.prompt("重命名为:");
      if (!name) return;
      await this.copyPaste(key, `${this.cwd}${name}`);
      await axios.delete(`/api/write/items/${key}`);
      this.fetchFiles();
    },

    async moveFile(key) {
      const currentPath = this.cwd;
      let allFolders = [...this.folders];
      if (currentPath !== '') {
        const parentPath = currentPath.replace(/[^\/]+\/$/, '');
        if (!allFolders.includes(parentPath) && parentPath !== '') allFolders.unshift(parentPath);
      }
      if (!allFolders.includes('')) allFolders.unshift('');
      const opts = allFolders.map((f, i) => `${i+1}. ${f === '' ? '根目录' : f === currentPath ? '当前目录' : f.replace(/.*\/(?!$)|\//g, '') + '/'}`).join('\n');
      const sel = window.prompt(`选择目标目录:\n${opts}\n`);
      if (!sel) return;
      const idx = parseInt(sel) - 1;
      if (isNaN(idx) || idx < 0 || idx >= allFolders.length) return alert('无效选择');
      const target = allFolders[idx];
      const fileName = key.split('/').pop();
      const finalName = fileName.endsWith('_$folder$') ? fileName.slice(0, -9) : fileName;
      const norm = target === '' ? '' : (target.endsWith('/') ? target : target + '/');

      try {
        if (key.endsWith('_$folder$')) {
          const srcBase = key.slice(0, -9);
          const tgtBase = norm + finalName + '/';
          const all = await this.getAllItems(srcBase);
          for (const item of all) {
            const rel = item.key.substring(srcBase.length);
            await this.copyPaste(item.key, tgtBase + rel);
            await axios.delete(`/api/write/items/${item.key}`);
          }
          await this.copyPaste(key, tgtBase.slice(0, -1) + '_$folder$');
          await axios.delete(`/api/write/items/${key}`);
        } else {
          await this.copyPaste(key, norm + finalName);
          await axios.delete(`/api/write/items/${key}`);
        }
        this.fetchFiles();
      } catch {
        alert('移动失败');
      }
    },

    async getAllItems(prefix) {
      const items = [];
      let marker = null;
      do {
        const url = new URL(`/api/children/${prefix}`, window.location.origin);
        if (marker) url.searchParams.set('marker', marker);
        const data = await fetch(url).then(r => r.json());
        items.push(...(data.value || []));
        for (const folder of (data.folders || [])) {
          items.push({ key: folder + '_$folder$', size: 0, uploaded: new Date().toISOString() });
          items.push(...await this.getAllItems(folder));
        }
        marker = data.marker;
      } while (marker);
      return items;
    },
  },

  watch: {
    cwd: {
      handler() {
        this.fetchFiles();
        const url = new URL(window.location);
        if ((url.searchParams.get("p") || "") !== this.cwd) {
          this.cwd ? url.searchParams.set("p", this.cwd) : url.searchParams.delete("p");
          window.history.pushState(null, "", url.toString());
        }
        document.title = `${this.cwd.replace(/.*\/(?!$)|\//g, "") || "/"} - 文件库`;
      },
      immediate: true,
    },
  },

  created() {
    const saved = localStorage.getItem('drive-theme');
    if (saved) document.documentElement.dataset.theme = saved;
    else document.documentElement.dataset.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    window.addEventListener("popstate", () => {
      const p = new URL(window.location).searchParams.get("p") || "";
      if (p !== this.cwd) this.cwd = p;
    });
  },

  components: { Dialog, Menu, UploadPopup, FileIcon },
};
</script>

<style>
.main { height: 100%; display: flex; flex-direction: column; }

/* ===== Title Bar ===== */
.title-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px 8px; flex-shrink: 0;
}
.title-left { display: flex; align-items: baseline; gap: 10px; }
.title-text {
  font-size: 1.35rem; font-weight: 700; margin: 0;
  background: linear-gradient(135deg, var(--text-primary), var(--accent));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.title-domain { font-size: 0.78rem; color: var(--text-tertiary); }
.title-right { display: flex; gap: 4px; }
.title-btn {
  width: 34px; height: 34px; border-radius: 10px; border: none;
  background: var(--bg-secondary); cursor: pointer; font-size: 0.95rem;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s; color: var(--text-secondary);
}
.title-btn:hover { background: var(--accent-subtle); color: var(--accent); }

/* ===== Storage ===== */
.storage-bar-wrap { padding: 6px 20px 10px; flex-shrink: 0; }
.storage-info { display: flex; justify-content: space-between; font-size: 0.7rem; color: var(--text-tertiary); margin-bottom: 4px; }
.storage-bar { height: 5px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden; }
.storage-bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent), #a855f7); border-radius: 3px; transition: width 0.5s; }

/* ===== Toolbar ===== */
.toolbar {
  display: flex; align-items: center; gap: 10px; padding: 6px 16px; flex-shrink: 0;
  border-bottom: 1px solid var(--border);
}
.toolbar-search {
  flex: 0 1 280px; padding: 7px 14px; border: 1px solid var(--border);
  border-radius: 10px; background: var(--bg-secondary); font-size: 0.85rem;
  color: var(--text-primary); outline: none; transition: border-color 0.2s;
}
.toolbar-search:focus { border-color: var(--accent); background: var(--bg-primary); }
.toolbar-actions { display: flex; gap: 4px; margin-left: auto; }
.tb-btn {
  padding: 6px 12px; border-radius: 8px; border: none; background: var(--bg-secondary);
  cursor: pointer; font-size: 0.82rem; color: var(--text-secondary);
  display: flex; align-items: center; gap: 4px; white-space: nowrap;
  transition: all 0.15s;
}
.tb-btn:hover { background: var(--accent-subtle); color: var(--accent); }
.tb-btn.primary { background: linear-gradient(135deg, var(--accent), #a855f7); color: #fff; }

/* ===== Filter Tabs ===== */
.filter-tabs {
  display: flex; gap: 2px; padding: 8px 16px 4px; flex-shrink: 0;
  overflow-x: auto; scrollbar-width: none;
}
.filter-tabs::-webkit-scrollbar { display: none; }
.ftab {
  padding: 5px 14px; border-radius: 20px; border: none; background: transparent;
  cursor: pointer; font-size: 0.8rem; color: var(--text-tertiary); white-space: nowrap;
  transition: all 0.15s;
}
.ftab:hover { background: var(--bg-secondary); color: var(--text-primary); }
.ftab.active { background: var(--accent); color: #fff; }

/* ===== Table Header ===== */
.table-header {
  display: flex; align-items: center; padding: 6px 16px;
  font-size: 0.72rem; color: var(--text-tertiary); text-transform: uppercase;
  letter-spacing: 0.04em; border-bottom: 1px solid var(--border);
  background: color-mix(in oklch, var(--bg-secondary) 50%, transparent); flex-shrink: 0;
}
.th-icon { flex: 0 0 40px; }
.th-name { flex: 1; }
.th-date { flex: 0 0 140px; text-align: right; display: none; }
.th-size { flex: 0 0 90px; text-align: right; }
.th-more { flex: 0 0 36px; }

@media (min-width: 640px) { .th-date { display: block; } }

/* ===== Table Body ===== */
.table-body { flex: 1; overflow-y: auto; padding: 2px 8px; }
.table-row {
  display: flex; align-items: center; padding: 6px 8px; border-radius: 8px;
  transition: background 0.15s; cursor: pointer;
}
.table-row:hover { background: var(--accent-subtle); }

.td-icon { flex: 0 0 40px; display: flex; justify-content: center; }
.td-name { flex: 1; min-width: 0; }
.td-date { flex: 0 0 140px; text-align: right; font-size: 0.8rem; color: var(--text-tertiary); display: none; }
.td-size { flex: 0 0 90px; text-align: right; font-size: 0.8rem; color: var(--text-tertiary); }
.td-more { flex: 0 0 36px; display: flex; justify-content: center; }

@media (min-width: 640px) { .td-date { display: block; } }

.file-label { font-weight: 500; font-size: 0.88rem; }
.row-more {
  width: 28px; height: 28px; border-radius: 50%; border: none; background: transparent;
  cursor: pointer; color: var(--text-tertiary); opacity: 0; font-size: 1rem;
  display: flex; align-items: center; justify-content: center; transition: all 0.15s;
}
.table-row:hover .row-more { opacity: 1; }
.row-more:hover { background: var(--bg-secondary); color: var(--text-primary); }

.table-loading, .table-empty { text-align: center; padding: 32px; color: var(--text-tertiary); font-size: 0.88rem; }

/* ===== Context Menu ===== */
.ctx-filename { padding: 12px 16px; font-size: 0.82rem; color: var(--text-secondary); word-break: break-all; border-bottom: 1px solid var(--border); }
.ctx-list { padding: 4px; }
.ctx-list li button, .ctx-list li a {
  display: block; width: 100%; padding: 8px 14px; text-align: left; border-radius: 6px;
  transition: all 0.15s; font-size: 0.85rem; color: var(--text-primary); text-decoration: none;
}
.ctx-list li button:hover, .ctx-list li a:hover { background: var(--accent-subtle); color: var(--accent); }
.ctx-list li button.danger { color: var(--text-danger); }
.ctx-list li button.danger:hover { background: color-mix(in oklch, var(--text-danger) 10%, transparent); }

/* ===== Upload Tab ===== */
.upload-tab {
  border-top: 1px solid var(--border); background: color-mix(in oklch, var(--bg-secondary) 60%, transparent);
  backdrop-filter: blur(12px); flex-shrink: 0;
}
.utab-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 20px; cursor: pointer; user-select: none; transition: background 0.15s;
}
.utab-header:hover { background: var(--accent-subtle); }
.utab-left { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-secondary); }
.utab-badge { background: var(--accent); color: #fff; font-size: 0.68rem; padding: 1px 7px; border-radius: 10px; font-weight: 600; }
.utab-arrow { font-size: 0.75rem; color: var(--text-tertiary); transition: transform 0.2s; }
.utab-arrow.open { transform: rotate(180deg); }
.utab-body { padding: 0 20px 10px; display: flex; flex-direction: column; gap: 6px; }
.utab-item { display: flex; align-items: center; gap: 10px; }
.uti-icon { font-size: 0.95rem; width: 24px; text-align: center; flex-shrink: 0; }
.uti-info { flex: 1; min-width: 0; }
.uti-name { font-size: 0.78rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.uti-bar { height: 4px; background: var(--bg-tertiary); border-radius: 2px; margin-top: 3px; overflow: hidden; }
.uti-bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent), #a855f7); border-radius: 2px; transition: width 0.3s; }
.uti-bar-fill.done { background: #22c55e; }
.uti-bar-fill.error { background: var(--text-danger); }
.uti-status { font-size: 0.72rem; color: var(--text-tertiary); flex-shrink: 0; min-width: 36px; text-align: right; }

/* ===== FAB ===== */
.fab {
  position: fixed; bottom: 20px; right: 20px;
  width: 50px; height: 50px; border-radius: 50%; border: none;
  background: linear-gradient(135deg, var(--accent), #a855f7); color: #fff;
  font-size: 1.5rem; cursor: pointer; z-index: 5;
  box-shadow: 0 4px 20px var(--accent-glow);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.25s var(--ease-out);
}
.fab:hover { transform: translateY(-3px); box-shadow: 0 6px 28px rgba(124,91,240,0.35); }
.fab:active { transform: scale(0.95); }
</style>
