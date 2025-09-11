import sdkChannelService from '@/services/sdkChannel';
import { IRootDispatch } from '@/store';
import { ISdkChannel, IBatchCreationAdspotChannel, IBatchCreationAdspotChannelReportApiList, batchCreationAdspotChannelItem, IBatchTargetingModelMapType } from './types/sdkChannel';
import { generateRandomID } from '@/services/utils/utils';

type IState = {
  list: ISdkChannel[],
  map: {
    [key in number]: ISdkChannel
  },
  /** 批量创建表单基础数据 */
  batchCreationAdspotChannel: IBatchCreationAdspotChannel,
  batchCreationAdspotChannelReportApiList: IBatchCreationAdspotChannelReportApiList,
  currentEditReportApiChannelId: number,
  currentEditReportApiChannel: batchCreationAdspotChannelItem,
  currentEditReportApiId: string,
  batchTargetingModelMap: IBatchTargetingModelMapType,
  // 三方广告位
  sdkAutoAdspot: Record<string, any> | null,
  cpmUpdateTime: number | null
};

export const defaultBatchCrearionTableData = {
  id: generateRandomID(),
  adnId: 0,
  reportApiParamId: undefined,
  isHeadBidding: 1,
  bidRatioPrice: '1',
  meta_adspot_id: '',
  channelAlias: '',
  timeout: 5000,
  location: '',
  maker: '',
  osv: '',
  appVersion: '',
  deviceRequestInterval: '',
  dailyReqLimit: '',
  dailyImpLimit: '',
  deviceDailyReqLimit: '',
  deviceDailyImpLimit: '',
  // hasReportApiParams: false,
  showReportApi: true,
  hasMetaAppKey: false,
  isBidRatio: true,
  isSeverHasSaveMetaAppId: false,
  severHasSaveMetaAppId: '',
  isSeverHasSaveMetaAppKey: false,
  severHasSaveMetaAppKey: '',
  editAppId: false,
  editAppKey: false
};

const defaultState: IState = {
  list: [],
  map: {},
  batchCreationAdspotChannel: {},
  batchCreationAdspotChannelReportApiList: {},
  currentEditReportApiChannelId: 0,
  currentEditReportApiChannel: defaultBatchCrearionTableData,
  currentEditReportApiId: '',
  batchTargetingModelMap: {},
  sdkAutoAdspot: null,
  cpmUpdateTime: null
};

export default {
  state: defaultState,

  reducers: {
    setList(prevState, list: ISdkChannel[]) {
      prevState.list = list;
      list.forEach(item => {
        prevState.map[item.adnId] = item;
      });
    },

    setBatchCreationAdspotChannel(prevState, id, currentCreateAdspotChannel) {
      prevState.batchCreationAdspotChannel[id] = currentCreateAdspotChannel;
    },

    setBatchCreationAdspotChannelReportApiList(prevState, id, currentCreateAReportApiList) {
      prevState.batchCreationAdspotChannelReportApiList[id] = currentCreateAReportApiList;
    },

    setCurrentEditReportApiChannelInfo(prevState, currentEditReportApiChannelId, currentEditReportApiId) {
      prevState.currentEditReportApiChannelId = currentEditReportApiChannelId;
      prevState.currentEditReportApiId = currentEditReportApiId;
    },

    /** @param batch true的覆盖方式是{...{key: value, key: value}, ...{key: value, key: value}}，false的覆盖方式是Object[key] = value */
    setBatchTargetingModelMap(prevState, {key, batch, data}) {
      if (batch) {
        prevState.batchTargetingModelMap = {...prevState.batchTargetingModelMap, ...data};
      } else {
        prevState.batchTargetingModelMap[key] = data;
      }
    },

    setSdkAutoAdspot(prevState, sdkAutoAdspot) {
      prevState.sdkAutoAdspot = sdkAutoAdspot;
    },

    setCpmUpdateTime(prevState, cpmUpdateTime) {
      prevState.cpmUpdateTime = cpmUpdateTime;
    }
  },

  effects: (dispatch: IRootDispatch) => ({
    async queryAll() {
      const data = await sdkChannelService.getSdkChannels();
      dispatch.sdkChannel.setList(data.sdk_adns);
      return {
        data: data.sdk_adns
      };
    },

    async getSdkMetaAppId(params) {
      const data = await sdkChannelService.getMetaAppId(params);
      // dispatch.sdkChannel.setMetaAppId(data);
    },

    async saveBatchSdkAdspotChannel({adspotId, model}) {
      const data = await sdkChannelService.batchCreationSdkAdspotChannel({adspotId, model});
      return data.sdkChannelList;
    },
  }),
};
