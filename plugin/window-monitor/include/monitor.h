#ifndef AGORA_WINDOW_MONITOR_BASE_H
#define AGORA_WINDOW_MONITOR_BASE_H

#if defined(_WIN32)
#include <Windows.h>
#endif
#include <stdlib.h>

#include "export.h"

namespace agora {
namespace plugin {
namespace windowmonitor {

typedef enum _ErrorCode{
  Success = 0,
  NoRights,
  AlreadyExist,
  ApplicationNotFound,
  WindowNotFound,
  CreateObserverFailed
} ErrorCode;

/**
 * @brief Window monitor event type.
 */
typedef enum _EventType{
  Unknown = 0,
  Focused,
  UnFocused,
  Moved,
  Moving,
  Resized,
  Shown,
  Hide,
  Minimized,
  Maxmized,
  Restore,
} EventType;

/**
 * @brief Window monitor unique identifier of window.
 */
#if defined(_WIN32)
typedef HWND WNDID;
#elif defined(__APPLE__)
typedef uint32_t WNDID;
#endif

/**
 * @brief Window monitor window position rect.
 */
typedef struct _CRECT {
  float left;
  float top;
  float right;
  float bottom;
  _CRECT() : left(0.0), top(0.0), right(0.0), bottom(0.0) {}
  _CRECT(float left, float top, float right, float bottom)
      : left(left), top(top), right(right), bottom(bottom) {}
} CRect;

/**
 * @brief Window monitor event callback.
 */
typedef void (*EventCallback)(WNDID, EventType, CRect);

#ifdef __cplusplus
extern "C" {
#endif

/**
 * @brief Register a callback function with specified window id.
 *
 * @param id Window id.
 * @param callback Callback function.
 * @return Zero for success, others for error codes.
 */
int MONITOR_EXPORT registerWindowMonitorCallback(WNDID id,
                                                 EventCallback callback);

/**
 * @brief Unregister callback function with specified window id.
 *
 * @param id Window id.
 */
void MONITOR_EXPORT unregisterWindowMonitorCallback(WNDID id);

#ifdef __cplusplus
}
#endif  // __cplusplus

}  // namespace windowmonitor
}  // namespace plugin
}  // namespace agora

#endif  // AGORA_WINDOW_MONITOR_BASE_H

// #if defined(_WIN32)
// #define WIN32_LEAN_AND_MEAN
// #include <Windows.h>
// #define RAY_CALL __cdecl
// #if defined(RAY_EXPORT)
// #define RAY_API extern "C" __declspec(dllexport)
// #else
// #define RAY_API extern "C" __declspec(dllimport)
// #endif
// #elif defined(__APPLE__)
// #include <TargetConditionals.h>
// #define RAY_API __attribute__((visibility("default")))
// #define RAY_CALL
// #elif defined(__ANDROID__) || defined(__linux__)
// #define RAY_API extern "C" __attribute__((visibility("default")))
// #define RAY_CALL
// #else
// #define RAY_API extern "C"
// #define RAY_CALL
// #endif
