#ifndef AGORA_WINDOW_MONITOR
#define AGORA_WINDOW_MONITOR

enum WindowMonitorEvent {
  Moved,
  Moving,
  Resizing,
  Resized,
  Shown,
  Hide,
  Minimized,
  Maxmized,
  FullScreen,
  Restore
};

#if defined(_WIN32)
typedef uint32_t agora_pid;
#elif defined(__APPLE__)
typedef pid_t agora_pid;
#endif

typedef struct {
  int left;
  int top;
  int right;
  int bottom;
} WindowMonitorCRect;

typedef void (*WindoeMonitorCallback)(agora_pid, enum WindowMonitorEvent,
                                      WindowMonitorCRect);

#if defined(_WIN32)
#define WIN32_LEAN_AND_MEAN
#include <Windows.h>
#define RAY_CALL __cdecl
#if defined(RAY_EXPORT)
#define RAY_API extern "C" __declspec(dllexport)
#else
#define RAY_API extern "C" __declspec(dllimport)
#endif
#elif defined(__APPLE__)
#include <TargetConditionals.h>
#define RAY_API __attribute__((visibility("default")))
#define RAY_CALL
#elif defined(__ANDROID__) || defined(__linux__)
#define RAY_API extern "C" __attribute__((visibility("default")))
#define RAY_CALL
#else
#define RAY_API extern "C"
#define RAY_CALL
#endif

#ifdef __cplusplus
extern "C" {
#endif

int RAY_API RAY_CALL
registerWindowMonitorCallback(agora_pid pid, WindoeMonitorCallback callback);
void RAY_API RAY_CALL unregisterWindowMonitorCallback(agora_pid pid);

#ifdef __cplusplus
}
#endif  // __cplusplus
#endif  // AGORA_WINDOW_MONITOR
