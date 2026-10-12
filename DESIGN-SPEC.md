# 迁移规格 · True Damage Ekko 概念落地页（LoL 版复刻 prompt）

> **这不是 synchronized.studio 的复刻，而是把它反推出的「设计与运动系统」迁移到一个新主体上。**
> 迁移原则：**保留系统语法，替换主体内容与美术方向**；凡是被替换的项都在下面标出 `[SWAP]`，凡是被保留的项标 `[KEEP]`。
> 参照基准：`../synchronized-studio-clone-prompt.md`（同一次反推的产物）。

---

## 0 · 授权与定位

- **性质**：粉丝概念设计页 / **非商用** / 个人学习与视觉研究。
- **IP**：艾克（Ekko）角色、皮肤名称、官方中文技能名、原画与游戏贴图版权归 **Riot Games**；本项目不含任何官方 logo，页脚必须写明 Riot IP 声明。
- **素材来源**：全部来自本机工作区 `ekko-truedamage/`（CommunityDragon 镜像的 Riot 随包资源 + 自己用 `render_glb.py` 渲染的 GLB 预览图），**不外链、不二次分发**。
- **不再使用的参照项**：synchronized.studio 的品牌名、文案、Contentful 图、试用字体 —— 全部不进入本页。

---

## 1 · 主体与叙事

| 项 | 值 |
|---|---|
| 主推产品 | **True Damage Ekko**（真实伤害 · 艾克），**skin 245019** |
| 发布时间 | 2019-11-10 |
| 系列 | 真实伤害（True Damage） |
| 页面语言 | 中文为主，英文术语/皮肤名保留原文 |
| 页面目标 | 皮肤概念宣发页：首屏 3D 立绘 → 世界观文案 → 技能 → 皮肤阵容 → 数据 → 获取 |

---

## 2 · 美术方向 `[SWAP]`（色调实测取自 `ref/splash_19.jpg`，非臆造）

原系统 = 纯黑场 `#000` + 鼠尾草绿单强调色。本页换成**采样自真实伤害原画的紫黑霓虹**：

| token | hex | 来源 / 用途 |
|---|---|---|
| `--field` | `#08060F` | 页面底色（原画最暗采样 `#100114`/`#120519` 再压暗） |
| `--field-2` | `#130A20` | 紫黑渐晕、section 之间的色场过渡 |
| `--violet-deep` | `#2A1B4A` | 卡片纸片、深紫面 |
| `--violet-mid` | `#5B3A9E` | 中间调、发梢紫 |
| `--neon-magenta` | `#EE61FF` | **主强调色**：标题描边、hover、CTA、太阳图标（原画 `#ee61ff` 实测） |
| `--neon-pink` | `#FB58FC` | 次级霓虹、光斑（原画 `#fb58fc` 实测） |
| `--neon-cyan` | `#5BD6FF` | **拖影主色**（替代原系统的 `#A3EC26`）、冷光、数据 |
| `--neon-gold` | `#EA981A` | 连帽衫内衬/球鞋金（原画 `#ea981a` 实测），用于页码与极少数高光 |
| `--hot-white` | `#FBFFF1` | 高光文字 |
| `#FFFFFF` / `#919191` | — | 主文字 / 次级文字 |

**注意**：原 prompt 的「无紫色」否定约束**在本页失效并被反转** —— 紫色是这款皮肤的母色。
新的否定约束：**不出现绿色系**（原系统的 `#A3EC26` / `#deebc8` 一律不得残留）。

---

## 3 · 字体 `[SWAP]`（全部实测 200，中文必须覆盖汉字）

| 原角色 | 原字体 | 本页字体 | 用途 |
|---|---|---|---|
| `Font-A` 高对比 display 衬线 | RL-Unno Trial | **Bodoni Moda** 900（拉丁）+ **Noto Serif SC** 900（中文） | 首屏级联大字 `TRUE / DAMAGE / EKKO` 与 `真实伤害` |
| `Font-B` 压缩展示字 | Domaine Display Condensed | **Bebas Neue** + **Noto Sans SC** 700 | section 大标题、nav、marquee |
| `Font-C` 正文 grotesque | Founders Grotesk | **Inter** + **Noto Sans SC** | 正文、UI |
| `Font-E` 轻量数字 | Founders Grotesk Light | **Rajdhani** 400/600 | loader 计数器、数据数字 |
| 新增技术标签字 | — | **Space Mono** | 皮肤 ID / 版本号 / 图注 |

```html
family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900
family=Bebas+Neue
family=Inter:wght@300;400;500;700
family=Rajdhani:wght@400;600;700
family=Space+Mono:wght@400;700
family=Noto+Serif+SC:wght@400;700;900
family=Noto+Sans+SC:wght@300;400;700;900
```
`[KEEP]` rem 基准切换与整体字号阶梯：`html{font-size:16px}`，`@media(min-width:1200px){20px}`；
`.huge-text` 20vw→16vw；`.big-text` 16vw→12vw；`.display-1` 18vw。

---

## 4 · 保留的系统语法 `[KEEP]`

1. **固定全屏 WebGL 背景舞台**：两张预合成拼贴层差速视差 + 鼠标径向扭转 + 颗粒 + 假点光，全屏 `position:fixed`。
2. ~~**clip-path 斜切切片大标题**~~ **已移除**（见 §6 差异表）：该设备为参照站的长 Latin 词调参，用在本页 4–6 字的短行上会切碎字母。现为单次渲染的级联大字（缩进阶梯 + 逐行颜色 + 发丝线 + 星芒保留）。
3. **开场加载器**：计数器 0→100 + 两段字标，结束后 `#loader` 从 DOM 移除。
4. **鼠标拖影**：原先照搬了参照站的 `#drawing-polyline` 连线；现已**主动偏离**为 Canvas 2D 粒子拖影（时间碎片），保留「指针驱动的全屏上层动效」这一槽位与 z-index 120。详见 README 差异表。
5. **distorted-link 液态 hover**：GSAP 驱动 `#filter-4` 的 `feTurbulence.baseFrequency`（`.04→0`，`.6s`，rough ease）+ 下划线 `scaleX→0`。
6. **marquee 双份无缝循环**：`.marquee-1` / `.marquee-2` 各一份，30s linear，`animation-delay:-15s / 0s`。
7. **smooth-scrollbar** 接管滚动，`html{overflow:hidden}`，禁止出现原生滚动条。
8. **`should-animate` + `data-preset` 逐元素入场**（`data-delay` / `data-dur` / `data-fromy` / `data-fromrotation`）。
9. **`<TracingCursorLayer/>`、`MarqueeLoop`、`DistortedLink`、`ScrollRevealWaypoint`、`OpeningSequence`** 五个具名契约按名复用。

---

## 4b · 新增的滚动演出 `[ADD]`（参照系统里没有，属于本页主体的叙事动作）

参照系统的运动语法只到「逐元素进入视口淡入」为止，没有跨 section 的镜头语言。下面四段是**新加**的，
每一段都对准本页主体：一个把四秒倒带当武器的少年、一份倒着走的技能表、三套要对比着看的皮肤。

| 段 | 触发 | 动作 | 依据 |
|---|---|---|---|
| **加载退场** | loader 计数到 100（`onFinished`） | 13rem 表盘 + 三根指针**逆时针**退（hour −220° / minute −540° / second −900°），中心数字 `100→000`；随后品红/青两带从左扫入、从右撤出（1.75s）。`#archive` 在 `onFinished` 时才挂载，四行标题要等扫屏**走完**才动 | 「倒带四秒」是 R 技能母题：退场不该是淡出，而是把时间倒着走一遍 |
| **展台 → 技能区** | `#abilities` 到视口 62% 处，`once` | ①**色差**：背景全屏 shader 逐通道 UV 偏移（`uChroma` 峰值 0.08）+ 文案品红/青通道分离（峰值 0.28em）；②**雪花**：150 片六芒冰晶；③ 两者走完后 `.circle-text` 环字才转入并无限续转 | 技能区是"时间被拆开"的一段；色差与雪花都只发生一次，之后交回给一个稳定的旋转环字 |
| **技能区 → 皮肤列表** | `#lineup` 到视口 78%→26%，scrub（可逆） | `clip-path: circle()` 圆心 = 顶部光芒圆盘的实测中心，半径 0→42% 线性推进，走完后直接置 `none` | 用户指定：**圆盘就是遮罩的起点**；所以圆心是量的、不是写死的 |
| **切模型** | 任意 `glb` 变化（点卡 / 转台内换肤） | 旧模型留在场景里淡出、新模型从 0 淡入，0.72s | 三套皮肤是同一角色的三个状态：换肤该是"溶解"而不是"换张图" |

三条实现约定（都是踩过的坑，写在这里避免回退）：

1. **ScrollTrigger 必须挂在 smooth-scrollbar 上**（`scrollerProxy` + `defaults({scroller})`）。这个页面从不滚动
   window（`html{overflow:hidden}` + 内容 transform），不代理的话每个 trigger 的 start/end 都算在一个永远不动的
   viewport 上，一个都不会触发 —— 而且要盖住"作者忘了传 `scroller`"这类静默失效，所以走 `ScrollTrigger.defaults()`。
2. **无限循环的 tween 不能放进会被 `onComplete` 依赖的 timeline**：`repeat:-1` 的子 tween 会让父 timeline 永不完成，
   父级的 `onComplete` 静默失效。环字的无限续转因此挂在前一段 tween 的 `onComplete` 上，而不是塞进同一条 timeline。
3. **动画初值由 GSAP 写、不写进 CSS**：环字的 `opacity:0 / scale:.86 / rotation:-24°` 与遮罩的 `clip-path` 都是
   JS 里 `gsap.set` 的，所以 GSAP 万一没跑、或 `prefers-reduced-motion` 命中，页面只是**静止**而不会**消失**。

---

## 5 · 章节顺序（12 段）

```
WebGLBackdrop → LoaderScreen → HeaderMarquee → Navigation → HeroHeadline(SlicedStack)
→ HeroContentColumn → EkkoStage(3D) → AbilitySection → SkinLineup → StatsSection
→ CtaSection → PageFooter → TracingCursorLayer → SvgFilterDefs
```

### 逐段要点

| # | Section | 关键设计 |
|---|---|---|
| 1 | WebGLBackdrop | `bg-lower.webp` + `bg-upper.webp`（4096×2048，本仓库脚本生成，均值 `rgb(15,13,21)`/`rgb(12,10,17)`）双纹理；视差系数 `0.03`；指针径向扭转 `radius .28 / angle .35`；颗粒 + 湿边暗角 + 紫青分级 |
| 2 | LoaderScreen | 计数器 `0→100`（Rajdhani 3.8rem）；字标两段 `真实伤害` / `TRUE DAMAGE`；`.display-progress{left:85vw}` |
| 3 | HeaderMarquee | `TRUE DAMAGE EKKO ✦ 245019 ✦` 重复 40× 两份；fixed top；滚过 200px 淡出 |
| 4 | Navigation | 左：`EKKO` 字标 + `真实伤害 / TRUE DAMAGE`；右：皮肤档案 / 技能 / 皮肤阵容 / 数据 / 获取；ARCHIVE 位改为 `245019` |
| 5 | HeroHeadline | 四行级联栈：`真实伤害` / `TRUE` / `DAMAGE` / `EKKO`；逐行缩进 1.05em→2.5em、逐行颜色由白到淡紫；三条发丝线交叉；切片设备已移除（字母对齐） |
| 6 | HeroContentColumn | 中文简介 + `播放皮肤预览`（打开 3D 转台覆盖层）；`.content-box` 绝对定位 23%/29%/43%，≥1200px 15% |
| 7 | EkkoStage | three.js 渲染 `ekko-td.glb`（3.5 MB，5 部件 / 12,820 三角面）；三灯（品红主光 / 青光补光 / 金色轮廓）；指针视差倾斜 lerp .06；滚动 dolly；拖拽旋转；阵容卡点击 **热替换 GLB** |
| 8 | AbilitySection | 被动 + Q/W/E/R 五行，Font-B 大写 + 官方中文技能名；`<i>` 斜体英文原名；hover 行高亮品红；`<b>` 金色下划线 |
| 9 | SkinLineup | 3 张卡（复刻 case-card 契约）：245019 / 245056 / 245057，各含序号、中英名、发布日、网格与三角面数、`查看模型`；`col-sm-7` + `≥1200px max-width:580px` + `bg-white/0.9679` 纸片 |
| 10 | StatsSection | 真实数据：皮肤 ID 245019 · 12,820 三角面 · 5 部件 · 2 贴图 · 2019-11-10；大字 `数据 / 与 / 规格` 三行 + `and` 椭圆，`display-1` #919191 |
| 11 | CtaSection | `不要犹豫 / 去 / 看 真 实 伤 害` 三行大字 + `download` 邮件位改为官方皮肤页外链（标注非官方） |
| 12 | PageFooter | 社交/官方链接 + `© Riot Games · 粉丝概念页 · 非商用` + 底部 `WATCH SHOWREEL/` 改为 `TRUE DAMAGE /` marquee |

---

## 6 · 与参照系统的差异（诚实记录）

| 项 | 参照系统 | 本页 | 原因 |
|---|---|---|---|
| 背景拼贴层 | 2 张 Contentful 拼贴图 | 本仓库脚本用本地原画+贴图合成 | 不占用第三方资源 |
| 背景技术 | PixiJS 5 + pixi-filters/lights/display | **three.js + 自写 GLSL 全屏 pass** | 同等 WebGL 能力，少一层版本风险；仍是真 WebGL，非 CSS 近似 |
| 3D 主视觉 | 无（纯 2D 图层） | **真 GLB 模型（three.js）** | 本项目独有资产优势 |
| showreel 视频 | `/videos/reel-2.mp4` | **3D 转台覆盖层**（无视频素材） | 不伪造视频；转台同样能展示皮肤 |
| 强调色 | `#deebc8` 鼠尾草绿 | `#EE61FF` 品红 + `#5BD6FF` 青 | 原画实测 |
| 字体 | 4 个商业试用字 | 7 个 Google Fonts（含中文覆盖） | 可加载、可商用 |
