#include "monitor.h"

#include <stdio.h>
#include <tchar.h>

#include <iostream>
#include <list>
#include <map>
#include <string>

#include "hooker.h"

namespace {
static std::map<agora::plugin::windowmonitor::WNDID,
                std::unique_ptr<agora::plugin::windowmonitor::Hooker>>
    hookers_;

DWORD getWindowOwnerPid(agora::plugin::windowmonitor::WNDID wid) {
  DWORD pid = 0;
  GetWindowThreadProcessId(wid, &pid);
  return pid;
}

}  // namespace

namespace agora {
namespace plugin {
namespace windowmonitor {

// for multiple child process like chrome, all event will trigger for all
// hookers so we need to call functions to decide whether to trigger event or
// not such as GetWindowPlacement
// https://docs.microsoft.com/en-us/windows/win32/api/winuser/nc-winuser-wineventproc
// https://docs.microsoft.com/en-us/windows/win32/winauto/event-constants
void HookerCallback(EventCallback callback, WNDID hwnd, DWORD event,
                    LONG idObject, LONG idChild) {
  EventType eventType = EventType::Unknown;
  std::string eventName;

  switch (event) {
    case EVENT_OBJECT_SHOW: {
      if (idObject != OBJID_WINDOW || !::IsWindowVisible(hwnd)) return;
      WINDOWPLACEMENT wp;
      wp.length = sizeof(WINDOWPLACEMENT);
      if (GetWindowPlacement(hwnd, &wp) && SW_SHOWMINIMIZED == wp.showCmd)
        return;
      eventName = "EVENT_OBJECT_SHOW";
      eventType = EventType::Shown;
      break;
    }
    case EVENT_OBJECT_HIDE:
      if (idObject != OBJID_WINDOW) return;
      eventName = "EVENT_OBJECT_HIDE";
      eventType = EventType::Hide;
      break;
    case EVENT_OBJECT_LOCATIONCHANGE: {
      if (idObject == OBJID_CURSOR) return;
      eventName = "EVENT_OBJECT_LOCATIONCHANGE";

      WINDOWPLACEMENT wp;
      wp.length = sizeof(WINDOWPLACEMENT);
      if (GetWindowPlacement(hwnd, &wp) && SW_SHOWMAXIMIZED == wp.showCmd) {
        eventType = EventType::Maxmized;
      } else if (SW_SHOWNORMAL == wp.showCmd && idObject == OBJID_WINDOW) {
        eventType = EventType::Moving;
      } else  // only care about maximized and show event here.
        return;
      break;
    }
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
    case EVENT_SYSTEM_MINIMIZEEND: {
      WINDOWPLACEMENT wp;
      wp.length = sizeof(WINDOWPLACEMENT);
      if (GetWindowPlacement(hwnd, &wp) && SW_SHOWMINIMIZED == wp.showCmd)
        return;
      eventName = "EVENT_SYSTEM_MINIMIZEEND";
      eventType = EventType::Restore;
      break;
    }
    default:
      return;
  }

  if (eventType == EventType::Unknown) {
    std::cout << "unhandled system event for wnd: " << hwnd
              << " event: " << event << std::endl;
    return;
  }

  if (callback) {
    CRect crect;
    getWindowRect(hwnd, crect);
    callback(hwnd, eventType, crect);
  }
}

bool MONITOR_EXPORT checkPrivileges() { return true; }

int MONITOR_EXPORT registerWindowMonitorCallback(WNDID wid,
                                                 EventCallback callback) {
  if (hookers_.find(wid) != hookers_.end()) {
    return ErrorCode::AlreadyExist;
  }

  auto hooker = new Hooker(
      wid, std::bind(&HookerCallback, callback, wid, std::placeholders::_1,
                     std::placeholders::_2, std::placeholders::_3));

  if (!hooker->HaveHooks()) {
    delete hooker;
    return ErrorCode::CreateObserverFailed;
  }

  hookers_[wid].reset(hooker);

  // trigger it immediately
  if (callback) {
    CRect crect;
    getWindowRect(wid, crect);
    callback(wid, EventType::Moved, crect);
  }

  return ErrorCode::Success;
}

void MONITOR_EXPORT unregisterWindowMonitorCallback(WNDID wid) {
  std::map<WNDID, std::unique_ptr<Hooker>>::iterator itr;
  if ((itr = hookers_.find(wid)) == hookers_.end()) return;

  hookers_.erase(itr);
}

int MONITOR_EXPORT getWindowRect(WNDID id, CRect& crect) {
  RECT rect;
  ::GetWindowRect(id, &rect);

  // https://docs.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getdpiforwindow
  float dpi = (float)::GetDpiForWindow(id);
  if (dpi != 0)
    crect =
        CRect((float)rect.left * 96.f / dpi, (float)rect.top * 96.f / dpi,
              (float)rect.right * 96.f / dpi, (float)rect.bottom * 96.f / dpi);
  else
    crect = CRect((float)rect.left, (float)rect.top, (float)rect.right,
                  (float)rect.bottom);

  return ErrorCode::Success;
}

}  // namespace windowmonitor
}  // namespace plugin
}  // namespace agora
