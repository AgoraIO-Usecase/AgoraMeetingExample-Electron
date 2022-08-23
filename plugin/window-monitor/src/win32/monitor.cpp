#include "monitor.h"

#include <stdio.h>
#include <tchar.h>

#include <iostream>
#include <list>
#include <map>
#include <string>

namespace {
// pid:observer
static std::map<DWORD, HWINEVENTHOOK> _observers;
// pid:[wid:callback]
static std::map<
    DWORD, std::list<std::pair<agora::plugin::windowmonitor::WNDID,
                               agora::plugin::windowmonitor::EventCallback>>>
    _callbacks;

DWORD getWindowOwnerPid(agora::plugin::windowmonitor::WNDID wid) {
  DWORD pid = 0;
  GetWindowThreadProcessId(wid, &pid);
  return pid;
}

agora::plugin::windowmonitor::EventCallback findExistCallback(
    agora::plugin::windowmonitor::WNDID wid) {
  DWORD pid = getWindowOwnerPid(wid);
  if (pid == 0) return nullptr;

  auto &list = _callbacks[pid];
  for (auto &pair : list) {
    if (pair.first == wid) return pair.second;
  }

  return nullptr;
}
}  // namespace

namespace agora {
namespace plugin {
namespace windowmonitor {

// https://docs.microsoft.com/en-us/windows/win32/api/winuser/nc-winuser-wineventproc
// https://docs.microsoft.com/en-us/windows/win32/winauto/event-constants
void __stdcall Wineventproc(HWINEVENTHOOK hWinEventHook, DWORD event, HWND hwnd,
                            LONG idObject, LONG idChild, DWORD idEventThread,
                            DWORD dwmsEventTime) {
  EventCallback eventCallback = nullptr;
  EventType eventType = EventType::Unknown;
  std::string eventName;

  // only care about window events.
  if (!hwnd || (eventCallback = findExistCallback(hwnd)) == nullptr) {
    if (event == EVENT_OBJECT_SHOW || event == EVENT_OBJECT_HIDE)
      std::cout << "ignored event for window id: " << hwnd
                << " parent: " << GetParent(hwnd) << std::hex << " objId: " << idObject
                << " childObjId: " << idChild
                << " event: " << event
                << std::endl;
    return;
  }

  switch (event) {
    case EVENT_OBJECT_SHOW:
      eventName = "EVENT_OBJECT_SHOW";
      eventType = EventType::Shown;
      break;
    case EVENT_OBJECT_HIDE:
      eventName = "EVENT_OBJECT_HIDE";
      eventType = EventType::Hide;
      break;
    case EVENT_OBJECT_LOCATIONCHANGE:
      if (idObject == OBJID_CURSOR) return;
      eventName = "EVENT_OBJECT_LOCATIONCHANGE";

      WINDOWPLACEMENT wp;
      wp.length = sizeof(WINDOWPLACEMENT);
      if (GetWindowPlacement(hwnd, &wp) && SW_SHOWMAXIMIZED == wp.showCmd) {
        eventType = EventType::Maxmized;
      } else if (SW_SHOWNORMAL == wp.showCmd) {
        eventType = EventType::Moving;
      } else  // only care about maximized and show event here.
        return;
      break;
    case EVENT_SYSTEM_DESKTOPSWITCH:
      eventName = "EVENT_SYSTEM_DESKTOPSWITCH";
      break;
    case EVENT_SYSTEM_MOVESIZESTART:
      eventName = "EVENT_SYSTEM_MOVESIZESTART";
      break;
    case EVENT_SYSTEM_MOVESIZEEND:
      eventName = "EVENT_SYSTEM_MOVESIZEEND";
      eventType = EventType::Moved;
      break;
    case EVENT_SYSTEM_MINIMIZESTART:
      eventName = "EVENT_SYSTEM_MINIMIZESTART";
      eventType = EventType::Minimized;
      break;
    case EVENT_SYSTEM_MINIMIZEEND:
      eventName = "EVENT_SYSTEM_MINIMIZEEND";
      eventType = EventType::Restore;
      break;
    default:
      return;
  }

  if (eventType == EventType::Unknown) {
    std::cout << "unhandled system event for wnd: " << hwnd
              << " event: " << event << std::endl;
    return;
  }

  RECT rect;
  GetWindowRect(hwnd, &rect);

  std::cout << eventName << " " << (int)hwnd << " " << rect.left << " "
            << rect.top << " " << rect.right << " " << rect.bottom << std::endl;

  if (eventCallback)
    eventCallback(hwnd, eventType,
                  CRect((float)rect.left, (float)rect.top, (float)rect.right,
                        (float)rect.bottom));
}

int MONITOR_EXPORT registerWindowMonitorCallback(WNDID wid,
                                                 EventCallback callback) {
  ErrorCode code = ErrorCode::Success;
  do {
    if (findExistCallback(wid) != nullptr) {
      code = ErrorCode::AlreadyExist;
      break;
    }

    DWORD pid = 0;
    DWORD wThreadId = GetWindowThreadProcessId(wid, &pid);
    if (pid == 0) {
      code = ErrorCode::ApplicationNotFound;
      break;
    }

    HWINEVENTHOOK &hEventHook = _observers[pid];
    if (!hEventHook) {
      // through we already set thread id, but different windows have same
      // thread id in one process
      // https://docs.microsoft.com/zh-cn/windows/win32/api/winuser/nf-winuser-setwineventhook?redirectedfrom=MSDN
      hEventHook = SetWinEventHook(
          EVENT_MIN, EVENT_MAX, NULL, Wineventproc, pid, wThreadId,
          WINEVENT_OUTOFCONTEXT | WINEVENT_SKIPOWNPROCESS);
    }
    if (!hEventHook) {
      code = ErrorCode::CreateObserverFailed;
      break;
    }

    auto &list = _callbacks[pid];
    list.emplace_back(std::pair<WNDID, EventCallback>(wid, callback));
  } while (0);

  return code;
}

void MONITOR_EXPORT unregisterWindowMonitorCallback(WNDID wid) {
  if (findExistCallback(wid) == nullptr) return;

  auto pid = getWindowOwnerPid(wid);
  auto observer = _observers[pid];

  auto &list = _callbacks[pid];
  for (auto itr = list.begin(); itr != list.end(); itr++) {
    if (itr->first == wid) {
      list.erase(itr);
      break;
    }
  }

  if (observer && list.size() == 0) {
    UnhookWinEvent(observer);
    _observers[pid] = nullptr;
  }
}
}  // namespace windowmonitor
}  // namespace plugin
}  // namespace agora
