#import <AppKit/AppKit.h>
#import <AppKit/NSAccessibility.h>
#import "base.h"
#import "bridging.h"

#include <functional>
#include <list>
#include <map>

namespace agora {
namespace plugin {
namespace windowmonitor {

namespace {

// pid:observer
static std::map<int, AXObserverRef> _observers;
// pid:[wid:callback]
static std::map<int, std::list<std::pair<CGWindowID, EventCallback>>> _callbacks;

static const CFStringRef _NOTIFICATIONS[] = {
    kAXApplicationActivatedNotification, kAXApplicationDeactivatedNotification,
    kAXApplicationShownNotification,     kAXApplicationHiddenNotification,
    kAXWindowMovedNotification,          kAXWindowResizedNotification,
    kAXWindowMiniaturizedNotification,   kAXWindowDeminiaturizedNotification,
    kAXFocusedWindowChangedNotification};
static const int _NOTIFICATIONS_SIZE = sizeof(_NOTIFICATIONS) / sizeof(_NOTIFICATIONS[0]);

bool checkPrivileges() {
  bool result = false;
  const void *keys[] = {kAXTrustedCheckOptionPrompt};
  const void *values[] = {kCFBooleanTrue};

  CFDictionaryRef options;
  options =
      CFDictionaryCreate(kCFAllocatorDefault, keys, values, sizeof(keys) / sizeof(*keys),
                         &kCFCopyStringDictionaryKeyCallBacks, &kCFTypeDictionaryValueCallBacks);

  result = AXIsProcessTrustedWithOptions(options);
  CFRelease(options);

  return result;
}

bool getWindowRef(CGWindowID id, std::function<void(CFDictionaryRef)> onWindow) {
  CFArrayRef ids = CFArrayCreate(NULL, (const void **)&id, 1, NULL);
  CFArrayRef windows = CGWindowListCreateDescriptionFromArray(ids);
  bool result = false;
  if (windows && CFArrayGetCount(windows)) {
    onWindow((CFDictionaryRef)(CFArrayGetValueAtIndex(windows, 0)));
    result = true;
  }
  if (windows) {
    CFRelease(windows);
  }
  CFRelease(ids);
  return result;
}

int getWindowOwnerPid(CFDictionaryRef window) {
  CFNumberRef refPid =
      reinterpret_cast<CFNumberRef>(CFDictionaryGetValue(window, kCGWindowOwnerPID));
  if (!refPid) {
    return 0;
  }
  int pid;
  if (!CFNumberGetValue(refPid, kCFNumberIntType, &pid)) {
    return 0;
  }
  return pid;
}

int getWindowOwnerPid(CGWindowID id) {
  int pid;
  if (getWindowRef(id, [&pid](CFDictionaryRef window) { pid = getWindowOwnerPid(window); })) {
    return pid;
  }
  return 0;
}


CRect getWindowBounds(CFDictionaryRef window) {
  CFDictionaryRef window_bounds = reinterpret_cast<CFDictionaryRef>(
      CFDictionaryGetValue(window, kCGWindowBounds));
  if (!window_bounds) {
    return CRect();
  }
  CGRect gc_window_rect;
  if (!CGRectMakeWithDictionaryRepresentation(window_bounds, &gc_window_rect)) {
    return CRect();
  }
  return CRect(gc_window_rect.origin.x, gc_window_rect.origin.y,
               gc_window_rect.origin.x + gc_window_rect.size.width,
               gc_window_rect.origin.y + gc_window_rect.size.height);
}
CRect getWindowCRect(CGWindowID id) {
  CRect rect;
  if (getWindowRef(id, [&rect](CFDictionaryRef window) {
        rect = getWindowBounds(window);
      })) {
  }

  return rect;
}

AXUIElementRef createApplicationAXUIElement(int pid) {
  AXUIElementRef axApp = AXUIElementCreateApplication(pid);
  if (!axApp) {
    NSLog(@"can not create axuielement with %d", pid);
    return nullptr;
  }

  return axApp;
}

AXUIElementRef findWindowAXUIElement(AXUIElementRef axApp, CGWindowID id) {
  if (!axApp) return nullptr;

  CFArrayRef windows;
  AXUIElementCopyAttributeValue(axApp, kAXWindowsAttribute, (CFTypeRef *)&windows);
  if (windows) {
    for (int i = 0; i < CFArrayGetCount(windows); i++) {
      AXUIElementRef window = (AXUIElementRef)CFArrayGetValueAtIndex(windows, i);
      CGWindowID tempId = 0;
      _AXUIElementGetWindow(window, &tempId);
      if (tempId == id) {
        CFRetain(window);
        CFRelease(windows);
        return window;
      }
      NSLog(@"window id %d", tempId);
    }
  }

  if (windows) CFRelease(windows);

  return nullptr;
}

bool registerObserverNotifications(AXObserverRef observer, AXUIElementRef element) {
  for (int i = 0; i < _NOTIFICATIONS_SIZE; i++) {
    AXError axErr = AXObserverAddNotification(observer, element, _NOTIFICATIONS[i], NULL);
    if (axErr != kAXErrorSuccess) {
      NSLog(@"add notification %@ failed %d", _NOTIFICATIONS[i], axErr);
      return false;
    }
  }
  return true;
}

void unregisterObserverNotifications(AXObserverRef observer, AXUIElementRef element) {
  if (!observer || !element) return;

  for (int i = 0; i < _NOTIFICATIONS_SIZE; i++) {
    AXObserverRemoveNotification(observer, element, _NOTIFICATIONS[i]);
  }
}

EventCallback findExistCallback(CGWindowID id) {
  int pid = getWindowOwnerPid(id);
  if (pid == 0) return nullptr;

  auto &list = _callbacks[pid];
  for (auto &pair : list) {
    if (pair.first == id) return pair.second;
  }

  return nullptr;
}

void getElementCRect(AXUIElementRef element, CRect &rect) {
  CFTypeRef positionStorage;
  AXError axErr = AXUIElementCopyAttributeValue(element, kAXPositionAttribute, &positionStorage);
  if (positionStorage && axErr == kAXErrorSuccess) {
    NSPoint point;
    AXValueGetValue((AXValueRef)positionStorage, (AXValueType)kAXValueCGPointType, &point);
    rect.left = point.x;
    rect.top = point.y;
  }

  CFTypeRef sizeStorage;
  axErr = AXUIElementCopyAttributeValue(element, kAXSizeAttribute, &sizeStorage);
  if (sizeStorage && axErr == kAXErrorSuccess) {
    NSSize size;
    AXValueGetValue((AXValueRef)sizeStorage, (AXValueType)kAXValueCGSizeType, &size);
    rect.right = rect.left + size.width;
    rect.bottom = rect.top + size.height;
  }

  if (positionStorage) CFRelease(positionStorage);
  if (sizeStorage) CFRelease(sizeStorage);
}

void onObserverCallback(AXObserverRef observer, AXUIElementRef element,
                        CFStringRef notificationName, void *refCon) {
  int pId = 0;
  AXError axErr = AXUIElementGetPid(element, &pId);
  if (axErr != kAXErrorSuccess) {
    NSLog(@"get pid in observer callback failed %d", axErr);
    return;
  }

  CGWindowID winId = 0;
  axErr = _AXUIElementGetWindow(
      element,
      &winId);  // axErr will be not kAXErrorSuccess when notification is a application level

  EventType eventType = EventType::Unknown;
  CRect rect;

  NSLog(@"%d %d  %@", pId, winId, notificationName);

  auto &callbackList = _callbacks[pId];
  // application event should notificate to all windows
  if (axErr != kAXErrorSuccess || winId == 0) {
    if (kCFCompareEqualTo ==
            CFStringCompare(notificationName, kAXApplicationActivatedNotification, 0) ||
        kCFCompareEqualTo ==
            CFStringCompare(notificationName, kAXApplicationShownNotification, 0)) {
      eventType = EventType::Shown;
    } else if (kCFCompareEqualTo ==
                   CFStringCompare(notificationName, kAXApplicationDeactivatedNotification, 0) ||
               kCFCompareEqualTo ==
                   CFStringCompare(notificationName, kAXApplicationHiddenNotification, 0)) {
      eventType = EventType::Hide;
    }
    for (auto &pair : callbackList) {
      if (pair.second) {
        pair.second(pair.first, eventType, rect);
      }
    }
  } else {
    EventCallback targetCallback = nullptr;
    for (auto &pair : callbackList) {
      if (pair.first == winId && pair.second) {
        targetCallback = pair.second;
        break;
      }
    }

    if (kCFCompareEqualTo == CFStringCompare(notificationName, kAXWindowMovedNotification, 0)) {
      eventType = EventType::Moved;
    } else if (kCFCompareEqualTo ==
               CFStringCompare(notificationName, kAXWindowResizedNotification, 0)) {
      eventType = EventType::Resized;
    } else if (kCFCompareEqualTo ==
               CFStringCompare(notificationName, kAXWindowMiniaturizedNotification, 0)) {
      eventType = EventType::Minimized;
    } else if (kCFCompareEqualTo ==
               CFStringCompare(notificationName, kAXWindowDeminiaturizedNotification, 0)) {
      eventType = EventType::Restore;
    } else if (kCFCompareEqualTo ==
               CFStringCompare(notificationName, kAXFocusedWindowChangedNotification, 0)) {
      eventType = EventType::Focused;  // should notify others unfocused
      for (auto &pair : callbackList) {
        if (pair.first != winId) {
          pair.second(pair.first, EventType::UnFocused, getWindowCRect(pair.first));
        }
      }
    }

    if (targetCallback) {
      targetCallback(winId, eventType, getWindowCRect(winId));
    }
  }
}

}  // namespace

int MONITOR_EXPORT registerWindowMonitorCallback(WNDID id, EventCallback callback) {
  ErrorCode code = ErrorCode::Success;
  do {
    if (!checkPrivileges()) {
      code = ErrorCode::NoRights;
      break;
    }

    if (findExistCallback(id) != nullptr) {
      code = ErrorCode::AlreadyExist;
      break;
    }

    int pid = getWindowOwnerPid(id);
    if (pid == 0) {
      code = ErrorCode::ApplicationNotFound;
      break;
    }

    AXUIElementRef axApp = createApplicationAXUIElement(pid);
    if (!axApp) {
      code = ErrorCode::ApplicationNotFound;
      break;
    }

    AXUIElementRef axWindow = findWindowAXUIElement(axApp, id);
    if (!axWindow) {
      code = ErrorCode::WindowNotFound;
      break;
    }

    AXObserverRef observer = _observers[pid];
    if (!observer) {
      AXError axErr = AXObserverCreate(pid, onObserverCallback, &observer);
      if (axErr != kAXErrorSuccess) {
        NSLog(@"create observer error %d", axErr);
        observer = nullptr;
      } else {
        registerObserverNotifications(observer, axApp);
        CFRunLoopAddSource(CFRunLoopGetCurrent(), AXObserverGetRunLoopSource(observer),
                           kCFRunLoopDefaultMode);
        _observers[pid] = observer;
      }
    }

    if (!observer) {
      code = ErrorCode::CreateObserverFailed;
      break;
    }

    auto &list = _callbacks[pid];
    list.emplace_back(std::pair<CGWindowID, EventCallback>(id, callback));
  } while (0);

  return code;
}

void MONITOR_EXPORT unregisterWindowMonitorCallback(WNDID id) {
  if (findExistCallback(id) == nullptr) return;

  int pid = getWindowOwnerPid(id);
  auto observer = _observers[pid];
  auto axApp = createApplicationAXUIElement(pid);

  auto &list = _callbacks[pid];
  for (auto itr = list.begin(); itr != list.end(); itr++) {
    if (itr->first == id) {
      list.erase(itr);
      break;
    }
  }

  if (observer && list.size() == 0) {
    unregisterObserverNotifications(observer, axApp);
    CFRelease(observer);
    _observers[pid] = nullptr;
  }
}

// demo function
// createApplicationObserver(@"com.microsoft.Powerpoint");
// void createApplicationObserver(NSString *bundleId) {
//   bool ret = checkPrivileges();
//   NSLog(@"checkPrivileges %d", ret);

//   NSLog(@"createApplicationObserver %@", bundleId);

//   NSArray *apps = [NSRunningApplication runningApplicationsWithBundleIdentifier:bundleId];

//   if ([apps count] == 0) {
//     NSLog(@"matched zero app");
//     return;
//   }

//   pid_t pid = [apps[0] processIdentifier];
//   NSLog(@"createApplicationObserver %d", pid);

//   AXError axErr = AXObserverCreate(pid, onObserverCallback, &_observer);
//   if (axErr != kAXErrorSuccess) {
//     NSLog(@"create observer error %d", axErr);
//   }

//   AXUIElementRef axElement = AXUIElementCreateApplication(pid);
//   AXUIElementRef axWindowElement = nullptr;

//   CFArrayRef windowList;
//   AXUIElementCopyAttributeValue(axElement, kAXWindowsAttribute, (CFTypeRef *)&windowList);
//   if (windowList) {
//     for (int i = 0; i < CFArrayGetCount(windowList); i++) {
//       AXUIElementRef windowRef = (AXUIElementRef)CFArrayGetValueAtIndex(windowList, i);
//       CGWindowID window_id = 0;
//       _AXUIElementGetWindow(windowRef, &window_id);
//       if (window_id == 48360) {
//         axWindowElement = windowRef;
//         break;
//       }
//       NSLog(@"window id %d", window_id);
//     }
//   }

//   AXObserverAddNotification(_observer, axWindowElement, kAXWindowMovedNotification, NULL);  //
//   moved AXObserverAddNotification(_observer, axWindowElement, kAXWindowResizedNotification,
//                             NULL);  // resized
//   AXObserverAddNotification(_observer, axWindowElement, kAXWindowMiniaturizedNotification,
//                             NULL);  // minimized in docker
//   AXObserverAddNotification(_observer, axWindowElement, kAXWindowDeminiaturizedNotification,
//                             NULL);  // unminimized from docker

//   CFRunLoopAddSource(CFRunLoopGetCurrent(), AXObserverGetRunLoopSource(_observer),
//                      kCFRunLoopDefaultMode);
// }

}  // namespace windowmonitor
}  // namespace plugin
}  // namespace agora
