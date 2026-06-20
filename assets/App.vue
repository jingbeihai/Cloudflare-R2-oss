<template>
  <div class="app-layout" @drop.prevent="onDrop" @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false">

    <canvas ref="particleCanvas" class="particle-bg"></canvas>

    <Transition name="scale">
      <div v-if="dragOver" class="drop-overlay" @drop="onDrop" @dragover.prevent @dragleave="dragOver = false">
        <canvas ref="dropCanvas" class="drop-canvas"></canvas>
        <div class="drop-text">
          <span class="drop-icon">📤</span>
          <span>释放以上传文件</span>
        </div>
      </div>
    </Transition>

    <nav class="unified-nav">
      <div class="unified-nav-inner">
        <a class="unified-nav-logo" href="https://7988798.xyz">Bin</a>
        <div class="unified-nav-links">
          <a class="unified-nav-link" href="https://7988798.xyz">主页</a>
          <a class="unified-nav-link" href="https://blog.7988798.xyz">博客</a>
          <a class="unified-nav-link active" href="/">网盘</a>
          <a class="unified-nav-link" href="https://github.com/jingbeihai" target="_blank">GitHub</a>
        </div>
      </div>
    </nav>

    <div class="app-glass">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-icon">🗄️</div>
          <div class="brand-text">
            <h1 class="brand-title">文件库</h1>
            <span class="brand-domain">drive.7988798.xyz</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a class="nav-item" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">
            <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            <span>全部文件</span>
          </a>
          <a class="nav-item" :class="{ active: activeFilter === 'image' }" @click="activeFilter = 'image'">
            <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span>图片</span>
          </a>
          <a class="nav-item" :class="{ active: activeFilter === 'doc' }" @click="activeFilter = 'doc'">
            <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <span>文档</span>
          </a>
          <a class="nav-item" :class="{ active: activeFilter === 'video' }" @click="activeFilter = 'video'">
            <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            <span>视频</span>
          </a>
          <a class="nav-item" :class="{ active: activeFilter === 'audio' }" @click="activeFilter = 'audio'">
            <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            <span>音频</span>
          </a>
          <a class="nav-item" :class="{ active: activeFilter === 'archive' }" @click="activeFilter = 'archive'">
            <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
            <span>压缩包</span>
          </a>
        </nav>

        <div class="sidebar-spacer"></div>

        <div class="sidebar-storage">
          <canvas ref="storageCanvas" class="storage-canvas" width="80" height="80"></canvas>
          <div class="storage-info">
            <div class="storage-used">{{ formatSize(storageUsed) }}</div>
            <div class="storage-total">/ {{ formatSize(storageTotal) }}</div>
          </div>
          <div class="storage-bar-wrap">
            <div class="storage-bar"><div class="storage-bar-fill" :style="{ width: storagePercent + '%' }"></div></div>
          </div>
        </div>

        <div class="sidebar-footer">
          <button class="sf-btn" @click="toggleTheme" :title="currentTheme === 'dark' ? '浅色模式' : '深色模式'">
            <svg v-if="currentTheme === 'dark'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sf-svg"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sf-svg"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>
          <button class="sf-btn" @click="showMenu = true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sf-svg"><circle cx="12" cy="12" r="3"/><circle cx="19" cy="12" r="3"/><circle cx="5" cy="12" r="3"/></svg>
          </button>
          <Menu v-model="showMenu" :items="menuItems" @click="onMenuClick" />
        </div>
      </aside>

      <div class="content">
        <div class="top-bar">
          <div class="breadcrumb" @click="cwd = cwd.replace(/[^\/]+\/$/, '')">
            <svg class="bc-home" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span class="bc-root">全部文件</span>
            <template v-for="(part, i) in cwdParts" :key="i">
              <span class="bc-sep">/</span>
              <span class="bc-part">{{ part }}</span>
            </template>
          </div>
          <div class="top-actions">
            <div class="search-wrap">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" v-model="search" placeholder="搜索文件..." class="search-input" />
            </div>
            <div class="view-toggle">
              <button class="vt-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'" title="列表视图">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </button>
              <button class="vt-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'" title="网格视图">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </button>
            </div>
            <button class="top-btn primary" @click="showUploadPopup = true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              上传
            </button>
            <button class="top-btn" @click="createFolder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
              新建
            </button>
            <button class="top-btn" @click="fetchFiles">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            </button>
          </div>
        </div>

        <UploadPopup v-model="showUploadPopup" @upload="onUploadClicked" @createFolder="createFolder" />

        <div class="table-wrap" v-if="viewMode === 'list'">
          <div class="table-header">
            <div class="th-name">
              <span v-if="batchMode">
                <input type="checkbox" :checked="allSelected" @change="toggleAll" />
              </span>
              文件名
            </div>
            <div class="th-size">大小</div>
            <div class="th-date">修改日期</div>
            <div class="th-more"></div>
          </div>

          <div class="table-body" @contextmenu.prevent>
            <div v-if="loading" class="table-body-skeleton">
              <div class="sk-row" v-for="n in 5" :key="n">
                <div class="sk-icon skeleton"></div>
                <div class="sk-name skeleton"></div>
                <div class="sk-size skeleton"></div>
                <div class="sk-date skeleton"></div>
              </div>
            </div>

            <template v-if="!loading">
              <div v-if="cwd !== ''" class="table-row" @click="cwd = cwd.replace(/[^\/]+\/$/, '')">
                <div class="td-name">
                  <span class="file-icon fi-folder">📁</span>
                  <span class="file-label">..</span>
                </div>
                <div class="td-size">—</div>
                <div class="td-date">—</div>
                <div class="td-more"></div>
              </div>

              <div v-for="folder in filteredFolders" :key="folder" class="table-row"
                @click="cwd = folder"
                @contextmenu.prevent="openContextMenu(folder)">
                <div class="td-name">
                  <span v-if="batchMode"><input type="checkbox" /></span>
                  <span class="file-icon fi-folder">📁</span>
                  <span class="file-label" v-text="folder.match(/.*?([^/]*)\/?$/)[1]"></span>
                </div>
                <div class="td-size">—</div>
                <div class="td-date">—</div>
                <div class="td-more">
                  <button class="row-more" @click.stop="openContextMenu(folder)">⋯</button>
                </div>
              </div>

              <div v-for="file in filteredFiles" :key="file.key" class="table-row"
                @dblclick="preview(`/raw/${file.key}`)"
                @contextmenu.prevent="openContextMenu(file)">
                <div class="td-name">
                  <span v-if="batchMode"><input type="checkbox" /></span>
                  <FileIcon :file="file" />
                  <span class="file-label" v-text="file.key.split('/').pop()"></span>
                </div>
                <div class="td-size" v-text="formatSize(file.size)"></div>
                <div class="td-date" v-text="formatDate(file.uploaded)"></div>
                <div class="td-more">
                  <button class="row-more" @click.stop="openContextMenu(file)">⋯</button>
                </div>
              </div>
            </template>

            <div v-if="!loading && !filteredFiles.length && !filteredFolders.length" class="table-state">
              <span class="empty-icon">📂</span>
              <span>此目录为空</span>
            </div>
          </div>
        </div>

        <div class="grid-wrap" v-if="viewMode === 'grid'">
          <div v-if="loading" class="grid-skeleton">
            <div class="sk-card" v-for="n in 8" :key="n">
              <div class="sk-card-icon skeleton"></div>
              <div class="sk-card-name skeleton"></div>
              <div class="sk-card-meta skeleton"></div>
            </div>
          </div>

          <template v-if="!loading">
            <div v-if="cwd !== ''" class="grid-item folder" @click="cwd = cwd.replace(/[^\/]+\/$/, '')">
              <div class="gi-icon">📁</div>
              <div class="gi-name">..</div>
            </div>

            <div v-for="folder in filteredFolders" :key="folder" class="grid-item folder"
              @click="cwd = folder"
              @contextmenu.prevent="openContextMenu(folder)">
              <div class="gi-icon">📁</div>
              <div class="gi-name" v-text="folder.match(/.*?([^/]*)\/?$/)[1]"></div>
            </div>

            <div v-for="file in filteredFiles" :key="file.key" class="grid-item"
              @dblclick="preview(`/raw/${file.key}`)"
              @contextmenu.prevent="openContextMenu(file)">
              <div class="gi-icon">
                <FileIcon :file="file" :size="48" />
              </div>
              <div class="gi-name" v-text="file.key.split('/').pop()"></div>
              <div class="gi-meta" v-text="formatSize(file.size)"></div>
            </div>
          </template>

          <div v-if="!loading && !filteredFiles.length && !filteredFolders.length" class="table-state">
            <span class="empty-icon">📂</span>
            <span>此目录为空</span>
          </div>
        </div>

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

        <div class="upload-tab" v-if="uploadItems.length">
          <div class="utab-header" @click="uploadPanelOpen = !uploadPanelOpen">
            <div class="utab-left">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="utab-svg"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span>上传进度</span>
              <span class="utab-badge" v-if="activeUploads > 0">{{ activeUploads }}</span>
            </div>
            <div class="utab-right">
              <span class="utab-done" v-if="doneUploads > 0 && doneUploads === uploadItems.length">全部完成</span>
              <span class="utab-arrow" :class="{ open: uploadPanelOpen }">▾</span>
            </div>
          </div>
          <div class="utab-body" v-show="uploadPanelOpen">
            <div class="utab-item" v-for="item in uploadItems" :key="item.id">
              <span class="uti-icon">{{ fileEmoji(item.file) }}</span>
              <div class="uti-info">
                <div class="uti-name" v-text="item.file.name"></div>
                <div class="uti-bar"><div class="uti-bar-fill" :class="{ done: item.status === 'done', error: item.status === 'error' }" :style="{ width: item.progress + '%' }"></div></div>
              </div>
              <span class="uti-status" v-text="item.status === 'done' ? '✅' : item.status === 'error' ? '❌' : item.progress + '%'"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="toast-container" id="toast-container"></div>
  </div>
</template>

<script>
import { generateThumbnail, blobDigest, multipartUpload, SIZE_LIMIT, initParticles, drawStorageChart } from "/assets/main.mjs";
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
    doneUploads: 0,
    storageUsed: 3.7 * 1024 * 1024 * 1024,
    storageTotal: 10 * 1024 * 1024 * 1024,
    viewMode: 'list',
    dragOver: false,
  }),

  computed: {
    currentTheme() {
      return document.documentElement.dataset.theme || 'light';
    },
    storagePercent() {
      return Math.round((this.storageUsed / this.storageTotal) * 100);
    },
    allSelected() {
      return this.files.length > 0 && this.files.every(f => f._selected);
    },
    cwdParts() {
      return this.cwd ? this.cwd.replace(/\/$/, '').split('/') : [];
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
      setTimeout(() => this.drawStorage(), 100);
    },
    toggleAll() {
      const v = !this.allSelected;
      this.files.forEach(f => f._selected = v);
    },
    formatDate(ts) {
      try { return new Date(ts).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); }
      catch { return ts; }
    },
    formatSize(size) {
      if (!size && size !== 0) return '—';
      const units = ["B", "KB", "MB", "GB", "TB"];
      let i = 0, s = size;
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
    openContextMenu(item) {
      this.ctxItem = item;
      this.showContextMenu = true;
    },
    copyLink(link) {
      const url = new URL(link, window.location.origin);
      navigator.clipboard.writeText(url.toString());
      this.showToast('链接已复制', 'success');
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
        this.showToast('文件夹已创建', 'success');
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
      this.dragOver = false;
      let files;
      if (ev.dataTransfer.items) {
        files = [...ev.dataTransfer.items].filter(i => i.kind === "file").map(i => i.getAsFile());
      } else {
        files = ev.dataTransfer.files;
      }
      if (files.length) {
        this.uploadFiles(files);
        this.showToast(`${files.length} 个文件已添加`, 'info');
      }
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
        } catch (e) { console.log('Thumbnail failed', e); }
      }
      try {
        const url = `/api/write/items/${item.basedir}${item.file.name}`;
        const headers = {};
        if (thumbnailDigest) headers['fd-thumbnail'] = thumbnailDigest;
        const onProgress = (e) => { item.progress = Math.round((e.loaded * 100) / e.total); };
        if (item.file.size >= SIZE_LIMIT) {
          await multipartUpload(`${item.basedir}${item.file.name}`, item.file, { headers, onUploadProgress: onProgress });
        } else {
          await axios.put(url, item.file, { headers, onUploadProgress: onProgress });
        }
        item.progress = 100;
        item.status = 'done';
        this.showToast(`${item.file.name} 上传完成`, 'success');
      } catch (err) {
        item.status = 'error';
        this.showToast(`${item.file.name} 上传失败`, 'error');
        fetch("/api/write/").then(r => { if (r.redirected) window.location.href = r.url; }).catch(() => {});
      }
      this.activeUploads = this.uploadItems.filter(i => i.status === 'uploading' || i.status === 'queued').length;
      this.doneUploads = this.uploadItems.filter(i => i.status === 'done').length;
      if (this.activeUploads === 0) {
        this.fetchFiles();
        setTimeout(() => { this.uploadItems = []; this.doneUploads = 0; }, 5000);
      }
    },
    async removeFile(key) {
      if (!window.confirm(`确定要删除 ${key} 吗？`)) return;
      await axios.delete(`/api/write/items/${key}`);
      this.fetchFiles();
      this.showToast('已删除', 'info');
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
      } catch { alert('移动失败'); }
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
    showToast(msg, type = 'info') {
      const container = document.getElementById('toast-container');
      if (!container) return;
      const el = document.createElement('div');
      el.className = `toast ${type}`;
      el.textContent = msg;
      container.appendChild(el);
      setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(40px)'; el.style.transition = 'all 0.3s ease'; setTimeout(() => el.remove(), 300); }, 3000);
    },
    drawStorage() {
      const canvas = this.$refs.storageCanvas;
      if (!canvas) return;
      drawStorageChart(canvas, this.storagePercent);
    },
    initParticleBg() {
      const canvas = this.$refs.particleCanvas;
      if (!canvas) return;
      const style = getComputedStyle(document.documentElement);
      const accent = style.getPropertyValue('--accent').trim() || '#7c5bf0';
      const cleanup = initParticles(canvas, { color: accent, count: 40, connectionDistance: 120, speed: 0.3 });
      this._particleCleanup = cleanup;
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
    storagePercent: {
      handler() { this.drawStorage(); },
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

  mounted() {
    this.initParticleBg();
    this.drawStorage();
  },

  beforeUnmount() {
    if (this._particleCleanup) this._particleCleanup();
  },

  components: { Dialog, Menu, UploadPopup, FileIcon },
};
</script>

<style>
/* ===== Layout ===== */
.app-layout { height: 100%; display: flex; flex-direction: column; position: relative; overflow: hidden; }

/* ===== Unified Nav ===== */
.unified-nav {
  flex-shrink: 0;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  background: color-mix(in oklch, var(--bg-primary) 70%, transparent);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid var(--border);
  position: relative;
  z-index: 10;
}
.unified-nav-inner {
  width: 100%;
  max-width: 1200px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.unified-nav-logo {
  font-size: 1.1rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent), #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.unified-nav-links {
  display: flex;
  align-items: center;
  gap: 6px;
}
.unified-nav-link {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-secondary);
  padding: 5px 12px;
  border-radius: var(--radius-md);
  transition: all 0.2s var(--ease-out);
}
.unified-nav-link:hover {
  color: var(--text-primary);
  background: var(--accent-subtle);
}
.unified-nav-link.active {
  color: #fff;
  background: var(--accent);
}

/* ===== Particle Canvas Background ===== */
.particle-bg {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0;
  pointer-events: none;
}

/* ===== Glass Container ===== */
.app-glass {
  position: relative; z-index: 1;
  display: flex; flex: 1; min-height: 0; width: 100%;
  background: color-mix(in oklch, var(--bg-primary) 78%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* ===== Drop Overlay ===== */
.drop-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: color-mix(in oklch, var(--accent) 15%, var(--backdrop));
  backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
}
.drop-canvas { position: absolute; inset: 0; pointer-events: none; }
.drop-text {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  color: #fff; font-size: 1.2rem; font-weight: 600;
  animation: float 2s ease-in-out infinite;
}
.drop-icon { font-size: 3rem; }

/* ===== Sidebar ===== */
.sidebar {
  width: 220px; flex-shrink: 0; display: flex; flex-direction: column;
  background: color-mix(in oklch, var(--bg-secondary) 60%, transparent);
  border-right: 1px solid var(--border); padding: 0;
}
.sidebar-brand {
  display: flex; align-items: center; gap: 10px;
  padding: 18px 16px 14px; border-bottom: 1px solid var(--border);
}
.brand-icon { font-size: 1.6rem; }
.brand-title {
  font-size: 1.05rem; font-weight: 700; margin: 0;
  background: linear-gradient(135deg, var(--text-primary), var(--accent));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.brand-domain { font-size: 0.65rem; color: var(--text-tertiary); display: block; margin-top: 1px; }

.sidebar-nav { flex: 1; padding: 6px; overflow-y: auto; }
.nav-item {
  display: flex; align-items: center; gap: 10px; padding: 8px 12px;
  border-radius: 8px; cursor: pointer; font-size: 0.85rem; color: var(--text-secondary);
  transition: all 0.15s; user-select: none; margin-bottom: 2px;
}
.nav-item:hover { background: var(--accent-subtle); color: var(--accent); }
.nav-item.active { background: var(--accent); color: #fff; font-weight: 600; }
.nav-svg { width: 18px; height: 18px; flex-shrink: 0; }

.sidebar-spacer { flex: 1; }

.sidebar-storage {
  padding: 14px 16px; border-top: 1px solid var(--border);
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.storage-canvas { width: 64px; height: 64px; }
.storage-info { display: flex; align-items: baseline; gap: 4px; font-size: 0.75rem; }
.storage-used { color: var(--text-primary); font-weight: 600; }
.storage-total { color: var(--text-tertiary); }
.storage-bar-wrap { width: 100%; }
.storage-bar { height: 4px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden; }
.storage-bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent), #a855f7); border-radius: 3px; transition: width 0.5s var(--ease-out); }

.sidebar-footer {
  display: flex; gap: 2px; padding: 8px 12px; border-top: 1px solid var(--border); justify-content: center;
}
.sf-btn {
  width: 34px; height: 34px; border-radius: 8px; border: none;
  background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: var(--text-tertiary); transition: all 0.15s;
}
.sf-btn:hover { background: var(--accent-subtle); color: var(--accent); }
.sf-svg { width: 18px; height: 18px; }

/* ===== Main Content ===== */
.content {
  flex: 1; display: flex; flex-direction: column; min-width: 0;
}

/* ===== Top Bar ===== */
.top-bar {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 20px 10px; flex-shrink: 0;
}
.breadcrumb {
  font-size: 0.85rem; color: var(--text-secondary); cursor: pointer;
  display: flex; align-items: center; gap: 4px; flex-shrink: 0;
}
.bc-home { width: 16px; height: 16px; flex-shrink: 0; }
.bc-root { font-weight: 600; color: var(--text-primary); }
.bc-sep { color: var(--text-tertiary); font-size: 0.75rem; }
.bc-part { color: var(--text-secondary); }
.breadcrumb:hover { opacity: 0.8; }

.top-actions { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.search-wrap { position: relative; }
.search-icon {
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
  width: 15px; height: 15px; color: var(--text-tertiary); pointer-events: none;
}
.search-input {
  width: 180px; padding: 6px 12px 6px 32px; border: 1px solid var(--border);
  border-radius: 8px; background: color-mix(in oklch, var(--bg-primary) 70%, transparent);
  font-size: 0.82rem; color: var(--text-primary); outline: none; transition: all 0.2s;
}
.search-input:focus { border-color: var(--accent); width: 220px; background: var(--bg-primary); }

.view-toggle { display: flex; gap: 2px; background: var(--bg-tertiary); border-radius: 8px; padding: 2px; }
.vt-btn {
  width: 30px; height: 28px; border-radius: 6px; display: flex;
  align-items: center; justify-content: center; transition: all 0.15s;
  color: var(--text-tertiary);
}
.vt-btn:hover { color: var(--text-secondary); }
.vt-btn.active { background: var(--bg-primary); color: var(--accent); box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.vt-btn svg { width: 16px; height: 16px; }

.top-btn {
  padding: 6px 14px; border-radius: 8px; border: 1px solid var(--border);
  background: color-mix(in oklch, var(--bg-primary) 70%, transparent);
  cursor: pointer; font-size: 0.82rem;
  color: var(--text-secondary); white-space: nowrap;
  display: flex; align-items: center; gap: 6px; transition: all 0.15s;
}
.top-btn:hover { background: var(--accent-subtle); border-color: var(--accent); color: var(--accent); }
.top-btn.primary {
  background: linear-gradient(135deg, var(--accent), #a855f7);
  color: #fff; border-color: transparent;
}
.top-btn.primary:hover { opacity: 0.92; }
.top-btn svg { width: 16px; height: 16px; }

/* ===== Table View ===== */
.table-wrap { flex: 1; display: flex; flex-direction: column; overflow: hidden; padding: 0 16px 8px; }
.table-header {
  display: flex; align-items: center; padding: 8px 12px;
  font-size: 0.72rem; color: var(--text-tertiary); font-weight: 600;
  border-bottom: 1px solid var(--border); flex-shrink: 0;
  text-transform: uppercase; letter-spacing: 0.04em;
}
.table-header .th-name { flex: 1; display: flex; align-items: center; gap: 8px; }
.table-header .th-size { flex: 0 0 100px; text-align: right; }
.table-header .th-date { flex: 0 0 160px; text-align: right; }
.table-header .th-more { flex: 0 0 40px; }

.table-body { flex: 1; overflow-y: auto; }

/* Skeleton */
.table-body-skeleton { padding: 4px 0; }
.sk-row {
  display: flex; align-items: center; padding: 10px 12px; gap: 12px;
}
.sk-icon { width: 28px; height: 28px; border-radius: 6px; flex-shrink: 0; }
.sk-name { flex: 1; height: 14px; border-radius: 4px; }
.sk-size { width: 80px; height: 14px; border-radius: 4px; flex-shrink: 0; }
.sk-date { width: 120px; height: 14px; border-radius: 4px; flex-shrink: 0; }

.table-row {
  display: flex; align-items: center; padding: 8px 12px; border-radius: 8px;
  transition: all 0.12s; cursor: pointer;
  border-bottom: 1px solid color-mix(in oklch, var(--border) 40%, transparent);
  animation: row-in 0.25s var(--ease-out) both;
}
@keyframes row-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.table-row:hover { background: var(--accent-subtle); }
.table-row .td-name { flex: 1; display: flex; align-items: center; gap: 10px; min-width: 0; }
.table-row .td-size { flex: 0 0 100px; text-align: right; font-size: 0.8rem; color: var(--text-tertiary); }
.table-row .td-date { flex: 0 0 160px; text-align: right; font-size: 0.8rem; color: var(--text-tertiary); }
.table-row .td-more { flex: 0 0 40px; display: flex; justify-content: center; }

.file-icon { font-size: 1.1rem; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px; flex-shrink: 0; }
.fi-folder { background: color-mix(in oklch, var(--accent) 10%, transparent); }
.file-label { font-weight: 500; font-size: 0.88rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.row-more {
  width: 28px; height: 28px; border-radius: 50%; border: none; background: transparent;
  cursor: pointer; color: var(--text-tertiary); opacity: 0; font-size: 1rem;
  display: flex; align-items: center; justify-content: center; transition: all 0.15s;
}
.table-row:hover .row-more { opacity: 1; }
.row-more:hover { background: var(--bg-secondary); color: var(--text-primary); }

.table-state { text-align: center; padding: 60px 16px; color: var(--text-tertiary); font-size: 0.95rem; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.empty-icon { font-size: 2.5rem; }

/* ===== Grid View ===== */
.grid-wrap {
  flex: 1; overflow-y: auto; padding: 12px 16px;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px; align-content: start;
}
.grid-item {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 16px 8px 12px; border-radius: var(--radius-md);
  border: 1px solid var(--border); cursor: pointer;
  transition: all 0.15s; animation: row-in 0.25s var(--ease-out) both;
  background: color-mix(in oklch, var(--bg-primary) 60%, transparent);
}
.grid-item:hover { background: var(--accent-subtle); border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 4px 16px var(--accent-glow); }
.grid-item.folder { border-style: dashed; }
.gi-icon { font-size: 2rem; line-height: 1; min-height: 48px; display: flex; align-items: center; }
.gi-name {
  font-size: 0.8rem; font-weight: 500; text-align: center;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;
}
.gi-meta { font-size: 0.68rem; color: var(--text-tertiary); }

/* Grid skeleton */
.grid-skeleton { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.sk-card { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 20px 12px 16px; border: 1px solid var(--border); border-radius: var(--radius-md); }
.sk-card-icon { width: 48px; height: 48px; border-radius: 10px; }
.sk-card-name { width: 80%; height: 12px; border-radius: 4px; }
.sk-card-meta { width: 50%; height: 10px; border-radius: 4px; }

/* ===== Context Menu ===== */
.ctx-filename { padding: 12px 16px; font-size: 0.82rem; color: var(--text-secondary); word-break: break-all; border-bottom: 1px solid var(--border); }
.ctx-list { padding: 4px; }
.ctx-list li button, .ctx-list li a {
  display: block; width: 100%; padding: 8px 14px; text-align: left; border-radius: 6px;
  transition: all 0.15s; font-size: 0.85rem; color: var(--text-primary); text-decoration: none;
  border: none; background: none; cursor: pointer;
}
.ctx-list li button:hover, .ctx-list li a:hover { background: var(--accent-subtle); color: var(--accent); }
.ctx-list li button.danger { color: var(--text-danger); }
.ctx-list li button.danger:hover { background: color-mix(in oklch, var(--text-danger) 10%, transparent); }

/* ===== Upload Tab ===== */
.upload-tab {
  border-top: 1px solid var(--border);
  background: color-mix(in oklch, var(--bg-primary) 75%, transparent);
  backdrop-filter: blur(8px);
  flex-shrink: 0;
}
.utab-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 20px; cursor: pointer; user-select: none;
}
.utab-header:hover { background: var(--accent-subtle); }
.utab-left { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; color: var(--text-secondary); }
.utab-svg { width: 16px; height: 16px; }
.utab-right { display: flex; align-items: center; gap: 8px; }
.utab-badge { background: var(--accent); color: #fff; font-size: 0.65rem; padding: 1px 7px; border-radius: 10px; font-weight: 600; }
.utab-done { font-size: 0.75rem; color: #22c55e; }
.utab-arrow { font-size: 0.75rem; color: var(--text-tertiary); transition: transform 0.2s; }
.utab-arrow.open { transform: rotate(180deg); }
.utab-body { padding: 0 20px 10px; display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto; }
.utab-item { display: flex; align-items: center; gap: 10px; }
.uti-icon { font-size: 0.95rem; width: 24px; text-align: center; flex-shrink: 0; }
.uti-info { flex: 1; min-width: 0; }
.uti-name { font-size: 0.78rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.uti-bar { height: 4px; background: var(--bg-tertiary); border-radius: 2px; margin-top: 3px; overflow: hidden; }
.uti-bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent), #a855f7); border-radius: 2px; transition: width 0.3s; }
.uti-bar-fill.done { background: #22c55e; }
.uti-bar-fill.error { background: var(--text-danger); }
.uti-status { font-size: 0.72rem; color: var(--text-tertiary); flex-shrink: 0; min-width: 36px; text-align: right; }

/* ===== Mobile ===== */
@media (max-width: 768px) {
  .sidebar {
    position: fixed; bottom: 0; left: 0; width: 100%; height: auto;
    flex-direction: row; border-top: 1px solid var(--border); border-right: none;
    background: color-mix(in oklch, var(--bg-primary) 85%, transparent);
    backdrop-filter: blur(12px); z-index: 100;
    padding: 6px 0 8px;
  }
  .sidebar-brand, .sidebar-storage, .sidebar-footer .sf-btn:last-child { display: none; }
  .sidebar-nav {
    display: flex; flex-direction: row; padding: 0 4px; overflow-x: auto;
    flex: 1;
  }
  .nav-item {
    flex-direction: column; gap: 2px; padding: 4px 10px; font-size: 0.65rem;
    white-space: nowrap; flex-shrink: 0; margin-bottom: 0;
  }
  .nav-svg { width: 20px; height: 20px; }
  .sidebar-footer { border-top: none; padding: 0 4px; }
  .sf-btn { width: 36px; height: 36px; }

  .content { padding-bottom: 60px; }
  .top-bar { padding: 10px 12px 8px; flex-wrap: wrap; gap: 8px; }
  .breadcrumb { order: 1; width: 100%; }
  .top-actions { order: 2; width: 100%; flex-wrap: wrap; }
  .search-input { width: 100%; }
  .search-input:focus { width: 100%; }
  .view-toggle { display: none; }

  .table-wrap { padding: 0 8px 4px; }
  .table-header .th-date, .table-row .td-date { display: none; }
  .table-header .th-size, .table-row .td-size { flex-basis: 70px; }

  .grid-wrap { grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; padding: 8px; }
  .grid-item { padding: 12px 6px 10px; }
  .gi-icon { font-size: 1.6rem; min-height: 36px; }
  .gi-name { font-size: 0.72rem; }
  .gi-meta { font-size: 0.62rem; }
}
</style>
