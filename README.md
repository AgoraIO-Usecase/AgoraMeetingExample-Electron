# AgoraMeetingExample-Electron

_**其他语言版本：** [**简体中文**](README.zh.md)_

## Overview

The AgoraMeetingExample-Electron project is an open-source demo that will show you meeting sence on how to integrate Agora SDK APIs into your project.

## Todo
- Real-time Messaging
- Conference Control

## How to run the sample project

#### Developer Environment Requirements

- Agora.io [Developer Account](https://dashboard.agora.io/signin/)
- [Node.js](https://nodejs.org/en/download/) >= 14.16.0 < 15
- [Yarn](https://yarnpkg.com/) package manager >= 1.17.3
- [CMake](https://cmake.org/download/) native-addon compiler >= 3.21
- [Xcode](https://developer.apple.com/download/all/?q=Xcode) or [Vistual Studio](https://visualstudio.microsoft.com/downloads/)

#### Notice

- Please add the absolute path of the directory which you want to put pptmonitor.exe to the exclusionpath list of Windows Defender if 
you want to use the function of tracking slide index of powerpoint.
``` shell
$ powershell -inputformat none -outputformat none -NonInteractive -Command Add-MpPreference -ExclusionPath XXXXX\ExtraResources
```

#### Steps to run

- Create a developer account at [Agora.io](https://dashboard.agora.io/signin/), and obtain an AppID.
- Follow [WhiteBoard Doc](https://docs.agora.io/cn/whiteboard/enable_whiteboard?platform=Web) to enable WhiteBoard and obtain your AppIdentifier、AK and SK。
- Clone project files
```shell
$ git clone https://github.com/AgoraIO-Usecase/AgoraMeetingExample-Electron.git
$ cd AgoraMeetingExample-Electron
```
- Reanme file [.env.template](.env.template) to .env, and replace 'XXXXXX' with your AppID、 AppCert、AppIdentifier、AK and SK.

Then do the following:

```shell 
$ yarn
$ yarn start

```

## Feedback

If you have any problems or suggestions regarding the sample projects, feel free to file an issue.

## Reference

- You can find full API document at [Document Center](https://docs.agora.io/en/Video/API%20Reference/electron/index.html)
- You can file issues about this demo at [issue](https://github.com/AgoraIO/Electron-SDK/issues)

## Related resources

- Check our [FAQ](https://docs.agora.io/en/faq) to see if your issue has been recorded.
- Dive into [Agora SDK Samples](https://github.com/AgoraIO) to see more tutorials
- Take a look at [Agora Use Case](https://github.com/AgoraIO-usecase) for more complicated real use case
- Repositories managed by developer communities can be found at [Agora Community](https://github.com/AgoraIO-Community)
- If you encounter problems during integration, feel free to ask questions in [Stack Overflow](https://stackoverflow.com/questions/tagged/agora.io)

## License

The sample projects are under the MIT license.
