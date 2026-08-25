import sdkChannelTrafficService from '@/services/sdkChannelTraffic';
import store, { IRootDispatch } from '@/store';
import { ICommonMap, ICommonState } from './types/common';
import { ISdkChannelTrafficList, SdkChannelTrafficListFilter } from './types/sdkChannelTrafficList';
import { PageParams, SortParams } from '@/models/types/common';

type IState = ICommonState<ISdkChannelTrafficList> & ICommonMap<ISdkChannelTrafficList> & {
  mediaIds: number[],
  total: number,
};
const defaultState: IState = {
  list: [],
  total: 0,
  map: {},
  mediaIds: []
};

export default {
  state: defaultState,

  reducers: {
    setEditing(prevState: IState, sdkChannelTrafficList: ISdkChannelTrafficList) {
      prevState.editing = sdkChannelTrafficList;
    },

    setList(prevState: IState, list: ISdkChannelTrafficList[]) {
      prevState.list = list;
      list.forEach(item => {
        prevState.map[item.id] = item;
      });
    },

    setTotal(prevState: IState, total: number) {
      prevState.total = total;
    },

    setOne(prevState: IState, sdkChannelTrafficList: ISdkChannelTrafficList) {
      const index = prevState.list.findIndex(item => item.id === sdkChannelTrafficList.id);
      prevState.list[index] = {
        ...prevState.list[index],
        ...sdkChannelTrafficList
      };
      prevState.map[sdkChannelTrafficList.id] = sdkChannelTrafficList;
    },

    remove(prevState: IState, { id, index }: { id: number, index: number }) {
      if (prevState.list[index].id === id) {
        prevState.list.splice(index, 1);
      }
    },

    setMediaIds(prevState: IState, mediaIds) {
      prevState.mediaIds = mediaIds;
    },
  },

  effects: (dispatchers: IRootDispatch) => ({
    async getList({ params, sdkChannelId }:{params: SdkChannelTrafficListFilter & PageParams & SortParams, sdkChannelId: number}) {
      const data = await sdkChannelTrafficService.getList({ params, sdkChannelId });

      const formatDataList = data['sdk_channel_traffic'].map(item => {return {...item, ...item.data};});
      dispatchers.sdkChannelTrafficList.setList(formatDataList);
      dispatchers.sdkChannelTrafficList.setTotal(data.meta.total);

      return {
        data: formatDataList,
        total: data.meta.total
      };
    },

    async updateStatus({ channelTraffic, status } : { channelTraffic: ISdkChannelTrafficList, status: boolean }) {
      await sdkChannelTrafficService.updateStatus({
        sdkGroupId: channelTraffic.sdkGroup.sdk_group_id,
        adspotSdkChannelId: channelTraffic.id,
        status: status ? 1 : 0
      });
      const newChannel = {
        ...channelTraffic,
        status: +status
      };
      dispatchers.sdkChannelTrafficList.setEditing(newChannel);
      dispatchers.sdkChannelTrafficList.setOne(newChannel);
      dispatchers.sdkChannelTrafficList.setTotal(store.getModelState('sdkChannelTrafficList').total - 1);
      return newChannel;
    },

    async delete({ adspotId, adspotChannelId, index }: { adspotId: number,adspotChannelId: number,  index: number }) {
      await sdkChannelTrafficService.delete({ adspotId, adspotChannelId });
      dispatchers.sdkChannelTrafficList.remove({ id: adspotId, index });
    },

    async batchDelete(deleteData) {
      await sdkChannelTrafficService.batchDelete(deleteData);
    }
  }),
};
