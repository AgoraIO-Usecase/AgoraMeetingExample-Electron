#include "hooker.h"

#include "function_stub.h"

namespace agora {
namespace plugin {
namespace windowmonitor {

const std::vector<DWORD> WIN_EVENTS = {
    EVENT_OBJECT_SHOW,           EVENT_OBJECT_HIDE,
    EVENT_OBJECT_LOCATIONCHANGE, EVENT_SYSTEM_DESKTOPSWITCH,
    EVENT_SYSTEM_MOVESIZESTART,  EVENT_SYSTEM_MOVESIZEEND,
    EVENT_SYSTEM_MINIMIZESTART,  EVENT_SYSTEM_MINIMIZEEND};

Hooker::Hooker(HWND hwnd, HookerCallback callback)
    : hwnd_(hwnd), wid_(0), pid_(0), hookStub_(0), callback_(callback) {
  if (!hwnd_) return;

  wid_ = ::GetWindowThreadProcessId(hwnd_, &pid_);
  if (!pid_ || !wid_) return;

  hookStub_ =
      FunctionStub::Create(reinterpret_cast<uintptr_t>(this), WinEventProc);

  for (auto& event : WIN_EVENTS) {
    auto hook = ::SetWinEventHook(
        event, event, NULL, reinterpret_cast<WINEVENTPROC>(hookStub_->code()),
        pid_, wid_, WINEVENT_OUTOFCONTEXT | WINEVENT_SKIPOWNPROCESS);
    if (hook) hooks_.emplace_back(hook);
  }
}

Hooker::~Hooker() {
  for (auto& hook : hooks_) {
    ::UnhookWinEvent(hook);
  }

  FunctionStub::Destroy(hookStub_);
}

void __stdcall Hooker::WinEventProc(Hooker* me, HWINEVENTHOOK hWinEventHook,
                                    DWORD event, HWND hwnd, LONG idObject,
                                    LONG idChild, DWORD idEventThread,
                                    DWORD dwmsEventTime) {
  if (me->callback_) me->callback_(event, idObject, idChild);
}

}  // namespace windowmonitor
}  // namespace plugin
}  // namespace agora
