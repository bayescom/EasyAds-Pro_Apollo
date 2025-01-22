import { request } from 'ice';
import { IAppVersion } from '@/models/types/version';
import replacePageLimitSort from './utils/replacePageLimitSort';

export default {
  async getAppVersion(mediumId: number) {
    const data = await request.get('/dimension/appver', {
      params: { mediaId: mediumId },
      instanceName: 'luna'
    });
    return data['dimension-list'];
  },

  async getAdvanceSdkVersion() {
    const data = await request.get('/dimension/sdkver', {
      instanceName: 'luna'
    });
    return data['dimension-list'];
  },

  async getAppVersionList(params) {
    const data = await request.get('/appver/list', {
      params: replacePageLimitSort(params),
      instanceName: 'luna'
    });
    return data;
  },

  async getAppVersionOne(id) {
    return await request.get(`/appver/{${id}`, {
      instanceName: 'luna'
    });
  },

  async createAppVersion(appver: IAppVersion) {
    appver.status = 1;
    return await request.post('/appver/', { appver }, {
      instanceName: 'luna'
    });
  },

  async updateAppVersion(appver: IAppVersion) {
    return await request({
      method: 'PUT',
      url: `/appver/${appver.id}`,
      data: { appver },
      instanceName: 'luna'
    });
  },

  async getSdkVersionList(params) {
    const data = await request.get('/sdkver/list', {
      params: replacePageLimitSort(params),
      instanceName: 'luna'
    });
    return data;
  },

  async getSdkVersionOne(id) {
    return await request.get(`/sdkver/{${id}`, {
      instanceName: 'luna'
    });
  },

  async createSdkVersion(sdkver: IAppVersion) {
    sdkver.status = 1;
    return await request.post('/sdkver/', { sdkver }, {
      instanceName: 'luna'
    });
  },

  async updateSdkVersion(sdkver: IAppVersion) {
    return await request({
      method: 'PUT',
      url: `sdkver/${sdkver.id}`,
      data: { sdkver },
      instanceName: 'luna'
    });
  },
};
