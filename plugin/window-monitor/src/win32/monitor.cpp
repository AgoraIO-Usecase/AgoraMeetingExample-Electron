#include "monitor.h"

namespace agora {
namespace plugin {
namespace windowmonitor {

int MONITOR_EXPORT registerWindowMonitorCallback(WNDID id,
                                                 EventCallback callback) {
  return 0;
}

void MONITOR_EXPORT unregisterWindowMonitorCallback(WNDID id) { void; }


}  // namespace windowmonitor
}  // namespace plugin
}  // namespace agora
