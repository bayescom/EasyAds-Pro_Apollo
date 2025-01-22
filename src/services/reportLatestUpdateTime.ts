import { request } from 'ice';

export default {
  async getReportLatestUpdateTime(params) {
    return await request.get('/traffic/update_time', {
      params,
      instanceName: 'luna'
    });
  },
};
