#include <stdio.h>
#include <stdlib.h>

#if defined(_WIN32)
#include <Windows.h>
#elif defined(__APPLE__)
#include <Foundation/Foundation.h>
#endif

#include "../include/monitor.h"

using namespace agora::plugin;

void onWindowMonitorCallback(windowmonitor::WNDID id,
                             windowmonitor::EventType evt,
                             windowmonitor::CRect rect) {
  printf("on window monitor event: %d %d %02f %02f %02f %02f \r\n", id, evt,
         rect.left, rect.top, rect.right, rect.bottom);
}

int main() {
  int ret = windowmonitor::registerWindowMonitorCallback(
      (windowmonitor::WNDID)2491936, onWindowMonitorCallback);
  printf("register result %d\r\n", ret);

  ret = windowmonitor::registerWindowMonitorCallback(
      (windowmonitor::WNDID)21365946, onWindowMonitorCallback);
  printf("register result %d\r\n", ret);

  ret = windowmonitor::registerWindowMonitorCallback(
      (windowmonitor::WNDID)853288, onWindowMonitorCallback);
  printf("register result %d\r\n", ret);

#if defined(_WIN32)
  MSG msg;

  while (GetMessage(&msg, NULL, 0, 0)) {
    TranslateMessage(&msg);
    DispatchMessage(&msg);
  }

  return msg.wParam;
#elif defined(__APPLE__)
  CFRunLoopRun();
#endif

  return 0;
}
