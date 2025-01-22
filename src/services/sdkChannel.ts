import { DateType } from '@/models/types/common';
import { ISdkAdspotChannel } from '@/models/types/sdkAdspotChannel';
import { TrafficPercentageType, GroupStrategyType } from '@/models/types/sdkDistribution';
import { request } from 'ice';

export default {
  // 添加、编辑广告源的时候，渠道的列表
  async getSdkChannels() {
    return await request.get('/sdk_adn/adns', {
      instanceName: 'luna'
    });
  },

  // 广告位SDK渠道列表
  async getSdkAdspotChannels(adspotId: number, dateType: DateType) {
    return await request.get(`/adspot/sdk/${adspotId}`, {
      params: dateType,
      instanceName: 'luna'
    });
  },

  // 据广告位id + SDK渠道id获取某一个广告位的某一个SDK渠道信息
  async getSdkAdspotChannel({adspotId, sdkAdspotChannelId } : { adspotId: number, sdkAdspotChannelId: number}) {
    return await request.get(`/adspot/sdk/${adspotId}/${sdkAdspotChannelId}`, {
      instanceName: 'luna'
    });
  },

  // 新建广告位的单个SDK渠道
  async createSdkAdspotChannel({ model, adspotId } : { model: Omit<ISdkAdspotChannel, 'id'>, adspotId: number}) {
    return await request.post(`/adspot/sdk/${adspotId}`, {
      sdk_channel: model
    }, {
      instanceName: 'luna'
    });
  },

  // 批量创建广告位的SDK渠道
  async batchCreationSdkAdspotChannel({adspotId, model}) {
    return await request.post(`/adspot/sdk/${adspotId}/batch`, {
      sdkChannelList: model
    }, {
      instanceName: 'luna'
    });
  },

  // 根据广告位id + SDK渠道id更新某一个广告位的某一个SDK渠道信息
  async updateSdkAdspotChannel({ model, adspotId } : { model: ISdkAdspotChannel, adspotId: number }) {
    return await request.put(`/adspot/sdk/${adspotId}/${model.id}`, {
      sdk_channel: model
    }, {
      instanceName: 'luna'
    });
  },

  // 根据广告位id + SDK渠道id删除渠道信息
  async deleteSdkAdspotChannel({ sdkAdspotChannelId, adspotId } : { sdkAdspotChannelId: number, adspotId: number }) {
    return await request.delete(`/adspot/sdk/${adspotId}/${sdkAdspotChannelId}`, {
      instanceName: 'luna'
    });
  },

  // 根据广告位id + SDK渠道id获取当前要删除的这个sdkChannelId还有哪些分发在用
  async getDeleteSdkAdspotChannelStatus({ sdkAdspotChannelId, adspotId } : { sdkAdspotChannelId: number, adspotId: number }) {
    return await request.get(`/adspot/sdk/${adspotId}/${sdkAdspotChannelId}/status`, {
      instanceName: 'luna'
    });
  },

  // 广告位流量分发列表
  async getSdkDistribution(adspotId: number, dateType: DateType) {
    return await request.get(`/adspot/sdk_traffic/${adspotId}`, {
      params: dateType,
      instanceName: 'luna'
    });
  },

  // 编辑流量分组
  async updateTargetingGroups(adspotId: number, groupStrategyList: GroupStrategyType[], percentageGroupId: number) {
    if (!percentageGroupId) {
      // TODO: 先分组后比例的情况
      return;
    }

    return await request.put(`/adspot/sdk/group_strategy/${adspotId}/${percentageGroupId}`, {
      groupStrategyList,
    }, {
      instanceName: 'luna'
    });
  },

  // 更新广告位的流量分组
  async updatePercentageGroups(
    adspotId: number,
    trafficPercentageList: TrafficPercentageType[]
  ) {
    
    return await request.put(`/adspot/sdk/traffic_percentage/${adspotId}`, {
      trafficPercentageList
    }, {
      instanceName: 'luna'
    });
  },

  // 分发策略设置
  async updateSuppliers(adspotId, trafficId, sdkSupplierMap) {
    return await request.put(`/adspot/sdk_traffic/${adspotId}/${trafficId}`, {
      id: trafficId,
      sdkSupplierMap: sdkSupplierMap
    }, {
      instanceName: 'luna'
    });
  },

  // sdk广告源弹窗新建时，根据当前广告源获取是否填写过应用ID/媒体ID
  async getMetaAppId({adspotId, sdkChannelId}) {
    return await request.get(`adspot/sdk_meta/${adspotId}/${sdkChannelId}`, {
      instanceName: 'luna'
    });
  },
};
