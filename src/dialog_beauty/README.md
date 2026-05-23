# Dialog Beauty

`dialog_beauty` 用来把消息里的 `<ellia>` 内容渲染成艾莉亚对话卡，并提供一套票券式设定界面

它负责这些功能：

- 读取当前消息，并定位当前 iframe 对应的 `<ellia>` 区块
- 解析对话行与动作行
- 渲染卡片内容
- 控制打字机播放、重播与离屏停止
- 管理型态、技能组、故事风格、字体、环境动画、打字速度
- 把设定写入全局变量、聊天变量与最新消息变量
- 处理 Rote Blume 自定义故事风格与 FP 扣费

## 目录结构

```text
src/dialog_beauty/
├── index.html
├── index.ts
├── App.vue
├── constants.ts
├── parser.ts
├── settings.ts
├── story-tone.ts
├── typewriter.ts
├── types.ts
└── components/
    ├── DialogBeautySettingsPanel.vue
    ├── DialogBeautySettingsSkill1Shell.vue
    ├── DialogBeautySettingsSkill2Page.vue
    ├── DialogBeautySettingsWorldPage.vue
    ├── DialogBeautySettingsBeautyPage.vue
    └── DialogBeautyTicketCard.vue
```

## 运行链路

```text
index.html
  ↓
index.ts
  ↓ createApp(App).use(createPinia()).mount('#app')
App.vue
  ↓ readPersistedSettings()
settings.ts
  ↓ 读取当前消息
parser.ts
  ↓ parseCurrentElliaBlock()
App.vue
  ↓ renderStaticText() / buildTypewriterTimeline()
typewriter.ts
  ↓ 用户打开设定面板
DialogBeautySettingsPanel.vue
  ↓ 进入各分页
Skill1Shell / Skill2Page / WorldPage / BeautyPage
  ↓ emit 回传修改
App.vue
  ↓ persistUiSettings() / persistStorySettings() / syncFormTypeToMessageVariables()
settings.ts
```

## 文件职责

### `index.html`

- HTML 宿主页
- 提供 `#app` 挂载点
- 通过 `meta` 写入版本与构建标记
- 通过 `body[data-ellia-font]` 提供默认字体模式

### `index.ts`

- 创建 Vue 应用并挂载 `App.vue`
- 注入 Pinia
- 在 `pagehide` 时卸载应用实例

### `App.vue`

主装配层，负责把消息内容、设定状态、动画状态和设定面板接起来

主要职责：

- 读取持久化设定
- 解析当前消息中的 `<ellia>` 区块
- 维护 `cards`、设定面板状态、动画状态和 DOM ref
- 控制播放、重播、停止、离屏停止
- 监听外部 `dialog_beauty_settings_sync` 事件
- 把设定写回变量系统

### `constants.ts`

集中定义：

- 字体、型态、技能、故事风格、打字速度的白名单
- 设定页入口资料与显示文案
- 快速回复选项
- 变量存放路径
- 打字机节奏参数
- Rote Blume 相关常量

### `parser.ts`

负责从消息文本中找出当前应显示的 `<ellia>` 区块

主要逻辑：

- 先去掉 `</thinking>` / `</think>` 之前的内容
- 根据当前 iframe 名称和父页面中的 iframe 列表分配区块索引
- 把 `「对话」` 与 `(动作)` 解析成不同类型的行

### `settings.ts`

负责设定读写和兼容处理

主要职责：

- 提供默认设定
- 归一化旧值与非法值
- 从最新消息变量识别当前型态
- 把 UI 设定写到全局变量
- 把故事设定写到聊天变量
- 把型态写回最新消息变量固定路径

### `story-tone.ts`

负责 Rote Blume 的交互逻辑

- 查找 FP 变量
- 扣除 100 FP
- 生成 Request / Reminder 标记
- 把内容写入输入框

### `typewriter.ts`

负责打字机播放系统

- 静态渲染文本
- 把文本拆成字符 span
- 根据标点、短语、省略号安排 GSAP 时间线
- 支援 `disable`、`normal`、`fast`

### `types.ts`

定义整个模块共享的数据结构

常用类型：

- `ElliaCard`
- `ParsedLine`
- `DialogBeautyUiSettings`
- `DialogBeautyStorySettings`
- `SettingsSectionKey`
- `RhythmProfile`

## 组件结构

### `DialogBeautySettingsPanel.vue`

总设定面板，负责：

- 首页票券入口
- 各分页壳层切换
- 当前状态摘要
- 把子页面操作统一 `emit` 回 `App.vue`

### `DialogBeautySettingsSkill1Shell.vue`

技能 1 的独立双页壳层

- `settings` 页负责选技能与快速回复
- `detail` 页负责展示技能说明
- 内部带水晶球翻面与状态切换动画

### `DialogBeautySettingsSkill2Page.vue`

- 技能 2 选项
- 技能 2 快速回复

### `DialogBeautySettingsWorldPage.vue`

- 型态切换
- 技能 3 切换
- 技能 4 / 故事风格切换
- 自定义故事风格输入、请求优化、保存扣费

### `DialogBeautySettingsBeautyPage.vue`

- 字体切换
- 环境动画开关
- 打字速度切换

### `DialogBeautyTicketCard.vue`

首页四张票券卡的纯展示组件

## 设定保存位置

| 设定 | 字段 | 保存位置 |
| --- | --- | --- |
| 字体 | `uiSettings.fontMode` | 全局变量 `dialog_beauty.ui` |
| 环境动画 | `uiSettings.animationEnabled` | 全局变量 `dialog_beauty.ui` |
| 打字速度 | `uiSettings.typewriterSpeed` | 全局变量 `dialog_beauty.ui` |
| 型态 | `storySettings.formType` | 聊天变量 `dialog_beauty.story` + 最新消息变量固定路径 |
| 技能1 | `storySettings.skill1` | 聊天变量 `dialog_beauty.story` |
| 技能2 | `storySettings.skill2` | 聊天变量 `dialog_beauty.story` |
| 技能3 | `storySettings.skill3` | 聊天变量 `dialog_beauty.story` |
| 故事风格 | `storySettings.skill4` | 聊天变量 `dialog_beauty.story` |
| 自定义故事风格 | `storySettings.skill4Custom` | 聊天变量 `dialog_beauty.story` |

型态同步路径：

```text
stat_data.关系列表.艾莉亚.技能.在您眼里.效果.当前状态
```

## `<ellia>` 格式

```html
<ellia name="艾莉亚">
「这里是对话」
(这里是动作)
「下一句对话」
</ellia>
```

解析规则：

- `name="..."` 缺省时使用 `艾莉亚`
- `「...」` 视为对话
- `(...)` 视为动作
- 若没有匹配到上述格式，则按非空行回退解析
- `thinking` 区块会先被剥离，避免思维内容被直接展示

## 维护顺序

1. 新增设定值：`types.ts` → `constants.ts` → `settings.ts` → 对应页面组件
2. 修改卡片内容解析：`parser.ts` → `App.vue`
3. 修改打字机体验：`constants.ts` → `typewriter.ts`
4. 修改设定面板结构：`DialogBeautySettingsPanel.vue` + 对应分页组件
5. 修改变量保存路径：`constants.ts` + `settings.ts`
