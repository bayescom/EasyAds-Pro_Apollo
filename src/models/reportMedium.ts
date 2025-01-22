import store, { IRootDispatch } from '@/store';
import mediaService from '@/services/medium';
import adspotService from '@/services/adspot';
import channelService from '@/services/channel';
import reportMediumService from '@/services/reportMedium';
import simpleSdkAdspotService from '@/services/simpleSdkAdspot';
import { SummaryData, IReportDetail } from '@/components/Utils/TableColumnByCompare';
import { IReportMediumChart, ReportMediumFilter } from './types/reportMedium';
import moment from 'moment';
import { FilterOptionOfValueNumber, TableParams } from './types/common';

interface selectList {
  id: number,
  name?: string,
  value?: string,
  channelId?: number,
}

const defaultParams: ReportMediumFilter = {
  beginTime: moment().subtract(7, 'days').startOf('day').unix(),
  endTime: moment().subtract(1, 'days').endOf('day').unix(),
  type: 2,
  contrastBeginTime: 0,
  contrastEndTime: 0,
  adspotIds: undefined,
  channelIds: undefined,
  mediaIds: undefined,
  sdkAdspotIds: undefined,
  adspotTypes: undefined
};

const defaultTableParams: TableParams = {
  page: 1,
  limit: 20,
  dimensions: 'timestamp,mediaId',
  sort: 'timestamp',
  dir: 'desc'
};

const defaultSummaryData : SummaryData = {
  data: {},
  adspotId: '',
  adspotName: '',
  channelId: '',
  channelName: '',
  dealId: '',
  dealName: '',
  mediaId: '',
  mediaName: '',
  sdkAdspotId: ''
};

const mediumChartDefaultValue : IReportMediumChart = {
  timeList: [],
  bid: [],
  bidRate: [],
  click: [],
  clickRate: [],
  ecpc: [],
  ecpm: [],
  gapBidPercent: [],
  gapClickPercent: [],
  gapImpPercent: [],
  gapReqPercent: [],
  imp: [],
  impRate: [],
  income: [],
  req: [],
  thirdBid: [],
  thirdBidRate: [],
  thirdClick: [],
  thirdClickRate: [],
  thirdEcpc: [],
  thirdEcpm: [],
  thirdImp: [],
  thirdImpRate: [],
  thirdIncome: [],
  thirdReq: [],
};

type IState = {
  queryParams: ReportMediumFilter,
  tableParams: TableParams,
  mediumChartList: IReportMediumChart [],
  mediumChartSummaryData: object,
  detailList: IReportDetail [],
  summaryData: SummaryData,
  total: number,
  mediaList: FilterOptionOfValueNumber [],
  adspotList: FilterOptionOfValueNumber [],
  channelList: FilterOptionOfValueNumber [],
  sdkAdspotList: selectList [],
  sdkAdspotMap: Partial<{
    [key in number]: selectList
  }>,
  isContrastTime: boolean,
  activeKey: string,
  // 当前汇总方式 1- 小时、 2 - 天 、3 - 周
  currentTimeType: number,
  // 当前是指标对比0，时间对比1，纬度对比2
  currentCompareType: number,
}

const defaultState: IState = {
  queryParams: defaultParams,
  tableParams: defaultTableParams,
  mediumChartList: [mediumChartDefaultValue],
  mediumChartSummaryData: {},
  detailList: [],
  summaryData: defaultSummaryData,
  total: 0,
  mediaList: [],
  adspotList: [],
  channelList: [],
  sdkAdspotList: [],
  sdkAdspotMap: {},
  isContrastTime: false,
  activeKey: 'detail',
  currentTimeType: 2,
  currentCompareType: 0,
};

export default {
  state: defaultState,

  reducers: {
    setChartList (prevState: IState, {mediumChartList, mediumChartSummaryData} : {mediumChartList: IReportMediumChart [], mediumChartSummaryData}) {
      prevState.mediumChartList = mediumChartList;
      prevState.mediumChartSummaryData = mediumChartSummaryData;
    },

    setDetailInfo (prevState: IState, payload) {
      return {
        ...prevState,
        ...payload
      };
    },

    setMediaList(prevState: IState, mediaList: FilterOptionOfValueNumber[]) {
      prevState.mediaList = mediaList;
    },

    setAdspotList(prevState: IState, adspotList: FilterOptionOfValueNumber[]) {
      prevState.adspotList = adspotList;
    },

    setChannelList(prevState: IState, channelList: FilterOptionOfValueNumber[]) {
      prevState.channelList = channelList;
    },

    setSdkAdspotList(prevState: IState, sdkAdspotList: selectList[]) {
      prevState.sdkAdspotList = sdkAdspotList;
      sdkAdspotList.forEach(item => {
        prevState.sdkAdspotMap[item.id] = item;
      });
    },

    setQueryParams(prevState: IState, queryParams) {
      const { time, contrastTime, sdkAdspotIds, ...form } = Object.assign({}, queryParams);
      if (contrastTime && contrastTime.length) {
        prevState.queryParams.contrastBeginTime = contrastTime[0].unix();
        prevState.queryParams.contrastEndTime = contrastTime[1].unix();
      }

      prevState.queryParams.adspotIds = form.adspotIds;
      prevState.queryParams.channelIds = form.channelIds;
      prevState.queryParams.mediaIds = form.mediaIds;
      prevState.queryParams.adspotTypes = form.adspotTypes;
      prevState.queryParams.beginTime = time[0].unix();
      prevState.queryParams.endTime = time[1].unix();
      prevState.queryParams.type = form.type;

      if (sdkAdspotIds) {
        prevState.queryParams.sdkAdspotIds = sdkAdspotIds.split(',').map(item => prevState.sdkAdspotMap[item]?.value).join(',');
      } else {
        prevState.queryParams.sdkAdspotIds = undefined;
      }

      // 筛选项改变的时候，page重置为1 
      prevState.tableParams.page = 1;
    },

    setTablePage(prevState: IState, tableParams: Partial<TableParams>) {
      prevState.tableParams = {
        ...prevState.tableParams,
        ...tableParams,
      };
    },

    setTableParams(prevState: IState, tableParams: Partial<TableParams>) {
      prevState.tableParams = {
        ...prevState.tableParams,
        ...tableParams,
        page: 1
      };
    },

    setIsContrastTime(prevState: IState, isContrastTime: boolean) {
      prevState.isContrastTime = isContrastTime;
    },

    setActiveKey(prevState: IState, activeKey: string) {
      prevState.activeKey = activeKey;
    },

    setCurrentTimeType(prevState: IState, currentTimeType: number) {
      prevState.currentTimeType = currentTimeType;
    },

    setCurrentCompareValue(prevState: IState, currentCompareType: number) {
      prevState.currentCompareType = currentCompareType;
    },
  },

  effects: (dispatchers: IRootDispatch) => ({
    async getMediumChartData () {
      let params = Object.assign({}, store.getModelState('reportMedium').queryParams);
      // 如果是按小时且时间是今天，给后端传的值就是今天0点到最近一小时
      if (params.type == 1 && moment().startOf('day').unix() == params.beginTime) {
        params.endTime = moment().subtract(1, 'hours').startOf('hour').unix();
      }
      
      const isContrastTime = store.getModelState('reportMedium').isContrastTime;
      if (!isContrastTime) {
        params = {...params, contrastBeginTime: undefined, contrastEndTime: undefined};
      } 
      const data = await reportMediumService.getMediaChart(params);

      dispatchers.reportMedium.setChartList({mediumChartList: data['chart'], mediumChartSummaryData: data['summary']});
      return data;
    },

    async getMediumDetailData () {
      const queryParams = store.getModelState('reportMedium').queryParams;
      const tableParams = store.getModelState('reportMedium').tableParams;
      const isContrastTime = store.getModelState('reportMedium').isContrastTime;
      
      let params = {...queryParams, ...tableParams};
      if (!isContrastTime) {
        params = {...params, contrastBeginTime: undefined, contrastEndTime: undefined};
      } 
      // 如果时间是今天，给后端传的值就是今天0点到最近一小时
      if (moment().startOf('day').unix() == params.beginTime) {
        params.endTime = moment().subtract(1, 'hours').unix();
      }
      const data = await reportMediumService.getMediaDetail(params);

      const detailList = data['detail'];
      const summaryData = data['summary'];
      const total = data['total'];
      dispatchers.reportMedium.setDetailInfo({ detailList, summaryData, total });

      return data;
    },

    async getMediaList () {
      const params = Object.assign({}, store.getModelState('reportMedium').queryParams);
      const isContrastTime = store.getModelState('reportMedium').isContrastTime;
      // 如果是按小时且时间是今天，给后端传的值就是今天0点到最近一小时
      if (params.type == 1 && moment().startOf('day').unix() == params.beginTime) {
        params.endTime = moment().subtract(1, 'hours').startOf('hour').unix();
      }
      const queryParams = {
        beginTime: params.beginTime, 
        endTime: params.endTime,
        type: 'report',
        ...isContrastTime && {
          contrastBeginTime: params.contrastBeginTime,
          contrastEndTime: params.contrastEndTime
        }
      };
      const mediaData = await mediaService.geTrafficMediaList(queryParams);
      dispatchers.reportMedium.setMediaList(mediaData);
    },

    async getAdspotList ({mediaIds, adspotTypes}: {mediaIds?: string, adspotTypes?: string}) {
      const params = Object.assign({}, store.getModelState('reportMedium').queryParams);
      const isContrastTime = store.getModelState('reportMedium').isContrastTime;
      // 如果是按小时且时间是今天，给后端传的值就是今天0点到最近一小时
      if (params.type == 1 && moment().startOf('day').unix() == params.beginTime) {
        params.endTime = moment().subtract(1, 'hours').startOf('hour').unix();
      }
      const queryParams = {
        mediaIds,
        adspotTypes,
        type: 'report',
        beginTime: params.beginTime, 
        endTime: params.endTime,
        ...isContrastTime && {
          contrastBeginTime: params.contrastBeginTime,
          contrastEndTime: params.contrastEndTime
        }
      };
      const adspotData = await adspotService.geTrafficAdspotList(queryParams);
      dispatchers.reportMedium.setAdspotList(adspotData);
    },

    async getChannelList () {
      const params = Object.assign({}, store.getModelState('reportMedium').queryParams);
      const isContrastTime = store.getModelState('reportMedium').isContrastTime;
      // 如果是按小时且时间是今天，给后端传的值就是今天0点到最近一小时
      if (params.type == 1 && moment().startOf('day').unix() == params.beginTime) {
        params.endTime = moment().subtract(1, 'hours').startOf('hour').unix();
      }
      const queryParams = {
        beginTime: params.beginTime, 
        endTime: params.endTime,
        type: 'report',
        ...isContrastTime && {
          contrastBeginTime: params.contrastBeginTime,
          contrastEndTime: params.contrastEndTime
        }
      };
      const channelData = await channelService.getTrafficChannelList(queryParams);
      dispatchers.reportMedium.setChannelList(channelData);
    },

    async getSdkAdspotList (channelIds?) {
      const params = Object.assign({}, store.getModelState('reportMedium').queryParams);
      // 如果是按小时且时间是今天，给后端传的值就是今天0点到最近一小时
      if (params.type == 1 && moment().startOf('day').unix() == params.beginTime) {
        params.endTime = moment().subtract(1, 'hours').startOf('hour').unix();
      }
      const queryParams = {
        beginTime: params.beginTime, 
        endTime: params.endTime,
        type: 'report',
        channelIds
      };

      const sdkAdspotData = await simpleSdkAdspotService.getReportMediumList(queryParams);
      dispatchers.reportMedium.setSdkAdspotList(sdkAdspotData);
    },

    // 上传媒体报表
    async newReportMediumByUploadFile({ formData, queryString }) { // dimensionId,
      const newDimensionOption = await reportMediumService.createFile({ formData, queryString });
      return newDimensionOption.options;
    },
  }),
};
