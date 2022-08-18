#include "napi_utils.h"

namespace agora {
namespace plugin {

napi_status napi_get_value_utf8string(napi_env& env, napi_value& value,
                                      std::string& str) {
  napi_status status;
  size_t length = 0;
  status = napi_get_value_string_utf8(env, value, nullptr, 0, &length);

  std::vector<char> strData;
  // https://github.com/nodejs/node-addon-examples/issues/83
  length += 1;
  strData.resize(length, '\0');

  size_t result = 0;
  status =
      napi_get_value_string_utf8(env, value, strData.data(), length, &result);
  str = strData.data();
  return status;
}

napi_status napi_obj_set_property(napi_env& env, napi_value& object,
                                  const char* utf8name, const int& value,
                                  int length) {
  napi_status status;
  napi_value n_value;
  status = napi_create_int32(env, value, &n_value);
  status = napi_set_named_property(env, object, utf8name, n_value);
  return status;
}

napi_status napi_obj_set_property(napi_env& env, napi_value& object,
                                  const char* utf8name,
                                  const std::string& value, int length) {
  napi_status status;
  napi_value n_value;
  status = napi_create_string_utf8(env, value.c_str(), strlen(value.c_str()),
                                   &n_value);
  status = napi_set_named_property(env, object, utf8name, n_value);
  return status;
}

napi_status napi_obj_set_property(napi_env& env, napi_value& object,
                                  const char* utf8name, const uint32_t& value,
                                  int length) {
  napi_status status;
  napi_value n_value;
  status = napi_create_uint32(env, value, &n_value);
  status = napi_set_named_property(env, object, utf8name, n_value);
  return status;
}

napi_status napi_obj_set_property(napi_env& env, napi_value& object,
                                  const char* utf8name, const float& value,
                                  int length) {
  napi_status status;
  napi_value n_value;
  status = napi_create_double(env, value, &n_value);
  status = napi_set_named_property(env, object, utf8name, n_value);
  return status;
}

napi_status napi_obj_set_property(napi_env& env, napi_value& object,
                                  const char* utf8name, const bool& value,
                                  int length) {
  napi_status status;
  napi_value n_value;
  status = napi_create_int32(env, value, &n_value);
  status = napi_set_named_property(env, object, utf8name, n_value);
  return status;
}

napi_status napi_obj_set_property(napi_env& env, napi_value& object,
                                  const char* utf8name, const double& value,
                                  int length) {
  napi_status status;
  napi_value n_value;
  status = napi_create_double(env, value, &n_value);
  status = napi_set_named_property(env, object, utf8name, n_value);
  return status;
}

napi_status napi_obj_set_property(napi_env& env, napi_value& object,
                                  const char* utf8name, const int64_t& value,
                                  int length) {
  napi_status status;
  napi_value n_value;
  status = napi_create_int64(env, value, &n_value);
  status = napi_set_named_property(env, object, utf8name, n_value);
  return status;
}

napi_status napi_obj_set_property(napi_env& env, napi_value& object,
                                  const char* utf8name, const uint64_t& value,
                                  int length) {
  napi_status status;
  napi_value n_value;
  status = napi_create_bigint_uint64(env, value, &n_value);
  status = napi_set_named_property(env, object, utf8name, n_value);
  return status;
}

napi_status napi_obj_set_property(napi_env& env, napi_value& object,
                                  const char* utf8name,
                                  const unsigned char* value, int length) {
  napi_status status;
  napi_value n_value;
  // just for get ArrayBuffer pointer.
  unsigned char* array_buffer = nullptr;
  status =
      napi_create_arraybuffer(env, length, (void**)&array_buffer, &n_value);
  memcpy(array_buffer, value, length);

  napi_value typed_array_value;
  status = napi_create_typedarray(env, napi_uint8_array, length, n_value, 0,
                                  &typed_array_value);
  status = napi_set_named_property(env, object, utf8name, typed_array_value);
  return status;
}

napi_status napi_obj_set_property(napi_env& env, napi_value& object,
                                  const char* utf8name, const napi_value& value,
                                  int length) {
  napi_status status;
  status = napi_set_named_property(env, object, utf8name, value);
  return status;
}

napi_status napi_obj_get_property(napi_env& env, napi_value& object,
                                  const char* utf8name, bool& result) {
  napi_status status;
  napi_value retValue;
  napi_get_named_property(env, object, utf8name, &retValue);
  status = napi_get_value_bool(env, retValue, &result);
  return status;
}

napi_status napi_obj_get_property(napi_env& env, napi_value& object,
                                  const char* utf8name, int& result) {
  napi_status status;
  napi_value retValue;
  napi_get_named_property(env, object, utf8name, &retValue);
  status = napi_get_value_int32(env, retValue, &result);
  return status;
}

napi_status napi_obj_get_property(napi_env& env, napi_value& object,
                                  const char* utf8name, uint32_t& result) {
  napi_status status;
  napi_value retValue;
  napi_get_named_property(env, object, utf8name, &retValue);
  status = napi_get_value_uint32(env, retValue, &result);
  return status;
}

napi_status napi_obj_get_property(napi_env& env, napi_value& object,
                                  const char* utf8name, uint64_t& result,
                                  bool* lossless) {
  napi_status status;
  napi_value retValue;
  napi_get_named_property(env, object, utf8name, &retValue);
  status = napi_get_value_bigint_uint64(env, retValue, &result, lossless);
  return status;
}

napi_status napi_obj_get_property(napi_env& env, napi_value& object,
                                  const char* utf8name, std::string& result) {
  napi_status status;
  napi_value retValue;
  napi_get_named_property(env, object, utf8name, &retValue);
  status = napi_get_value_utf8string(env, retValue, result);
  return status;
}

napi_status napi_obj_get_property(napi_env& env, napi_value& object,
                                  const char* utf8name, napi_value& result) {
  napi_status status;
  status = napi_get_named_property(env, object, utf8name, &result);
  return status;
}

napi_status napi_obj_get_property(napi_env& env, napi_value& object,
                                  const char* utf8name,
                                  std::vector<std::string>& result) {
  napi_status status;
  napi_value retValue;

  status = napi_get_named_property(env, object, utf8name, &retValue);
  if (status != napi_ok) return status;

  bool isArray = false;
  status = napi_is_array(env, retValue, &isArray);
  if (status != napi_ok || !isArray) return napi_array_expected;

  uint32_t length = 0;
  status = napi_get_array_length(env, retValue, &length);
  if (status != napi_ok || !length) return status;

  for (uint32_t index = 0; index < length; index++) {
    napi_value elementValue;
    status = napi_get_element(env, retValue, index, &elementValue);
    if (status != napi_ok) return status;

    std::string stringValue;
    status = napi_get_value_utf8string(env, elementValue, stringValue);
    if (status != napi_ok) return status;

    result.emplace_back(stringValue);
  }

  return status;
}

}  // namespace plugin
}  // namespace agora
