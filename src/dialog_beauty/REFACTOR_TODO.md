# Dialog Beauty Refactor Todo

## 已完成

- [x] 梳理 `dialog_beauty_v104` 与 TS 版的结构差异
- [x] 抽出 `types.ts`
- [x] 抽出 `constants.ts`
- [x] 抽出 `settings.ts`
- [x] 抽出 `story-tone.ts`
- [x] 抽出 `parser.ts`
- [x] 抽出 `typewriter.ts`
- [x] 将 `App.vue` 收口为装配层
- [x] 构建验证当前重构可通过
- [x] 补上 `skill1` / `skill2` 的 `A` 档兼容
- [x] 补上 `NEW WEIRD` / `WEIRD_GHOST` / `诡谲探灵` / `诡异探灵` 的兼容映射

## 进行中

- [ ] 评估 `v104` 票券式设置页，决定是否搬回 TS 版
- [x] 吸收新的 `1.html` 原型，作为“技能1 / 水晶球”票券卡视觉参考
- [x] 将票券卡入口扩展成完整的设置分区结构
- [x] 将设置首页修正为 `v104` 风格舞台：1x4 横排票券卡

## 下一步

- [x] 将设置弹窗拆成独立组件，减轻 `App.vue` 模板负担
- [ ] 基于 `1.html` 为设置页建立第一张票券卡组件
- [x] 基于 `1.html` 为设置页建立第一张票券卡组件
- [x] 为 skill2 / world / beauty 做各自更贴近原稿的票券视觉
- [ ] 继续微调舞台尺寸、幕布光带、选中卡片位移，贴近截图比例
- [ ] 对照 `v104` 检查剩余文案与交互差异
- [ ] 在浏览器里做一次实际消息渲染验证
- [ ] 视结果决定是否继续搬运票券式设置 UI

## 备注

- 当前 TS 版已经是主维护源，`v104` 更像运行产物拆包版本，不适合作为长期修改入口。
- 构建验证通过，但还没有做浏览器里的实际交互回归。
- 新增的视觉原型已登记在 [design_refs/README.md](<C:/Users/kcwan/Documents/ST-script-diy/github/project_ellia/src/dialog_beauty/design_refs/README.md:1>)。
