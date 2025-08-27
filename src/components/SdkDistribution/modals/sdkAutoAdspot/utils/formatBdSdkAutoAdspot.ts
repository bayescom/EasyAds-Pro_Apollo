import { convertNumbersToStrings, convertStringsToNumbers } from '@/services/utils/utils';

// 1 - 横幅， 2 开屏， 3 插屏， 6 信息流， 8 文字链 ， 9 视频贴片， 12 激励视频
export function formatBdPayloadDataFromModal(thirdAdspotFormData, adspotType) {
  const commonParams = {
    // 代码位名称
    adName: thirdAdspotFormData.adName,
    cpm: thirdAdspotFormData.cpm ? +thirdAdspotFormData.cpm : 0
  };

  let adInfo;
  if (adspotType == 2) {
    adInfo = {
      // 物料类型
      splashMaterialTypes: thirdAdspotFormData.splashMaterialTypes,
      // 展示控制
      splashShowControl: thirdAdspotFormData.splashShowControl
    };
  }

  if (adspotType == 3) {
    adInfo = {
      // 物料类型
      interstitialMaterialTypes: thirdAdspotFormData.interstitialMaterialTypes,
      // 广告场景
      interstitialAdScene: thirdAdspotFormData.interstitialAdScene,
      // 广告样式
      interstitialStyleTypes: convertStringsToNumbers(thirdAdspotFormData.interstitialStyleTypes)
    };
  }

  if (adspotType == 6) {
    let infoFlowElement;

    // 说明：
    //   1、elementGroups 传参既无 （图片）也无 (视频）时，没有 elementSize elementImageNum 字段
    //   2、如果 elementGroups 传参包含 图片 但没有（视频），就会有 elementImageNum 字段（前端传入1）,elementSize = 1
    //   3、elementGroups 传参只要包含 （视频），elementSize 默认为 10, 没有 elementImageNum 这个字段
    //   4、如果传了 elementImageNum，必须传 elementSize，
    //   5、字段没有的，不传
    if (thirdAdspotFormData.infoFlowStyleControlType == 3) {
      let infoFlowElementOtherParams;
      // 组成元素 1 标题  2 描述  3 图片  4 图标  5 视频
      const imageIndex = thirdAdspotFormData.infoFlowElement.indexOf('3');
      const videoIndex = thirdAdspotFormData.infoFlowElement.indexOf('5');
      if (imageIndex == -1 && videoIndex == -1) { // 既没图片，也没视频
        infoFlowElementOtherParams = {};
      } else {
        if (imageIndex !== -1 && videoIndex == -1) { // 有图片，无视频
          infoFlowElementOtherParams = { elementImageNum: 1, elementSize: 1 };
        }

        if (videoIndex !== -1) { // 包含视频
          infoFlowElementOtherParams = { elementSize: 10 };
        }
      }

      infoFlowElement = {
        elementGroups: convertStringsToNumbers(thirdAdspotFormData.infoFlowElement),
        ...infoFlowElementOtherParams
      };
    }

    let infoFlowTemplates = null;
    // 模版样式 百度接口要求：如果包含了16（三图），则需要把17（三图）也传给后端，如果包含了19（上文下图），则需要把20（上文下图）也传给后端
    if (thirdAdspotFormData.infoFlowStyleControlType == 1) {
      const temp = convertStringsToNumbers(thirdAdspotFormData.infoFlowTemplates);
      if (temp.includes(16)) temp.push(17);

      if (temp.includes(19)) temp.push(20);

      infoFlowTemplates = temp;
    }
    
    adInfo = {
      // 渲染样式
      infoFlowStyleControlType: thirdAdspotFormData.infoFlowStyleControlType,
      // 物料类型
      infoFlowMaterialTypes: thirdAdspotFormData.infoFlowMaterialTypes,
      // 模版样式
      infoFlowTemplates,
      infoFlowElement
    };
  }

  if (adspotType == 12) {
    adInfo = {
      // 回调控制
      rewardVideoReturnControl: thirdAdspotFormData.rewardVideoReturnControl,
      // 回调URL
      rewardVideoReturnUrl: thirdAdspotFormData.rewardVideoReturnUrl,
      // 声音控制
      rewardVideoVoiceControl: thirdAdspotFormData.rewardVideoVoiceControl
    };
  }

  return { ...commonParams, adInfo };
}

export function formatBdModalDataFromPayload(thirdAdspotPayloadData: Record<string, any>, adspotType) {
  const commonParams = {
    // 代码位名称
    adName: thirdAdspotPayloadData.ad_name,
    cpm: thirdAdspotPayloadData.cpm ? thirdAdspotPayloadData.cpm : 0
  };

  let adInfo;
  if (adspotType == 2) {
    adInfo = {
      // 物料类型
      splashMaterialTypes: thirdAdspotPayloadData.ad_info.splash_material_types,
      // 展示控制
      splashShowControl: thirdAdspotPayloadData.ad_info.splash_show_control
    };
  }

  if (adspotType == 3) {
    adInfo = {
      // 物料类型
      interstitialMaterialTypes: thirdAdspotPayloadData.ad_info.interstitial_material_types,
      // 广告场景
      interstitialAdScene: thirdAdspotPayloadData.ad_info.interstitial_ad_scene,
      // 广告样式
      interstitialStyleTypes: convertNumbersToStrings(thirdAdspotPayloadData.ad_info.interstitial_style_types)
    };
  }

  if (adspotType == 6) {
    adInfo = {
      // 渲染样式
      infoFlowStyleControlType: thirdAdspotPayloadData.ad_info.info_flow_style_control_type,
      // 物料类型
      infoFlowMaterialTypes: thirdAdspotPayloadData.ad_info.info_flow_material_types,
      // 模版样式
      infoFlowTemplates: thirdAdspotPayloadData.ad_info.info_flow_style_control_type == 1 ? convertNumbersToStrings(thirdAdspotPayloadData.ad_info.info_flow_templates).filter(item => !['17', '20'].includes(item)) : null,
      infoFlowElement: thirdAdspotPayloadData.ad_info.info_flow_style_control_type == 3 ? convertNumbersToStrings(thirdAdspotPayloadData.ad_info.info_flow_element.element_groups) : null
    };
  }

  if (adspotType == 12) {
    adInfo = {
      // 回调控制
      rewardVideoReturnControl: thirdAdspotPayloadData.ad_info.reward_video_return_control,
      // 回调URL
      rewardVideoReturnUrl: thirdAdspotPayloadData.ad_info.reward_video_return_url,
      // 声音控制
      rewardVideoVoiceControl: thirdAdspotPayloadData.ad_info.reward_video_voice_control
    };
  }
  
  return { ...commonParams, ...adInfo };
}
