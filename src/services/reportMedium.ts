import { request } from 'ice';

export default {
  async getMediaChart(params) {
    return await request.get('/traffic/report/chart', {
      params,
      instanceName: 'luna'
    });
  },

  async getMediaDetail(params) {
    return await request.get('/traffic/report/detail', {
      params,
      instanceName: 'luna'
    });
  },

  async createFile({ formData, queryString }) {
    return await request({
      method: 'POST',
      url: `traffic/report/income-upload?${queryString}`,
      data: formData,
      instanceName: 'luna'
    });
  },
};
