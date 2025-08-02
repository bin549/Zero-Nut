---
title: "VR开发概述"
date: 2024-09-10T14:00:51+08:00
lastmod: 2024-10-11T14:30:51+08:00
author: "Z"
draft: false
description: "针对XR设备开发还处于初步发展阶段，缺乏统一的标准。不像PC或移动端，可以做到一次开发多设备部署，如移动端应用基于Android SDK开发后，就可以运行于绝大部分Android手机。"
tags: ['开发', '配置', '环境']
categories: [  ]
# series: [ "" ]
# series_order: 
---

# VR开发工具概述

**日期**: 2024-09-10  
**最后修改**: 2024-10-11  
**作者**: Z

> 针对XR设备开发还处于初步发展阶段，缺乏统一的标准。不像PC或移动端，可以做到一次开发多设备部署，如移动端应用基于Android SDK开发后，就可以运行于绝大部分Android手机。

---

## 一、XR通用开发框架

针对XR设备开发还处于初步发展阶段，缺乏统一的标准。不像PC或移动端，可以做到一次开发多设备部署，如移动端应用基于Android SDK开发后，就可以运行于绝大部分Android手机。

越来越多的VR设备推出，控制器类型逐渐趋向于碎片化。从开发层面上来看，不同的控制器具有不同的键值映射，当现有 VR 应用程序移植到另外一个VR平台的时候，需要针对目标平台进行交互适配。  
每有新的控制器发布，都会给开发者带来一些额外的工作量，游戏项目需要修改交互代码以适配新的设备。

随着XR内容生态的发展，这一问题得到了改善，主流引擎提供了统一的XR开发框架，开发者无需关注设备间差异，只需关注引擎，专注于内容创作本身，而复杂的设备和平台兼容将由底层的通用开发框架来负责。

---

### 1.1 SteamVR Plugin

SteamVR Plugin 是 Valve 提供给 Unity 开发者的开发工具，主要帮助开发者实现三项主要功能：

1. 为 VR 控制器加载呈现相对应的 3D 模型
2. 处理控制器的输入
3. 根据用户实际手部动作估算骨骼数据并呈现手部姿态

此外，它还提供了交互系统（Interaction System），帮助开发者快速实现常见的 VR 交互功能。  
2.x 版本引入 **Input System**，开发者可以围绕动作（Action）而非设备按键编程，提高新设备的适配效率。

---

### 1.2 MRTK

MRTK（Mixed Reality Toolkit）是微软提供的混合现实开发工具包，支持 Unreal Engine 与 Unity。  
主要特性包括：

- 跨平台输入系统
- 空间交互构建模块
- 编辑器内模拟
- 模块化组件结构

MRTK v3 基于 **OpenXR** 原生构建，可运行在 HoloLens 2、Meta Quest 2、Magic Leap 2 等设备上。

---

### 1.3 XR Interaction Toolkit

XR Interaction Toolkit 是 Unity 官方推出的 XR 开发工具包，提供跨平台的移动、抓取、UI 交互等功能。  
无需编写代码即可实现常见交互，也支持自定义扩展。  
最新版本增加了 **Poke Interactor**、**Multi-grab Support** 等新特性。

---

### 1.4 Unreal Engine

UE（Unreal Engine）在 VR 领域画面与沉浸感表现出色，支持：

- OpenXR、SteamVR、MRTK
- Oculus、三星、谷歌等厂商插件
- VR 游戏交互、UI、优化与平台发布流程

---

### 1.5 Godot

Godot 从 3.0 开始支持 VR，4.0 将 **OpenXR** 集成进引擎，支持 Quest 2、Pico 4、Magic Leap 2 等。  
推荐使用官方 **Godot XR Tools** 插件，提供移动、交互、UI 等模块及项目模板。

---

### 1.6 VRTK

VRTK（Virtual Reality Toolkit）是 Unity VR 交互开发框架，支持 Oculus、SteamVR、Daydream 等平台。  
V4 完全重写，模块化、硬件无关，便于跨平台适配。

---

## 二、XR设备SDK

即使有通用框架，由于 OpenXR 兼容性不足，各大厂商仍会提供自家 SDK 供开发者使用。

---

### 2.1 Oculus Integration

Meta 提供的 Unity 插件，支持 Quest 系列设备，集成：

- 渲染功能
- 社交系统
- 头像系统
- 音频与语音
- 示例框架

---

### 2.2 Pico SDK

Pico 针对 Neo 3、Pico 4 提供 SDK，支持渲染、输入、追踪、MR 捕捉，并配套支付与数据体系。

---

### 2.3 HTC SDK

支持 Vive 系列设备，提供指尖追踪、手势识别插件，可用于 Unity/Unreal。

---

### 2.4 GoogleVR SDK

分为 Cardboard 与 Daydream 两种方案，支持头部追踪、立体渲染、畸变修正、控制器支持等功能。

---

## 结论

本文介绍了主流 XR 通用开发框架与厂商 SDK，为 XR 开发者提供了工具选型参考。

---

## 摘要

针对 XR 设备开发还处于初期阶段，缺乏统一标准。  
随着 OpenXR 普及与主流引擎支持，跨平台 XR 开发将逐步简化。
