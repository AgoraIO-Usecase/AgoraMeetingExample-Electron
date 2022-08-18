#include "napi_async.h"

namespace agora {
namespace plugin {

node_async_call node_async_call::s_instance_;

node_async_call::node_async_call() {
  node_queue_.reset(new async_queue<task_type>(
      uv_default_loop(),
      std::bind(&node_async_call::run_task, this, std::placeholders::_1)));
}

node_async_call::~node_async_call() {}

}  // namespace plugin
}  // namespace agora
