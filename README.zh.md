# AgoraMeetingExample-Electron

_Read this in other languages: [English](README.md)_

## 简介

这个开源示例项目演示了针对会议场景下，Agora SDK 的基本集成逻辑。

## 功能列表

- 设备管理、测试
- 音视频通话
- 参会人列表，状态维护
- 演讲者视图、宫格视图
- 屏幕共享，专注模式下支持共享区域互动批注
- 互动白板
- 语音激励
- 原生插件，用以专注模式下监听PPT翻页和目标窗口跟随

## 待完成
- 实时消息
- 会议控制


## 如何运行示例程序

#### 运行环境

- Agora.io [Developer Account](https://dashboard.agora.io/signin/)
- [Node.js](https://nodejs.org/en/download/) >= 14.16.0 < 15
- [Yarn](https://yarnpkg.com/) package manager >= 1.17.3
- [CMake](https://cmake.org/download/) native-addon compiler >= 3.21
- Mac系统下需要安装[Xcode](https://developer.apple.com/download/all/?q=Xcode)
- Windows系统下需要安装[Visual Studio](https://visualstudio.microsoft.com/downloads/)(at least vs2017) 或 [windows-build-tools](https://www.npmjs.com/package/windows-build-tools)

#### 注意

- 请仔细检查本地环境是否符合上述描述，尤其是Node、Yarn等版本号
- 若要使用PowerPoint翻页追踪功能，请在以管理员运行的安装程序中将pptmonitor.exe所在文件夹路径添加到Windows Defender白名单中，可通过如下脚本添加
``` shell
$ powershell -inputformat none -outputformat none -NonInteractive -Command Add-MpPreference -ExclusionPath XXXXX\ExtraResources
```
- 自从[v1.4.0](https://github.com/AgoraIO-Usecase/AgoraMeetingExample-Electron/releases/tag/v1.4.0)提供原生插件后，对运行demo增加了本地原生模块编译环境的要求，若发生问题可参考[node-gyp 8.3.0](https://github.com/nodejs/node-gyp/tree/v8.3.0)

#### 运行步骤

- 首先在 [Agora.io 注册](https://dashboard.agora.io/cn/signup/) 注册账号，并创建自己的测试项目，获取到 AppID和AppCert。
- 随后在[控制台中按照文档配置互动白板功能](https://docs.agora.io/cn/whiteboard/enable_whiteboard?platform=Web)，并获取到AppIdentifier、AK和SK。
- 获取代码
```shell
$ git clone https://github.com/AgoraIO-Usecase/AgoraMeetingExample-Electron.git
$ cd AgoraMeetingExample-Electron
```
- 重命名文件[.env.template](.env.template) 为'.env'，并将获取到的AppId、AppCert、AppIdentifier、AK和SK填入该文件。

然后进行以下操作:

```shell
$ yarn
$ yarn start

```

## 反馈

如果您对示例项目有任何问题或建议，请随时提交问题。

## 参考文档

- 您可以在 [文档中心](https://docs.agora.io/cn/Video/API%20Reference/electron/index.html)找到完整的 API 文档

## 相关资源

- 你可以先参阅[常见问题](https://docs.agora.io/cn/faq)
- 如果你想了解更多官方示例，可以参考[官方 SDK 示例](https://github.com/AgoraIO)
- 如果你想了解声网 SDK 在复杂场景下的应用，可以参考[官方场景案例](https://github.com/AgoraIO-usecase)
- 如果你想了解声网的一些社区开发者维护的项目，可以查看[社区](https://github.com/AgoraIO-Community)
- 若遇到问题需要开发者帮助，你可以到[开发者社区](https://rtcdeveloper.com/)提问
- 如果需要售后技术支持, 你可以在[Agora Dashboard](https://dashboard.agora.io/)提交工单

## 代码许可

示例项目遵守 MIT 许可证。
