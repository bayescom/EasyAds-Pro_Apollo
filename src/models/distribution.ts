import store, { IRootDispatch } from '@/store';
import { adspotSelectOption } from './types/distribution';
import { DragTagList, checkAllFlagMap, checkedListMap, dataTargetCheckAllFlagMap, dataTargetCheckedListMap } from './types/dataTargetOperation';
import { dataTargetArray, formatValueList } from '@/components/DataTargetOperations/utils';
import mediumService from '@/services/medium';
import { IMedium } from './types/medium';
import adspotService from '@/services/adspot';
import sdkChannelService from '@/services/sdkChannel';
import { IAdspot } from '@/models/types/adspotList';
import { DateType } from './types/common';
import moment from 'moment';

type DirectionType = {
  name: string,
  property: string,
  value: string []
}

type SdkStrategyDirectionType = {
  directionList: DirectionType []
}

type IState = {
  adspotSelectOptions: adspotSelectOption[];
  channelName: string,
  dataTargetModalVisible: boolean,
  /** 分发页面列表指标数组*/
  distributionDataTarget: string[],
  /** 数据指标弹窗的checkbox的设置 */
  dragTagList: DragTagList[],
  dataTargetCheckAllFlagMap: dataTargetCheckAllFlagMap,
  dataTargetCheckedListMap: dataTargetCheckedListMap,
  adspotId: number,
  mediaId: number,
  currentAdspot: IAdspot[],
  mediumList: IMedium[],
  adspotList: IAdspot[],
  time: DateType,
  currentTargetId: number,
  currentGroupTargetId: number,
  sdkStrategyDirection: SdkStrategyDirectionType
}

export const defaultCheckedListMap: checkedListMap = {
  biddingData: [],
  reqData: ['req', 'bid', 'bidRate', 'imp', 'impRate', 'click'],
  incomeData: ['income', 'ecpm', 'ecpc'],
};

export const defaultCheckAllFlagMap: checkAllFlagMap = {
  incomeData: {
    indeterminate: false,
    checkAll: true
  },
  biddingData: {
    indeterminate: false,
    checkAll: false
  },
  reqData: {
    indeterminate: true,
    checkAll: false
  },
};

const clearCheckAllFlagMap: checkAllFlagMap = {
  incomeData: {
    indeterminate: false,
    checkAll: false
  },
  biddingData: {
    indeterminate: false,
    checkAll: false
  },
  reqData: {
    indeterminate: false,
    checkAll: false
  }
};

const clearCheckedListMap: checkedListMap = {
  incomeData: [],
  biddingData: [],
  reqData: []
};

export const defaultDataTargetCheckAllFlagMap: dataTargetCheckAllFlagMap  = {
  statistics: defaultCheckAllFlagMap,
  third: clearCheckAllFlagMap,
  gap: clearCheckAllFlagMap
};

export const defaultDataTargetCheckedListMap: dataTargetCheckedListMap = {
  statistics: defaultCheckedListMap,
  third: clearCheckedListMap,
  gap: clearCheckedListMap
};

const clearDataTargetCheckedListMap = {
  statistics: clearCheckedListMap,
  third: clearCheckedListMap,
  gap: clearCheckedListMap
};

const clearDataTargetCheckAllFlagMap = {
  statistics: clearCheckAllFlagMap,
  third: clearCheckAllFlagMap,
  gap: clearCheckAllFlagMap
};

export const defaultDragTagList = [
  {value: 'income', title: '预估收益',  father: 'incomeData', belong: 'statistics'},
  {value: 'ecpm',  title: 'eCPM(¥)', father: 'incomeData', belong: 'statistics'},
  {value: 'ecpc', title: 'eCPC(¥)', father: 'incomeData', belong: 'statistics'},
  {value: 'req', title: '请求', father: 'reqData', belong: 'statistics'},
  {value: 'bid', title: '返回', father: 'reqData', belong: 'statistics'},
  {value: 'bidRate', title: '填充率', father: 'reqData', belong: 'statistics'},
  {value: 'imp', title: '展示', father: 'reqData', belong: 'statistics'},
  {value: 'impRate', title: '展示率', father: 'reqData', belong: 'statistics'},
  {value: 'click', title: '点击', father: 'reqData', belong: 'statistics'}
];

export const defaultDistributionDataTarget = ['income', 'ecpm', 'ecpc', 'req', 'bid', 'bidRate', 'imp', 'impRate', 'click'];

const defaultTime = {
  beginTime: moment().subtract(1, 'day').startOf('day').unix(),
  endTime: moment().subtract(1, 'day').endOf('day').unix()
};

const defaultState:IState = {
  adspotSelectOptions: [],
  channelName: '',
  dataTargetModalVisible: false,
  distributionDataTarget: defaultDistributionDataTarget,
  dragTagList: defaultDragTagList,
  dataTargetCheckAllFlagMap: defaultDataTargetCheckAllFlagMap,
  dataTargetCheckedListMap: defaultDataTargetCheckedListMap,
  mediaId: 0,
  adspotId: 0,
  currentAdspot: [],
  mediumList: [],
  adspotList: [],
  adspotListMap: {},
  time: defaultTime,
  currentTargetId: 0,
  // currentTrafficId: 0,
  currentGroupTargetId: 0,
  sdkStrategyDirection: []
};

export default {
  state: defaultState,

  reducers: {
    setAdspotSelectOptions(prevState:IState, list) {
      prevState.adspotSelectOptions = list;
    },

    setDataTargetModalVisible(prevState:IState, dataTargetModalVisible) {
      prevState.dataTargetModalVisible = dataTargetModalVisible;
    },

    // 数据指标弹窗的设置
    setCheckedListMap(prevState:IState, {dataKey, fatherKey, newCheckedChildrenList}) {
      prevState.dataTargetCheckedListMap[dataKey][fatherKey] = newCheckedChildrenList;
    },

    setCheckAllFlagMap(prevState:IState, {dataKey, fatherKey, newFlagMap}) {
      prevState.dataTargetCheckAllFlagMap[dataKey][fatherKey] = newFlagMap;
    },

    // 这里是直接使用本地localStorage数据赋值
    setLocalStorageParams(prevState:IState, dataTargetCheckAllFlagMap, dataTargetCheckedListMap) {
      // 当前页面显示的勾选项
      const currentPageShowIncomeData = formatValueList(dataTargetArray[0].children[0].children);
      const currentPageShowReqData = formatValueList(dataTargetArray[0].children[1].children);
      // 当前state里存储的勾选数据
      const currentStateSaveIncomeData = dataTargetCheckedListMap.statistics.incomeData.filter(item => currentPageShowIncomeData.includes(item));
      const currentStateSaveReqData = dataTargetCheckedListMap.statistics.reqData.filter(item => currentPageShowReqData.includes(item));
     
      const incomeDataIndeterminate = !!currentStateSaveIncomeData.length && currentStateSaveIncomeData.length < currentPageShowIncomeData.length;
      const incomeDataCheckAll = currentStateSaveIncomeData.length == currentPageShowIncomeData.length;

      const reqDataIndeterminate = !!currentStateSaveReqData.length && currentStateSaveReqData.length < currentPageShowReqData.length;
      const reqDataCheckAll = currentStateSaveReqData.length == currentPageShowReqData.length;

      const newStatisticsMap = {
        ...dataTargetCheckAllFlagMap.statistics,
        incomeData: {indeterminate: incomeDataIndeterminate, checkAll: incomeDataCheckAll},
        reqData: {indeterminate: reqDataIndeterminate, checkAll: reqDataCheckAll}
      };

      const newCheckedChildrenMap = {...dataTargetCheckAllFlagMap, statistics: newStatisticsMap};
      prevState.dataTargetCheckAllFlagMap = newCheckedChildrenMap;
      prevState.dataTargetCheckedListMap = dataTargetCheckedListMap;
    },

    setDragTagList(prevState:IState, dragTagList) {
      prevState.dragTagList = dragTagList;
    },

    setClearAll(prevState:IState, arg) {
      prevState.dataTargetCheckAllFlagMap = clearDataTargetCheckAllFlagMap;
      prevState.dataTargetCheckedListMap = clearDataTargetCheckedListMap;
      prevState.dragTagList = [];
    },

    setDistributionDataTarget(prevState:IState, data) {
      prevState.distributionDataTarget = data;
    },

    setAdspotId(prevState:IState, adspotId) {
      prevState.adspotId = adspotId;
    },

    setCurrentTargetId(prevState:IState, currentTargetId) {
      return {
        ...prevState,          // 复制旧状态
        currentTargetId,        // 更新目标字段
      };
    },


    setCurrentGroupTargetId(prevState:IState, currentGroupTargetId) {
      prevState.currentGroupTargetId = currentGroupTargetId;
    },

    setMediaId(prevState:IState, mediaId) {
      prevState.mediaId = mediaId;
    },

    setCurrentAdspot(prevState:IState, currentAdspot) {
      prevState.currentAdspot = currentAdspot;
    },

    setMediumList(prevState:IState, mediumList) {
      prevState.mediumList = mediumList;
    },

    setAdspotList(prevState:IState, adspotList) {
      prevState.adspotList = adspotList;
      adspotList.forEach(item => {
        prevState.adspotListMap[item.id] = item;
      });
    },

    setTime(prevState: IState, time: DateType) {
      prevState.time = time;
    },

    setSdkStrategyDirection(prevState:IState, sdkStrategyDirection) {
      prevState.sdkStrategyDirection = sdkStrategyDirection;
    }
  },

  effects: (dispatchers: IRootDispatch) => ({
    async getMediumList(params) {
      const data = await mediumService.getList(params);
      const mediaList = data.medias.filter(item => item.adspotCount);
      dispatchers.distribution.setMediumList(mediaList);

      return {
        data: data.medias,
        total: data.meta.total
      };
    },

    async getAdspotList(params) {
      const data = await adspotService.getList(params);
      dispatchers.distribution.setAdspotList(data.adspots);

      return {
        data: data.adspots,
        total: data.meta.total
      };
    },

    async getSdkStrategyDirection({ targetId }: { targetId: number }) {
      const data = await sdkChannelService.getSdkStrategyDirection(targetId);
      if (!data) {
        return;
      }
      dispatchers.distribution.setSdkStrategyDirection(data.strategySummary);
    },
  }),
};
