#ifndef AGORA_PLUGIN_WINDOW_MONITOR_HOOKER_H
#define AGORA_PLUGIN_WINDOW_MONITOR_HOOKER_H

#include <Windows.h>

#include <functional>
#include <vector>

struct FunctionStub;

namespace agora {
namespace plugin {
namespace windowmonitor {

class Hooker {
 public:
  Hooker() = delete;
  Hooker(const Hooker&) = delete;

  using HookerCallback =
      std::function<void(DWORD event, LONG idObject, LONG idChild)>;

  Hooker(HWND hwnd, HookerCallback callback);
  ~Hooker();

  bool HaveHooks() { return !hooks_.empty(); }

 private:
  // coz we can not get correct hwnd when the event is EVENT_OBJECT_SHOW and
  // EVENT_OBJECT_HIDE. so we use the FunctionStub to combine Hooker with
  // callback function
  static void CALLBACK WinEventProc(Hooker* me, HWINEVENTHOOK hWinEventHook,
                                    DWORD event, HWND hwnd, LONG idObject,
                                    LONG idChild, DWORD idEventThread,
                                    DWORD dwmsEventTime);

 private:
  HWND hwnd_;
  DWORD wid_;
  DWORD pid_;

  struct FunctionStub* hookStub_;
  std::vector<HWINEVENTHOOK> hooks_;

  HookerCallback callback_;
};

}  // namespace windowmonitor
}  // namespace plugin
}  // namespace agora

#endif  // AGORA_PLUGIN_WINDOW_MONITOR_HOOKER_H
