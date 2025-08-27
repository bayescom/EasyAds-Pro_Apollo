// 1 - 横幅， 2 开屏， 3 插屏， 6 信息流， 8 文字链 ， 9 视频贴片， 12 激励视频
export function formatYlhPayloadDataFromModal(thirdAdspotFormData, adspotType) {
  const commonParams = {
    // 代码位名称
    placementName: thirdAdspotFormData.placementName,
    ecpmPrice: thirdAdspotFormData.ecpmPrice ? thirdAdspotFormData.ecpmPrice * 100 : 0,
    priceStrategyType: thirdAdspotFormData.priceType != '3' ? 'BiddingPrice' : 'TargetPrice',
    realTimeBiddingType: thirdAdspotFormData.priceType == '1' ? 'Client_Bidding' : thirdAdspotFormData.priceType == '2' ? 'Server_Bidding' : null,
  };

  const optionalParamsMap = {
    // 横幅
    1: {
      // 渲染方式： 模板渲染 or 自渲染
      renderType: thirdAdspotFormData.renderType || null,

      // 模版样式: 模板渲染的时候有,因为前端使用的是select button, 是单选，这里需要传入 list
      adCrtTemplateType: thirdAdspotFormData.adCrtTemplateType && typeof thirdAdspotFormData.adCrtTemplateType === 'string' ? thirdAdspotFormData.adCrtTemplateType.split(',') : null,

      // 广告样式： 自渲染的时候有
      adCrtNormalTypes: thirdAdspotFormData.adCrtNormalTypes || null
    },
    // 开屏
    2: {
      // 广告素材类型
      adCrtTypeList: thirdAdspotFormData.adCrtTypeList
    },
    // // 插屏
    3: {
      // 广告素材类型
      adCrtTypeList: thirdAdspotFormData.adCrtTypeList,

      // 渲染样式：弹窗、全屏
      adCrtTemplateType:  thirdAdspotFormData.adCrtTypeList && typeof thirdAdspotFormData.adCrtTemplateType === 'string' ? thirdAdspotFormData.adCrtTemplateType.split(',') : null,
    },
    // // 信息流
    6: {
      // 渲染方式： 模板渲染 or 自渲染
      renderType: thirdAdspotFormData.renderType || null,

      // 广告素材类型
      adCrtTypeList: thirdAdspotFormData.adCrtTypeList || null,

      // 广告样式多样性探索
      enableExperiment: thirdAdspotFormData.enableExperiment || null,

      // 模版样式: 模板渲染的时候有， 这个字段，和横幅的传给后端的字段不一样，切记
      // 且这里加上 typeOf 的判断是因为，在横幅的时候，thirdAdspotFormData.adCrtTypeList = 'IMAGE',是字符串，解析道这行代码的时候，没有map方法，就会导致进程被卡住。
      adCrtTemplateType: thirdAdspotFormData.adCrtTypeList && typeof thirdAdspotFormData.adCrtTemplateType === 'object' ? thirdAdspotFormData.adCrtTemplateType : null,

      // 广告样式： 自渲染的时候有
      adCrtNormalTypes: thirdAdspotFormData.adCrtNormalTypes ? thirdAdspotFormData.adCrtNormalTypes : null
    },
    // // 激励视频
    12: {
      // 渲染样式,当两者都选中的时候，值是 ALL_DIRECTION
      rewardedVideoCrtType: thirdAdspotFormData.rewardedVideoCrtType ? (thirdAdspotFormData.rewardedVideoCrtType.length == 2 ? 'ALL_DIRECTION' : thirdAdspotFormData.rewardedVideoCrtType.join(',')) : null,

      // 服务器判断
      needServerVerify: thirdAdspotFormData.needServerVerify || null,

      // 回调URL
      transferUrl: thirdAdspotFormData.transferUrl || null,
      // 密钥：新建的时候前端生成一个随机密码
      secret: thirdAdspotFormData.secret || null
    }
  };

  return { ...commonParams, ...optionalParamsMap[adspotType] };
}

const formatPriceType = (priceStrategyType, realTimeBiddingType) => {
  let priceType = '';
  if (priceStrategyType == 'TargetPrice') {
    priceType = '3';
  }else if (priceStrategyType == 'BiddingPrice' && realTimeBiddingType == 'Client_Bidding') {
    priceType = '1';
  } else if (priceStrategyType == 'BiddingPrice' && realTimeBiddingType == 'Server_Bidding') {
    priceType = '2';
  }
  return priceType;
};

export function formatYlhModalDataFromPayload(thirdAdspotPayloadData: Record<string, any>, adspotType) {
  const commonParams = {
    // 代码位名称
    placementName: thirdAdspotPayloadData.placement_name,
    ecpmPrice: thirdAdspotPayloadData.ecpm_price ? thirdAdspotPayloadData.ecpm_price / 100 : null,
    priceType: formatPriceType(thirdAdspotPayloadData.price_strategy_type, thirdAdspotPayloadData.real_time_bidding_type)
  };

  const optionalParamsMap = {
    1: {
      // 是否轮播
      renderType: thirdAdspotPayloadData.render_type,
      // 模版样式
      adCrtTemplateType: thirdAdspotPayloadData.ad_crt_template_type ? thirdAdspotPayloadData.ad_crt_template_type.join(',') : null,
      // 广告样式
      adCrtNormalTypes: thirdAdspotPayloadData.ad_crt_normal_types
    },
    2: {
      // 广告素材类型 
      adCrtTypeList: thirdAdspotPayloadData.ad_crt_type_list
    },
    3: {
      // 广告素材类型
      adCrtTypeList: thirdAdspotPayloadData.ad_crt_type_list,
      // 渲染样式：弹窗、全屏
      adCrtTemplateType: thirdAdspotPayloadData.ad_crt_template_type ? thirdAdspotPayloadData.ad_crt_template_type.join(',') : null
    },
    6: {
      // 渲染方式： 模板渲染 or 自渲染
      renderType: thirdAdspotPayloadData.render_type,
      // 广告素材类型
      adCrtTypeList: thirdAdspotPayloadData.ad_crt_type_list,
      // 广告样式多样性探索
      enableExperiment: thirdAdspotPayloadData.enable_experiment,
      // 模版样式
      adCrtTemplateType: thirdAdspotPayloadData.ad_crt_template_type,
      // 广告样式
      adCrtNormalTypes: thirdAdspotPayloadData.ad_crt_normal_types
    },
    12: {
      // 渲染样式
      rewardedVideoCrtType: thirdAdspotPayloadData.rewarded_video_crt_type ? (thirdAdspotPayloadData.rewarded_video_crt_type == 'ALL_DIRECTION' ? ['VIDEO', 'IMAGE'] : thirdAdspotPayloadData.rewarded_video_crt_type.split(',')) : null,
      // 服务器判断
      needServerVerify: thirdAdspotPayloadData.need_server_verify,
      // 回调URL
      transferUrl: thirdAdspotPayloadData.transfer_url,
      // 密钥
      secret: thirdAdspotPayloadData.secret,
    }
  };
  
  return { ...commonParams, ...optionalParamsMap[adspotType] };
}
