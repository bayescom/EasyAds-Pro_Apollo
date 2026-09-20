import store from '@/store';

export default function getAdspotSdkChannelQueryParams(adspotId?: number) {
  const distribution = store.getModelState('distribution');
  const adspotState = store.getModelState('adspot');
  const id = adspotId || distribution.adspotId;

  const fromDetail = id
    ? (adspotState.map[id] || (adspotState.editing?.id === id ? adspotState.editing : undefined))
    : undefined;
  const fromDistribution = id
    ? distribution.adspotList.find(item => item.id == id)
    : undefined;

  return {
    renderType: fromDetail?.renderType ?? fromDistribution?.renderType ?? 0,
    platformType: fromDetail?.platformType ?? fromDistribution?.platformType,
    adspotType: fromDetail?.adspotType ?? fromDistribution?.adspotType,
  };
}
