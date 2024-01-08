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
#pragma once

#include <string>

#include "Eigen/Core"

#include "modules/common_msgs/sensor_msgs/oculii_radar.pb.h"
#include "modules/perception/common/base/radar_point_cloud.h"
#include "modules/perception/common/radar/common/radar_frame.h"

#include "cyber/common/macros.h"
#include "modules/perception/common/base/frame.h"
#include "modules/perception/common/base/hdmap_struct.h"
#include "modules/perception/common/lib/interface/base_init_options.h"
#include "modules/perception/common/lib/registerer/registerer.h"

namespace apollo {
namespace perception {
namespace radar4d {

struct DetectorInitOptions : public BaseInitOptions {
  // reserved
};

struct DetectorOptions {
  Eigen::Matrix4d* radar2world_pose = nullptr;
  Eigen::Matrix4d* radar2novatel_trans = nullptr;
  Eigen::Vector3f car_linear_speed = Eigen::Vector3f::Zero();
  Eigen::Vector3f car_angular_speed = Eigen::Vector3f::Zero();
  base::HdmapStructPtr roi = nullptr;

  EIGEN_MAKE_ALIGNED_OPERATOR_NEW
};

class BaseDetector {
 public:
  /**
   * @brief Construct a new Base Detector object
   *
   */
  BaseDetector() = default;
  virtual ~BaseDetector() = default;

  /**
   * @brief Init base detector object configs.
   *
   * @param options init options
   * @return true
   * @return false
   */
  virtual bool Init(const DetectorInitOptions& options) = 0;

  /**
   * @brief Detect the objects from the radar point cloud
   *
   * @param frame radar frame with preprocessed point cloud
   * @param options detect options
   * @return true
   * @return false
   */
  virtual bool Detect(RadarFrame* frame,
                      const DetectorOptions& options) = 0;

  /**
   * @brief The name of the radar base Detector
   *
   * @return std::string
   */
  virtual std::string Name() const = 0;

 private:
  DISALLOW_COPY_AND_ASSIGN(BaseDetector);
};

PERCEPTION_REGISTER_REGISTERER(BaseDetector);
#define PERCEPTION_REGISTER_DETECTOR(name) \
  PERCEPTION_REGISTER_CLASS(BaseDetector, name)

}  // namespace radar4d
}  // namespace perception
}  // namespace apollo
