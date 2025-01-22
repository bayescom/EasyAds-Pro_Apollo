import { BaseModel, ListQueryPayload as CommonListQueryPayload } from './common';

interface ISdkAdspotChannel extends BaseModel {
  id: number,
  adnId: number,
  channelName: string,
  channelAlias: string,
  isHeadBidding: number,
  bidRatio: number
  bidPrice: number | null,
  timeout: number,
  params: {
    [key in string]: string
  },
  adnParamsMeta: AdnParamsMetaType [],

  direction: DirectionType,
  requestLimit: RequestLimit,
}

type AdnParamsMetaType = {
  metaName: string;
  metaKey: string;
  key: string,
  name: string,
  value: string
}

type RequestLimit = {
  dailyReqLimit: number | null,
  dailyImpLimit: number | null,
  deviceDailyReqLimit: number | null,
  deviceDailyImpLimit: number | null,
  deviceRequestInterval: number | null,
}

type DirectionType = {
  appVersion: Direction,
  deviceMaker: Direction,
  location: Direction,
  osVersion: Direction
}

type Direction = {
  property: string,
  value: string []
}

type SortKey = 'id';
type SdkAdspotChannelFilter = {
  status: 'all' | 'true'
};

type ISdkAdspotChannelListQueryPayload = CommonListQueryPayload<SdkAdspotChannelFilter, SortKey>;

export { ISdkAdspotChannel, SortKey, SdkAdspotChannelFilter, ISdkAdspotChannelListQueryPayload };
