#include <stdio.h>
#include <stdlib.h>

#import <Foundation/Foundation.h>
#include "../include/base.h"

void onWindowMonitorCallback(agora::plugin::windowmonitor::WNDID id,
                             agora::plugin::windowmonitor::EventType evt,
                             agora::plugin::windowmonitor::CRect rect) {
  printf("on window monitor event: %d %d %02f %02f %02f %02f \r\n", id, evt, rect.left, rect.top,
         rect.right, rect.bottom);
}

int main() {
  int ret = agora::plugin::windowmonitor::registerWindowMonitorCallback(59487, onWindowMonitorCallback);
  printf("register result %d\r\n", ret);

  ret = agora::plugin::windowmonitor::registerWindowMonitorCallback(59510, onWindowMonitorCallback);
  printf("register result %d\r\n", ret);

  CFRunLoopRun();

  return 0;
}
