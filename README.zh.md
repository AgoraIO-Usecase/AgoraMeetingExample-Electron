# AgoraMeetingExample-Electron

_Read this in other languages: [English](README.md)_

## 简介

这个开源示例项目演示了针对会议场景下，Agora SDK 的基本集成逻辑。

## 待完成
- 实时消息
- 白板共享
- 会议控制
- 会议邀请


## 如何运行示例程序

#### 运行环境

- Agora.io [Developer Account](https://dashboard.agora.io/signin/)
- [Node.js](https://nodejs.org/en/download/) >= 14.5.x < 15
- [Yarn](https://yarnpkg.com/) package manager >= 1.21.3

#### 运行步骤

- 首先在 [Agora.io 注册](https://dashboard.agora.io/cn/signup/) 注册账号，并创建自己的测试项目，获取到 AppID。
- 重命名文件[.env.template](.env.template) 为'.env'，并将获取到的AppId和AppCert填入该文件。

然后进行以下操作:

```shell
$ git clone https://github.com/AgoraIO-Usecase/AgoraMeetingExample-Electron.git
$ cd AgoraMeetingExample-Electron
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
