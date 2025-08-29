// 前端传给后端的值 素材类型
// 1- 竖版视频，2 - 横版视频 5 - 竖版图片 6 - 横版图片 10 - 组图
// 前端有 【视频 + 图片】 应该传给api接口：[1,2,5,6]
// 【仅视频】: [1,2]
// 【仅图片】: [5,6]
export function formatmaterialTypeListFormFrontend(materialTypeList) {
  if (materialTypeList == 1) {
    return [1,2,5,6];
  } else if (materialTypeList == 2) {
    return [1,2];
  } else {
    return [5,6];
  }
}

// 从后端往前端展示
export function formatmaterialTypeListFormBackend(materialTypeList) {
  if (materialTypeList.length == 4) {
    return 1;
  } else if (materialTypeList.includes(2)) {
    return 2;
  } else {
    return 3;
  }
}

// 开屏和他们不一样，tmd, 竖屏：[1,3] 横屏： 必填[2,6]
export function formatSplashMaterialTypeListFormFrontend(materialTypeList) {
  if (materialTypeList == 1) {
    return [1,3];
  } else if (materialTypeList == 2) {
    return [2,6];
  } else {
    return [];
  }
}

export function formatSplashMaterialTypeListFormBackend(materialTypeList) {
  if (materialTypeList.includes(1)) {
    return 1;
  } else if (materialTypeList.includes(2)) {
    return 2;
  } else {
    return 1;
  }
}

const adspotTypeToKsAdStyleMap = {
  3: { ks: 5 },
  1: { ks: 4 },
  2: { ks: 1 },
  5: { ks: 2 },
};

const ksAdStyleToAdspotTypeMap = {
  1: { easyads: 2 },
  2: { easyads: 5 },
  4: { easyads: 1 },
  5: { easyads: 3 },
};

const formatAdStyleFormFrontend = (adspotType, adStyle) => {
  if ([3,1,2,5].includes(adspotType)) {
    return adspotTypeToKsAdStyleMap[adspotType].ks;
  } else {
    // 这种情况下，就是插屏，他表单会让选择是新插屏还是插屏
    return adStyle;
  }
};

const formatAdStyleFormBackend = (adspotType, adStyle) => {
  if ([1,2,4,5].includes(adStyle)) {
    return ksAdStyleToAdspotTypeMap[adStyle].easyads;
  } else {
    // 这种情况下，就是插屏，他表单会让选择是新插屏还是插屏
    return adStyle;
  }
};

// /** 1 - 开屏， 2 信息流， 3 横幅， 4 插屏， 5 激励视频 */
// 快手对应的是： // banner - 5, 信息流 - 1，激励视频 - 2， 插屏 - 13，新插屏 - 23， 开屏 - 4
export function formatKsPayloadDataFromModal(thirdAdspotFormData, adspotType) {
  const commonParams = {
    // 代码位名称
    name: thirdAdspotFormData.name,
    expectCpm: thirdAdspotFormData.expectCpm ? +thirdAdspotFormData.expectCpm : null,
    cpmFloor: thirdAdspotFormData.expectCpm ? +thirdAdspotFormData.expectCpm : null,
    priceStrategy: thirdAdspotFormData.expectCpm ? 1 : 2,
    adStyle: formatAdStyleFormFrontend(adspotType, thirdAdspotFormData.adStyle)
  };

  let adInfo;
  if (adspotType == 3) {
    adInfo = {
      renderType: 2,
      templateId: thirdAdspotFormData.templateId,
      materialTypeList: formatmaterialTypeListFormFrontend(thirdAdspotFormData.materialTypeList)
    };
  }

  if (adspotType == 1) {
    adInfo = {
      renderType: 2,
      materialTypeList: formatSplashMaterialTypeListFormFrontend(thirdAdspotFormData.materialTypeList),
      skipAdMode: 0,
      countdownShow: thirdAdspotFormData.countdownShow
    };
  }

  if (adspotType == 4) {
    adInfo = {
      renderType: 2,
      templateId: 9,
      materialTypeList: thirdAdspotFormData.materialTypeList,
      adRolloutSize: thirdAdspotFormData.adRolloutSize || null
    };
  }

  if (adspotType == 2) {
    adInfo = {
      renderType: thirdAdspotFormData.renderType,
      // 素材类型
      materialTypeList: thirdAdspotFormData.renderType == 2 ? formatmaterialTypeListFormFrontend(thirdAdspotFormData.materialTypeList) : thirdAdspotFormData.materialTypeList,
      // 模板样式
      multiTemplateParams: thirdAdspotFormData.multiTemplateParams ? thirdAdspotFormData.multiTemplateParams.map(item => ({templateId: item})) : null,
    };
  }

  if (adspotType == 5) {
    adInfo = {
      renderType: 1,
      materialTypeList: thirdAdspotFormData.materialTypeList,
      rewardedType: thirdAdspotFormData.rewardedType,
      rewardedNum: thirdAdspotFormData.rewardedNum,
      callbackStatus: thirdAdspotFormData.callbackStatus,
      callbackUrl: thirdAdspotFormData.callbackUrl
    };
  }

  console.log('result: ', { ...commonParams, ...adInfo });

  return { ...commonParams, ...adInfo };
}

export function formatKsModalDataFromPayload(thirdAdspotPayloadData: Record<string, any>, adspotType) {
  const commonParams = {
    // 代码位名称
    name: thirdAdspotPayloadData.name,
    expectCpm: thirdAdspotPayloadData.cpm_floor ? thirdAdspotPayloadData.cpm_floor : null,
    cpmFloor: thirdAdspotPayloadData.cpm_floor ? thirdAdspotPayloadData.cpm_floor : null,
    priceStrategy: thirdAdspotPayloadData.price_strategy,
    adStyle: formatAdStyleFormBackend(adspotType,thirdAdspotPayloadData.ad_style)
  };
  
  let adInfo;
  if (adspotType == 3) {
    adInfo = {
      renderType: 2,
      templateId: thirdAdspotPayloadData.template_id,
      materialTypeList: formatmaterialTypeListFormBackend(thirdAdspotPayloadData.creative_material_type)
    };
  }

  if (adspotType == 1) {
    adInfo = {
      renderType: 2,
      materialTypeList: formatSplashMaterialTypeListFormBackend(thirdAdspotPayloadData.creative_material_type),
      skipAdMode: 0,
      // 这个字段在get的时候不返回，怎么办
      countdownShow: thirdAdspotPayloadData.countdownShow
    };
  }

  if (adspotType == 4) {
    adInfo = {
      renderType: 2,
      templateId: 9,
      materialTypeList: thirdAdspotPayloadData.creative_material_type.map(item => item.toString()),
      adRolloutSize: thirdAdspotPayloadData.ad_rollout_size || null
    };
  }

  if (adspotType == 2) {
    adInfo = {
      renderType: thirdAdspotPayloadData.render_type,
      // 素材类型
      materialTypeList: thirdAdspotPayloadData.render_type == 1 ? thirdAdspotPayloadData.creative_material_type.map(item => item.toString()) : formatmaterialTypeListFormBackend(thirdAdspotPayloadData.creative_material_type),
      // 模板样式
      multiTemplateParams: thirdAdspotPayloadData.template_id_list.map(item => item.toString()),
    };
  }

  if (adspotType == 5) {
    adInfo = {
      renderType: 1,
      materialTypeList: +thirdAdspotPayloadData.creative_material_type.join(''),
      rewardedType: thirdAdspotPayloadData.rewarded_type,
      rewardedNum: thirdAdspotPayloadData.rewarded_num,
      // 这个字段根据 callback_url 返回来判断，如果有值，则为1，没有值则为0
      callbackStatus: thirdAdspotPayloadData.callback_url ? 1 : 0,
      callbackUrl: thirdAdspotPayloadData.callback_url || null
    };
  }
  
  return { ...commonParams, ...adInfo };
}
