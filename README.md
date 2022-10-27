# AgoraMeetingExample-Electron

_**其他语言版本：** [**简体中文**](README.zh.md)_

## Overview

The AgoraMeetingExample-Electron project is an open-source demo that will show you meeting sence on how to integrate Agora SDK APIs into your project.

## Support

- Manage and test devices
- Audio and video Conferencing
- Attendee list with media status
- Speaker and grid layouts
- ScreenShare
- Whiteboard
- Voice activated
- Native addon to follow PPT and position changed event of target window on focus mode

## Todo
- Real-time Messaging
- Conference Control

## How to run the sample project

#### Developer Environment Requirements

- Agora.io [Developer Account](https://dashboard.agora.io/signin/)
- [Node.js](https://nodejs.org/en/download/) >= 14.16.0 < 15
- [Yarn](https://yarnpkg.com/) package manager >= 1.17.3
- [CMake](https://cmake.org/download/) native-addon compiler >= 3.21
- [Xcode](https://developer.apple.com/download/all/?q=Xcode) for macOS
- [Vistual Studio](https://visualstudio.microsoft.com/downloads/)(at least vs2017) or [windows-build-tools](https://www.npmjs.com/package/windows-build-tools) for Windows

#### Notice

- Please double check your local environment with the above requeirements, especially versions of Node and Yarn
- Please add the absolute path of the directory which you want to put pptmonitor.exe to the exclusionpath list of Windows Defender if 
you want to use the function of tracking slide index of powerpoint.
``` shell
$ powershell -inputformat none -outputformat none -NonInteractive -Command Add-MpPreference -ExclusionPath XXXXX\ExtraResources
```
- As we provided native addon module from [v1.4.0](https://github.com/AgoraIO-Usecase/AgoraMeetingExample-Electron/releases/tag/v1.4.0),you must install the native build tools if you want to run sample code from sources,learn more about how to compile native addon from [node-gyp 8.3.0](https://github.com/nodejs/node-gyp/tree/v8.3.0)

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
