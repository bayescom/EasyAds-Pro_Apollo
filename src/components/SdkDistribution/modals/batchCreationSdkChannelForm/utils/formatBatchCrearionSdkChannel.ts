import { firstLetterToOperatorMap, firstLetterToPropertyMap } from '@/models/common';

export function formatPayloadDataFromModal(sdkAdspotChannelFormData) {
  const location = sdkAdspotChannelFormData.location || sdkAdspotChannelFormData.excludeLocation,
    appVersion = sdkAdspotChannelFormData.appVersion,
    deviceMaker = sdkAdspotChannelFormData.deviceMaker || sdkAdspotChannelFormData.excludeDeviceMaker,
    osv = sdkAdspotChannelFormData.osv || sdkAdspotChannelFormData.excludeOsv;

  const operatorRegex = Object.values(firstLetterToOperatorMap).map(item => `(${item})`).join('|');
  const initialVersion = appVersion ? appVersion.replace(new RegExp(operatorRegex), '') : undefined;
  const initialProperty = appVersion ? firstLetterToPropertyMap[appVersion.substr(0, 1)] : 'include';
  const newReportApiParam = [2, 3, 5].includes(sdkAdspotChannelFormData.adnId) ? {
    id: sdkAdspotChannelFormData.reportApiParam.id || null,
    name: sdkAdspotChannelFormData.reportApiParam.name,
    channelParams: sdkAdspotChannelFormData.reportApiParam.channelParams,
    status: sdkAdspotChannelFormData.reportApiParam.status
  } : {};

  const sdkAdspotChannelNew = {
    id: sdkAdspotChannelFormData.id || 0,
    adnId: sdkAdspotChannelFormData.adnId,
    channelName: sdkAdspotChannelFormData.channelName || '',
    channelAlias: sdkAdspotChannelFormData.channelAlias,
    bidPrice: sdkAdspotChannelFormData.price || 0,
    isHeadBidding: sdkAdspotChannelFormData.isHeadBidding,
    // 固价 或者 bidRatio 没有值的时候，默认为1
    bidRatio: !sdkAdspotChannelFormData.isHeadBidding ? 1 : (!sdkAdspotChannelFormData.bidRatio && String(sdkAdspotChannelFormData.bidRatio !== '0') ? 1 : sdkAdspotChannelFormData.bidRatio),
    timeout: sdkAdspotChannelFormData.timeout,
    
    requestLimit: {
      dailyReqLimit: sdkAdspotChannelFormData.dailyReqLimit || null,
      dailyImpLimit: sdkAdspotChannelFormData.dailyImpLimit || null,
      deviceDailyReqLimit: sdkAdspotChannelFormData.deviceDailyReqLimit || null,
      deviceDailyImpLimit: sdkAdspotChannelFormData.deviceDailyImpLimit || null,
      deviceRequestInterval: sdkAdspotChannelFormData.deviceRequestInterval || null,
    },
    direction: {
      appVersion: {
        property: initialProperty || 'include',
        value: appVersion ? initialVersion.split(',') : []
      },
      location: {
        property: !sdkAdspotChannelFormData.excludeLocation ? 'include' : 'exclude',
        value: !location ? [] : location.split(',')
      },
      deviceMaker:{
        property: !sdkAdspotChannelFormData.excludeDeviceMaker ? 'include' : 'exclude',
        value: !deviceMaker ? [] : deviceMaker.split(',')
      },
      osVersion: {
        property: !sdkAdspotChannelFormData.osv ? 'exclude' : 'include',
        value: !osv ? [] : osv.split(',')
      }
    },

    params: sdkAdspotChannelFormData.params,
    adnParamsMeta: sdkAdspotChannelFormData.adnParamsMeta || [],
    reportApiParam: newReportApiParam,
  };
  return sdkAdspotChannelNew;
}
