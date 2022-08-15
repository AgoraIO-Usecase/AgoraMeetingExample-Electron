#import <AppKit/NSAccessibility.h>
#import <Cocoa/Cocoa.h>

#include "base.h"

int registerWindowMonitorCallback(agora_pid pid, WindoeMonitorCallback callback) { return 0; }
void unregisterWindowMonitorCallback(agora_pid pid) {}

void onObserverCallback(AXObserverRef observer, AXUIElementRef element,
                        CFStringRef notificationName, void *refCon) {
  NSLog(@"windowCreatedCallback %@", notificationName);
}

void createApplicationObserver(NSString *bundleId) {
  NSLog(@"createApplicationObserver %@", bundleId);

  NSArray *apps = [NSRunningApplication runningApplicationsWithBundleIdentifier:bundleId];

  if ([apps count] == 0) {
    NSLog(@"matched zero app");
    return;
  }

  pid_t pid = [apps[0] processIdentifier];

  AXObserverRef observer = NULL;
  AXError axErr = AXObserverCreate(pid, onObserverCallback, &observer);
  if (axErr != kAXErrorSuccess) {
    NSLog(@"create observer error %d", axErr);
  }

  AXUIElementRef axElement = AXUIElementCreateApplication(pid);

  AXObserverAddNotification(observer, axElement, kAXWindowMovedNotification, NULL);    // moved
  AXObserverAddNotification(observer, axElement, kAXWindowResizedNotification, NULL);  // resized
  AXObserverAddNotification(observer, axElement, kAXWindowMiniaturizedNotification,
                            NULL);  // minimized in docker
  AXObserverAddNotification(observer, axElement, kAXWindowDeminiaturizedNotification,
                            NULL);  // unminimized from docker

  CFRunLoopAddSource(CFRunLoopGetCurrent(), AXObserverGetRunLoopSource(observer),
                     kCFRunLoopDefaultMode);
}
