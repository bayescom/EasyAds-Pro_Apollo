import store, { IRootDispatch } from '@/store';
import reportAbTestService from '@/services/reportAbTest';
import { IReportReportAbTest, ReportReportAbTestFilter } from './types/reportAbTest';
import { BasicOption } from './types/common';
import extractSort from '@/services/utils/extractSort';

type IState = {
  detailList: IReportReportAbTest [],
  mediaList: BasicOption<number> [],
  adspotList: BasicOption<number> [],
  filterExpList: BasicOption<number> []
}

const defaultState: IState = {
  detailList: [],
  mediaList: [],
  adspotList: [],
  filterExpList: []
};

export default {
  state: defaultState,

  reducers: {
    setDetailList(prevState: IState, detailList: IReportReportAbTest[]) {
      prevState.detailList = detailList;
    },

    setMediaList(prevState: IState, mediaList: BasicOption<number>[]) {
      prevState.mediaList = mediaList;
    },

    setAdspotList(prevState: IState, adspotList: BasicOption<number>[]) {
      prevState.adspotList = adspotList;
    },

    setFilterExpList(prevState: IState, filterExpList: BasicOption<number>[]) {
      return {
        ...prevState,  
        filterExpList,
      };
    },
  },

  effects: (dispatchers: IRootDispatch) => ({
    async getList({ params, sort }) {
      const data = await reportAbTestService.getList({
        ...params,
        ...extractSort(sort)
      });
      dispatchers.reportAbTest.setDetailList(data['sdk_experiment_list']);

      return {
        data: data['sdk_experiment_list'],
        total: data.meta.total
      };
    },

    async getFilterExperimentList() {
      const data = await reportAbTestService.getFilterExperimentList();
      dispatchers.reportAbTest.setFilterExpList(data);

      return {
        data
      };
    },

    async getMediaList () {
      const mediaData = await reportAbTestService.getFilterExperimentMediaList();
      dispatchers.reportAbTest.setMediaList(mediaData);
    },

    async getAdspotList (params) {
      const adspotData = await reportAbTestService.getFilterExperimentAdspotList(params);
      dispatchers.reportAbTest.setAdspotList(adspotData);
    },

  })
};
