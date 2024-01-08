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

#include <memory>
#include <vector>

#include "modules/common/util/eigen_defs.h"
#include "modules/perception/common/base/hdmap_struct.h"
#include "modules/perception/common/base/lane_struct.h"
#include "modules/perception/common/base/object_pool_types.h"
#include "modules/perception/common/base/traffic_light.h"
#include "modules/perception/common/camera/common/data_provider.h"

namespace apollo {
namespace perception {
namespace onboard {

struct CameraFrame {
  // Frame sequence id
  std::uint64_t frame_id;
  // Timestamp
  double timestamp;
  // Image
  std::shared_ptr<camera::DataProvider> data_provider;
  // Detection result
  std::vector<base::ObjectPtr> detected_objects;
  // appearance features for tracking
  std::shared_ptr<base::Blob<float>> feature_blob = nullptr;
  // intrinstic
  Eigen::Matrix3f camera_k_matrix = Eigen::Matrix3f::Identity();
  // camera to world pose
  Eigen::Affine3d camera2world_pose = Eigen::Affine3d::Identity();

  EIGEN_MAKE_ALIGNED_OPERATOR_NEW
};

}  // namespace onboard
}  // namespace perception
}  // namespace apollo
