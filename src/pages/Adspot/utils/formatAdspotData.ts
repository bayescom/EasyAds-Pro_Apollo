import { IAdspot } from '@/models/types/adspot';

export function formatPayloadDataFromModal(adspotFormData: IAdspot) {
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

    timeout: adspotPayloadData.timeout,
    deviceDailyReqLimit: adspotPayloadData.deviceDailyReqLimit,
    deviceDailyImpLimit: adspotPayloadData.deviceDailyImpLimit,
    deviceReqInterval: adspotPayloadData.deviceReqInterval,
  } as IAdspot;

  return adspot;
}
