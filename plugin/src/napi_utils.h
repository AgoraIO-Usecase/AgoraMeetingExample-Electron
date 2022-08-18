#ifndef AGORA_PLUGIN_NAPI_UTILS_H_
#define AGORA_PLUGIN_NAPI_UTILS_H_

#include <node_api.h>
#include <node_buffer.h>

#include <memory>
#include <string>
#include <vector>

namespace agora {
namespace plugin {

#define NAPI_CALL(env, call)                                             \
  do {                                                                   \
    napi_status status = (call);                                         \
    if (status != napi_ok) {                                             \
      const napi_extended_error_info* error_info = NULL;                 \
      napi_get_last_error_info((env), &error_info);                      \
      const char* err_message = error_info->error_message;               \
      bool is_pending;                                                   \
      napi_is_exception_pending((env), &is_pending);                     \
      if (!is_pending) {                                                 \
        const char* message =                                            \
            (err_message == NULL) ? "empty error message" : err_message; \
        napi_throw_error((env), NULL, message);                          \
        return NULL;                                                     \
      }                                                                  \
    }                                                                    \
  } while (0)

#define NAPI_CALL_NORETURN(env, call)                                  \
  do {                                                                 \
    napi_status status = (call);                                       \
    if (status != napi_ok) {                                           \
      const napi_extended_error_info* error_info = NULL;               \
      napi_get_last_error_info((env), &error_info);                    \
      const char* err_message = error_info->error_message;             \
      bool is_pending;                                                 \
      napi_is_exception_pending((env), &is_pending);                   \
      const char* message =                                            \
          (err_message == NULL) ? "empty error message" : err_message; \
      if (!is_pending) {                                               \
        napi_throw_error((env), NULL, message);                        \
        return;                                                        \
      }                                                                \
    }                                                                  \
  } while (0)

#define NAPI_DEFINE_FUNC(env, object, call, name)                              \
  do {                                                                         \
    napi_value fn;                                                             \
    NAPI_CALL(env, napi_create_function(env, nullptr, 0, call, nullptr, &fn)); \
    NAPI_CALL(env, napi_set_named_property(env, object, name, fn));            \
  } while (0)

#define DECLARE_NAPI_METHOD(name, func) \
  { name, 0, func, 0, 0, 0, napi_default, 0 }

#define RETURE_NAPI_OBJ()                                         \
  napi_value retObj;                                              \
  status = napi_create_object(env, &retObj);                      \
  std::string resultStr = std::string(result);                    \
  napi_obj_set_property(env, retObj, _ret_code_str, ret);         \
  napi_obj_set_property(env, retObj, _ret_result_str, resultStr); \
  return retObj

napi_status napi_get_value_utf8string(napi_env& env, napi_value& value,
                                      std::string& str);

napi_status napi_obj_set_property(napi_env& env, napi_value& object,
                                  const char* utf8name, const int& value,
                                  int length = 0);

napi_status napi_obj_set_property(napi_env& env, napi_value& object,
                                  const char* utf8name,
                                  const std::string& value, int length = 0);

napi_status napi_obj_set_property(napi_env& env, napi_value& object,
                                  const char* utf8name, const uint32_t& value,
                                  int length = 0);

napi_status napi_obj_set_property(napi_env& env, napi_value& object,
                                  const char* utf8name, const float& value,
                                  int length = 0);

napi_status napi_obj_set_property(napi_env& env, napi_value& object,
                                  const char* utf8name, const bool& value,
                                  int length = 0);

napi_status napi_obj_set_property(napi_env& env, napi_value& object,
                                  const char* utf8name, const double& value,
                                  int length = 0);

napi_status napi_obj_set_property(napi_env& env, napi_value& object,
                                  const char* utf8name, const int64_t& value,
                                  int length = 0);

napi_status napi_obj_set_property(napi_env& env, napi_value& object,
                                  const char* utf8name, const uint64_t& value,
                                  int length = 0);

napi_status napi_obj_set_property(napi_env& env, napi_value& object,
                                  const char* utf8name,
                                  const unsigned char* value, int length = 0);

napi_status napi_obj_set_property(napi_env& env, napi_value& object,
                                  const char* utf8name, const napi_value& value,
                                  int length = 0);

napi_status napi_obj_get_property(napi_env& env, napi_value& object,
                                  const char* utf8name, bool& result);

napi_status napi_obj_get_property(napi_env& env, napi_value& object,
                                  const char* utf8name, int& result);

napi_status napi_obj_get_property(napi_env& env, napi_value& object,
                                  const char* utf8name, uint32_t& result);

napi_status napi_obj_get_property(napi_env& env, napi_value& object,
                                  const char* utf8name, uint64_t& result,
                                  bool* lossless);

napi_status napi_obj_get_property(napi_env& env, napi_value& object,
                                  const char* utf8name, std::string& result);

napi_status napi_obj_get_property(napi_env& env, napi_value& object,
                                  const char* utf8name, napi_value& result);

napi_status napi_obj_get_property(napi_env& env, napi_value& object,
                                  const char* utf8name,
                                  std::vector<std::string>& result);

}  // namespace plugin
}  // namespace agora

#endif  // AGORA_PLUGIN_NAPI_UTILS_H_
