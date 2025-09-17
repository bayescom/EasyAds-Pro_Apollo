import { ListQueryPayload as CommonListQueryPayload } from './common';

interface IReportReportAbTest {
  id: number,
  mediaId: number,
  mediaName: string,
  mediaIcon: string,
  adspotId: number,
  adspotName: string,
  experimentType: string,
  id: number,
  experimentName: number,
  createdAt: string,
  endAt: string,
  status: number,
}

type ReportReportAbTestFilter = {
  mediaIds?: string,
  adspotIds?: string,
  expIds?: string,
  expType?: number,
  status?: number
}

type ReportReportAbTestDetailFilter = {
  adspotId: number,
  expId: number,
  expType: number,
  beginTime: number
  endTime: number,
  /**
   * （是否三方api数据，0或1）
   */
  isThird: number
}

interface DimensionChartItemData {
  bid: [],
  bidRateFloat: [],
  bidWin: [],
  bidWinRateFloat: [],
  click: [],
  clickRateFloat: [],
  ecpc: [],
  ecpm: [],
  imp: [],
  impRateFloat: [],
  income: [],
  req: [],
  groupId: number,
  tag: string
}

type DimensionChartItem = {
  tag: string,
  dataList: number []
}

type IReportReportAbTestDetailList = {
  groupId: number,
  percentageString: string,
  status: number,
  tag: string,
  bid: number,
  bidRate: string,
  bidRateFloat: string,
  bidWin: number,
  bidWinRate: string,
  bidWinRateFloat: string,
  click: number,
  clickRate: string,
  clickRateFloat: string,
  ecpc: string,
  ecpm: string,
  groupId: number,
  imp: number,
  impRate: string,
  impRateFloat: string,
  income: string,
  req: number,
  timestamp: number,
}

type IReportReportAbTestQueryPayload = CommonListQueryPayload<ReportReportAbTestFilter>;

export { IReportReportAbTest, ReportReportAbTestFilter, IReportReportAbTestQueryPayload, ReportReportAbTestDetailFilter, DimensionChartItemData, IReportReportAbTestDetailList };
