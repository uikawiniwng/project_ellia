# Dialog Beauty

本文档用于快速理解 `src/dialog_beauty/` 的目录结构、运行链路，以及每个组件/模块的用途。

## 目录结构图

```text
src/dialog_beauty/
├── index.html                         # HTML 宿主页面；提供 #app 挂载点与默认字体配置
├── index.ts                           # Vue 入口；创建并挂载 App，pagehide 时卸载实例
├── App.vue                            # 主装配层；读取消息、解析 <ellia>、渲染卡片、管理动画与设置同步
├── components/
│   ├── DialogBeautySettingsPanel.vue  # 设置面板；技能、型态、故事风格、字体、动画、打字速度
│   └── DialogBeautyTicketCard.vue     # 设置首页的票券卡视觉组件
├── constants.ts                       # 常量中心；选项、标签、变量路径、事件名、节奏参数
├── parser.ts                          # 消息解析；定位当前 iframe 对应的 <ellia> 块并转成卡片数据
├── settings.ts                        # 设置读写；默认值、兼容归一化、全局/聊天/消息变量同步
├── story-tone.ts                      # 自定义故事风格；FP 扣费、输入框写入、Request/Reminder 标记生成
├── typewriter.ts                      # 打字机动画；拆字、分词、按节奏创建 GSAP timeline
├── types.ts                           # 类型定义；卡片、设置、节奏、票券分区等共享类型
└── STRUCTURE.md
```

## 运行链路

```text
index.html
  ↓ 提供 #app
index.ts
  ↓ createApp(App).use(createPinia()).mount('#app')
App.vue
  ↓ readPersistedSettings()
settings.ts
  ↓ getChatMessages(getCurrentMessageId())[0].message
parser.ts
  ↓ parseCurrentElliaBlock()
App.vue cards
  ↓ renderStaticText() / buildTypewriterTimeline()
typewriter.ts
  ↓ 用户打开设置
DialogBeautySettingsPanel.vue
  ↓ 选择票券分区
DialogBeautyTicketCard.vue
  ↓ emit 设置事件
App.vue
  ↓ persistUiSettings() / persistStorySettings() / syncFormTypeToMessageVariables()
settings.ts
```

核心数据流可以理解为：

1. 从 SillyTavern 当前消息读取原文。
2. `parser.ts` 跳过 thinking 内容，提取当前 iframe 对应的 `<ellia>` 块。
3. `App.vue` 将解析结果变成 `cards`，并把每张卡渲染成对话展示卡。
4. `typewriter.ts` 控制文本静态渲染或 GSAP 打字机播放。
5. 设置面板通过 emit 把用户选择交回 `App.vue`。
6. `settings.ts` 把 UI 设置保存到全局变量，把故事设置保存到聊天变量，必要时同步型态到最新消息变量。

## 入口文件

### `index.html`

用途：

- 作为 Dialog Beauty 的 HTML 宿主。
- 提供 `<div id="app"></div>` 给 Vue 挂载。
- 在 `<body data-ellia-font="A">` 上提供默认字体模式。
- 通过 meta 记录版本号和构建标记。

关联点：

- `settings.ts` 的 `getConfiguredFontMode()` 会读取 `document.body.dataset.elliaFont`。
- 字体模式支持 `A` 到 `E`，对应实际字体在 `App.vue` 样式中定义。

### `index.ts`

用途：

- 使用 Vue 创建 `App` 实例。
- 注入 Pinia。
- 挂载到 `#app`。
- 在 `pagehide` 时主动卸载，避免 iframe 或页面切换后残留实例。

主要逻辑：

```ts
$(() => {
  const app = createApp(App).use(createPinia());
  app.mount('#app');
  $(window).on('pagehide', () => app.unmount());
});
```

依赖外部环境：

- `$`：jQuery。
- `createPinia()`：由构建/运行环境提供或全局可用。

## Vue 组件

### `App.vue`

定位：

- Dialog Beauty 的主容器和状态装配层。
- 负责把 SillyTavern 消息解析结果、设置状态、动画状态和 UI 组件串起来。

主要职责：

- 读取持久化设置：
  - `readPersistedSettings()`。
  - 如果最新消息变量中存在型态状态，则覆盖聊天设置里的 `formType`。
- 解析当前消息：
  - `getChatMessages(getCurrentMessageId())[0]?.message` 读取当前消息。
  - `getCurrentElliaBlockIndex(message)` 判断当前 iframe 对应第几个 `<ellia>` 块。
  - `parseCurrentElliaBlock(message, blockIndex)` 生成 `ElliaCard`。
- 渲染卡片：
  - 展示艾莉亚名称、调试标签、对话/动作行。
  - 使用 `renderStaticText()` 先渲染静态文本，保证禁用动画或动画未启动时可读。
- 管理打字机：
  - `startAnimation()` 创建 GSAP timeline。
  - `stopAnimation()` 中断动画并回到静态文本。
  - `replayCard()` 强制重播。
  - `IntersectionObserver` 检测卡片是否离屏，离屏时停止动画。
- 管理设置面板：
  - `toggleSettings()` / `closeSettingsPanel()`。
  - 接收 `DialogBeautySettingsPanel.vue` 的事件并修改设置。
- 持久化设置：
  - watch `uiSettings`，保存到全局变量。
  - watch `storySettings`，保存到聊天变量。
- 响应外部同步：
  - 监听 `SETTINGS_SYNC_EVENT`。
  - 重新读取全局/聊天/消息变量。

主要状态：

| 状态 | 类型 | 用途 |
| --- | --- | --- |
| `cards` | `ElliaCard[]` | 当前消息内可渲染的艾莉亚卡片，目前实际只渲染当前 iframe 对应的一张。 |
| `uiSettings` | `DialogBeautyUiSettings` | 字体、环境动画、打字速度。 |
| `storySettings` | `DialogBeautyStorySettings` | 型态、技能1/2/3、故事风格、自定义故事风格。 |
| `activeSettingsCardId` | `string \| null` | 当前打开设置面板的卡片 ID。 |
| `activeSettingsSection` | `SettingsSectionKey` | 设置面板当前分区。 |
| `contentRefs` | `Map<string, HTMLElement>` | 卡片内容 DOM，用于静态渲染和打字机拆字。 |
| `cardRefs` | `Map<string, HTMLElement>` | 卡片容器 DOM，用于可见性监听。 |
| `timelineMap` | `Map<string, gsap.core.Timeline>` | 每张卡对应的打字机动画 timeline。 |

对外部环境的依赖：

- SillyTavern 辅助函数：`getChatMessages`、`getCurrentMessageId`、`eventOn`、`errorCatched`。
- 浏览器 API：`IntersectionObserver`。
- GSAP：动画 timeline。

### `components/DialogBeautySettingsPanel.vue`

定位：

- 设置面板组件。
- 只负责展示、分区切换和 emit 用户选择；实际状态修改由 `App.vue` 处理。

面板视图：

| 视图 | 说明 |
| --- | --- |
| `home` | 首页，显示四张票券入口。 |
| `detail` | 详情页，展示当前分区的设置项和状态摘要。 |

四个设置分区：

| 分区 key | 名称 | 功能 |
| --- | --- | --- |
| `skill1` | 第一个技能组 | 切换 `storySettings.skill1`。 |
| `skill2` | 第二个技能组 | 切换 `storySettings.skill2`。 |
| `world` | 世界设置 | 切换型态、技能3、故事风格、自定义故事风格。 |
| `beauty` | 展示设置 | 切换字体、环境动画、打字速度。 |

接收的 props：

| prop | 用途 |
| --- | --- |
| `uiSettings` | 当前 UI 设置。 |
| `storySettings` | 当前故事设置。 |
| `activeSection` | 当前设置分区。 |
| `isStoryStyleDiyOpen` | 自定义故事风格输入区是否展开。 |
| `storyStyleDiyDraft` | 自定义故事风格草稿。 |
| `storyStyleDiyStatus` | 自定义故事风格操作反馈。 |

主要 emit：

| 事件 | 用途 |
| --- | --- |
| `close` | 关闭设置面板。 |
| `select-section` | 切换设置分区。 |
| `set-font-mode` | 修改字体模式。 |
| `set-form-type` | 修改艾莉亚型态。 |
| `set-skill` | 修改技能1/2/3。 |
| `set-story-style` | 修改故事风格。 |
| `open-story-style-diy` | 展开自定义故事风格输入区。 |
| `close-story-style-diy` | 关闭自定义故事风格输入区。 |
| `request-story-style-suggestion` | 将故事风格优化请求写入输入框。 |
| `save-story-style-diy` | 扣除 FP 并保存自定义故事风格。 |
| `update:story-style-diy-draft` | 更新自定义故事风格草稿。 |
| `set-animation-enabled` | 开关环境动画。 |
| `set-typewriter-speed` | 修改打字速度。 |

内部辅助函数：

| 函数 | 用途 |
| --- | --- |
| `currentSection` | 根据 `activeSection` 找到分区元信息。 |
| `currentStatus` | 生成当前分区的人类可读状态摘要。 |
| `getSkillLabel()` | 把技能模式值转成显示标签。 |
| `getFormTypeLabel()` | 把型态值转成显示标签。 |
| `getFontModeLabel()` | 把字体值转成显示标签。 |
| `getTypewriterSpeedLabel()` | 把打字速度值转成显示标签。 |
| `getStoryStyleLabel()` | 把故事风格值转成显示标签，兼容自定义与世界决定。 |
| `openSection()` | 切到详情页并通知父组件更新分区。 |

### `components/DialogBeautyTicketCard.vue`

定位：

- 设置首页的单张票券卡。
- 纯展示组件，不直接修改任何设置。

接收的 props：

| prop | 用途 |
| --- | --- |
| `eyebrow` | 顶部小标题，例如“水晶球”“塔罗牌”。 |
| `variant` | 控制视觉变体：`skill1`、`skill2`、`world`、`beauty`。 |
| `title` | 中文标题。 |
| `subtitle` | 英文副标题。 |
| `summary` | 简短说明。 |
| `active` | 是否显示激活态。 |

视觉变体：

| variant | 视觉主题 | 对应分区 |
| --- | --- | --- |
| `skill1` | 水晶球/星轨 | 技能1。 |
| `skill2` | 塔罗牌符号 | 技能2。 |
| `world` | 花占卜符号 | 型态、技能3、故事风格。 |
| `beauty` | 碟仙/三角仪式符号 | 字体、动画、打字速度。 |

使用方式：

- 由 `DialogBeautySettingsPanel.vue` 在 `settingsSections` 循环中创建。
- 外层按钮负责点击行为，票券卡本身只负责图形和文案。

## 工具模块

### `constants.ts`

定位：

- 所有共享常量、选项和显示文案的集中维护点。

主要内容：

| 常量/数据 | 用途 |
| --- | --- |
| `BASE_RHYTHM` | 打字机基础节奏参数。 |
| `PHRASE_PATTERNS` | 特殊语气短语识别，如“嗯哼？”、“诶嘿”、“啊……”。 |
| `FONT_MODES` | 字体模式白名单。 |
| `FORM_TYPES` | 型态模式白名单。 |
| `SKILL_MODES` | 技能模式白名单。 |
| `STORY_STYLE_MODES` | 故事风格模式白名单。 |
| `TYPEWRITER_SPEEDS` | 打字速度白名单。 |
| `GLOBAL_SETTINGS_PATH` | 全局变量里的 UI 设置路径：`dialog_beauty.ui`。 |
| `CHAT_SETTINGS_PATH` | 聊天变量里的故事设置路径：`dialog_beauty.story`。 |
| `SETTINGS_SYNC_EVENT` | 外部设置同步事件名。 |
| `STORY_TONE_COST` | 保存自定义故事风格需要消耗的 FP。 |
| `ROTE_REQUEST_HEADER` | 请求生成/优化故事风格时写入输入框的标记头。 |
| `ROTE_REMINDER_HEADER` | 保存自定义故事风格后写入输入框的提醒标记头。 |
| `FP_PATH_CANDIDATES` | 在消息变量中查找 FP 的候选路径。 |
| `fontOptions` | 字体设置按钮数据。 |
| `formTypeOptions` | 型态设置按钮数据。 |
| `skillOptionGroups` | 技能1/2/3 的按钮数据。 |
| `blueStoryStyleOptions` | 预设故事风格按钮数据。 |
| `typewriterSpeedOptions` | 打字速度按钮数据。 |
| `elliaFormLabels` | 型态值到中文标签的映射。 |
| `elliaFormStatusPath` | 最新消息变量中记录艾莉亚型态的位置。 |
| `settingsSections` | 设置首页四张票券的元信息。 |

修改建议：

- 新增选项时，优先在这里扩展白名单和按钮数据。
- 如果新增设置分区，也应先扩展 `SettingsSectionKey` 与 `settingsSections`。

### `types.ts`

定位：

- 共享类型定义。
- 保持 Vue 组件和工具模块之间的数据结构一致。

主要类型：

| 类型 | 用途 |
| --- | --- |
| `ParsedLine` | 解析后的单行文本，区分 `dialogue` 和 `action`。 |
| `ElliaCard` | 一张艾莉亚展示卡的完整状态。 |
| `TokenKind` | 打字机分词类型。 |
| `FontMode` | 字体模式。 |
| `FormType` | 型态模式。 |
| `SkillMode` | 技能模式。 |
| `StoryStyleMode` | 故事风格模式。 |
| `TypewriterSpeed` | 打字速度。 |
| `StorySkillKey` | 可用 `set-skill` 修改的技能 key。 |
| `SettingsSectionKey` | 设置面板分区 key。 |
| `LineToken` | 打字机分词结果。 |
| `PreparedChar` | 拆字后字符与 DOM span 的绑定。 |
| `PreparedLine` | 拆字后的行。 |
| `RevealOptions` | 单字符动画参数。 |
| `ElliaInstanceRegistryEntry` | iframe 与 `<ellia>` 块索引的分配缓存。 |
| `DialogBeautyUiSettings` | UI 设置结构。 |
| `DialogBeautyStorySettings` | 故事设置结构。 |
| `SettingsSectionMeta` | 设置票券分区元信息。 |
| `RhythmProfile` | 打字机节奏配置。 |

### `parser.ts`

定位：

- 负责把当前 SillyTavern 消息中的 `<ellia>` 内容解析成 `ElliaCard`。
- 解决同一条消息中多个 `<ellia>` iframe 时的索引匹配问题。

主要函数：

| 函数 | 用途 |
| --- | --- |
| `stripThinkingContent(message)` | 去掉最后一个 `</thinking>` 或 `</think>` 之前的内容，只解析可见消息。 |
| `parseLines(rawText)` | 从文本中提取 `「对话」` 和 `(动作)`；如果没有匹配，则按换行回退解析。 |
| `createElliaCard(attrText, rawBody, index)` | 从 `<ellia>` 属性和正文创建 `ElliaCard`。支持 `name="..."`。 |
| `getCurrentElliaBlockIndex(message)` | 根据当前 iframe 名称、消息 ID 和父页面中实际 iframe 列表，决定当前实例对应第几个 `<ellia>` 块。 |
| `parseCurrentElliaBlock(message, blockIndex)` | 解析指定索引的 `<ellia>` 块。 |

内部机制：

- 在 `window.parent.__ELLIA_INSTANCE_REGISTRY__` 保存每条消息的分配记录。
- 当消息正文变化时重建记录。
- 当 iframe 已不在当前消息中时清理旧分配。

依赖外部环境：

- `getCurrentMessageId()`。
- `getIframeName()`。
- `retrieveDisplayedMessage()`。
- 父页面 DOM。

### `settings.ts`

定位：

- 设置的默认值、读取、归一化、持久化和型态同步中心。

主要函数：

| 函数 | 用途 |
| --- | --- |
| `getSkillLabel(skillKey, mode)` | 技能值转显示标签。 |
| `getStoryStyleLabel(mode, customStyle)` | 故事风格值转显示标签。 |
| `getDefaultUiSettings()` | 返回默认 UI 设置。 |
| `getDefaultStorySettings()` | 返回默认故事设置。 |
| `getConfiguredFontMode()` | 从 `body[data-ellia-font]` 读取默认字体。 |
| `normalizeUiSettings(value)` | 校验并修复 UI 设置，兼容缺失/非法值。 |
| `normalizeStorySettings(value)` | 校验并修复故事设置，兼容旧版 `skill3` 存故事风格的情况。 |
| `normalizeStoryStyleMode(value)` | 统一故事风格别名，如 `WEIRD_GHOST`、`诡异探灵`、`诡谲探灵`。 |
| `normalizeCustomStoryStyle(value)` | 清理自定义故事风格，折叠空白并限制 80 字。 |
| `safeGetVariables(option)` | 安全读取变量，失败时返回空对象。 |
| `getFormTypeFromText(value)` | 从文本中识别型态。 |
| `getFormTypeFromMessageVariables(variables)` | 从最新消息变量中识别艾莉亚当前型态。 |
| `syncFormTypeToMessageVariables(mode)` | 将型态写回最新消息变量的固定路径。 |
| `persistUiSettings(settings)` | 将 UI 设置保存到全局变量。 |
| `persistStorySettings(settings)` | 将故事设置保存到聊天变量。 |
| `readPersistedSettings()` | 一次性读取全局、聊天、最新消息变量并返回归一化结果。 |

变量存放：

| 设置类别 | 保存位置 | 路径 |
| --- | --- | --- |
| UI 设置 | 全局变量 | `dialog_beauty.ui` |
| 故事设置 | 聊天变量 | `dialog_beauty.story` |
| 当前型态 | 最新消息变量 | `stat_data.关系列表.艾莉亚.技能.在您眼里.效果.当前状态` |

依赖外部环境：

- `getVariables()`。
- `replaceVariables()`。
- lodash `_`。

### `story-tone.ts`

定位：

- 处理 “Rote Blume / 自定义故事风格” 的 FP 消耗和输入框标记写入。

主要函数：

| 函数 | 用途 |
| --- | --- |
| `spendStoryToneFp()` | 在最新消息变量中寻找 FP，检查是否足够，扣除 `STORY_TONE_COST`。 |
| `insertIntoPromptInput(text)` | 将文本追加写入 SillyTavern 输入框，并触发 `input` / `change` 事件。 |
| `buildStoryToneReminder(tone)` | 生成保存自定义故事风格后的 Reminder 标记。 |
| `buildStoryToneRequest(tone)` | 生成请求艾莉亚协助优化故事风格的 Request 标记。 |

内部辅助逻辑：

| 函数 | 用途 |
| --- | --- |
| `parseFpValue(value)` | 从数字或字符串中解析 FP 数值。 |
| `findFpState(variables)` | 按 `FP_PATH_CANDIDATES` 查找 FP 路径和值。 |
| `getPromptInput()` | 在父页面中寻找输入框或 contenteditable。 |
| `escapeMarkerContent(value)` | 避免标记内容中的双引号破坏格式。 |

用户操作对应流程：

| 操作 | 实际行为 |
| --- | --- |
| “帮我想/优化！” | 生成 `[Request_Rote Blume] ...` 并写入输入框，不扣 FP。 |
| “传送” | 校验自定义文本，扣除 100 FP，保存为 `CUSTOM`，生成 `[Reminder_Rote Blume] ...` 并写入输入框。 |

### `typewriter.ts`

定位：

- 打字机动画系统。
- 将卡片文本拆成字符 span，再根据标点、语气词、省略号和速度创建 GSAP timeline。

主要函数：

| 函数 | 用途 |
| --- | --- |
| `renderStaticText(contentElement, card)` | 将卡片内容恢复为普通静态文本。 |
| `buildTypewriterTimeline(card, contentElement, speed, onComplete)` | 创建可播放的 GSAP 打字机 timeline。 |

内部辅助函数：

| 函数 | 用途 |
| --- | --- |
| `scaleTiming(value, multiplier)` | 根据速度倍率缩放节奏参数。 |
| `createRhythmProfile(speed)` | 根据 `normal` / `fast` 生成实际节奏。 |
| `classifyPunctuation(char)` | 将标点归类为逗号、句号、问号、叹号、冒号等。 |
| `tokenizeLine(text)` | 将一行文本切成普通字符、短语、省略号和标点 token。 |
| `rebuildCharacters(contentElement, card)` | 清空原文本并为每个字符创建 `.ellia-v2-char` span。 |
| `revealCharacter(...)` | 为单个字符安排出现动画。 |
| `revealQuestionMark(...)` | 问号的专用出现节奏。 |
| `revealEllipsis(...)` | 省略号逐点出现并追加尾停顿。 |
| `schedulePlainToken(...)` | 普通字符的出现节奏，兼顾语气词和句尾助词。 |
| `schedulePunctuationToken(...)` | 标点符号的出现节奏。 |
| `schedulePhraseToken(...)` | 特殊短语的出现节奏。 |

速度说明：

| 设置 | 行为 |
| --- | --- |
| `disable` | 不创建 timeline，直接静态显示。 |
| `normal` | 使用较慢倍率。 |
| `fast` | 使用基础倍率。 |

### `REFACTOR_TODO.md`

定位：

- 当前重构计划和完成情况的记录。
- 不是运行时依赖。

适合记录：

- 已完成的抽离模块。
- 票券式设置页搬运情况。
- 后续浏览器验证、文案差异检查、视觉微调等任务。

## 设置项与保存位置

| UI/故事项 | 字段 | 保存位置 | 说明 |
| --- | --- | --- | --- |
| 字体 | `uiSettings.fontMode` | 全局变量 | 控制根节点 `data-font-mode`，影响 CSS 字体变量。 |
| 环境动画 | `uiSettings.animationEnabled` | 全局变量 | 控制根节点 `data-animations-enabled`，关闭 CSS 动画/过渡。 |
| 打字速度 | `uiSettings.typewriterSpeed` | 全局变量 | 控制打字机禁用、普通、快速。 |
| 型态 | `storySettings.formType` | 聊天变量 + 最新消息变量 | 设置面板修改时同步到消息变量固定路径。 |
| 技能1 | `storySettings.skill1` | 聊天变量 | 给后续 EJS / 世界书读取。 |
| 技能2 | `storySettings.skill2` | 聊天变量 | 给后续 EJS / 世界书读取。 |
| 技能3 | `storySettings.skill3` | 聊天变量 | 给后续 EJS / 世界书读取。 |
| 故事风格 | `storySettings.skill4` | 聊天变量 | 支持世界决定、预设风格、自定义。 |
| 自定义故事风格 | `storySettings.skill4Custom` | 聊天变量 | 保存前会清理空白并限制长度。 |
| 故事风格请求状态 | `storySettings.skill4Request` | 聊天变量 | 目前保存结构中保留，主界面操作会重置为 false。 |

## `<ellia>` 内容格式

基础格式：

```html
<ellia name="艾莉亚">
「这里是对话」
(这里是动作)
「下一句对话」
</ellia>
```

解析规则：

- `name="..."` 会作为卡片标题，缺失时默认 `艾莉亚`。
- `「...」` 会被解析为 `dialogue`。
- `(...)` 会被解析为 `action`。
- 如果没有找到上述格式，则按非空行解析；整行被括号包住时视为 `action`，否则视为 `dialogue`。
- `</thinking>` 或 `</think>` 之前的内容会被忽略，避免把思维内容渲染出来。

## 维护建议

- 新增设置值：先更新 `types.ts` 的类型，再更新 `constants.ts` 的白名单和按钮数据，最后接入 `settings.ts` 的归一化逻辑。
- 新增设置分区：更新 `SettingsSectionKey`、`settingsSections`、`DialogBeautySettingsPanel.vue` 的详情视图。
- 修改持久化路径：集中改 `constants.ts` 的 `GLOBAL_SETTINGS_PATH` / `CHAT_SETTINGS_PATH`，并检查旧数据兼容。
- 修改打字机节奏：优先改 `constants.ts` 的 `BASE_RHYTHM` 和 `PHRASE_PATTERNS`，避免把节奏常量散落到 `typewriter.ts`。
- 修改 `<ellia>` 语法：优先改 `parser.ts`，并确认多 iframe 分配逻辑仍能正确定位当前块。
