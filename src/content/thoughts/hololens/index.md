---
title: "我在Hololens 2上开发软件"
date: 2023-02-11T16:26:54+08:00
lastmod: 2025-08-02T19:04:57+08:00
author: "Z"
draft: false
description: "本文为笔者从首次拿到设备开箱到配置开发环境，最后对项目进行打包部署到Hololens2真机的整个流程。"
tags: [Hololens 2, VR]
categories: [想法]
# series: [ "" ]
# series_order:
---


> 本文为笔者从首次拿到设备开箱到配置开发环境，最后对项目进行打包部署到Hololens2真机的整个流程。

> 微软的官方文档中有HoloLens2部署的权威教程。但一些问题官方文档并没有列出，需要在实际开发过程中去根据自身或者前人的经验去解决。

> 开发环境使用Unity2020.3.8 + MRTK2.7.0。MRTK2.7 已在2021年9月份开始支持Unity2020.3LTS版本，通常而言，Unity2019.4+MRTK2.6 或者Unity2020.3+MRTK2.7是最佳搭配，不建议混合搭配（如Unity2019.4+MRTK2.7）。

## 一、开发环境搭建

### 1.1 Unity配置

Unity是开发HoloLens 应用的重点平台，而微软和Unity 本身也是紧密合作，双向支持。

#### 1.1.1 新建Unity项目
通过Unity Hub，新建一个工程，选择3D模板、填写好项目名称、选择工程存储路径。

#### 1.1.2 配置Unity编译环境
工程创建完成后，在Unity菜单中，依次选择`File > Build Settings`（快捷键`Ctrl+Shift+B`），打开构建设置窗口，选择“Universal Windows Platform”，设置：
- Target Device: HoloLens
- Architecture: ARM64

点击「Switch Platform」按钮切换平台。


> 如果无法选择UWP，需要回到Unity Hub中为该版本添加UWP构建支持模块。

### 1.2 导入MRTK插件
MRTK 是微软 Mixed Reality Toolkit 的简称。这个用于 Unity 的工具包提供跨平台的输入系统、基础组件以及用于空间交互的通用构建模块，目标就是加快面向包括 HoloLens 在内的应用程序的开发，大大降低 MR 准入门槛。

#### 1.2.1 导入方式
- 方式一：从[官方Github](https://github.com/microsoft/MixedRealityToolkit-Unity/releases)下载 `.unitypackage`
- 方式二（推荐）：使用 [MRFT 工具](https://www.microsoft.com/en-us/download/details.aspx?id=102778) 以可视化方式管理MRTK

#### 1.2.2 使用MRFT导入MRTK
1. 打开 MRFT 工具，指定 Unity 工程路径
2. 选择 `Mixed Reality Toolkit Foundation` 并指定版本
3. 勾选 `Mixed Reality OpenXR Plugin` 并指定版本
4. MRFT 会修改 `manifest.json`，Unity 会自动加载对应工具包

#### 1.2.3 配置XR环境
1. 启用 Unity OpenXR 插件
2. 重启 Unity（导入OpenXR插件后会提示）
3. 打开 XR Plug-in Management 设置
4. 在 `UWP` 下勾选 `OpenXR`，并勾选 `Microsoft HoloLens feature group`
5. Player Settings 配置：
  - Package name：自定义
  - Capabilities：InternetClient、InternetClientServer、WebCam、Microphone、SpatialPerception
  - Supported Device Families：Holographic
6. OpenXR 配置：
  - Render Mode: Single Pass Instance
  - Depth Submission Mode: Depth 16 Bit
  - 添加 Microsoft Hand Interaction Profile

#### 1.2.4 完成XR环境
最后导入 TextMeshPro 工具包完成环境配置。


## 二、设备环境

### 2.1 启动开发者模式
- **PC**：控制面板 → 更新和安全 → 开发者选项 → 开启开发者模式
- **HoloLens2**：Settings → Update & Security → For Developers → 开启 Developer Mode

### 2.2 网页连接HoloLens2设备
1. 获取UsbNcm IP
  - **方式一**：USB-C 连接 → 在开发者面板查看
  - **方式二**：命令行执行 `winappdeploycmd device`
2. 浏览器访问 IP → 安装证书 → 输入设备Pin → 注册用户
3. 登录 Device Portal 查看状态


## 三、MR 场景与本机调试

### 3.1 创建MR场景
菜单 `Mixed Reality > Toolkit > Add to Scene and Configure`  
会自动生成：
- MixedRealityToolkit
- MixedRealityPlayspace
- MixedRealitySceneContent

### 3.2 添加手势交互
1. 创建 Cube
2. 添加：
  - Object Manipulator
  - NearInteractionGrabbable
3. 运行程序，即可手势交互

### 3.3 本机调试
- **USB**：USB-C 直连
- **WiFi**：`Mixed Reality > Remoting` → 输入IP → Enable → 运行


## 四、项目打包部署

### 4.1 Unity 编译
Build Settings → 输出到本地文件夹

### 4.2 VS WiFi 部署
1. 同一局域网
2. VS 打开工程 → Release / ARM64 / Remote Machine
3. 填写 IP，身份验证类型：通用
4. `F5` 部署（首次需输入 Pin）

{{< figure src="./embed_imgs/5317.png" alt="环境配置截图" caption="" >}}

## 参考文章
- [使用 Windows 设备门户](https://learn.microsoft.com/zh-cn/windows/mixed-reality/develop/advanced-concepts/using-the-windows-device-portal)
- [Unity X HoloLens 2 混合现实开发入门](https://learn.u3d.cn/tutorial/mr-development-hololens2)
- [HoloLens2之路－Unity2020.3+MRTK2.7配置](https://blog.csdn.net/yolon3000/article/details/121776416)
- [HoloLens2之路－部署到真机](https://blog.csdn.net/yolon3000/article/details/122072266)
