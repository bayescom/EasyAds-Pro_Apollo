import { request } from 'ice';
import replacePageLimitSort from './utils/replacePageLimitSort';

export default {
  async getList({params, sdkChannelId}) {
    return await request.get(`/sdk_channel/traffic/${sdkChannelId}`, {
      params: replacePageLimitSort(params),
      instanceName: 'luna'
    });
  },

  async updateStatus({ sdkGroupId, adspotSdkChannelId, status } : { sdkGroupId: number, adspotSdkChannelId: number, status: number }) {
    return await request({
      method: 'PUT',
      url: `/sdk_channel/traffic/${sdkGroupId}/${adspotSdkChannelId}?status=${status}`,
      instanceName: 'luna'
    });
  },


  async delete({ adspotId, adspotChannelId }: { adspotId: number, adspotChannelId: number }) {
    return await request({
      method: 'DELETE',
      url: `/adspot/traffic/${adspotId}/${adspotChannelId}`,
      instanceName: 'luna'
    });
  },


  async batchDelete(deleteData) {
    return await request.delete('/adspot/traffic/batch/adspot_channels',
      {
        data: {
          adspot_channel_detail_list: deleteData
        },
        instanceName: 'luna'
      }
    );
  },
};
