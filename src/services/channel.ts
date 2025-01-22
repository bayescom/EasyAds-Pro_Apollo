import { ISdkChannel } from '@/models/types/channel';
import { request } from 'ice';
import replacePageLimitSort from './utils/replacePageLimitSort';

export default {
  // sdk 广告网络管理接口
  async getSdkList(params) {
    return await request.get('/sdk_adn/adns', {
      params: replacePageLimitSort(params),
      instanceName: 'luna'
    });
  },

  // sdk 广告网络管理更新接口
  async updateSdkChannel(channel: ISdkChannel) {
    return await request({
      method: 'PUT',
      url: `sdk_adn/${channel.adnId}`,
      data: { sdk_adn: channel },
      instanceName: 'luna'
    });
  },

  async getTrafficChannelList(params?) {
    return await request.get('traffic/filter/channel', {
      params,
      instanceName: 'luna'
    });
  }
};
