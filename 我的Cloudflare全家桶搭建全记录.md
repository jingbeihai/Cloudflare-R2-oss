# 我的 Cloudflare 全家桶搭建全记录

> 从零开始搭建个人主页、博客、网盘的完整历程与技术选型分析
> 2026年6月

---

## 一、最终架构总览

```
用户访问
    │
    ▼
Cloudflare DNS（域名解析 7988798.xyz）
    │
    ├── 7988798.xyz → Cloudflare Pages（主页源码）
    │                     ↓
    │               Caddy反代（腾讯云国内服务器）
    │
    ├── blog.7988798.xyz → Cloudflare Pages（博客源码）
    │                        ↓
    │                  Caddy反代（腾讯云国内服务器）
    │
    ├── drive.7988798.xyz → Cloudflare Pages Functions + R2（网盘）
    │                        ↓
    │                  Caddy反代（腾讯云国内服务器）
    │
```

---

## 二、完整搭建步骤

### 1. 注册与基础设施

#### 注册 Cloudflare
- 访问 https://dash.cloudflare.com 注册账号
- 添加域名 `7988798.xyz`
- 修改域名的 NS 记录指向 Cloudflare 分配的 DNS 服务器
- 等待 DNS 生效（通常几分钟到几小时）

#### 注册 GitHub
- 访问 https://github.com 注册账号（用户名: jingbeihai）
- 创建 Personal Access Token（用于代码推送）
  - 路径: Settings → Developer settings → Personal access tokens → Fine-grained tokens
  - 权限: Contents (Read and Write)

#### 开通 Cloudflare R2
- Cloudflare Dashboard → R2 → 创建存储桶
- 创建 API 令牌（Access Key + Secret Key）
- 配置 CORS 策略允许跨域访问

#### 购买腾讯云服务器（解决国内访问问题）
- 腾讯云 38元/年 轻量服务器（新用户秒杀价）
- 系统: Ubuntu
- 安装 1Panel 面板
- 安装 Caddy Docker（用于反向代理）

---

### 2. 个人主页搭建

#### GitHub 仓库
- 仓库名: `jingbeihai/homepage`
- 文件: `index.html`（纯静态页面）

#### Cloudflare Pages 部署
- Workers & Pages → 创建 → Pages → 连接到 Git
- 选择 `jingbeihai/homepage` 仓库
- 构建设置: 框架预设 = "无"，输出目录 = `/`
- 绑定自定义域名 `7988798.xyz`

---

### 3. 博客搭建

#### GitHub 仓库
- 仓库名: `jingbeihai/myblog`（假设）
- 静态博客框架或纯 HTML

#### Cloudflare Pages 部署
- 同样连接 Git 部署
- 绑定自定义域名 `blog.7988798.xyz`

---

### 4. 网盘搭建（最终方案：Cloudflare-R2-oss）

#### GitHub 仓库
- 仓库名: `jingbeihai/Cloudflare-R2-oss`
- 来源: Fork 自 `ljxi/Cloudflare-R2-oss`
- 包含: 前端页面 + Pages Functions（Worker API）

#### Cloudflare Pages 部署
- 连接 Git 仓库
- 设置环境变量:
  - `PUBURL` = R2 存储桶公共 URL
  - `admin:密码` = `*`（管理员权限）
- 绑定 R2 存储桶（变量名: `BUCKET`）
- 修复 `@/` 路径别名问题（改成相对路径）

#### Worker API 功能（由 Pages Functions 提供）
- `GET /api/children/` → 列出文件
- `PUT /api/write/items/*` → 上传/复制文件
- `DELETE /api/write/items/*` → 删除文件
- `GET /raw/*` → 下载文件

---

### 5. Caddy 反向代理（解决国内访问慢）

#### 安装 Caddy
- 通过 1Panel 应用商店安装 Caddy Docker
- 配置文件路径: `/opt/1panel/apps/caddy/caddy/data/config.json`

#### 配置内容
```json
{
  "apps": {
    "http": {
      "servers": {
        "srv0": {
          "listen": [":80"],
          "routes": [
            {
              "handle": [{
                "handler": "subroute",
                "routes": [{
                  "handle": [{
                    "handler": "reverse_proxy",
                    "upstreams": [{"dial": "cloudflare-r2-oss-3ap.pages.dev:443"}]
                  }],
                  "match": [{"host": ["drive.7988798.xyz"]}]
                }]
              }]
            },
            {
              "handle": [{
                "handler": "subroute",
                "routes": [{
                  "handle": [{
                    "handler": "reverse_proxy",
                    "upstreams": [{"dial": "homepage-6wv.pages.dev:443"}]
                  }],
                  "match": [{"host": ["7988798.xyz"]}]
                }]
              }]
            },
            {
              "handle": [{
                "handler": "subroute",
                "routes": [{
                  "handle": [{
                    "handler": "reverse_proxy",
                    "upstreams": [{"dial": "myblog-eev.pages.dev:443"}]
                  }],
                  "match": [{"host": ["blog.7988798.xyz"]}]
                }]
              }]
            }
          ]
        }
      }
    }
  }
}
```

---

## 三、各方案优缺点分析

### 方案对比：网盘前端

| 方案 | 优点 | 缺点 |
|---|---|---|
| **方案A：自写 Worker + 简陋前端**（最初的） | 简单直接，代码少 | 界面丑、不支持中文文件名、没有文件夹 |
| **方案B：R2 Web**（r2.viki.moe） | 界面现代美观，支持中文/深色模式，PWA，文件预览功能强 | 纯前端直连 R2，凭证存浏览器，分享给别人要填凭证，无法外部分享，限制 300MB |
| **方案C：Cloudflare-R2-oss**（最终采用） | 有 Worker 后端，有用户认证，支持分享链接，可直接在线预览，创建文件夹、重命名、移动都有 | 初始界面略丑（已美化），部署需要配置环境变量 |
| **方案D：R2-Explorer** | Google Drive 风格，分享链接带密码/过期时间，功能最强 | 界面老气，不支持中文，部署复杂 |
| **方案E：FlareDrive-666** | 中文界面，多用户权限，部署简单 | 项目 `@/` 路径别名问题导致部署失败，环境变量配置繁琐 |

### 方案对比：国内加速

| 方案 | 优点 | 缺点 |
|---|---|---|
| **直连 Cloudflare Pages**（初始） | 零成本，无需服务器 | 国内被墙/限速，必须 VPN |
| **Cloudflare 中国网络** | 官方合作节点，速度快 | $200+/月，需要 ICP 备案，个人承受不起 |
| **国内 CDN 反代** | 速度快 | 需要额外配置，域名需要备案 |
| **Nginx 反向代理**（尝试过） | 稳定成熟 | 配置 HTTPS 麻烦，端口冲突处理繁琐 |
| **Caddy 反向代理**（最终采用） | 配置极简（JSON 几行），自动 HTTPS，Docker 一键部署 | 不如 Nginx 生态丰富，但够用 |

---

## 四、为什么最终选择 Cloudflare 全家桶 + Caddy

### 选择 Cloudflare 的原因

| 原因 | 说明 |
|---|---|
| **完全免费** | Pages、R2（10GB）、Workers、DNS 都免费 |
| **无需服务器维护** | 博客和网盘的前端托管在 Pages，不用操心操作系统 |
| **全球 CDN** | 海外访问速度极快（虽然国内需要额外处理） |
| **全家桶整合** | DNS + 托管 + 存储 + 隧道在一个平台管理 |
| **R2 免流量费** | 只收存储费，不收入站/出站流量，网盘最合适 |
| **Pages Functions** | 前端和后端（Worker）在同一个项目里，部署简单 |

### 选择 Caddy 的原因

| 原因 | 说明 |
|---|---|
| **解决国内访问** | Cloudflare Pages 源站在海外，国内需要国内服务器中转 |
| **配置极简** | 三条 `reverse_proxy` 规则搞定主页+博客+网盘，不用写几十行 Nginx 配置 |
| **自动 HTTPS** | Caddy 自动申请和续期 SSL 证书 |
| **Docker 部署** | 1Panel 应用商店一键安装，不污染宿主机 |
| **正好有腾讯云服务器** | 38元/年，低成本解决国内访问问题 |

### 为什么不选传统方案

| 传统方案 | 不选的理由 |
|---|---|
| **阿里云/腾讯云直接建站** | 要备案、要维护服务器、要配置数据库，比 Pages 麻烦 |
| **Oracle Cloud 免费服务器** | 注册风控极严，反复失败，账号不稳定 |
| **Azure 免费层** | 1核1G 配置太低，跑不动应用 |
| **仅用 Cloudflare 直连** | 国内访问需要 VPN |
| **仅用腾讯云服务器** | 续费贵（200元/年），且相比 Pages 需要更多运维工作 |

---

## 五、最终结论

**Cloudflare 全家桶 + 腾讯云服务器做 Caddy 反代** 是目前的最优解：

- **免费的部分：** 主页、博客、网盘静态资源、DNS → 完全免费
- **花钱的部分：** 腾讯云服务器 38~99元/年（用来做国内反代）
- **数据安全：** R2 存储，数据在自己手里
- **不锁死：** 以后想换到其他平台，只需要改 DNS 记录

这套架构对于**个人使用完全够用**，而且所有服务都在一个 Cloudflare 账号下管理，非常省心。
