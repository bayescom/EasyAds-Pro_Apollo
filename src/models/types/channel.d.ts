import { ListQueryPayload } from './common';

interface ISdkChannel {
  adnId: number,
  adnName: string,
  status: boolean,
  adnParamsMeta: IParam [],
  reportApiParams: ReportApiParams[],
  /**
   * 广告网络参数的key和name
   */
  reportApiParamsMeta: IParam[],
  isDsp: boolean,
  data: ChannelData,
  reportApiStatus: number,
  supportAutoCreate: number
}

interface ReportApiParams {
  id: number | null,
  name: string,
  status: number,
  /**
   * paramsMeta里面每一组参数的key对应的值
   */
  channelParams: IChannelParams[],
  autoCreateStatus: number
}

interface IParam {
  metaName: string,
  metaKey: string,
  metaRequired: boolean,
}

interface IChannelParams {
  paramId: number,
}

interface ChannelData {
  req: number,
  /**
   * 返回数
   */
  bid: number,
  /**
   * 展现数
   */
  imp: number,
  /**
   * 点击数
   */
  click: number,
  /**
   * ecpm
   */
  ecpm: number
}

type SortKey = 'id';
type ChannelFilter = {
  searchText?: string,
  status?: number,
  beginTime: number,
  endTime: number
};

type IChannelQueryPayload = ListQueryPayload<ChannelFilter, SortKey>;

export { ISdkChannel, SortKey, ChannelFilter, IChannelQueryPayload };
