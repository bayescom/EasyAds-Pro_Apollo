interface ISdkChannel {
  adnId: number
  adnName: string,
  channelName?: string
  status: number,
  /**
   * 广告网络参数的key和name
   */
  adnParamsMeta: ReportApiParamsMeta[],
  reportApiParamsMeta: ReportApiParamsMeta [],
  reportApiParams: ReportApiParam [],
  reportApiStatus: number
}

type ReportApiParam = {
  id: number | null,
  name: string,
  channelParams: ChannelParams,
  status: number
}

type ChannelParams = {
  [x in string]: string
}

type ReportApiParamsMeta = {
  metaKey: string,
  metaName: string,
  metaRequired: number
}

interface IBatchCreationAdspotChannel {
  [x in number]: ReportApiParamsMeta []
}

interface IBatchCreationAdspotChannelReportApiList {
  [x in number]: ReportApiParam []
}

type batchCreationAdspotChannelItem = {
  id: string,
  adnId: number,
  reportApiParamId: number | undefined,
  isHeadBidding: nhumber,
  bidRatioPrice: string
  channelAlias: string,
  dailyImpLimit: string,
  dailyReqLimit: string,
  deviceDailyImpLimit: string,
  deviceDailyReqLimit: string,
  deviceRequestInterval: string,
  maker: string,
  meta_adspot_id: string,
  osv: string,
  appVersion: string,
  location: string,
  timeout: number,
  /** reportApi是否有值 */
  // hasReportApiParams: boolean,
  /** 当前广告网络是否拥有reportApi */
  showReportApi: boolean,
  /** 是否需要填写 meta_app_key*/
  hasMetaAppKey: boolean,
  /** 显示为固价框还是竞价框, 默认为竞价 */
  isBidRatio: boolean,
  /** 媒体ID后端有没有存储 */
  isSeverHasSaveMetaAppId: boolean,
  /** 存储的媒体ID */
  severHasSaveMetaAppId: string,
  /** 媒体Key后端有没有存储 */
  isSeverHasSaveMetaAppKey: boolean,
  /** 存储的媒体Key */
  severHasSaveMetaAppKey: string,
  editAppId: boolean,
  editAppKey: boolean
}

type batchTargetingModelType = {
  location: string,
  excludeLocation: string,
  deviceMaker: string,
  excludeDeviceMaker: string,
  osv: string,
  excludeOsv: string,
  appVersion: string
}

interface IBatchTargetingModelMapType {
  [x in string]: batchTargetingModelType
}

type ChannelList = {
  label: string,
  value: number
}

type OptionList = {
  label: string,
  value: number | null,
}

type formValueType = {
  adnId?: string,
  isHeadBidding?: number,
  timeout?: string,
  location?: string,
  maker?: string,
  osv?: string,
  appVersion?: string,
  deviceRequestInterval?: string,
  dailyReqLimit?: string,
  dailyImpLimit?: string,
  deviceDailyReqLimit?: string,
  deviceDailyImpLimit?: string,
  meta_app_id?: string,
  meta_app_key?: string,
  meta_adspot_id?: string
}

export { ISdkChannel,ReportApiParamsMeta, ReportApiParam, IBatchCreationAdspotChannel, IBatchCreationAdspotChannelReportApiList, batchCreationAdspotChannelItem, batchTargetingModelType, IBatchTargetingModelMapType, ChannelList, OptionList, formValueType };
