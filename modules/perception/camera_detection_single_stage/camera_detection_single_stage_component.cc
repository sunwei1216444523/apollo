/******************************************************************************
 * Copyright 2023 The Apollo Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *****************************************************************************/
#include "modules/perception/camera_detection_single_stage/camera_detection_single_stage_component.h"

#include <cmath>
#include <string>

#include "cyber/common/file.h"
#include "cyber/common/log.h"
#include "cyber/profiler/profiler.h"
#include "modules/perception/camera_detection_single_stage/detector/caddn/caddn_obstacle_detector.h"
#include "modules/perception/camera_detection_single_stage/detector/smoke/smoke_obstacle_detector.h"
#include "modules/perception/common/algorithm/i_lib/core/i_constant.h"
#include "modules/perception/common/algorithm/sensor_manager/sensor_manager.h"
#include "modules/perception/common/base/camera.h"
#include "modules/perception/common/camera/common/data_provider.h"

namespace apollo {
namespace perception {
namespace camera {


bool CameraDetectionSingleStageComponent::InitObstacleDetector(
    const CameraDetectionSingleStage& detection_param) {
  ObstacleDetectorInitOptions init_options;
  // Init conf file
  auto plugin_param = detection_param.plugin_param();
  init_options.config_path = plugin_param.config_path();
  init_options.config_file = plugin_param.config_file();
  init_options.gpu_id = detection_param.gpu_id();

  // Init camera params
  std::string camera_name = detection_param.camera_name();
  base::BaseCameraModelPtr model =
      algorithm::SensorManager::Instance()->GetUndistortCameraModel(
          camera_name);
  ACHECK(model) << "Can't find " << camera_name
                << " in data/conf/sensor_meta.pb.txt";
  auto pinhole = static_cast<base::PinholeCameraModel*>(model.get());
  init_options.intrinsic = pinhole->get_intrinsic_params();
  camera_k_matrix_ = init_options.intrinsic;
  init_options.image_height = model->get_height();
  init_options.image_width = model->get_width();
  image_height_ = model->get_height();
  image_width_ = model->get_width();

  // Init detector
  detector_.reset(
      BaseObstacleDetectorRegisterer::GetInstanceByName(plugin_param.name()));
  detector_->Init(init_options);
  return true;
}

bool CameraDetectionSingleStageComponent::InitCameraFrame(
    const CameraDetectionSingleStage& detection_param) {
  DataProvider::InitOptions init_options;
  init_options.image_height = image_height_;
  init_options.image_width = image_width_;
  init_options.do_undistortion = detection_param.enable_undistortion();
  init_options.sensor_name = detection_param.camera_name();
  init_options.device_id = detection_param.gpu_id();
  AINFO << "init_options.device_id: " << init_options.device_id
        << " camera_name: " << init_options.sensor_name;

  data_provider_ = std::make_shared<camera::DataProvider>();
  data_provider_->Init(init_options);

  return true;
}

bool CameraDetectionSingleStageComponent::InitTransformWrapper(
    const CameraDetectionSingleStage& detection_param) {
  trans_wrapper_.reset(new onboard::TransformWrapper());
  // tf_camera_frame_id
  trans_wrapper_->Init(detection_param.camera_name());
  return true;
}

bool CameraDetectionSingleStageComponent::Init() {
  CameraDetectionSingleStage detection_param;
  if (!GetProtoConfig(&detection_param)) {
    AERROR << "Load camera detection 3d component config failed!";
    return false;
  }

  InitObstacleDetector(detection_param);

  InitCameraFrame(detection_param);

  InitTransformWrapper(detection_param);

  writer_ = node_->CreateWriter<onboard::CameraFrame>(
                detection_param.channel().output_obstacles_channel_name());
  return true;
}

void CameraDetectionSingleStageComponent::CameraToWorldCoor(
    const Eigen::Affine3d& camera2world, std::vector<base::ObjectPtr>* objs) {
  for (auto& obj : *objs) {
    Eigen::Vector3d local_center =
        obj->camera_supplement.local_center.cast<double>();
    obj->center = camera2world * local_center;

    float x = obj->camera_supplement.local_center[0];
    float z = obj->camera_supplement.local_center[2];
    float rotation_y = std::atan2(x, z) + obj->camera_supplement.alpha;

    // enforce rotation_y to be in the range [-pi, pi)
    const float PI = algorithm::Constant<float>::PI();
    if (rotation_y < -PI) {
      rotation_y += 2 * PI;
    } else if (rotation_y >= PI) {
      rotation_y -= 2 * PI;
    }

    Eigen::Vector3d local_theta;
    local_theta << cos(rotation_y), sin(rotation_y), 0;
    Eigen::Vector3d direction = camera2world.linear() * local_theta;
    obj->direction = direction.cast<float>();
    obj->theta = std::atan2(obj->direction(1), obj->direction(0));
  }
}

bool CameraDetectionSingleStageComponent::Proc(
    const std::shared_ptr<apollo::drivers::Image>& msg) {
  PERF_FUNCTION()
  std::shared_ptr<onboard::CameraFrame> out_message(new (std::nothrow)
                                                    onboard::CameraFrame);
  bool status = InternalProc(msg, out_message);
  if (status) {
    writer_->Write(out_message);
    AINFO << "Send camera detection 3d output message.";
  }

  return status;
}

bool CameraDetectionSingleStageComponent::InternalProc(
    const std::shared_ptr<apollo::drivers::Image>& msg,
    const std::shared_ptr<onboard::CameraFrame>& out_message) {
  out_message->data_provider = data_provider_;
  // Fill image
  // todo(daohu527): need use real memory size
  out_message->data_provider->FillImageData(
      image_height_, image_width_,
      reinterpret_cast<const uint8_t*>(msg->data().data()), msg->encoding());

  out_message->camera_k_matrix = camera_k_matrix_;

  const double msg_timestamp = msg->measurement_time() + timestamp_offset_;
  out_message->timestamp = msg_timestamp;

  out_message->frame_id = frame_id_;
  ++frame_id_;

  // Get sensor to world pose from TF
  Eigen::Affine3d camera2world;
  if (!trans_wrapper_->GetSensor2worldTrans(msg_timestamp, &camera2world)) {
    const std::string err_str =
        absl::StrCat("failed to get camera to world pose, ts: ", msg_timestamp,
                     " frame_id: ", msg->frame_id());
    AERROR << err_str;
    return cyber::FAIL;
  }

  out_message->camera2world_pose = camera2world;

  // Detect
  PERF_BLOCK("camera_3d_detector")
  detector_->Detect(out_message.get());
  PERF_BLOCK_END

  CameraToWorldCoor(camera2world, &out_message->detected_objects);

  return true;
}

}  // namespace camera
}  // namespace perception
}  // namespace apollo
