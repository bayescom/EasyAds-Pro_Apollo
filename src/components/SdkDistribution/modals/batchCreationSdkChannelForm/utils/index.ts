export const defaultBatchEditDropdownSelect = [
  {
    label: '广告网络/账户',
    key: 'adnId',
    disable: false
  },
  {
    label: '排序/价格/系数',
    key: 'isHeadBidding',
    disable: false
  },
  {
    label: '超时时间',
    key: 'timeout',
    disable: false
  },
  {
    label: '地域定向',
    key: 'location',
    disable: false
  },
  {
    label: '制造商定向',
    key: 'deviceMaker',
    disable: false
  },
  {
    label: '操作系统版本定向',
    key: 'osv',
    disable: false
  },
  {
    label: 'APP版本定向',
    key: 'appVersion',
    disable: false
  },
  {
    label: '单设备最小请求间隔',
    key: 'deviceRequestInterval',
    disable: false
  },
  {
    label: '日请求上限',
    key: 'dailyReqLimit',
    disable: false
  },
  {
    label: '日展示上限',
    key: 'dailyImpLimit',
    disable: false
  },
  {
    label: '单设备日请求上限',
    key: 'deviceDailyReqLimit',
    disable: false
  },
  {
    label: '单设备日展示上限',
    key: 'deviceDailyImpLimit',
    disable: false
  }
];

export const targetingItemsMap = {
  'location': { key: 'location', name: '地域', includeKey: 'location', excludeKey: 'excludeLocation' },
  'maker': { key: 'maker', name: '制造商', includeKey: 'deviceMaker', excludeKey: 'excludeDeviceMaker' },
  'osv': { key: 'osv', name: '操作系统版本', includeKey: 'osv', excludeKey: 'excludeOsv' },
  'appVersion': { key: 'appVersion', name: 'APP版本', keys: ['appVersion'] }
};

export const batchTargetingModelItem = {
  location: '',
  excludeLocation: '',
  deviceMaker: '',
  excludeDeviceMaker: '',
  osv: '',
  excludeOsv: '',
  appVersion: ''
};

export const targetingKeys = ['location', 'excludeLocation', 'deviceMaker', 'excludeDeviceMaker', 'osv', 'excludeOsv', 'appVersion'];
export const targetingKey = ['location', 'excludeLocation', 'deviceMaker', 'excludeDeviceMaker', 'osv', 'excludeOsv'];

export const findIndex = (id, data) => {return data.findIndex(item => item.id == id);};
