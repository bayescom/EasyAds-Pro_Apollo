import channelService from '@/services/channel';
import store, { IRootDispatch } from '@/store';
import { ICommonState } from './types/common';
import { ChannelFilter, ISdkChannel } from './types/channel';
import { PageParams, SortParams } from '@/models/types/common';
import { formatDataPayload, formatChannelFromModal } from '@/pages/Channel/utils/formatChannelData';

type IState = ICommonState<ISdkChannel>;

const defaultState: IState = {
  list: [],
};

export default {
  state: defaultState,

  reducers: {
    setList(prevState: IState, list: ISdkChannel[]) {
      prevState.list = list;
    }
  },

  effects: (dispatchers: IRootDispatch) => ({
    async getSdkList(params: ChannelFilter & PageParams & SortParams) {
      const data = await channelService.getSdkList({
        ...params,
      });

      dispatchers.channel.setList(formatDataPayload(data['sdk_adns']));
      
      return {
        data: (data['sdk_adns']),
        total: data.meta.total
      };
    },

    async updateSdkChannel(channel: ISdkChannel) {
      const data = await channelService.updateSdkChannel(formatChannelFromModal(channel));
      if (data) {
        // 提交完后重新拉取分发页面的广告网络列表，这样不用刷新页面
        await dispatchers.sdkChannel.queryAll();
      }
    }
  }),
};
