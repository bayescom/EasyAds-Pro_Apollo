import { LimitType, ListQueryPayload } from './common';

interface ISdkChannelTrafficList {
  id: number,
  adspotName: string,
  adspotId: number,
  adspotType: number,
  data: dataType,
  directionList: directioType [],
  isAutoCreate: number,
  limitList: LimitType [],
  mediaId: number,
  mediaName: string,
  mediaIcon: string,
  platformType: number,
  price: number | null,
  sdkChannelAlias: string,
  sdkChannelConfigs: ChannelParams [],
  sdkChannelIcon: string,
  sdkChannelId: number,
  sdkChannelName: string,
  sdkChannelParams: ChannelConfigs [],
  sdkConfig: ConfigType,
  status: number,
  sdkGroup: SdkGroupType
}

type ChannelParams = {
  [x in string]: string
}

type SdkGroupType = {
  group_tag: string,
  /**
   * 他是 targetPercentageStrategyList 中的 trafficId， 是第三层的
   *  */ 
  sdk_group_id: number,
  /**
   * 他是 最外层的，是流量分组的ab 
   */
  sdk_group_percentage_id: number,
  /**
   * 他是分组的信息，第二层的
   */
  sdk_group_targeting_id: number,
  /**
   * 他是 targetPercentageStrategyList 中的 targetPercentageId 是第三层的 AB 分组的id
   */
  sdk_group_targeting_percentage_id: number
}

type ConfigType = {
  layerId: number | null,
  isHeadBidding: number,
  bidRatio: number
}

interface ChannelConfigs {
  key: string,
  name: string,
  value: string,
  required: number
}

type directioType = {
  /**
   * 定向类型名称
   */
  name: string,
  /**
   * 定向属性
   */
  property: string,
  value: string,
}

type dataType = {
  bid: number,
  winRate: string,
  impRate: string
}

type SortKey = 'id';
type SdkChannelTrafficListFilter = {
  searchText?: string,
  status?: number,
  mediaIds?: string
};

type ISdkChannelTrafficListQueryPayload = ListQueryPayload<ISdkChannelTrafficList, SortKey>;

export { ISdkChannelTrafficList, SortKey, SdkChannelTrafficListFilter, ISdkChannelTrafficListQueryPayload };
