import { sdkReportApiChannels } from '@/components/Utils/Constant';
import { firstLetterToOperatorMap, firstLetterToPropertyMap } from '@/models/common';

export function formatPayloadDataFromModal(sdkAdspotChannelFormData) {
  const location = sdkAdspotChannelFormData.location || sdkAdspotChannelFormData.excludeLocation,
    appVersion = sdkAdspotChannelFormData.appVersion,
    deviceMaker = sdkAdspotChannelFormData.deviceMaker || sdkAdspotChannelFormData.excludeDeviceMaker,
    osv = sdkAdspotChannelFormData.osv || sdkAdspotChannelFormData.excludeOsv;

  const operatorRegex = Object.values(firstLetterToOperatorMap).map(item => `(${item})`).join('|');
  const initialVersion = appVersion.replace(new RegExp(operatorRegex), '');
  const initialProperty = firstLetterToPropertyMap[appVersion.substr(0, 1)];
  const newReportApiParam = sdkReportApiChannels.includes(sdkAdspotChannelFormData.adnId) ? {
    id: sdkAdspotChannelFormData.reportApiParam.id || null,
    name: sdkAdspotChannelFormData.reportApiParam.name,
    channelParams: sdkAdspotChannelFormData.reportApiParam.channelParams,
    status: sdkAdspotChannelFormData.reportApiParam.status,
    autoCreateStatus: sdkAdspotChannelFormData.reportApiParam.autoCreateStatus
  } : {};

  const sdkAdspotChannelNew = {
    id: sdkAdspotChannelFormData.id,
    adnId: sdkAdspotChannelFormData.adnId,
    channelName: sdkAdspotChannelFormData.channelName,
    channelAlias: sdkAdspotChannelFormData.channelAlias,
    isHeadBidding: sdkAdspotChannelFormData.isHeadBidding,
    // 固价 或者 bidRatio 没有值的时候，默认为1
    bidRatio: !sdkAdspotChannelFormData.isHeadBidding ? 1 : (!sdkAdspotChannelFormData.bidRatio && String(sdkAdspotChannelFormData.bidRatio !== '0') ? 1 : sdkAdspotChannelFormData.bidRatio),
    bidPrice: sdkAdspotChannelFormData.bidPrice,
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
        value: initialVersion.split(',') || []
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
    adnParamsMeta: sdkAdspotChannelFormData.adnParamsMeta,
    reportApiParam: newReportApiParam,
    isAutoCreate: sdkAdspotChannelFormData.isAutoCreate || 0,
    cpmUpdateTime: sdkAdspotChannelFormData.cpmUpdateTime
  };
  return sdkAdspotChannelNew;
}

export function formatModalDataFromPayload(sdkAdspotChannelPayloadData) {
  const { params, requestLimit, direction, adnParamsMeta, reportApiParam } = sdkAdspotChannelPayloadData;

  let appVersionProperty;
  switch (direction.appVersion.property) {
  case 'include':
    appVersionProperty = '';
    break;
  case 'exclude':
    appVersionProperty = '!';
    break;
  default:
    appVersionProperty = direction.appVersion.property;
    break;
  }
  
  const sdkAdspotChannel = {
    id: sdkAdspotChannelPayloadData.id,
    adnId: sdkAdspotChannelPayloadData.adnId,
    channelName: sdkAdspotChannelPayloadData.channelName,
    channelAlias: sdkAdspotChannelPayloadData.channelAlias,
    isHeadBidding: sdkAdspotChannelPayloadData.isHeadBidding,
    bidRatio: sdkAdspotChannelPayloadData.bidRatio,
    bidPrice: sdkAdspotChannelPayloadData.bidPrice,
    timeout: sdkAdspotChannelPayloadData.timeout,

    params: params,
    adnParamsMeta: adnParamsMeta,
    reportApiParam: reportApiParam,
    dailyReqLimit: requestLimit.dailyReqLimit,
    dailyImpLimit: requestLimit.dailyImpLimit,
    deviceDailyReqLimit: requestLimit.deviceDailyReqLimit,
    deviceDailyImpLimit: requestLimit.deviceDailyImpLimit,
    deviceRequestInterval: requestLimit.deviceRequestInterval,

    location: direction.location.property == 'include' ? direction.location.value.join(',') : '',
    excludeLocation: direction.location.property == 'include' ? '' : direction.location.value.join(','),
    deviceMaker: direction.deviceMaker.property == 'include' ? direction.deviceMaker.value.join(',') : '',
    excludeDeviceMaker: direction.deviceMaker.property == 'include' ? '' : direction.deviceMaker.value.join(','),
    osv: direction.osVersion.property == 'include' ? direction.osVersion.value.join(',') : '',
    excludeOsv: direction.osVersion.property == 'include' ? '' : direction.osVersion.value.join(','),
    appVersion: appVersionProperty + direction.appVersion.value.join(',') || '',
    isAutoCreate: sdkAdspotChannelPayloadData.isAutoCreate,
    cpmUpdateTime: sdkAdspotChannelPayloadData.cpmUpdateTime
  };
  return sdkAdspotChannel;
}

export function formatPayloadDataFromTargetingGroupModal(formData) {
  const appVersion = formData.appVersion,
    sdkVersion = formData.sdkVersion;

  const operatorRegex = Object.values(firstLetterToOperatorMap).map(item => `(${item})`).join('|');
  const initialAppVersion = appVersion.replace(new RegExp(operatorRegex), '');
  const initialAppProperty = firstLetterToPropertyMap[appVersion.substr(0, 1)];
  
  const initialSdkVersion = sdkVersion.replace(new RegExp(operatorRegex), '');
  const initialSdkProperty = firstLetterToPropertyMap[sdkVersion.substr(0, 1)];

  const newData = {
    groupTargetId: formData.groupTargetId || null,
    name: formData.name,
    priority: formData.priority,
    
    direction: {
      appVersion: {
        property: initialAppProperty || 'include',
        value: initialAppVersion == '' ? [] : initialAppVersion.split(',') || []
      },
      sdkVersion: {
        property: initialSdkProperty || 'include',
        value: initialSdkVersion == '' ? [] : initialSdkVersion.split(',') || []
      },
      location: {
        property: formData.locationProperty == '!' ? 'exclude' : 'include',
        value: formData.location == '' ? [] : formData.location.split(',') || []
      },
      osv: {
        property: formData.osvProperty == '!' ? 'exclude' : 'include',
        value: formData.osv == '' ? [] : formData.osv.split(',') || []
      },
      maker: {
        property: formData.makerProperty == '!' ? 'exclude' : 'include',
        value: formData.maker == '' ? [] : formData.maker.split(',') || []
      },
    },
  };
  return newData;
}

const getVersionProperty = (versionProperty) => {
  let _versionProperty;
  switch (versionProperty) {
  case 'include':
    _versionProperty = '';
    break;
  case 'exclude':
    _versionProperty = '!';
    break;
  default:
    _versionProperty =versionProperty;
    break;
  }
  return _versionProperty;
};

export function formatTargetingGroupDataFromPayload(payloadData) {
  const { direction } = payloadData;
  
  const data = {
    groupTargetId: payloadData.groupTargetId,
    name: payloadData.name,
    priority: payloadData.priority,

    appVersion: getVersionProperty(direction.appVersion.property) + direction.appVersion.value.join(',') || '',
    sdkVersion: getVersionProperty(direction.sdkVersion.property) + direction.sdkVersion.value.join(',') || '',
    location: direction.location.value.join(',') || '',
    locationProperty: ['', 'include'].includes(direction.location.property) ? '' : '!',

    maker: direction.maker.value.join(',') || '',
    makerProperty: ['', 'include'].includes(direction.maker.property) ? '' : '!',
    osv: direction.osv.value.join(',') || '',
    osvProperty: ['', 'include'].includes(direction.osv.property) ? '' : '!',
  };
  return data;
}
