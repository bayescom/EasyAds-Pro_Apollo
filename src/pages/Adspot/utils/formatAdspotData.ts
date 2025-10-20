import { IAdspot } from '@/models/types/adspot';

export function formatPayloadDataFromModal(adspotFormData: IAdspot) {
  let reward;
  if (adspotFormData.adspotType == 5 && adspotFormData.integrationType == 0 && adspotFormData.rewardReveal) {
    reward = {
      rewardName: adspotFormData.rewardName,
      rewardAmount: adspotFormData.rewardAmount ? +adspotFormData.rewardAmount : null,
      rewardCallback: adspotFormData.rewardCallback,
      securityKey : adspotFormData.securityKey,
    };
  } else {
    reward = null;
  }

  const adspotNew = {
    id: adspotFormData.id,
    adspotName: adspotFormData.adspotName,
    status: adspotFormData.status ? 1 : 0,
    mediaId: adspotFormData.mediaId,
    integrationType: adspotFormData.integrationType,
    adspotType: adspotFormData.adspotType,
    timeout: adspotFormData.timeout || 500,
    deviceDailyReqLimit: adspotFormData.deviceDailyReqLimit || null,
    deviceDailyImpLimit: adspotFormData.deviceDailyImpLimit || null,
    deviceReqInterval: adspotFormData.deviceReqInterval || null,
    property: { reward }
  };
  return adspotNew;
}

export function formatModalDataFromPayload(adspotPayloadData) {
  const adspot = {
    id: adspotPayloadData.id,
    adspotName: adspotPayloadData.adspotName,
    status: adspotPayloadData.status ? true : false,

    mediaId: adspotPayloadData.mediaId,
    integrationType: adspotPayloadData.integrationType || 0,
    adspotType: adspotPayloadData.adspotType,

    rewardReveal: adspotPayloadData.property.reward ? 1 : 0,
    rewardName: adspotPayloadData.property.reward ? adspotPayloadData.property.reward.rewardName : '',
    rewardAmount: adspotPayloadData.property.reward ? adspotPayloadData.property.reward.rewardAmount : null,
    rewardCallback: adspotPayloadData.property.reward ? adspotPayloadData.property.reward.rewardCallback : '',
    securityKey: adspotPayloadData.property.reward ? adspotPayloadData.property.reward.securityKey : '',

    timeout: adspotPayloadData.timeout,
    deviceDailyReqLimit: adspotPayloadData.deviceDailyReqLimit,
    deviceDailyImpLimit: adspotPayloadData.deviceDailyImpLimit,
    deviceReqInterval: adspotPayloadData.deviceReqInterval,
  } as IAdspot;

  return adspot;
}
