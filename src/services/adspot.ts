import { request } from 'ice';
import replacePageLimitSort from './utils/replacePageLimitSort';

export default {
  async getOne(id) {
    return await request.get(`/adspot/${id}`, {
      instanceName: 'luna'
    });
  },

  async getList(params) {
    return await request.get('/adspot/adspots', {
      params: replacePageLimitSort(params),
      instanceName: 'luna'
    });
  },

  async create(adspot) {
    return await request.post('/adspot/', { adspot }, {
      instanceName: 'luna'
    });
  },

  async update(adspot) {
    return await request({
      method: 'PUT',
      url: `/adspot/${adspot.id}`,
      data: { adspot },
      instanceName: 'luna'
    });
  },

  async delete(adspotId: number) {
    await request.delete(`/adspot/${adspotId}`, {
      instanceName: 'luna'
    });
  },

  async getLayoutList() {
    return await request.get('/adspot/type', {
      instanceName: 'luna'
    });
  },

  async geTrafficAdspotList(params) {
    return await request.get('/traffic/filter/adspot', {
      params,
      instanceName: 'luna'
    });
  },

  async updateBatchAdspot(adspotList) {
    return await request({
      method: 'PUT',
      url: '/adspot/status',
      data: { adspots: adspotList },
      instanceName: 'luna'
    });
  },
};
