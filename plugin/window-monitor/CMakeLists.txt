# CMakeList.txt : CMake project, include source and define
# project specific logic here.
#
cmake_minimum_required(VERSION 3.21)
project("window-monitor")

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CONFIGURATION_TYPES "Debug;Release" CACHE STRING "" FORCE)

function(enum_files target_path target_extension results)
    file(GLOB TARGET_FILES "${target_path}/*.${target_extension}")
    set(${results} ${TARGET_FILES} PARENT_SCOPE)
endfunction(enum_files)

# set(CMAKE_EXE_LINKER_FLAGS "/machine:x86")
set(_LOCAL_ARCH)
if(CMAKE_CL_64)
  set(_LOCAL_ARCH "x64")
  message(FATAL_ERROR "Only support build with x86 target for now, please excute cmake with option \"-A Win32\"")
elseif((CMAKE_GENERATOR MATCHES "ARM") OR ("${arch_hint}" STREQUAL "ARM") OR (CMAKE_VS_EFFECTIVE_PLATFORMS MATCHES "ARM|arm"))
  set(_LOCAL_ARCH "arm")
  message(FATAL_ERROR "Only support build with x86 target for now, please excute cmake with option \"-A Win32\"")
else()
  set(_LOCAL_ARCH "x86")
endif()

message(STATUS "_LOCAL_ARCH: " ${_LOCAL_ARCH})

set(_IS_Win32 FALSE)
set(_IS_MacOS FALSE)
set(_IS_IOS FALSE)
set(_IS_ANDROID FALSE)
set(_IS_UNIX FALSE)
set(_LOCAL_SOURCES)
if(WIN32)
    set(_IS_Win32 TRUE)
    if(NOT MSVC)
        message(FATAL_ERROR "Only support build with msvc for now!")
    endif()
    aux_source_directory("./src/win32" _LOCAL_SOURCES)
elseif(UNIX AND NOT ANDROID AND NOT APPLE)
    set(_IS_UNIX TRUE)
    message(FATAL_ERROR "Not support this platform!")
elseif(APPLE)
    if(NOT IOS)
      set(_IS_MacOS TRUE)
      aux_source_directory("./src/macos" _LOCAL_SOURCES)
    else()
        set(_IS_IOS TRUE)
        message(FATAL_ERROR "Not support this platform!")
    endif()
elseif(ANDROID)
    set(_IS_ANDROID TRUE)
    message(FATAL_ERROR "Not support this platform!")
endif()

message(STATUS "_IS_Win32: ${_IS_Win32} _IS_MacOS: ${_IS_MacOS} _IS_IOS: ${_IS_IOS} _IS_ANDROID: ${_IS_ANDROID} _IS_UNIX: ${_IS_UNIX}")

# Platform options
if(_IS_MacOS)
  set(CMAKE_OSX_DEPLOYMENT_TARGET 10.14)
  # set(CMAKE_MACOSX_RPATH TRUE)
  # set(CMAKE_SKIP_BUILD_RPATH  FALSE)
  # set(CMAKE_BUILD_WITH_INSTALL_RPATH TRUE)
  # set(CMAKE_INSTALL_RPATH_USE_LINK_PATH TRUE)
  # set(CMAKE_INSTALL_NAME_DIR "@rpath/")
endif()

# Target Section
add_library(monitor SHARED ${_LOCAL_SOURCES})

# Export include
include(GenerateExportHeader)
generate_export_header(monitor EXPORT_FILE_NAME "${CMAKE_SOURCE_DIR}/include/export.h")

# Public include
set(_LOCAL_PUBLIC_HEADERS_DIR ${CMAKE_SOURCE_DIR}/include)
set(_LOCAL_PUBLIC_HEADERS)
enum_files(${_LOCAL_PUBLIC_HEADERS_DIR} "h" _LOCAL_PUBLIC_HEADERS)

message(STATUS "_LOCAL_PUBLIC_HEADERS_DIR: " ${_LOCAL_PUBLIC_HEADERS_DIR})
message(STATUS "_LOCAL_PUBLIC_HEADERS: " ${_LOCAL_PUBLIC_HEADERS})

# Target properties
target_include_directories(monitor PRIVATE ${_LOCAL_PUBLIC_HEADERS_DIR})
# set_target_properties(monitor PROPERTIES PUBLIC_HEADER "${_LOCAL_PUBLIC_HEADERS}")

if(_IS_MacOS)
    target_link_libraries(monitor PRIVATE "-framework AppKit"
      "-framework Foundation")
    set_target_properties(monitor PROPERTIES
        FRAMEWORK TRUE
        FRAMEWORK_VERSION A
        MACOSX_FRAMEWORK_IDENTIFIER io.agora.windowmonitor
        PUBLIC_HEADER "${_LOCAL_PUBLIC_HEADERS}"
        XCODE_ATTRIBUTE_CODE_SIGN_IDENTITY "Mac Developer"
    )
endif()

# Install section
set(CMAKE_INSTALL_PREFIX "${CMAKE_SOURCE_DIR}/install")

INSTALL(TARGETS monitor
    RUNTIME DESTINATION bin
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib
    PUBLIC_HEADER DESTINATION include
    FRAMEWORK DESTINATION .
)


# Test section
add_executable(test "${CMAKE_SOURCE_DIR}/test/main.mm")
target_include_directories(test PRIVATE ${_LOCAL_PUBLIC_HEADERS_DIR})
target_link_libraries(test monitor "-framework Foundation" "-framework Cocoa")
