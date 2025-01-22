import { request } from 'ice';

export default {
  async getDimensionOptions(dimensionKey: string) {
    return await request.get(`dimension/${dimensionKey}`, {
      instanceName: 'luna'
    });
  }
};
