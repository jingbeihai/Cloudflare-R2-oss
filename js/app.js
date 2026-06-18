// ===== 文件类型判断 =====
function getFileType(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) return 'image';
  if (['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'].includes(ext)) return 'audio';
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)) return 'zip';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['js', 'ts', 'py', 'java', 'go', 'rs', 'c', 'cpp', 'html', 'css', 'json', 'xml', 'yaml', 'toml', 'sh', 'sql'].includes(ext)) return 'code';
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md', 'csv'].includes(ext)) return 'doc';
  return 'other';
}

function getFileEmoji(type) {
  const map = {
    image: '🖼️',
    video: '🎬',
    audio: '🎵',
    zip: '📦',
    pdf:  '📄',
    code: '💻',
    doc:  '📝',
    other: '📎',
  };
  return map[type] || '📎';
}

// ===== 格式化文件大小 =====
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return val.toFixed(i > 0 ? 1 : 0) + ' ' + units[i];
}

// ===== 格式化日期 =====
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now - d;
  const oneDay = 86400000;

  if (diff < oneDay && d.getDate() === now.getDate()) {
    return '今天 ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  if (diff < 2 * oneDay && d.getDate() === now.getDate() - 1) {
    return '昨天 ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ===== Toast 提示 =====
let toastTimer = null;

function showToast(msg, type) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.className = 'toast' + (type ? ' ' + type : '');
  // 强制回流
  void toast.offsetWidth;
  toast.classList.add('show');
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// ===== 上传文件 =====
async function uploadFile() {
  const input = document.getElementById('fileInput');
  const file = input.files[0];
  if (!file) return;

  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(file.name)}`, {
      method: 'PUT',
      body: file,
    });

    if (!res.ok) throw new Error('上传失败: ' + res.status);

    showToast('✅ ' + file.name + ' 上传成功', 'success');
    input.value = '';
    loadFiles();
  } catch (e) {
    showToast('❌ ' + e.message, 'error');
  }
}

// ===== 删除文件 =====
async function deleteFile(name) {
  if (!confirm(`确定要删除「${name}」吗？`)) return;

  try {
    const res = await fetch(`${API_BASE}/${name}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('删除失败: ' + res.status);

    showToast('🗑️ 已删除 ' + name, 'success');
    loadFiles();
  } catch (e) {
    showToast('❌ ' + e.message, 'error');
  }
}

// ===== 加载文件列表 =====
async function loadFiles() {
  const grid = document.getElementById('fileGrid');
  const loading = document.getElementById('loadingState');
  const empty = document.getElementById('emptyState');

  // 显示加载中
  grid.innerHTML = '';
  loading.style.display = 'block';
  empty.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE}/list`);
    if (!res.ok) throw new Error('获取列表失败: ' + res.status);

    const files = await res.json();
    loading.style.display = 'none';

    if (!files || files.length === 0) {
      empty.style.display = 'block';
      return;
    }

    // 过滤掉目录（以 / 结尾的 key）
    const items = files.filter(f => !f.name.endsWith('/'));

    if (items.length === 0) {
      empty.style.display = 'block';
      return;
    }

    grid.innerHTML = '';
    items.forEach(f => {
      const type = getFileType(f.name);
      const emoji = getFileEmoji(type);
      const div = document.createElement('div');
      div.className = 'card';

      div.innerHTML = `
        <div class="file-icon ${type}">${emoji}</div>
        <div class="name" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</div>
        <div class="meta">
          ${f.size != null ? `<span class="size">${formatSize(f.size)}</span>` : ''}
          ${f.uploaded ? `<span>${formatDate(f.uploaded)}</span>` : ''}
        </div>
        <div class="actions">
          <a class="download-btn" href="${API_BASE}/${encodeURIComponent(f.name)}" target="_blank">下载</a>
          <button class="delete-btn" onclick="deleteFile('${escapeJsString(f.name)}')">删除</button>
        </div>
      `;

      grid.appendChild(div);
    });
  } catch (e) {
    loading.style.display = 'none';
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:#999;">
        <div style="font-size:48px;margin-bottom:12px;">😵</div>
        <p>加载失败</p>
        <p style="font-size:13px;margin-top:4px;">${escapeHtml(e.message)}</p>
        <button onclick="loadFiles()" style="margin-top:16px;padding:8px 24px;border:2px solid #667eea;border-radius:8px;background:white;color:#667eea;cursor:pointer;font-size:14px;">重试</button>
      </div>
    `;
  }
}

// ===== 辅助函数 =====
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeJsString(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

// ===== 页面加载 =====
loadFiles();
