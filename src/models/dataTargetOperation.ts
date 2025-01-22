import store, { IRootDispatch } from '@/store';
import { dataTargetArray, formatValueList } from '@/components/DataTargetOperations/utils';
import { DataTargetArray, DragTagList, checkAllFlagMap, checkedListMap, dataTargetCheckAllFlagMap, dataTargetCheckedListMap } from './types/dataTargetOperation';

type IState = {
  dataTargetModalVisible: boolean,
  /** 所引用的页面的所在列表指标数组*/
  pageDataTarget: string[],
  /** 数据指标弹窗的checkbox的设置 */
  dragTagList: DragTagList[],
  dataTargetCheckAllFlagMap: dataTargetCheckAllFlagMap,
  dataTargetCheckedListMap: dataTargetCheckedListMap,
  dataTargetArray: DataTargetArray
};

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

export const pageDataTarget = ['income', 'ecpm', 'ecpc', 'req', 'bid', 'bidRate', 'imp', 'impRate', 'click'];

const defaultState: IState = {
  dataTargetModalVisible: false,
  dragTagList: defaultDragTagList,
  pageDataTarget: pageDataTarget,
  dataTargetCheckAllFlagMap: defaultDataTargetCheckAllFlagMap,
  dataTargetCheckedListMap: defaultDataTargetCheckedListMap,
  dataTargetArray: dataTargetArray
};

export default {
  state: defaultState,

  reducers: {
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
      prevState.dataTargetCheckAllFlagMap = dataTargetCheckAllFlagMap;
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

    setPageDataTarget(prevState:IState, data) {
      prevState.pageDataTarget = data;
    },

    setDataTargetArray(prevState:IState, dataTargetArray, newCheckedChildrenMap) {
      prevState.dataTargetArray = dataTargetArray;
      prevState.dataTargetCheckAllFlagMap = newCheckedChildrenMap;
    },
  },

  effects: (dispatchers: IRootDispatch) => ({
    async setUpPageDisplay(dataTargetArray) {
      const dataTargetCheckAllFlagMap = store.getModelState('dataTargetOperation').dataTargetCheckAllFlagMap;
      const dataTargetCheckedListMap = store.getModelState('dataTargetOperation').dataTargetCheckedListMap;
      
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
      dispatchers.dataTargetOperation.setDataTargetArray(dataTargetArray, newCheckedChildrenMap);
    },
  }),
};
