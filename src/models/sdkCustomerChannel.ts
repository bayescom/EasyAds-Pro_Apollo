import sdkCustomerChannelService from '@/services/sdkCustomerChannel';
import extractSort from '@/services/utils/extractSort';
import { IRootDispatch, IRootState } from '@/store';
import { ICommonState } from './types/common';
import { formatModalDataFromPayload, formatPayloadDataFromModal } from '@/pages/Channel/components/SdkCustomerChannelDrawer/utils/formatSdkCustomerChannelData';
import { normalizeAdapterOptions, normalizePlatformOptions } from '@/pages/Channel/components/SdkCustomerChannelDrawer/utils';

type IState = ICommonState<ISdkCustomerChannel> & {
  new: ISdkCustomerChannel;
  total: number;
  platformOptions: ISdkCustomerChannelPlatformOption[];
  adapterOptions: { value: string; label: string }[];
};

const sdkCustomerChannelDefaultValue: ISdkCustomerChannel = {
  id: 0,
  name: '',
  platforms: {},
};

const defaultState: IState = {
  new: sdkCustomerChannelDefaultValue,
  list: [],
  total: 0,
  platformOptions: [],
  adapterOptions: [],
};

export default {
  state: defaultState,

  reducers: {
    setList(prevState: IState, { list, total }: { list: ISdkCustomerChannel[]; total?: number }) {
      prevState.list = list;
      prevState.total = total || 0;
    },

    setPlatformOptions(prevState: IState, platformOptions: ISdkCustomerChannelPlatformOption[]) {
      prevState.platformOptions = platformOptions;
    },

    setAdapterOptions(prevState: IState, adapterOptions: { value: string; label: string }[]) {
      prevState.adapterOptions = adapterOptions;
    },
  },

  effects: (dispatchers: IRootDispatch) => ({
    async getPlatformOptions() {
      const platformList = await dispatchers.code.fetchCodeList(['platform_type', true]);
      const platformOptions = normalizePlatformOptions(platformList);
      dispatchers.sdkCustomerChannel.setPlatformOptions(platformOptions);
      return platformOptions;
    },

    async getList({ params, sort }, rootState: IRootState) {
      const data = await sdkCustomerChannelService.getList({
        ...params,
        ...extractSort(sort),
      });

      const platformOptions = rootState.sdkCustomerChannel.platformOptions;
      const list = (data.sdk_customer_channels || []).map(item =>
        formatModalDataFromPayload(item, platformOptions)
      );
      const total = data?.meta?.total;

      dispatchers.sdkCustomerChannel.setList({ list, total });

      return {
        data: list,
        total,
      };
    },

    async create(sdkCustomerChannel: ISdkCustomerChannel, rootState: IRootState) {
      const platformOptions = rootState.sdkCustomerChannel.platformOptions;
      const sdkCustomerChannelData = formatPayloadDataFromModal(sdkCustomerChannel, platformOptions);
      const data = await sdkCustomerChannelService.create(sdkCustomerChannelData);
      return data.sdk_customer_channel;
    },

    async update(sdkCustomerChannel: ISdkCustomerChannel, rootState: IRootState) {
      const platformOptions = rootState.sdkCustomerChannel.platformOptions;
      const sdkCustomerChannelData = formatPayloadDataFromModal(sdkCustomerChannel, platformOptions);
      const data = await sdkCustomerChannelService.update({
        ...sdkCustomerChannelData,
        id: sdkCustomerChannel.id,
      });
      return data.sdk_customer_channel;
    },

    async getAdapterAdspotType() {
      const data = await sdkCustomerChannelService.getAdapterAdspotType();
      const adapterOptions = normalizeAdapterOptions(data);
      dispatchers.sdkCustomerChannel.setAdapterOptions(adapterOptions);
      return adapterOptions;
    },
  }),
};
