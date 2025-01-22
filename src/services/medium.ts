import { IMedium } from '@/models/types/medium';
import { request } from 'ice';
import replacePageLimitSort from './utils/replacePageLimitSort';

export default {
  async getOne(id) {
    return await request.get(`/media/${id}`, {
      instanceName: 'luna'
    });
  },

  async getList(params) {
    return await request.get('/media/medias', {
      params: replacePageLimitSort(params),
      instanceName: 'luna'
    });
  },

  async create(media: IMedium) {
    media.status = 1;
    return await request.post('/media/', { media }, {
      instanceName: 'luna'
    });
  },

  async update(media: IMedium) {
    return await request({
      method: 'PUT',
      url: `/media/${media.id}`,
      data: { media },
      instanceName: 'luna'
    });
  },

  async delete(mediumId: number) {
    await request.delete(`/media/${mediumId}`, {
      instanceName: 'luna'
    });
  },

  async geTrafficMediaList(params?) {
    return await request.get('/traffic/filter/media', {
      params,
      instanceName: 'luna'
    });
  },

  async updateBatch(mediumList) {
    return await request({
      method: 'PUT',
      url: '/media/status',
      data: { medias: mediumList },
      instanceName: 'luna'
    });
  },
};
