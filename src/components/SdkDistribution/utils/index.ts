// income ecpm ecpc req bid bidRate imp impRate click clickRate
export const columnWidth = {
  priority: '1 0 89px',
  name: '1 0 145px',
  price: '1 0 63px',
  operation: '1 0 117px',
  income: '1 0 9.3%',  // 收益
  ecpm: '1 0 8.3%',  // ecpm
  ecpc: '1 0 8.3%',  // ecpc
  req: '1 0 7.3%',  // 请求
  bid: '1 0 7.3%',  // 返回
  bidRate: '1 0 7.3%',  // 填充率
  imp: '1 0 6.3%',  // 展示
  impRate: '1 0 7.3%',  // 展示率
  click: '1 0 6.3%',  // 点击
  clickRate: '1 0 7.3%',  // 点击率
  thirdReq: '1 0 8.5%',  // 三方请求
  thirdBid: '1 0 8.5%',  // 三方返回
  thirdBidRate: '1 0 9.7%',  // 三方填充率
  thirdImp: '1 0 8.5%',   // 三方展现
  thirdImpRate: '1 0 9.7%',  // 三方展现率
  thirdClick: '1 0 8.5%',  // 三方点击
  thirdClickRate: '1 0 9.7%',  // 三方点击率
  thirdIncome: '1 0 10.7%',  // 三方预估收益
  thirdEcpm: '1 0 10.7%',  // 三方eCPM(¥)
  thirdEcpc: '1 0 10.7%',  // 三方eCPC(¥)
  gapReqPercent: '1 0 9.6%',  // 请求Gap率
  gapBidPercent: '1 0 9.6%',  // 返回Gap率
  gapImpPercent: '1 0 9.6%',  // 展现Gap率
  gapClickPercent:'1 0 9.6%',  // 点击Gap率
  bidWin: '1 0 7.3%',  // 竞胜
  bidWinRate: '1 0 7.3%',  // 竞胜率
  channelOperation: '0 0 40px',
  groupOperation: '0 0 40px',
  groupDroppable: '1 0 auto'
} as const;

export const keyMap = {
  'req': ['gapReqPercent', 'thirdReq'],
  'bid': ['gapBidPercent', 'thirdBid'],
  'bidRate': ['thirdBidRate'],
  'imp': ['gapImpPercent', 'thirdImp'],
  'impRate': ['thirdImpRate'],
  'click': ['gapClickPercent', 'thirdClick'],
  'clickRate': ['thirdClickRate'],
  'income': ['thirdIncome'],
  'ecpm': ['thirdEcpm'],
  'ecpc': ['thirdEcpc'],
};

export const renderKeysMap = {
  income: '预估收益',
  ecpm: 'eCPM(¥)',
  ecpc: 'eCPC(¥)',
  req: '请求',
  bid: '返回',
  bidRate: '填充率',
  imp: '展示',
  impRate: '展示率',
  click: '点击',
  clickRate: '点击率',
  // 三方拉取和gap率
  thirdReq: '三方请求',
  thirdBid: '三方返回',
  thirdBidRate: '三方填充率',
  thirdImp: '三方展示',
  thirdImpRate: '三方展示率',
  thirdClick: '三方点击',
  thirdClickRate: '三方点击率',
  thirdIncome: '三方预估收益',
  thirdEcpm: '三方eCPM(¥)',
  thirdEcpc: '三方eCPC(¥)',
  gapReqPercent: '请求Gap率',
  gapBidPercent: '返回Gap率',
  gapImpPercent: '展现Gap率',
  gapClickPercent:' 点击Gap率',
  bidWin: '竞胜数',
  bidWinRate: '竞胜率',
};

export const formatArray = (list, father, dataKey) => {
  const result = list.map(item => {
    return {
      value: item,
      title: renderKeysMap[item as string],
      father,
      belong: dataKey
    };
  });
  return result;
};

export const getLocalDateType = () => {
  const localDateType = window.sessionStorage.getItem('commonDateType');
  if (localDateType) {
    return JSON.parse(localDateType);
  } else {
    return null;
  }
};

export const defaultBatchEditDropdownSelect = [
 
  {
    label: '地域定向',
    key: 'location',
    disable: false
  },
  {
    label: '制造商定向',
    key: 'maker',
    disable: false
  },
  {
    label: 'APP版本定向',
    key: 'appVersion',
    disable: false
  },
  {
    label: '操作系统版本定向',
    key: 'osv',
    disable: false
  },
  {
    label: '每日请求上线',
    key: 'dailyReqLimit',
    disable: false
  },
  {
    label: '每日展示上限',
    key: 'dailyImpLimit',
    disable: false
  },
  {
    label: '单设备每日请求上限',
    key: 'deviceDailyReqLimit',
    disable: false
  },
  {
    label: '单设备每日展示上限',
    key: 'deviceDailyImpLimit',
    disable: false
  },
  {
    label: '单设备最小请求间隔',
    key: 'deviceRequestInterval',
    disable: false
  },
  {
    label: '适配尺寸',
    key: 'targetSize',
    disable: false
  },
  {
    label: '广告位类型转换',
    key: 'adTypeTransform',
    disable: false
  },
  {
    label: '自定义参数',
    key: 'channelCustomParam',
    disable: false
  },
  {
    label: '请求比例',
    key: 'percentage',
    disable: false
  },
  {
    label: '状态',
    key: 'status',
    disable: false
  },
];

// 下拉控制不包括定向
export const defaultShowSelectedFormItemMap = {
  dailyReqLimit: false,
  dailyImpLimit: false,
  deviceDailyReqLimit: false,
  deviceDailyImpLimit: false,
  deviceRequestInterval: false,
  targetSize: false,
  adTypeTransform: false,
  channelCustomParam: false,
  percentage: false,
  status: false
};

export const batchAdspotApiChannelTargetingValues = {
  // 地域定向
  location: '',
  excludeLocation: '',
  // APP版本
  appVersion: '',
  // 操作系统版本
  osv: '',
  excludeOsv: '',
  // 设备制造商定向
  deviceMaker: '',
  excludeDeviceMaker: '',
};

export const defaultBatchAdspotApiChannelTargetingVisibility = {
  location: false,
  maker: false,
  appVersion: false,
  osv: false,
};

export const filterTargetingVisibilityKeys = ['location', 'maker', 'appVersion', 'osv'];
