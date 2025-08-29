import sdkChannelService from '@/services/sdkChannel';
import store, { IRootDispatch } from '@/store';
import { DateType, ICommonState } from './types/common';
import { ISdkAdspotChannel } from './types/sdkAdspotChannel';
import moment from 'moment';
import { getLocalDateType } from '@/components/SdkDistribution/utils';
import { formatModalDataFromPayload } from '@/components/SdkDistribution/modals/sdkAutoAdspot/utils/formatCsjSdkAutoAdspot';
import { formatYlhModalDataFromPayload } from '@/components/SdkDistribution/modals/sdkAutoAdspot/utils/formatYlhSdkAutoAdspot';
import { formatBdModalDataFromPayload } from '@/components/SdkDistribution/modals/sdkAutoAdspot/utils/formatBdSdkAutoAdspot';
import { formatKsModalDataFromPayload } from '@/components/SdkDistribution/modals/sdkAutoAdspot/utils/formatKsSdkAutoAdspot';

type DeleteSupplierStatusType = {
  count: number,
  groupList: string []
}

type IState = ICommonState<ISdkAdspotChannel> & {
  new: ISdkAdspotChannel,
  map: {
    [key in number]: ISdkAdspotChannel
  },
  deleteSupplierStatus: DeleteSupplierStatusType,
};

const defaultTime = {
  beginTime: moment().subtract(1, 'day').startOf('day').unix(),
  endTime: moment().subtract(1, 'day').endOf('day').unix()
};

const sdkAdspotChannelDefaultValue: ISdkAdspotChannel = {
  id: 0,
  adnId: 0,
  channelName: '',
  channelAlias: '',
  isHeadBidding: 1,
  bidRatio: 1,
  bidPrice: 0,
  timeout: 5000,
  params: {},
  adnParamsMeta: [],

  direction: {
    appVersion: {
      property: '',
      value: []
    },
    deviceMaker: {
      property: '',
      value: []
    },
    location: {
      property: '',
      value: []
    },
    osVersion: {
      property: '',
      value: []
    }
  },
  requestLimit: {
    dailyReqLimit: 0,
    dailyImpLimit: 0,
    deviceDailyReqLimit: 0,
    deviceDailyImpLimit: 0,
    deviceRequestInterval: 0,
  },
};

const defaultState: IState = {
  new: sdkAdspotChannelDefaultValue,
  list: [],
  map: {},
  deleteSupplierStatus: {
    count: 0,
    groupList: []
  },
};

export default {
  state: defaultState,

  reducers: {
    setList(prevState: IState, list: ISdkAdspotChannel[]) {
      prevState.list = list;
      list.forEach(item => {
        prevState.map[item.id] = item;
      });
    },

    setOne(prevState: IState, model: ISdkAdspotChannel) {
      const index = prevState.list.findIndex(item => item.id === model.id);
      if (index !== -1) {
        prevState.list[index] = model;
      } else {
        prevState.list.push(model);
      }

      prevState.map[model.id] = model;
    },

    deleteOne(prevState: IState, sdkAdspotChannelId: number) {
      const index = prevState.list.findIndex(item => item.id === sdkAdspotChannelId);
      prevState.list.splice(index, 1);
      delete prevState.map[sdkAdspotChannelId];
    },

    setDeleteSupplierStatus(prevState: IState, deleteSupplierStatus: DeleteSupplierStatusType) {
      prevState.deleteSupplierStatus = deleteSupplierStatus;
    },
  },

  effects: (dispatch: IRootDispatch) => ({
    async getList({ adspotId, dateType }: { adspotId: number, dateType: DateType }) {
      const data = await sdkChannelService.getSdkAdspotChannels(adspotId, dateType);

      if (store.getModelState('sdkChannel').list.length === 0) {
        await dispatch.sdkChannel.queryAll();
      }
      if (!data) {
        return;
      }

      const list = data.sdkChannelList;

      dispatch.sdkAdspotChannel.setList(list);
      return { data: data.sdkChannelList };
    },

    async getAutoAdspotSdkChannel({adspotId, sdkAdspotChannelId, adspotType, source }: { adspotId: number, sdkAdspotChannelId: number, adspotType: number, source: string }) {
      const data = await sdkChannelService.getAutoAdspotSdkChannel({adspotId, sdkAdspotChannelId, source, adspotType});

      let autoAdspot;
      if (source == 'csj') {
        autoAdspot = formatModalDataFromPayload(data.auto_adspot, adspotType);
      } else if (source == 'ylh') {
        autoAdspot = formatYlhModalDataFromPayload(data.auto_adspot, adspotType);
      } else if (source == 'bd') {
        autoAdspot = formatBdModalDataFromPayload(data.auto_adspot, adspotType);
      } else if (source == 'ks') {
        autoAdspot = formatKsModalDataFromPayload(data.auto_adspot, adspotType);
      }
      
      dispatch.sdkChannel.setSdkAutoAdspot(autoAdspot);
      dispatch.sdkChannel.setCpmUpdateTime(data.sdkChannel.cpmUpdateTime);
      return data.sdkChannel;
    },

    async save({ sdkAdspotChannel, adspotId }: { sdkAdspotChannel: ISdkAdspotChannel, adspotId: number }) {
      const data = sdkAdspotChannel.id
        ? await sdkChannelService.updateSdkAdspotChannel({ model: sdkAdspotChannel, adspotId })
        : await sdkChannelService.createSdkAdspotChannel({ model: sdkAdspotChannel, adspotId });

      if (!data?.sdkChannel) {
        return;
      }

      return data.sdkChannel;
    },

    async autoAdspotSave({ sdkAdspotChannel, sdkAutoAdspot, adspotId, adspotType, source }: { sdkAdspotChannel: ISdkAdspotChannel, sdkAutoAdspot, adspotId: number, adspotType: number, source: string }) {
      const data = sdkAdspotChannel.id
        ? await sdkChannelService.updateAutoAdspotSdkChannel({ sdkAdspotChannel, sdkAutoAdspot, adspotId, adspotType, source })
        : await sdkChannelService.createAutoAdspotSdkChannel({ sdkAdspotChannel, sdkAutoAdspot, adspotId, adspotType, source });

      if (!data?.sdkChannel) {
        return;
      }

      return data.sdkChannel;
    },

    async delete({ sdkAdspotChannelId, adspotId }: { sdkAdspotChannelId: number, adspotId: number }) {
      dispatch.sdkDistribution.removeSdkAdspotChannel({ adspotId, sdkAdspotChannelId });
      dispatch.sdkAdspotChannel.deleteOne(sdkAdspotChannelId);

      await sdkChannelService.deleteSdkAdspotChannel({sdkAdspotChannelId, adspotId});
      const localDateType = getLocalDateType();
      const dateType = localDateType ? localDateType : defaultTime;
      await dispatch.sdkDistribution.queryAdspotSdkDistribution({ adspotId, dateType });
    },

    async getDeleteSdkAdspotChannelStatus({ sdkAdspotChannelId, adspotId }: { sdkAdspotChannelId: number, adspotId: number }) {
      const data = await sdkChannelService.getDeleteSdkAdspotChannelStatus({sdkAdspotChannelId, adspotId});
      dispatch.sdkAdspotChannel.setDeleteSupplierStatus(data);
      return data;
    },
  }),
};
