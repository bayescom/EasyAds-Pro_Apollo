import store, { IRootDispatch } from '@/store';
import sdkChannelService from '@/services/sdkChannel';
import { ISdkDistribution, GroupStrategyType, TrafficPercentageType } from './types/sdkDistribution';
import moment from 'moment';
import { getLocalDateType } from '@/components/SdkDistribution/utils';
import { DateType } from './types/common';

type IState = {
  [key in number]: ISdkDistribution
}

const defaultState:IState = {};

const defaultTime = {
  beginTime: moment().subtract(1, 'day').startOf('day').unix(),
  endTime: moment().subtract(1, 'day').endOf('day').unix()
};

export default {
  state: defaultState,

  reducers: {
    setAdspotSdkDistribution(prevState: IState, { adspotId, data }: { adspotId: number, data: ISdkDistribution }) {
      prevState[adspotId] = data;
    },

    removeSdkAdspotChannel(prevState: IState, {
      adspotId,
      sdkAdspotChannelId
    }: {
      adspotId: number,
      sdkAdspotChannelId: number
    }) {
      const distribution = prevState[adspotId];

      distribution.percentageList?.forEach(percentageGroup => {
        percentageGroup.trafficGroupList.forEach(targetingGroup => {
          let rowIndex: number | undefined, cellIndex: number | undefined;
          targetingGroup.suppliers.forEach((row, i) => {
            row.forEach((cell, j) => {
              if (cell === sdkAdspotChannelId) {
                rowIndex = i;
                cellIndex = j;
              }
            });
          });

          if (rowIndex === undefined || cellIndex === undefined) {
            return;
          }

          if (targetingGroup.suppliers[rowIndex].length === 1) {
            targetingGroup.suppliers.splice(rowIndex, 1);
          } else {
            targetingGroup.suppliers[rowIndex].splice(cellIndex, 1);
          }
        });
      });
    },
  },

  effects: (dispatch: IRootDispatch) => ({
    async queryAdspotSdkDistribution({ adspotId, dateType }: { adspotId: number, dateType: DateType }) {
      const data = await sdkChannelService.getSdkDistribution(adspotId, dateType);
      if (!data) {
        return;
      }
      dispatch.sdkDistribution.setAdspotSdkDistribution({ adspotId, data: data });
    },

    async updateTargetingGroups({ adspotId, groupStrategyList, percentageGroupId }: {
      adspotId: number,
      groupStrategyList: GroupStrategyType[],
      percentageGroupId: number
    }) {
      const result = await sdkChannelService.updateTargetingGroups(adspotId, groupStrategyList, percentageGroupId);

      const localDateType = getLocalDateType();
      const dateType = localDateType ? localDateType : defaultTime;
      await dispatch.sdkDistribution.queryAdspotSdkDistribution({ adspotId, dateType });
      return result;
    },

    // 点击tab的右侧删除按钮可以删除分组
    async deleteTargetingGroup({ adspotId, percentageGroupId, targetingGroupId }: {
      adspotId: number,
      targetingGroupId: number,
      percentageGroupId: number
    }) {
      const distribution = store.getModelState('sdkDistribution')[adspotId];
      if (!distribution) {
        return;
      }

      // 先比例后定向时
      const percentageGroup = distribution.percentageList?.find(item => item.trafficPercentage.percentageId === percentageGroupId);
      if (!percentageGroup) {
        return;
      }
      const groupStrategyList = percentageGroup.trafficGroupList.filter(item => item.trafficId !== targetingGroupId).map(item => item.groupStrategy);

      await this.updateTargetingGroups({
        adspotId,
        groupStrategyList,
        percentageGroupId: percentageGroupId
      });
    },

    async updatePercentageGroups({ adspotId, trafficPercentageList }: {
      adspotId: number,
      trafficPercentageList: TrafficPercentageType[],
    }) {
      const result = await sdkChannelService.updatePercentageGroups(
        adspotId,
        trafficPercentageList,
      );
      const localDateType = getLocalDateType();
      const dateType = localDateType ? localDateType : defaultTime;
      await dispatch.sdkDistribution.queryAdspotSdkDistribution({ adspotId, dateType });
      return result;
    },

    async updateSuppliers({ adspotId, trafficId, sdkSupplierMap }: {
      adspotId: number,
      trafficId: number,
      sdkSupplierMap: {bidding: string, waterfall: string}
    }) {
      const result = await sdkChannelService.updateSuppliers(adspotId, trafficId, sdkSupplierMap);
      const localDateType = getLocalDateType();
      const dateType = localDateType ? localDateType : defaultTime;
      await dispatch.sdkDistribution.queryAdspotSdkDistribution({ adspotId, dateType });
      return result;
    }
  }),
};
