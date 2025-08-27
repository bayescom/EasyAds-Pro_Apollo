import { request } from 'ice';
import replacePageLimitSort from './utils/replacePageLimitSort';

export default {
  async getList(params) {
    return await request.get('/sdk_experiment/list', {
      params: replacePageLimitSort(params),
      instanceName: 'luna'
    });
  },

  async getFilterExperimentList() {
    return await request.get('/sdk_experiment/filter/list', {
      instanceName: 'luna'
    });
  },

  async getFilterExperimentMediaList() {
    return await request.get('/sdk_experiment/filter/list/media', {
      instanceName: 'luna'
    });
  },

  async getFilterExperimentAdspotList(params) {
    return await request.get('/sdk_experiment/filter/list/adspot', {
      params,
      instanceName: 'luna'
    });
  },

  async getOneExperimentById(expId) {
    return await request.get(`/sdk_experiment/${expId}`, {
      instanceName: 'luna'
    });
  },

  async getExperimentReportDetailById(params) {
    return await request.get('/sdk_experiment/report', {
      params: replacePageLimitSort(params),
      instanceName: 'luna'
    });
  },
};
