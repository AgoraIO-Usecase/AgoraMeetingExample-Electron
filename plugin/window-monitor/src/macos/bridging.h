#ifndef AGORA_WINDOW_MONITOR_BRIDGING_H
#define AGORA_WINDOW_MONITOR_BRIDGING_H

#import <AppKit/AppKit.h>
#import <AppKit/NSAccessibility.h>

// undocumented function have risk to be refused to publish your app on appstore
extern "C" AXError _AXUIElementGetWindow(AXUIElementRef element,
                                     CGWindowID *identifier);

#endif  // AGORA_WINDOW_MONITOR_BRIDGING_H
