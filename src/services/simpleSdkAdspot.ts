import { request } from 'ice';

export default {
  async getList(channelIds?) {
    return await request.get('/traffic/filter/sdk_adspot', {
      params: { channelIds },
      instanceName: 'luna'
    });
  },

  async getReportMediumList(params) {
    return await request.get('/traffic/filter/adspot_meta', {
      params: params,
      instanceName: 'luna'
    });
  },
};
