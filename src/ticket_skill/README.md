# 车票技能美化

这个目录是车票技能美化的前端界面源码。它遵循 `.cursor/rules/前端界面.mdc`：`index.html` 作为 webpack HTML 模板，`index.ts` 作为唯一脚本入口，Vue 负责组件化渲染，最终由 `pnpm run build:dev` 或 `pnpm run build` 输出到 `dist/ticket_skill/index.html`。

版本号不放在目录名里，写在 `index.html` 的 `ellia-ticket-skill-version` / `ellia-ticket-skill-build` meta 里。

## 文件结构

```text
src/ticket_skill/
├── index.html                 # webpack HTML 模板；只放 head 资源和 #ticket-skill-root
├── index.ts                   # 前端入口；创建 Vue app 并导入全局样式
├── App.vue                    # 读取 $1-$7 占位符，挂载后初始化 TavernHelper 逻辑
├── components/
│   ├── TicketCard.vue         # 车票整体布局
│   ├── TicketStamp.vue        # 折叠邮票
│   ├── TicketStub.vue         # 左侧票根
│   ├── TicketFront.vue        # 车票正面内容
│   ├── TicketBack.vue         # 车票背面故事之种
│   └── TicketToast.vue        # toast 容器
├── runtime/
│   ├── fields.ts              # 正则替换后的 $1-$7 数据源
│   ├── auto-import.ts         # 自动注入背包车票
│   ├── archive-ticket.ts      # 点击 OBSERVED 后保存背包与归档记录
│   ├── message-scope.ts       # 消息楼层识别
│   ├── variables.ts           # TavernHelper 变量读写封装
│   ├── ticket-data.ts         # 车票物品、Raw Text、日历记录构造
│   ├── theme.ts               # 主题色安全化处理
│   ├── hash.ts                # 车票去重 key/hash
│   ├── dom.ts                 # DOM、toast、plain object 工具
│   └── types.ts               # 共享类型
├── styles/
│   └── ticket.css             # 视觉、折叠、翻面、移动端适配、toast 样式
└── README.md
```

## 常用命令

```bash
pnpm run build:dev
```

开发模式构建，输出 `dist/ticket_skill/index.html`。

```bash
pnpm run build
```

生产模式构建，同样输出 `dist/ticket_skill/index.html`。

## 维护提醒

- 修改显示内容和占位符结构时，优先改 `App.vue` 和 `components/*.vue`。
- 修改样式时，优先改 `styles/ticket.css`。
- 修改变量读写、消息楼层识别、背包/日历保存逻辑时，分别改 `runtime/*.ts`。
- 这个模板依赖 SillyTavern / TavernHelper 的运行环境，浏览器直接打开只能检查静态外观，变量注入逻辑不会生效。
