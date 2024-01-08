/******************************************************************************
 * Copyright 2023 The Apollo Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *****************************************************************************/

#pragma once

#include <string>

#include "cyber/common/macros.h"
#include "modules/perception/common/lib/interface/base_init_options.h"
#include "modules/perception/common/lib/registerer/registerer.h"
#include "modules/perception/common/radar/common/radar_frame.h"

namespace apollo {
namespace perception {
namespace radar4d {

using apollo::perception::BaseInitOptions;

struct ClassifierInitOptions : public BaseInitOptions {};

struct ClassifierOptions {};

class BaseClassifier {
 public:
  BaseClassifier() = default;

  virtual ~BaseClassifier() = default;

  /**
   * @brief Init classifier
   *
   * @param options
   * @return true
   * @return false
   */
  virtual bool Init(
      const ClassifierInitOptions& options = ClassifierInitOptions()) = 0;

  /**
   * @brief Classify object list and fill type in object
   *
   * @param options
   * @param frame
   * @return true
   * @return false
   */
  virtual bool Classify(const ClassifierOptions& options,
                        RadarFrame* frame) = 0;
  /**
   * @brief Get class name
   *
   * @return std::string
   */
  virtual std::string Name() const = 0;

 private:
  DISALLOW_COPY_AND_ASSIGN(BaseClassifier);
};  // class BaseClassifier

PERCEPTION_REGISTER_REGISTERER(BaseClassifier);
#define PERCEPTION_REGISTER_CLASSIFIER(name) \
  PERCEPTION_REGISTER_CLASS(BaseClassifier, name)

}  // namespace radar4d
}  // namespace perception
}  // namespace apollo
