# CMakeList.txt : CMake project, include source and define
# project specific logic here.
#
cmake_minimum_required(VERSION 3.21)
project("window-monitor")

set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CONFIGURATION_TYPES "Debug;Release" CACHE STRING "" FORCE)

function(enum_files target_path target_extension results)
    file(GLOB TARGET_FILES "${target_path}/*.${target_extension}")
    set(${results} ${TARGET_FILES} PARENT_SCOPE)
endfunction(enum_files)

set(_LOCAL_SOURCES)
if(WIN32)
    if(NOT MSVC)
        message(FATAL_ERROR "Only support build with msvc for now!")
    endif()

    # this will always build with arch x86
    # set(CMAKE_EXE_LINKER_FLAGS "/machine:x86")
    if(CMAKE_CL_64)
        message(FATAL_ERROR "Only support build with x86 target for now, please excute cmake with option \"-A Win32\"")
    elseif((CMAKE_GENERATOR MATCHES "ARM") OR ("${arch_hint}" STREQUAL "ARM") OR (CMAKE_VS_EFFECTIVE_PLATFORMS MATCHES "ARM|arm"))
        message(FATAL_ERROR "Only support build with x86 target for now, please excute cmake with option \"-A Win32\"")
    endif()

    aux_source_directory("./src/win32" _LOCAL_SOURCES)
elseif(UNIX AND NOT ANDROID AND NOT APPLE)
    message(FATAL_ERROR "Not support this platform!")
elseif(APPLE)
    if(NOT IOS)
      aux_source_directory("./src/macos" _LOCAL_SOURCES)
    else()
        message(FATAL_ERROR "Not support this platform!")
    endif()
elseif(ANDROID)
    message(FATAL_ERROR "Not support this platform!")
endif()

# Public include
set(_LOCAL_PUBLIC_HEADERS_DIR ${CMAKE_SOURCE_DIR}/include)
set(_LOCAL_PUBLIC_HEADERS)
enum_files(${_LOCAL_PUBLIC_HEADERS_DIR} "h" _LOCAL_PUBLIC_HEADERS)

message(STATUS "_LOCAL_PUBLIC_HEADERS_DIR: " ${_LOCAL_PUBLIC_HEADERS_DIR})
message(STATUS "_LOCAL_PUBLIC_HEADERS: " ${_LOCAL_PUBLIC_HEADERS})

# Target Section
add_library(monitor STATIC ${_LOCAL_SOURCES} ${_LOCAL_PUBLIC_HEADERS})
target_include_directories(monitor PUBLIC ${_LOCAL_PUBLIC_HEADERS_DIR})
set_target_properties(monitor PROPERTIES PUBLIC_HEADER ${_LOCAL_PUBLIC_HEADERS})

if(APPLE)
    target_link_libraries(monitor PRIVATE "-framework Foundation" "-framework Cocoa" "-framework HIServices")
    set_target_properties(monitor PROPERTIES
        FRAMEWORK TRUE
        FRAMEWORK_VERSION A
        MACOSX_FRAMEWORK_IDENTIFIER io.agora.plugins.windowmonitor
    )
endif()

# Install section
set(CMAKE_INSTALL_PREFIX "${CMAKE_SOURCE_DIR}/install")

INSTALL(TARGETS monitor
    RUNTIME DESTINATION bin
    LIBRARY DESTINATION lib
    ARCHIVE DESTINATION lib
    FRAMEWORK DESTINATION bin
)
