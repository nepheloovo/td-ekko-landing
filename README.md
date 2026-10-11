# True Damage Ekko — 概念落地页

用一次对 [synchronized.studio](https://synchronized.studio/) 的完整反推（见 [`../synchronized-studio-clone-prompt.md`](../synchronized-studio-clone-prompt.md)）得到的**设计与运动系统**，迁移到 **True Damage Ekko（skin 245019）** 上的粉丝概念落地页。

**A 档实现**：three.js 实时渲染本项目自己提取的 **GLB**（不是图片），外加**自写 GLSL 全屏着色器**做的 WebGL 背景舞台。

> ⚠️ **非商用 · 粉丝概念设计。** 艾克角色、皮肤名称、官方技能名、原画与游戏贴图版权归 **Riot Games**。本页不含官方 logo，不提供下载，代码仅供个人学习与视觉研究。详见文末许可。

---

## 运行

```bash
node -v                 # 需要 Node 18+（本机验证于 v24.21.0）
npm install
npm run dev             # http://127.0.0.1:5180
npm run build           # 产物在 dist/
```

`npm run build` 实测通过：`468 modules transformed`，`dist/` ≈ 20 MB（其中 13 MB 是三个 GLB）。

---

## 部署

产物是纯静态站点：`npm run build` → `dist/`。

代码侧已经为**子路径部署**做好两件事（GitHub Pages 项目站点把页面放在 `/<repo>/`，绝对路径 `/assets/...` 会 404）：

1. `vite.config.ts` 里 `base: './'` —— 同一份产物在 `/` 和 `/<repo>/` 下都能跑，不需要为部署重新构建；
2. 所有素材路径都过 `src/lib/asset.ts` 的 `asset()`，跟随 `import.meta.env.BASE_URL`。

> **已在子路径下实测**（把 `dist/` 挂到 `/td-ekko-landing/` 用静态服务器跑）：
> 页面 / JS / CSS / 两个拼贴层 / 三个 GLB / 卡片原画**全部 200**（唯一 404 是浏览器默认请求的 `favicon.ico`，已补 `public/favicon.svg`）；
> WebGL 舞台 `ok: true` 累计 755 帧、3D 模型 `5 parts / 12,820 triangles`、点卡换肤到 `8 parts / 25,900 triangles`、**控制台 0 error**。

### 路线 A · GitHub Pages

⚠️ **可见性约束（重要）**：GitHub **Free** 账号的 Pages **只能从公开仓库发布**；私有仓库要发 Pages 需要 **Pro/Team**，而且**即便仓库私有，Pages 站点的 URL 本身仍是公开可访问的**（私有的是代码，不是站点）。所以「不公开」和「用 Pages」在 Free 账号下不能同时满足。

已经放好 workflow：`.github/workflows/deploy-pages.yml`

1. `git push` 到 `main`
2. 仓库 **Settings → Pages → Source** 选 **GitHub Actions**（workflow 里带了 `enablement: true`，多数情况会自动切换）
3. 之后每次 push 自动重建，站点地址 `https://<user>.github.io/<repo>/`

### 路线 B · 仓库保持私有（不开 Pro）

本地看：

```bash
npm run dev        # http://127.0.0.1:5180
npm run build && npm run preview   # 预览生产产物
```

需要「在线可看但不想公开」时，用支持私有仓库 + 访问门禁的托管，构建命令 `npm run build`、输出目录 `dist`：

| 平台 | 私有仓库 | 访问保护 |
|---|---|---|
| Cloudflare Pages | ✅ | **Cloudflare Access**（邮箱 / SSO 门禁，免费额度够用）——最贴近你要的「私有在线预览」 |
| Vercel | ✅ | Deployment Protection（密码 / Vercel 账号门禁） |
| Netlify | ✅ | Password protection（付费档） |

### 关于素材与公开仓库

`public/assets/` 里是 Riot 的 GLB 模型、原画与游戏贴图（约 13 MB）。**把它们推进公开仓库 = 二次分发 Riot 素材**，与文末许可一节冲突；私有仓库则只是本地留存，没有这个问题。如果要公开发布，建议走上面的「替换素材」路线（用生成图/占位图替换 Riot 资产）而不是直接推。

---

## 页面结构（12 段）

```
WebGLBackdrop → LoaderScreen → HeaderMarquee → Navigation → HeroHeadline(切片大字)
→ EkkoStage(3D) → AbilitySection → SkinLineup → StatsSection → GetCta → Footer
→ TurntableOverlay + TracingCursorLayer
```

| 段 | 实现 |
|---|---|
| **WebGLBackdrop** | 真正的 WebGL2 全屏 pass：两张 4096×2048 拼贴层差速视差 + 指针径向扭转（`radius .28 / angle .35`）+ 动态颗粒 + 假点光 + 紫/品红分级 + 湿边暗角。每帧只写 uniform，不触发 React 渲染 |
| **LoaderScreen** | 计数器 0→100，两段字标左右滑入，结束后**从 DOM 卸载**（不是隐藏）；计数器状态留在自己的子树里，不会 60fps 重渲染整页 |
| **HeroHeadline** | 同一段四行文字叠 **4 份**，各用源站**逐字polygon** 切成斜带、每带行偏移不同 → 斜切错位大字 |
| **EkkoStage** | 真实 GLB + 三灯（品红主光 / 青光补光 / 金色轮廓）+ 指针倾斜（lerp）+ 拖拽惯性 + 滚动推镜 + 线框/自动旋转开关 |
| **SkinLineup** | 3 张卡，复用源站卡契约：`col-sm-7`、`≥1200px max-width:580px`、`bg-white` 纸片 `opacity .9679`、5:6 画幅、巨型序号 |
| **TracingCursor** | 固定全屏 `<svg>` 里的 `#drawing-polyline`，`#5BD6FF` / 2px / `fill:none`，指针划过就留痕 |
| **DistortedLink** | GSAP 驱动 `#filter-4` 的 `feTurbulence.baseFrequency` `.04→0 / .6s / rough ease`，下划线 `scaleX→0` |
| 其余 | marquee 双份 30s 无缝循环、smooth-scrollbar、`should-animate` + `data-preset` 逐元素入场、旋转星芒 |

---

## 实测验证结果（不是"应该能跑"）

用浏览器在同视口（1440×900）逐锚点核对：

| 项 | 结果 |
|---|---|
| 控制台 | **0 error / 0 WebGL warning**（含 GLB 热替换与覆盖层开关全程） |
| 背景舞台 | `state.ok = true`，累计渲染 720 → 1465 帧持续增长（静止即失败） |
| 3D 模型解析 | `5 PARTS · 12,820 TRIANGLES`，与工具包 `validate_glb.py` 的记录**完全一致** |
| 卡片热替换 GLB | 卡 2 → Breakout：`6 parts / 15,398 tris`；卡 3 → Arcane：`8 parts / 25,900 tris` —— 三个都与工具包记录逐项吻合 |
| 切片大字 | 4 条 `clip-path` 计算值与源站多边形逐字一致；行高修正为 1.0（源站实测值） |
| 轨迹线 | `points="500,320 760,420 980,380 1180,300"`，`stroke rgb(91,214,255)` ✓ |
| 卡片契约 | 3 张卡 width 580px、`sheet opacity 0.9679` ✓ |
| 顶部 marquee | 滚动后 opacity → 0 ✓ |
| loader | 完成后 DOM 中不存在 `.loader` ✓ |
| 移动端 390×844 | `scrollWidth 390 == innerWidth`，**零横向溢出**，nav 项按断点隐藏 |
| 构建 | `vite build` 成功 |

截图证据在 [`preview/`](preview/)（hero / 3D 舞台 / 皮肤阵容 / 数据 / 2 个转台换肤 / 移动端）。

---

## 与参照系统的差异（诚实记录）

| 项 | 参照系统 | 本页 | 原因 |
|---|---|---|---|
| 背景技术 | PixiJS 5 + pixi-filters/lights/display | **three.js + 自写 GLSL 全屏 pass** | 同为真 WebGL，少一层版本/私有 shader 风险 |
| 背景素材 | Contentful 拼贴图 | `scripts/build_backdrop.py` 用本地原画+贴图合成 | 不占用第三方资源，可复现（固定随机种子） |
| 3D 主视觉 | 无 | **真 GLB** | 本项目独有资产优势 |
| showreel 视频 | `/videos/reel-2.mp4` | **3D 转台覆盖层** | 无视频素材，不伪造 |
| 强调色 | `#deebc8` 鼠尾草绿 | `#EE61FF` 品红 + `#5BD6FF` 青 | 从 `splash_19.jpg` **像素采样**得到，非臆造 |
| 字体 | RL-Unno / Domaine Display Condensed / Founders Grotesk（试用） | Bodoni Moda + Noto Serif SC + Bebas Neue + Inter + Rajdhani + Space Mono | 全部 Google Fonts 实测 200，含中文字符集覆盖 |
| **字号微调（已记录）** | `.huge-text` 恒定 16vw | ≥1440px 降为 **13.5vw** | 源站 4 行 × 16vw 在 900px 高视口下放不下（源站自己也把末行切在折叠线下）；为保证整段字标首屏可读而下调 |
| 卡片标题字号 | 90px / `lh .8` | **3.4rem / `lh 1.02`** | 源站那套是给长拉丁标题调的；中文在 `.8` leading 下会字形相撞（实测 h 由 69 → 54 才暴露问题） |
| 数据大字 | `.display-1` 18vw | 拉丁行降到 **5.5vw** | `TRUE DAMAGE` 11 字符 × 18vw = 2850px，必然折行溢出 |

---

## 已知缺口（未做，不是漏做）

1. **GLB 无骨骼/无动画**：工具包已实测确认 CDragon 不托管 `.skl` / `.anm`，静态网格是这条路的上限。要动画需本地客户端 `Ekko.wad.client` + `lol2gltf`。
2. **官方中文技能名待核**：`Z 型驱动共振 / 时间卷曲器 / 平行收敛 / 相位俯冲 / 时空断裂` 按官方本地化写法录入，页面上也标了英文原名作为权威对照；公开发布前建议对客户端核一遍。技能描述文案是自写概念句，非 Riot tooltip 原文。
3. **`three.js` 未做代码分割**：主 chunk 890 KB（gzip 261 KB）。做法：`manualChunks` 把 `three` 拆出来 + 3D 区块 `React.lazy`。
4. **Arcane 原画缺图**：工作区里 `splash_57.jpg` 只有 13 KB 且**文件截断无法解码**（脚本已容错跳过），因此第三张卡改用工具包 `render_glb.py` 渲染的 GLB 预览图。

---

## 素材来源与许可

| 素材 | 来源 |
|---|---|
| `public/assets/ekko-*.glb` | 工作区 `ekko-truedamage/glb/`，由 `fetch_skin.py` + `lolmesh.py` 从 CommunityDragon 镜像的 Riot 随包资源提取、经 `validate_glb.py` 校验 |
| `splash-td.jpg` / `splash-breakout.jpg` | 同上工具包 `ref/`（LoL Wiki 原画） |
| `card-*.png` | 工具包 `render_glb.py` 自渲染的 GLB 预览 |
| `tex/*.png` | 同上工具包 `raw/`（游戏内 `_tx_cm` 贴图） |
| `bg-lower/upper.webp` | 由 `scripts/build_backdrop.py` 用上述素材合成 |

**许可边界**：代码可自由参考；**模型/原画/贴图不是开源资产，版权属 Riot Games**。按 Riot 粉丝内容政策：仅限个人学习、非商业用途；从客户端提取并二次分发模型有版权风险，**不可商用、不可放进商业发布的游戏上架**。本页页脚已写明非官方、非商用声明。

字体（Bodoni Moda / Bebas Neue / Inter / Rajdhani / Space Mono / Noto Serif SC / Noto Sans SC）均为 Google Fonts 开放字体，可商用。
