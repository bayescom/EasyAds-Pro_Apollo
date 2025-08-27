import androidIcon from '@/assets/icons/platform-android.jpg';
import iosIcon from '@/assets/icons/platform-ios.jpg';
import harmonyOsIcon from '@/assets/icons/platform-harmonyOs.png';
import android from '@/assets/icons/media/android_app_icon.png';
import harmony from '@/assets/icons/media/harmony_app_icon.png';
import ios from '@/assets/icons/media/ios_app_icon.png';
import tapTap from '@/assets/icons/channel/taptap.png';
import ylh from '@/assets/icons/channel/ylh.png';
import adx from '@/assets/icons/channel/adx.png';
import baidu from '@/assets/icons/channel/baidu.png';
import tanx from '@/assets/icons/channel/tanx.png';
import oppo from '@/assets/icons/channel/oppo.png';
import csj from '@/assets/icons/channel/csj.png';
import own from '@/assets/icons/channel/own.png';
import kuaishou from '@/assets/icons/channel/kuaishou.png';

type dimensionListType = {
  key: string,
  name: string,
  color: string,
  format?: string
}

const chartDimensionList = {
  'req': { key: 'req', name: '请求', color: '#7D26CD', topGradient: 'rgba(125, 38, 205, 0.1)', tailGradient: 'rgba(125, 38, 205, 0)'},
  'bid': { key: 'bid', name: '广告返回', color: '#FFBF00', topGradient: 'rgba(255, 191, 0, 0.1)', tailGradient: 'rgba(255, 191, 0, 0)'},
  'bidRate': { key: 'bidRate', name: '填充率', color: '#FF3030',format: 'percent' },
  'imp': { key: 'imp', name: '展现', color: '#37A2FF', topGradient: 'rgba(55, 162, 255, 0.1)', tailGradient: 'rgba(55, 162, 255, 0)'},
  'impRate': { key: 'impRate', name: '展现率', format: 'percent', color: '#2364FB', topGradient: 'rgba(35, 100, 251, 0.1)', tailGradient: 'rgba(35, 100, 251, 0)'},
  'click': { key: 'click', name: '点击', color: '#FF0087', topGradient: 'rgba(255, 0, 135, 0.1)', tailGradient: 'rgba(255, 0, 135, 0)'},
  'ctr': { key: 'ctr', name: '点击率', format: 'percent', color: '#76c911', topGradient: 'rgba(118, 201, 17, 0.1)', tailGradient: 'rgba(118, 201, 17, 0)'},
  'clickRate': { key: 'clickRate', name: '点击率', format: 'percent', color: '#76c911' },
  'income': { key: 'income', name: '收入(¥)', format: 'rmbYuan', color: '#ff00ff', topGradient: 'rgba(255, 0, 255, 0.1)', tailGradient: 'rgba(255, 0, 255, 0)'},
  'ecpm': { key: 'ecpm', name: 'eCPM(¥)', format: 'rmbYuan', color: '#80FFA5', topGradient: 'rgba(128, 255, 165, 0.1)', tailGradient: 'rgba(128, 255, 165, 0)'},
  'ecpc': { key: 'ecpc', name: 'eCPC(¥)', format: 'rmbYuan', color: '#FFBF00', topGradient: 'rgba(255, 191, 0, 0.1)', tailGradient: 'rgba(255, 191, 0, 0)'},
  'cpa': { key: 'cpa', name: 'CPA(¥)', format: 'rmbYuan', color: '#0099cc' },
  'thirdReq': { key: 'thirdReq', name: '三方请求', color: '#3c16fb' },
  'thirdBid': { key: 'thirdBid', name: '三方返回', color: '#f256ab' },
  'thirdBidRate': { key: 'thirdBidRate', name: '三方填充率', format: 'percent', color: '#634c7f' },
  'thirdImp': { key: 'thirdImp', name: '三方展示', color: '#89e6ae' },
  'thirdImpRate': { key: 'thirdImpRate', name: '三方展示率', format: 'percent', color: '#3152ae' },
  'thirdClick': { key: 'thirdClick', name: '三方点击', color: '#9fec51' },
  'thirdClickRate': { key: 'thirdClickRate', name: '三方点击率', format: 'percent', color: '#5f543a' },
  'thirdIncome': { key: 'thirdIncome', name: '三方预估收益(¥)', format: 'rmbYuan', color: '#65e2f9' },
  'thirdEcpm': { key: 'thirdEcpm', name: '三方eCPM(¥)', format: 'rmbYuan', color: '#2f3368' },
  'thirdEcpc': { key: 'thirdEcpc', name: '三方eCPC(¥)', format: 'rmbYuan', color: '#0dfdb5' },
  'gapReqPercent': { key: 'gapReqPercent', name: '请求Gap率', format: 'percent', color: '#ccc' },
  'gapBidPercent': { key: 'gapBidPercent', name: '返回Gap率', format: 'percent', color: '#7ae73b' },
  'gapImpPercent': { key: 'gapImpPercent', name: '展现Gap率', format: 'percent', color: '#094ab7' },
  'gapClickPercent': { key: 'gapClickPercent', name: '点击Gap率', format: 'percent', color: '#9ze66d' },
  'bidWin': { key: 'bidWin', name: '竞胜数', color: '#FFBF00' },
  'bidWinRate': { key: 'bidWinRate', name: '竞胜率', format: 'percent', color: '#9ze66d' },
};

const adspotTypeAllList = ['开屏', '信息流', '横幅', '插屏', '视频贴片', '激励视频', '文字链', '气泡角标'];

const platformIconMap = {
  0: iosIcon,
  1: androidIcon,
  2: harmonyOsIcon
};

const mediaIconMap = {
  0: ios,
  1: android,
  2: harmony
};

const channelIconMap = {
  1: own,
  2: ylh,
  3: csj,
  4: baidu,
  5: kuaishou,
  7: tanx,
  9: oppo,
  10: tapTap,
  99: adx
};

/** 2, 3, 4, 5 穿山甲，优量汇，百度，快手 */
const sdkReportApiChannels = [2, 3, 4, 5];

const autoCreateStatusTipMap = {
  2: '请确保您的优量汇账号拥有应用代码位管理API权限。若无此权限，可向优量汇对接人进行申请。开启自动创建广告源功能，当您在平台创建广告源时，平台会自动在优量汇后台同步创建广告代码位。',
  3: '请确保您的穿山甲账号拥有应用代码位管理API权限。若无此权限，可向穿山甲对接人进行申请。开启自动创建广告源功能，当您在平台创建广告源时，平台会自动在穿山甲后台同步创建广告代码位。',
  4: '请确保您的百度账号拥有应用代码位管理API权限。若无此权限，可向百度对接人进行申请。开启自动创建广告源功能，当您在平台创建广告源时，平台会自动在百度后台同步创建广告代码位。',
  5: '请确保您的快手账号拥有应用代码位管理API权限。若无此权限，可向快手对接人进行申请。开启自动创建广告源功能，当您在平台创建广告源时，平台会自动在快手后台同步创建广告代码位。',
};

const adspotTypeListMap = { 1: '横幅', 2: '开屏', 3: '插屏', 6: '信息流', 8: '文字链', 9: '视频贴片', 12: '激励视频' };

export { dimensionListType, chartDimensionList, adspotTypeAllList, platformIconMap, mediaIconMap, channelIconMap, sdkReportApiChannels, autoCreateStatusTipMap, adspotTypeListMap };
