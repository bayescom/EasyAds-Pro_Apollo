import { csjAdspotSize } from './index';

// 1 - 横幅， 2 开屏， 3 插屏， 6 信息流， 8 文字链 ， 9 视频贴片， 12 激励视频
export function formatPayloadDataFromModal(thirdAdspotFormData, adspotType) {
  const commonParams = {
    // 代码位名称
    adSlotName: thirdAdspotFormData.adSlotName,
    cpm: thirdAdspotFormData.cpm ? thirdAdspotFormData.cpm : null,
    renderType: thirdAdspotFormData.renderType
  };

  const optionalParamsMap = {
    1: {
      // 是否轮播
      slideBanner: thirdAdspotFormData.slideBanner,
      // 广告位尺寸
      adSlotSizeType: csjAdspotSize.findIndex(item => item.value == thirdAdspotFormData.adSlotSizeType) + 1
    },
    2: {
      // 屏幕方向
      orientation: thirdAdspotFormData.orientation,
      // 创意交互方式
      splashShake: thirdAdspotFormData.splashShake
    },
    3: {
      // 广告铺开大小
      adRolloutSize: thirdAdspotFormData.adRolloutSize,
      // 素材类型
      acceptMaterialType: thirdAdspotFormData.acceptMaterialType,
      // 屏幕方向
      orientation: thirdAdspotFormData.orientation,
      // 视频声音
      videoVoiceControl: thirdAdspotFormData.videoVoiceControl,
      // 视频自动播放
      videoAutoPlay: thirdAdspotFormData.videoAutoPlay,
      // n秒后显示跳过按钮
      skipDuration: thirdAdspotFormData.skipDuration
    },
    6: {
      // 素材类型
      acceptMaterialType: thirdAdspotFormData.acceptMaterialType,
      // 优选模版
      templateLayouts: thirdAdspotFormData.templateLayouts ? thirdAdspotFormData.templateLayouts.map(item => +item) : null,
      // 视频声音
      videoVoiceControl: thirdAdspotFormData.videoVoiceControl,
      // 视频自动播放
      videoAutoPlay: thirdAdspotFormData.videoAutoPlay
    },
    12: {
      // 屏幕方向
      orientation: thirdAdspotFormData.orientation,
      // 奖励发放设置
      isRewardRetainPop: thirdAdspotFormData.isRewardRetainPop,
      // 奖励名称
      rewardName: thirdAdspotFormData.rewardName,
      // 奖励数量
      rewardCount: thirdAdspotFormData.rewardCount,
      // 服务器判断
      rewardIsCallback: thirdAdspotFormData.rewardIsCallback,
      // 回调URL
      rewardCallbackUrl: thirdAdspotFormData.rewardCallbackUrl
    }
  };
  
  return { ...commonParams, ...optionalParamsMap[adspotType] };
}

export function formatModalDataFromPayload(thirdAdspotPayloadData: Record<string, any>, adspotType) {
  const commonParams = {
    // 代码位名称
    adSlotName: thirdAdspotPayloadData.ad_slot_name,
    cpm: thirdAdspotPayloadData.cpm ? thirdAdspotPayloadData.cpm : null,
    renderType: thirdAdspotPayloadData.render_type
  };

  const optionalParamsMap = {
    1: {
      // 是否轮播
      slideBanner: thirdAdspotPayloadData.slide_banner,
      // 广告位尺寸
      adSlotSizeType: thirdAdspotPayloadData.adSlotSizeType
    },
    2: {
      // 屏幕方向
      orientation: thirdAdspotPayloadData.orientation,
      // 创意交互方式
      splashShake: thirdAdspotPayloadData.splash_shake
    },
    3: {
      // 广告铺开大小
      adRolloutSize: thirdAdspotPayloadData.ad_rollout_size,
      // 素材类型
      acceptMaterialType: thirdAdspotPayloadData.accept_material_type,
      // 屏幕方向
      orientation: thirdAdspotPayloadData.orientation,
      // 视频声音
      videoVoiceControl: thirdAdspotPayloadData.video_voice_control,
      // 视频自动播放
      videoAutoPlay: thirdAdspotPayloadData.video_auto_play,
      // n秒后显示跳过按钮
      skipDuration: thirdAdspotPayloadData.skip_duration
    },
    6: {
      // 素材类型
      acceptMaterialType: thirdAdspotPayloadData.accept_material_type,
      // 优选模版
      templateLayouts: thirdAdspotPayloadData.template_layouts ? thirdAdspotPayloadData.template_layouts.map(item => String(item)) : [],
      // 视频声音
      videoVoiceControl: thirdAdspotPayloadData.video_voice_control,
      // 视频自动播放
      videoAutoPlay: thirdAdspotPayloadData.video_auto_play
    },
    12: {
      // 屏幕方向
      orientation: thirdAdspotPayloadData.orientation,
      // 奖励发放设置
      isRewardRetainPop: thirdAdspotPayloadData.is_reward_retain_pop,
      // 奖励名称
      rewardName: thirdAdspotPayloadData.reward_name,
      // 奖励数量
      rewardCount: thirdAdspotPayloadData.reward_count,
      // 服务器判断
      rewardIsCallback: thirdAdspotPayloadData.reward_is_callback,
      // 回调URL
      rewardCallbackUrl: thirdAdspotPayloadData.reward_callback_url 
    }
  };
  
  return { ...commonParams, ...optionalParamsMap[adspotType] };
}
