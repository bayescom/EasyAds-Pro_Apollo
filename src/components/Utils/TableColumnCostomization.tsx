import { Tooltip, Typography, Statistic } from 'antd';
import { formatData } from '@/services/utils/utils';
import { Link } from 'ice';
import { QuestionCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface SummaryData {
  dateRange: string,
  /**
   * 请求
   */
  req?: number,
  /**
   * 广告返回
   */
  bid?: number,
  /**
   * 填充率
   */
  bidRate?: string,
  /**
   * 展现
   */
  imp: number,
  /**
   * 展现率
   */
  impRate?: string,
  click: number,
  clickRate: string,
  /**
   * 激活
   */
  action?: number,
  income?: number,
  ecpm?: number,
  ecpc?: number,
  cpa?: number,
}

interface IReportDetail {
  dateRange: string,
  req: string,
  bid: number,
  imp: number,
  click: number,
  income: number,
  bidRate: string,
  impRate: string,
  clickRate: string,
  ecpm: number,
  ecpc: number,
  mediaId: string,
  mediaName: string,
  adspotId: string,
  adspotName: string,
  channelId: string,
  channelName: string,
  dealId: string,
  dealName: string,
  sdkAdspotId: string
}

const initColumnsList = {
  'timestamp' :{
    title: '时间',
    dataIndex: 'timestamp',
    key: 'timestamp',
    render: (dom, reportDetail) => (
      <Text>{reportDetail.dateRange}</Text>
    ),
    fixed: 'left',
    sorter: true,
    width: 125,
  },
  'mediaId':{
    title: '媒体',
    dataIndex: 'mediaId',
    key: 'mediaId',
    sorter: false,
    render: (dom, reportDetail) => (<>
      <Text>{reportDetail.mediaName || '-'}</Text>
      { reportDetail && reportDetail.noNeedJump ? (<p>{reportDetail.mediaId}</p>) : (<Link style={{ display: 'block' }} to={{pathname:'/traffic/media', search: `mediaId=${reportDetail.mediaId}`}} target='_blank'>{reportDetail.mediaId || '-'}</Link>) }
    </>),
    fixed: 'left',
    width: 170,
  },
  'adspotId': {
    title: '广告位',
    dataIndex: 'adspotId',
    key: 'adspotId',
    sorter: false,
    render: (dom, reportDetail) => (<>
      <Text>{reportDetail.adspotName || '-'}</Text>
      { reportDetail && reportDetail.noNeedJump ? (<p>{reportDetail.adspotId}</p>) : (<Link style={{display:'block'}} to={`/traffic/distribution?mediaId=${reportDetail.mediaId}&adspotId=${reportDetail.adspotId}`} target='_blank'>{reportDetail.adspotId || '-'}</Link>) }
    </>),
    fixed: 'left',
    width: 205,
  },
  'channelId': {
    title: '广告网络',
    dataIndex: 'channelId',
    key: 'channelId',
    sorter: false,
    render: (dom, reportDetail) => (
      <Text>{reportDetail.channelName || '-'}</Text>
    ),
    fixed: 'left',
    width: 150,
  },
  'creativeId': {
    title: '创意',
    dataIndex: 'creativeId',
    key: 'creativeId',
    render: (dom, reportDetail) => (<>
      <Text>{reportDetail.creativeName || '-'}</Text>
      <Link style={{display:'block'}} to={`/advertising/creative?creativeId=${reportDetail.creativeId}`} target='_blank'>{reportDetail.creativeId|| '-'}</Link>
    </>),
    fixed: 'left',
    sorter: false,
    width: 205,
  },
  'adId': {
    title: '广告',
    dataIndex: 'adId',
    key: 'adId',
    render: (dom, reportDetail) => (<>
      <Text>{reportDetail.adIdName || '-'}</Text>
      <Text style={{display:'block'}}>{reportDetail.adId|| '-'}</Text>
    </>),
    fixed: 'left',
    sorter: false,
    width: 205,
  },
  'customerId': {
    title: '客户',
    dataIndex: 'customerId',
    key: 'customerId',
    render: (dom, reportDetail) => (
      <Text>{reportDetail.customerName || '-'}</Text>
    ),
    fixed: 'left',
    sorter: false,
    width: 205,
  },
  'dealId': {
    title: 'deal',
    dataIndex: 'dealId',
    key: 'dealId',
    render: (dom, reportMedium) => (
      <Text>{reportMedium.dealName || '-'}</Text>
    ),
    fixed: 'left',
    sorter: false,
    width: 150,
  },
  'sdkAdspotId': {
    title: '广告源',
    dataIndex: 'sdkAdspotId',
    key: 'sdkAdspotId',
    fixed: 'left',
    sorter: false,
    width: 150,
  },
  'req': {
    title: <><Tooltip title="接收到的来自客户端的广告请求数，当一个请求要请求多条广告时，广告请求数会记为1次"><QuestionCircleOutlined /></Tooltip>  请求</>,
    dataIndex: 'req',
    key: 'req',
    render: (text) => formatData(text, 0),
    sorter: true,
    width: 130,
  },
  'bid':{
    title: <><Tooltip title="返回给客户端的广告数"><QuestionCircleOutlined /></Tooltip>  返回</>,
    dataIndex: 'bid',
    key: 'bid',
    render: (text) => formatData(text, 0),
    sorter: true,
    width: 130,
  },
  'bidRate':{
    title: <><Tooltip title="填充率=广告返回数/广告请求数 * 100%"><QuestionCircleOutlined /></Tooltip>  填充率</>,
    dataIndex: 'bidRate',
    key: 'bidRate',
    sorter: true,
    width: 130,
  },
  'imp': {
    title: <><Tooltip title="统计的广告有效展示次数"><QuestionCircleOutlined /></Tooltip>  展示</>,
    dataIndex: 'imp',
    key: 'imp',
    render: (text) => formatData(text, 0),
    sorter: true,
    width: 130,
  },
  'impRate': {
    title: <><Tooltip title="展示率=广告展示数/广告返回数 * 100%；分广告网络时，展示率=展示/竞胜"><QuestionCircleOutlined /></Tooltip>  展示率</>,
    dataIndex: 'impRate',
    key: 'impRate',
    sorter: true,
    width: 130,
  },
  'click': {
    title: <><Tooltip title="统计的广告有效点击次数"><QuestionCircleOutlined /></Tooltip>  点击</>,
    dataIndex: 'click',
    key: 'click',
    render: (text) => formatData(text, 0),
    sorter: true,
    width: 130,
  },
  'clickRate': {
    title: <><Tooltip title="点击率=广告点击数/广告展示数 * 100%"><QuestionCircleOutlined /></Tooltip>  点击率</>,
    dataIndex: 'clickRate',
    key: 'clickRate',
    sorter: true,
    width: 130,
  },
  'income': {
    title: <><Tooltip title="因当天收益有所偏差，无法准确记录，所以记录的数据是昨天的预估收入，黄色部分表示收益还未被全部录入"><QuestionCircleOutlined /></Tooltip>  预估收益</>,
    dataIndex: 'income',
    key: 'income',
    render: (dom, reportDetail) => (
      <Text><Statistic value={reportDetail.income} prefix='¥' valueStyle={{color: '#000', fontSize: 12}} precision={2} /></Text>
    ),
    sorter: true,
    width: 130,
  },
  'ecpm': {
    title: <><Tooltip title="eCPM=（收入/展示数）* 1000"><QuestionCircleOutlined /></Tooltip>  eCPM(¥)</>,
    dataIndex: 'ecpm',
    key: 'ecpm',
    render: (dom, reportDetail) => (
      <Text><Statistic value={reportDetail.ecpm} prefix='¥' valueStyle={{color: '#000' , fontSize: 12}} precision={2} /></Text>
    ),
    sorter: true,
    width: 130,
  },
  'ecpc': {
    title: <><Tooltip title="eCPC=收入/点击数"><QuestionCircleOutlined /></Tooltip>  eCPC(¥)</>,
    dataIndex: 'ecpc',
    key: 'ecpc',
    render: (dom, reportDetail) => (
      <Text><Statistic value={reportDetail.ecpc} prefix='¥' valueStyle={{color: '#000', fontSize: 12}} precision={2} /></Text>
    ),
    sorter: true,
    width: 130,
  },
  'cpa': {
    title: 'CPA(¥)',
    dataIndex: 'cpa',
    key: 'cpa',
    sorter: true,
    width: 130,
    render: (dom, reportDetail) => (
      <Text><Statistic value={reportDetail.cpa} prefix='¥' valueStyle={{color: '#000', fontSize: 12}} precision={2} /></Text>
    ),
  },
  'action': {
    title: '激活',
    dataIndex: 'action',
    key: 'action',
    sorter: true,
    render: (text) => formatData(text, 0),
    width: 130,
  },
  'thirdReq': {
    title: <><Tooltip title="通过ADN Reporting API获取的广告请求数"><QuestionCircleOutlined /></Tooltip>  三方请求</>,
    dataIndex: 'thirdReq',
    key: 'thirdReq',
    render: (text) => formatData(text, 0),
    // sorter: true,
    width: 135,
  },
  'thirdBid':{
    title: <><Tooltip title="通过ADN Reporting API获取的广告返回数"><QuestionCircleOutlined /></Tooltip>  三方返回</>,
    dataIndex: 'thirdBid',
    key: 'thirdBid',
    render: (text) => formatData(text, 0),
    // sorter: true,
    width: 165,
  },
  'thirdBidRate':{
    title: <><Tooltip
      title={<>通过Reporting API获取的请求数和返回数计算出来的三方填充率，公式为：<br/>三方填充率 = 三方返回 / 三方请求</>}><QuestionCircleOutlined /></Tooltip>  三方填充率</>,
    dataIndex: 'thirdBidRate',
    key: 'thirdBidRate',
    // sorter: true,
    width: 150,
  },
  'thirdImp': {
    title: <><Tooltip title="通过Reporting API获取的展示数，由于网络环境和口径差异等情况，与倍联统计的可能有一定差异"><QuestionCircleOutlined /></Tooltip>  三方展示</>,
    dataIndex: 'thirdImp',
    key: 'thirdImp',
    render: (text) => formatData(text, 0),
    // sorter: true,
    width: 135,
  },
  'thirdImpRate': {
    title: <><Tooltip title="三方展示率 = 三方展示 / 三方返回 * 100%"><QuestionCircleOutlined /></Tooltip>  三方展示率</>,
    dataIndex: 'thirdImpRate',
    key: 'thirdImpRate',
    // sorter: true,
    width: 150,
  },
  'thirdClick': {
    title: <><Tooltip title="通过Reporting API获取的点击数"><QuestionCircleOutlined /></Tooltip>  三方点击</>,
    dataIndex: 'thirdClick',
    key: 'thirdClick',
    render: (text) => formatData(text, 0),
    // sorter: true,
    width: 135,
  },
  'thirdClickRate': {
    title: <><Tooltip title="三方点击率 = 三方点击数 / 三方展示数 * 100%"><QuestionCircleOutlined /></Tooltip>  三方点击率</>,
    dataIndex: 'thirdClickRate',
    key: 'thirdClickRate',
    // sorter: true,
    width: 150,
  },
  'thirdIncome': {
    title: <><Tooltip title="通过Reporting API获取的收益，经实时汇率转换为账号的货币单位"><QuestionCircleOutlined /></Tooltip>  三方预估收益</>,
    dataIndex: 'thirdIncome',
    key: 'thirdIncome',
    render: (dom, reportDetail) => (
      <Text><Statistic value={reportDetail.thirdIncome} prefix='¥' valueStyle={{color: '#000', fontSize: 12}} precision={2} /></Text>
    ),
    // sorter: true,
    width: 155,
  },
  'thirdEcpm': {
    title: <><Tooltip
      title={<>通过Reporting API获取的收益和展示数计算出来的每千次广告展示收益，公式为:<br/>三方eCPM(¥) =（三方预估收益 / 三方展示）* 1000</>}><QuestionCircleOutlined /></Tooltip>  三方eCPM(¥)</>,
    dataIndex: 'thirdEcpm',
    key: 'thirdEcpm',
    render: (dom, reportDetail) => (
      <Text><Statistic value={reportDetail.thirdEcpm} prefix='¥' valueStyle={{color: '#000', fontSize: 12}} precision={2} /></Text>
    ),
    // sorter: true,
    width: 165,
  },
  'thirdEcpc': {
    title: <><Tooltip title="通过reporting api获取的eCPC"><QuestionCircleOutlined /></Tooltip>  三方eCPC(¥)</>,
    dataIndex: 'thirdEcpc',
    key: 'thirdEcpc',
    render: (dom, reportDetail) => (
      <Text><Statistic value={reportDetail.thirdEcpc} prefix='¥' valueStyle={{color: '#000', fontSize: 12}} precision={2} /></Text>
    ),
    // sorter: true,
    width: 165,
  },
  'gapReqPercent': {
    title: <><Tooltip
      title={<>统计请求量与第三方广告平台统计请求量的差异，公式为:<br/> 请求gap率 = (请求 - 三方请求) / 三方请求</>}><QuestionCircleOutlined /></Tooltip>  请求Gap率</>,
    dataIndex: 'gapReqPercent',
    key: 'gapReqRatio',
    // sorter: true,
    width: 130,
  },
  'gapBidPercent': {
    title: <><Tooltip
      title={<>统计返回量与广告平台统计返回量的差异，公式为:<br/> 返回gap率 = (返回 - 三方返回) / 三方返回</>}><QuestionCircleOutlined /></Tooltip>  返回Gap率</>,
    dataIndex: 'gapBidPercent',
    key: 'gapBidPercent',
    // sorter: true,
    width: 130,
  },
  'gapImpPercent': {
    title: <><Tooltip
      title={<>统计展示量与广告平台统计展示量的差异，公式为:<br/> 展示gap = (展示 - 三方展示) / 三方展示</>}><QuestionCircleOutlined /></Tooltip>  展现Gap率</>,
    dataIndex: 'gapImpPercent',
    key: 'gapImpPercent',
    // sorter: true,
    width: 130,
  },
  'gapClickPercent': {
    title: <><Tooltip
      title={<>统计点击与广告平台统计点击的差异，公式为:<br/> 点击gap = (点击 - 三方点击) / 三方点击</>}><QuestionCircleOutlined /></Tooltip>  点击Gap率</>,
    dataIndex: 'gapClickPercent',
    key: 'gapClickPercent',
    // sorter: true,
    width: 130,
  },
  'bidWin': {
    title: <><Tooltip
      title='渠道竞价胜出的次数'><QuestionCircleOutlined /></Tooltip>  竞胜数</>,
    dataIndex: 'bidWin',
    key: 'bidWin',
    render: (text) => formatData(text, 0),
    // sorter: true,
    width: 135,
  },
  'bidWinRate': {
    title: <><Tooltip
      title='竞胜/返回'><QuestionCircleOutlined /></Tooltip>  竞胜率</>,
    dataIndex: 'bidWinRate',
    key: 'bidWinRate',
    // sorter: true,
    width: 110,
  },
};

export { SummaryData, IReportDetail, initColumnsList };
