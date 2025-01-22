interface IAdspot {
  id: number,
  adspotName: string,
  status: boolean,

  //basic
  mediaId: number,
  integrationType: number,
  adspotType: number,

  // 频次控制 requestLimit
  /**
   * 广告位超时时间
   */
  timeout: number,
  /**
   * 单设备每日请求上限
   */
  deviceDailyReqLimit: number,
  /**
   * 单设备每日曝光上限
   */
  deviceDailyImpLimit: number,
  /**
   * 单设备最小请求间隔
   */
  deviceReqInterval: number,

  /**
   * 频次设置是否展开，仅前端判断用，不做后端传值使用
   */
  switchFcrequency?: boolean,
}

export { IAdspot };
