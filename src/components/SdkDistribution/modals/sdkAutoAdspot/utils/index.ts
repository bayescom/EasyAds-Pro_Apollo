import moment from 'moment';

// 穿山甲
const csjAdspotSize = [
  {label: '300*150 dp/pt', value: '300*150'},
  {label: '300*200 dp/pt', value: '300*200'},
  {label: '300*250 dp/pt', value: '300*250'},
  {label: '300*130 dp/pt', value: '300*140'},
  {label: '300*45 dp/pt', value: '300*45'},
  {label: '300*75 dp/pt', value: '300*75'},
  {label: '320*50 dp/pt', value: '320*50'},
  {label: '345*194 dp/pt', value: '345*194'}
];

const csjTemplateLayouts = [
  {name: '上文下图', value: '1'},
  {name: '上图下文', value: '2'},
  {name: '文字浮层', value: '3'},
  {name: '竖版', value: '4'},
  {name: '左图右文', value: '5'},
  {name: '左文右图', value: '6'},
  {name: '三图', value: '7'},
];

/** 判断是否 >= 24 小时 */
function isMoreThan24Hours(timestamp) {
  // 将秒级时间戳转为毫秒（Moment 需要毫秒）
  const timestampMs = timestamp * 1000;
  
  // 获取当前时间的 Moment 对象
  const now = moment();
  
  // 计算时间差（绝对值，单位：毫秒）
  const diffMs = Math.abs(now.diff(timestampMs));
  
  // 判断是否 >= 24 小时（24 * 3600 * 1000 毫秒）
  return diffMs >= 86400000;
}

/**
 * 
 * @param timestamp 
 * @returns 判断时间戳是不是当天
 */
function isTimestampToday(timestamp) {
  return moment.unix(timestamp).isSame(moment(), 'day');
}

// 优量汇、穿山甲、百度、快手
const channelSource = {0: '', 2: 'ylh', 3: 'csj', 4: 'bd', 5: 'ks'};

// 这里是优量汇的常量
// 激励视频渲染样式
const ylhIncentiveRewardedVideoCrtType = [
  { value: 'VIDEO',  name: '激励视频+激励图文', tootips: ''},
  { value: 'IMAGE',  name: '激励浏览', tootips: '用户通过浏览页面 X 秒或完成互动操作来获取应用内奖励'},
];

// 广告素材类型
const ylhAdCrtTypeMap = {
  // 开屏
  2: [
    {  value: 'FLASH_IMAGE_V', name: '图片', defaultDisabled: true },
    {  value: 'FLASH_VIDEO_V', name: '5s视频', defaultDisabled: false }
  ],
  // 插屏
  3: [
    {  value: 'IMAGE', name: '图片', defaultDisabled: false },
    {  value: 'VIDEO', name: '视频', defaultDisabled: false }
  ],
  // 信息流
  6: [
    {  value: 'IMAGE', name: '图片', defaultDisabled: true },
    {  value: 'VIDEO', name: '视频', defaultDisabled: false }
  ],
};

// 自渲染广告样式
const ylhAdCrtNormalTypesMap = {
  1: [
    { value: '16_9_image', name: '16:9 图片', isDefaultSelected: true },
    { value: '16_9_video', name: '16:9 视频', isDefaultSelected: true },
    { value: '3_2_image', name: '3:2 图片（3张）', isDefaultSelected: true },
  ],
  6: [
    { value: '16_9_image', name: '16:9 图片', isDefaultSelected: true },
    { value: '16_9_video', name: '16:9 视频', isDefaultSelected: true },
    { value: '9_16_image', name: '9:16 图片', isDefaultSelected: true },
    { value: '9_16_video', name: '9:16 视频', isDefaultSelected: true },
    { value: '3_2_image', name: '3:2 图片（3张）', isDefaultSelected: true },
    { value: '20_3_image', name: '20:3 图片', isDefaultSelected: false }
  ]
};

const ylhAdCrtTypeListMap = {
  1: [
    { value: 'IMAGE', name: '图文组合', backendValue: 'IMAGE' }
  ],
  6: [
    { value: 'LP_RT', name: '左图右文' },
    { value: 'RP_LT', name: '左文右图' },
    { value: 'TP_BT', name: '上图下文' },
    { value: 'TT_BP', name: '上文下图' },
    { value: 'DB_TI', name: '双图双文' },
    { value: 'TP_IMG_MASK', name: '单图单文-蒙层' },
    { value: 'TP_BT_MASK', name: '上图下文-蒙层' },
    { value: 'TT_BP_MASK', name: '上文下图-蒙层' },
    { value: 'H_IMG', name: '横版纯图片' },
    { value: 'V_IMG', name: '竖版纯图片' },
    { value: 'THR_IMG', name: '三小图双文' }
  ]
};

// 百度
const bdMaterialTypesNameMap = {2: 'splashMaterialTypes', 3: 'interstitialMaterialTypes', 6: 'infoFlowMaterialTypes'};

const bdAdStyleNameMap = {3: 'interstitialStyleTypes', 6: 'infoFlowElement'};

// 广告样式
const bdAdStyleMap = {
  // 插屏-竖版
  1: [
    {name: '半屏9/16', value: '1'},
    {name: '半屏 1/1', value: '2'},
    {name: '全屏', value: '4'},
    {name: '半屏2/3', value: '5'}
  ],
  // 插屏-横版
  2: [
    {name: '模版', value: '3'}
  ],
  3: [
    {name: '标题', value: '1'},
    {name: '描述', value: '2'},
    {name: '图片', value: '3'},
    {name: '图标', value: '4'},
    {name: '视频', value: '5'},
  ]
};

const splashShowControl = [
  { label: '倒计时跳过按钮-胶囊型', value: 2 },
  { label: '倒计时跳过按钮-圆形', value: 5 },
  { label: '跳过按钮', value: 1 },
  { label: '无', value: 4 }
];

const infoFlowTemplateKeys = {
  'checkAll': ['21', '14', '18', '19', '16', '30'],  // 17， 20
  '1': ['21', '14', '18', '19', '16', '30'],   // 17， 20
  '7': ['21', '14', '18', '19', '30']   // 20
};

// 这里前端需要注意的是，例如：前端选中【三图】，传值的时候要将16，17 都传过来, 选中【上文下图】，传值的时候要将19，20 都传过来
const infoFlowTemplateItems = {
  14: {name: '左文右图', value: '14'},
  16: {name: '三图', value: '16'},
  // 17: {name: '三图', value: '17'},
  18: {name: '上图下文', value: '18'},
  19: {name: '上文下图', value: '19'},
  // 20: {name: '上文下图', value: 20},
  21: {name: '左图右文', value: '21'},
  30: {name: '竖版样式', value: '30'},
};


// 快手 banner 的广告样式
const ksBannerTempalteId = [
  { label: '300*50 dp/pt', value: 101},
  { label: '300*45 dp/pt', value: 102},
  { label: '300*130 dp/pt', value: 103 },
  { label: '300*75 dp/pt', value: 104}
];

const ksMaterialTypeList = [
  { value: '1', name: '竖版视频' },
  { value: '2', name: '横版视频' },
  { value: '5', name: '竖版图片' },
  { value: '6', name: '横版图片' },
  { value: '10', name: '多图' },
];

const baseTemplateList = [
  { value: '4', name: '上文下图', tips: '支持横版图片/视频'},
  { value: '5', name: '上图下文', tips: '支持横版图片/视频'},
  { value: '1', name: '大图', tips: '支持横版图片/视频'},
  { value: '3', name: '左图右文', tips: '支持横版图片'},
  { value: '2', name: '左文右图', tips: '支持横版图片'},
  { value: '14', name: '三图', tips: '支持横版图片'},
  { value: '15', name: '三图组合', tips: '支持横版图片'},
  { value: '16', name: '橱窗', tips: '支持横版图片'},
  { value: '17', name: '上文下图', tips: '支持竖版图片/视频'},
  { value: '18', name: '上图下文', tips: '支持竖版图片/视频'},
  { value: '19', name: '大图', tips: '支持竖版图片/视频'},
];

const ksMultiTemplateParamsMap = {
  1: baseTemplateList,
  3: baseTemplateList,
  2: [
    { value: '4', name: '上文下图', tips: '支持横版图片/视频'},
    { value: '5', name: '上图下文', tips: '支持横版图片/视频'},
    { value: '1', name: '大图', tips: '支持横版图片/视频'},
    { value: '17', name: '上文下图', tips: '支持竖版图片/视频'},
    { value: '18', name: '上图下文', tips: '支持竖版图片/视频'},
    { value: '19', name: '大图', tips: '支持竖版图片/视频'},
  ]
};

const ksRewardedTypeList = [
  { value: 1, label: '虚拟金币' },
  { value: 2, label: '积分' },
  { value: 3, label: '生命' },
  { value: 4, label: '体力值' },
  { value: 5, label: '通关机会' },
  { value: 6, label: '新关卡机会' },
  { value: 7, label: '阅读币' },
  { value: 8, label: '新章节（小说类）' },
  { value: 9, label: '观影币' },
  { value: 10, label: '观看机会' },
  { value: 11, label: '其他' },
];

export { csjAdspotSize, csjTemplateLayouts, isMoreThan24Hours, channelSource, ylhIncentiveRewardedVideoCrtType, ylhAdCrtTypeMap, ylhAdCrtNormalTypesMap, ylhAdCrtTypeListMap, isTimestampToday, bdMaterialTypesNameMap, bdAdStyleNameMap, bdAdStyleMap, splashShowControl, infoFlowTemplateKeys, infoFlowTemplateItems, ksBannerTempalteId, ksMaterialTypeList, ksMultiTemplateParamsMap, ksRewardedTypeList };
