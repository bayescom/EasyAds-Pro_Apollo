import { request } from 'ice';
import replacePageLimitSort from './utils/replacePageLimitSort';

export default {
  async getList(params) {
    return await request.get('/sdk_customer_channel/list', {
      params: replacePageLimitSort(params),
      instanceName: 'luna'
    });
  },

  async create(sdkCustomerChannel) {
    return await request.post('/sdk_customer_channel/', { sdk_customer_channel: sdkCustomerChannel }, {
      instanceName: 'luna'
    });
  },

  async update(sdkCustomerChannel) {
    return await request({
      method: 'PUT',
      url: `/sdk_customer_channel/${sdkCustomerChannel.id}`,
      data: { sdk_customer_channel: sdkCustomerChannel },
      instanceName: 'luna'
    });
  },

  async getAdapterAdspotType() {
    return await request.get('/sdk_customer_channel/adapter_adspot_type', {
      instanceName: 'luna'
    });
  },
};
