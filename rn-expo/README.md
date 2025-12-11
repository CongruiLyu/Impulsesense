# ImpulseSense React Native (Expo)

HCI / 情感计算 / 多模态研究原型（未完成版）。本仓库是从 Web 版迁移到 Expo RN 的初始版本，UI/交互未完全复刻，主要用于研究演示和后续迭代。

## 状态
- Expo SDK：54（与最新 Expo Go 兼容）
- React Native：0.76.5，React：18.3.1
- 未包含 icon/splash 资产，需自行补充或修改 `app.json`
- 功能骨架可运行；UI/交互简化，未完成高保真

## 前置要求
- Node.js 18+
- npm（推荐）或 yarn
- 建议使用国内源加速：`npm config set registry https://registry.npmmirror.com`

## 安装
在 `rn-expo` 目录执行：
```bash
npm install
```

## 运行
启动开发服务器：
```bash
npm start
```

### Web 预览
- 在终端按 `w`，或手动打开 `http://localhost:8081`

### Expo Go 真机预览
- 手机安装 Expo Go
- 电脑与手机同一 WiFi
- 终端显示二维码后，用 Expo Go 扫码；若网络不通，使用：
```bash
npm start --tunnel
```

## 已知事项
- 资产文件：`app.json` 引用的 `icon/splash/adaptive-icon` 未提供，请自行添加到 `assets/`，或修改 `app.json` 去掉引用
- 首次加载较慢属正常（需下载 bundle）
- 若安装警告（deprecated/peer），不影响运行；确保 `npm install` 成功即可

## 项目结构
- `App.tsx`            应用入口，包裹导航与全局状态
- `src/navigation/`    Bottom Tabs 导航
- `src/screens/`       Home / Mall / Insights / Settings
- `src/components/`    可复用组件（如呼吸练习 Overlay）
- `src/hooks/`         自定义 Hooks（核心状态与引擎）
- `src/services/`      业务逻辑/算法
- `src/types/`         TypeScript 类型定义

## 许可证
MIT（见 `LICENSE`）