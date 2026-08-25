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

    async updateSdkChannel(channel: ISdkChannel & { renderType?: number, platformType?: number, adspotType?: number }) {
      const { renderType, platformType, adspotType, ...channelPayload } = channel;
      const data = await channelService.updateSdkChannel(formatChannelFromModal(channelPayload as ISdkChannel));
      if (data && (renderType !== undefined || platformType !== undefined || adspotType !== undefined)) {
        // 分发场景下提交完后重新拉取广告网络列表，这样不用刷新页面
        await dispatchers.sdkChannel.queryAll({renderType, platformType, adspotType});
      }
    }
  }),
};
