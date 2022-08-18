#ifndef AGORA_PLUGIN_NAPI_EVENT_H_
#define AGORA_PLUGIN_NAPI_EVENT_H_

#include <node_api.h>

#include <map>
#include <memory>
#include <unordered_map>

#include "napi_async.h"
#include "napi_utils.h"

namespace agora {
namespace plugin {

// const int argc = 2;
// Fire(NODE_VALORAN_EVENTS::kMediaUserMajorChange, argc,
//      [=](napi_env& env, napi_value argv[]) {
//        PackageNodeUser(env, argv[0], user);

//        NAPI_CALL_NORETURN(env, napi_create_int32(env, reason, &argv[1]));
//      });

template <typename KEY>
class NodeValoranEventBase {
 public:
  class NodeValoranEventRef {
   public:
    NodeValoranEventRef(const napi_env& env, const napi_value& cb,
                        const napi_value& global)
        : env_(env), ref_(0) {
      if (env_ && cb) {
        NAPI_CALL_NORETURN(env_, napi_create_reference(env_, cb, 1, &ref_));
      }
    }
    ~NodeValoranEventRef() {
      if (env_ && ref_) {
        NAPI_CALL_NORETURN(env_, napi_delete_reference(env_, ref_));
      }
    }

    napi_env env_;
    napi_ref ref_;
  };

  virtual ~NodeValoranEventBase() { callbacks_.clear(); }

  virtual void AddEvent(const KEY& key, const napi_env& env,
                        const napi_value& cb, const napi_value& global) {
    callbacks_[key] = std::make_unique<NodeValoranEventRef>(env, cb, global);
  }

  virtual void RemoveEvent(const KEY& key) {
    auto itr = callbacks_.find(key);
    if (itr != callbacks_.end()) callbacks_.erase(itr);
  }

  using NodeValoranEventPackCallback =
      std::function<void(napi_env& env, napi_value argv[])>;

  virtual void Fire(const KEY& key, const int argc,
                    NodeValoranEventPackCallback callback) {
    node_async_call::async_call([this, key, argc, callback] {
      auto itr = callbacks_.find(key);
      if (itr == callbacks_.end()) return;

      napi_handle_scope scope;
      NAPI_CALL_NORETURN(itr->second->env_,
                         napi_open_handle_scope(itr->second->env_, &scope));

      napi_value* argv = nullptr;
      if (argc) {
        argv = new napi_value[argc];
        callback(itr->second->env_, argv);
      }

      napi_value unrefed_cb;
      NAPI_CALL_NORETURN(
          itr->second->env_,
          napi_get_reference_value(itr->second->env_, itr->second->ref_,
                                   &unrefed_cb));
      napi_value cb_returned_value;
      NAPI_CALL_NORETURN(
          itr->second->env_,
          napi_get_undefined(itr->second->env_, &cb_returned_value));

      napi_value result;
      NAPI_CALL_NORETURN(
          itr->second->env_,
          napi_call_function(itr->second->env_, cb_returned_value, unrefed_cb,
                             argc, argv, &result));

      if (argv) delete[] argv;

      NAPI_CALL_NORETURN(itr->second->env_,
                         napi_close_handle_scope(itr->second->env_, scope));
    });
  }

 private:
  std::unordered_map<KEY, std::unique_ptr<NodeValoranEventRef>> callbacks_;
};

}  // namespace plugin
}  // namespace agora

#endif  // AGORA_PLUGIN_NAPI_EVENT_H_
