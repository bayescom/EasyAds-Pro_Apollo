import store, { IRootDispatch } from '@/store';
import reportAbTestService from '@/services/reportAbTest';
import { IReportReportAbTest, ReportReportAbTestDetailFilter, DimensionChartItemData, IReportReportAbTestDetailList } from './types/reportAbTest';
import { BasicOption } from '@/models/types/common';
import moment from 'moment';
import { formatDataPayload } from '@/pages/Channel/utils/formatChannelData';

type IState = {
  detailList: IReportReportAbTestDetailList [],
  dimensionChart: DimensionChartItemData [],
  currentExperiment: IReportReportAbTest,
  queryParams: ReportReportAbTestDetailFilter,
  groupList: BasicOption<number>[],
  contrastData: {
    [key in string] : string
  },
  timeList: string [],
}

const defaultParams: ReportReportAbTestDetailFilter = {
  beginTime: moment().subtract(1, 'day').startOf('day').unix(),
  endTime: moment().subtract(1, 'day').endOf('day').unix(),
  isThird: 0
};

const defaultState: IState = {
  detailList: [],
  currentExperiment: {},
  dimensionChart: [],
  queryParams: defaultParams,
  groupList: [],
  contrastData: {},
  timeList: []
};

export default {
  state: defaultState,

  reducers: {
    setDetailList(prevState: IState, detailList: IReportReportAbTestDetailList[]) {
      prevState.detailList = detailList;
    },

    setCurrentExperiment(prevState: IState, currentExperiment: IReportReportAbTest) {
      return {
        ...prevState,  
        currentExperiment
      };
    },

    setContrastData(prevState: IState, contrastData) {
      prevState.contrastData = contrastData;
    },

    setQueryParams(prevState: IState, queryParams) {
      prevState.queryParams.adspotId = queryParams.adspotId;
      prevState.queryParams.expId = queryParams.expId;
      prevState.queryParams.expType = queryParams.expType;
      prevState.queryParams.beginTime = queryParams.beginTime;
      prevState.queryParams.endTime = queryParams.endTime;
      prevState.queryParams.isThird = queryParams.isThird;
    },

    setDimensionChart(prevState: IState, dimensionChart: DimensionChartItemData []) {
      prevState.dimensionChart = dimensionChart;
    },

    setTimeList(prevState: IState, timeList: string []) {
      prevState.timeList = timeList;
    },

    setGroupList(prevState: IState, groupList){
      prevState.groupList = groupList;
    },
  },

  effects: (dispatchers: IRootDispatch) => ({
    async getExperimentReportDetailById() {
      const queryParams = store.getModelState('reportAbTestDetail').queryParams;

      const data = await reportAbTestService.getExperimentReportDetailById({
        ...queryParams
      });
      const {dimensionChart, list, timeList } = data;
      // 这里是为了不让字体显示黄色，因为要用到的组件中有这个判断
      const _list = list.map(item => ({...item, completely: true, groupIdTemp: item.groupId}));
      dispatchers.reportAbTestDetail.setDetailList(formatDataPayload(_list).map(item => ({...item, groupId: item.groupIdTemp})));
      dispatchers.reportAbTestDetail.setDimensionChart(dimensionChart);
      dispatchers.reportAbTestDetail.setTimeList(timeList);
      dispatchers.reportAbTestDetail.setGroupList(list.map(item => ({
        value: item.groupId,
        name: item.tag
      })));

      return {
        data: data
      };
    },

    async getOneExperimentById (expId) {
      const data = await reportAbTestService.getOneExperimentById(expId);
      const currentExperiment = data['sdk_experiment'];
      dispatchers.reportAbTestDetail.setCurrentExperiment(currentExperiment);

      dispatchers.reportAbTestDetail.setQueryParams({
        ...store.getModelState('reportAbTestDetail').queryParams,
        adspotId: currentExperiment.adspotId,
        expId: currentExperiment.id,
        expType: currentExperiment.experimentType
      });
    },
  })
};
