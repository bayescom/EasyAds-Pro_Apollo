import { ListQueryPayload as CommonListQueryPayload } from './common';

interface IReportMediumChart {
  timeList: string [],
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
}

type ReportMediumFilter = {
  type: number,
  beginTime: number,
  endTime: number,
  contrastBeginTime: number,
  contrastEndTime: number,
  mediaIds?: number,
  adspotIds?: number,
  channelIds?: number,
  sdkAdspotIds?: number,
  adspotTypes?: number
}

type IReportMediumQueryPayload = CommonListQueryPayload<ReportMediumFilter>;

export { IReportMediumChart, ReportMediumFilter };
