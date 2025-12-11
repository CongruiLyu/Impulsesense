# ImpulseSense 预览指南

## 🚀 快速开始

### 1. 安装依赖（首次运行）
```bash
cd rn-expo
npm install
```

### 2. 启动开发服务器
```bash
npm start
```

启动后会显示一个二维码和菜单选项。

---

## 📱 预览方式（按推荐顺序）

### 方式 1: Expo Go 手机应用（最简单，推荐）

**优点：** 无需安装模拟器，真机预览，支持摄像头等功能

**步骤：**
1. 在手机上安装 **Expo Go** 应用：
   - iOS: [App Store 下载](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play 下载](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. 确保手机和电脑在同一 WiFi 网络

3. 运行 `npm start` 后：
   - **iOS**: 用相机扫描终端中的二维码
   - **Android**: 打开 Expo Go，点击 "Scan QR code"，扫描二维码

4. 应用会自动在手机上加载

**注意：** 如果二维码无法扫描，可以：
- 在 Expo Go 中手动输入显示的 URL（如 `exp://192.168.x.x:8081`）
- 或使用 `npm start --tunnel` 创建隧道连接（需要 Expo 账号）

---

### 方式 2: Web 浏览器预览（最快，但功能受限）

**优点：** 无需安装任何东西，立即预览

**步骤：**
```bash
npm start
# 然后按 'w' 键
# 或直接运行：
npm run web
```

浏览器会自动打开 `http://localhost:19006`

**限制：** 
- 摄像头功能可能不可用
- 某些原生功能（如震动）可能无法正常工作
- UI 布局可能略有不同

---

### 方式 3: Android 模拟器（完整功能）

**优点：** 完整 Android 环境，支持所有功能

**前置要求：**
1. 安装 [Android Studio](https://developer.android.com/studio)
2. 在 Android Studio 中创建并启动一个 Android 虚拟设备（AVD）
3. 确保 AVD 正在运行

**步骤：**
```bash
npm start
# 然后按 'a' 键
# 或直接运行：
npm run android
```

应用会自动在 Android 模拟器中打开。

---

### 方式 4: iOS 模拟器（仅 macOS）

**优点：** 完整 iOS 环境，支持所有功能

**前置要求：**
1. 必须使用 **macOS** 系统
2. 安装 [Xcode](https://developer.apple.com/xcode/)
3. 安装 Xcode Command Line Tools: `xcode-select --install`

**步骤：**
```bash
npm start
# 然后按 'i' 键
# 或直接运行：
npm run ios
```

应用会自动在 iOS 模拟器中打开。

---

## 🛠️ 开发工具

### Expo DevTools
运行 `npm start` 后，可以在浏览器中打开：
- **本地**: http://localhost:19002
- 提供日志查看、重新加载、性能监控等功能

### React Native Debugger
1. 在 Expo Go 或模拟器中，摇动设备（或按 `Cmd+D` / `Ctrl+M`）
2. 选择 "Debug Remote JS"
3. 浏览器会打开 Chrome DevTools

---

## 🔧 常见问题

### 问题 1: 二维码扫描后无法连接
**解决方案：**
- 确保手机和电脑在同一 WiFi
- 尝试使用隧道模式：`npm start --tunnel`
- 或手动输入显示的 URL

### 问题 2: 摄像头权限被拒绝
**解决方案：**
- 在手机设置中允许 Expo Go 访问摄像头
- 或在模拟器中授予权限

### 问题 3: 依赖安装失败
**解决方案：**
```bash
# 清除缓存
npm cache clean --force
# 删除 node_modules 重新安装
rm -rf node_modules
npm install
```

### 问题 4: 端口被占用
**解决方案：**
```bash
# 使用不同端口
npx expo start --port 8082
```

---

## 📝 推荐工作流程

1. **开发阶段**: 使用 **Web 预览**（`npm run web`）快速查看 UI 变化
2. **功能测试**: 使用 **Expo Go** 在真机上测试完整功能
3. **深度测试**: 使用 **Android/iOS 模拟器** 测试特定平台行为

---

## 🎯 快速命令参考

```bash
# 启动开发服务器（显示所有选项）
npm start

# 直接打开 Web
npm run web

# 直接打开 Android（需要模拟器运行）
npm run android

# 直接打开 iOS（仅 macOS）
npm run ios

# 使用隧道模式（解决网络问题）
npx expo start --tunnel

# 清除缓存并重启
npx expo start --clear
```

---

## 💡 提示

- **热重载**: 修改代码后，应用会自动刷新（Web 和 Expo Go 都支持）
- **快速刷新**: 在 Expo Go 中摇动设备，选择 "Reload" 手动刷新
- **查看日志**: 在终端中可以看到所有 console.log 输出
- **性能监控**: 在 Expo DevTools 中查看性能指标



