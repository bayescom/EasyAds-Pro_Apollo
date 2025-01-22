import { Tooltip, Typography, Statistic, Space, Image } from 'antd';
import { formatData } from '@/services/utils/utils';
import { Link } from 'ice';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import { QuestionCircleOutlined } from '@ant-design/icons';
import DefaultIcon from '@/assets/icons/channel/defaultIcon.png';
import styles from './index.module.less';
import { channelIconMap, mediaIconMap } from '@/components/Utils/Constant';

const { Text } = Typography;

// 模版
const dimensionsTemplate = (reportDetail, key, type = 'none') => {
  return (<div style={{fontSize: '13px'}}>
    {/* 基础值展示 */}
    {type == 'number' && <p style={{marginBottom: 0}}>{formatData(reportDetail.data[key].basic, 0)}</p>}
    {type == 'rmb' && <Statistic value={reportDetail.data[key].basic} prefix='¥' valueStyle={{color: '#000', fontSize: 13}} />}
    {type == 'none' && <p style={{marginBottom: 0}}>{reportDetail.data[key].basic}</p>}

    { reportDetail && reportDetail.data && reportDetail.data[key] && reportDetail.data[key].crease != null ? (<p style={{color: reportDetail.data[key].trend == 1 ? 'red' : 'green', marginBottom: 0, marginTop: '5px'}}>
      
      {/* 对比展示 */}
      {type == 'number' && (<>{
        reportDetail.data[key].trend == 1 ? <CaretUpOutlined style={{color: 'red'}} /> : <CaretDownOutlined style={{color: 'green'}} />
      }
      <span>{formatData(reportDetail.data[key].crease, 0)}</span>
      ({reportDetail.data[key].ratio})
      </>)}
      {type == 'rmb' && (<>{
        reportDetail.data[key].trend == 1 ? <CaretUpOutlined style={{color: 'red' }} /> : <CaretDownOutlined style={{color: 'green'}} />
      }
      <Statistic value={reportDetail.data[key].crease} prefix='¥' valueStyle={{color: reportDetail.data[key].trend == 1 ? 'red' : 'green' , fontSize: 13}} style={{display: 'inline-block'}} />
      <span style={{color: reportDetail.data[key].trend == 1 ? 'red' : 'green'}}>({reportDetail.data[key].ratio})</span>
      </>)}
      {type == 'none' && (<>{
        reportDetail.data[key].trend == 1 ? <CaretUpOutlined style={{color: 'red'}} /> : <CaretDownOutlined style={{color: 'green'}} />
      }
      <span>{reportDetail.data[key].crease}</span>
      ({reportDetail.data[key].ratio})
      </>)}
      
    </p>) : (<></>) 
    }
  </div>);
};

type DimesionType = {
  basic: string,
  contrast: string,
  crease: string,
  ratio: string,
  trend: number
}

type DataDimesionType = {
  dataRange: DimesionType,
  bid: DimesionType,
  bidRate: DimesionType,
  click: DimesionType,
  clickRate: DimesionType,
  ecpc: DimesionType,
  ecpm: DimesionType,
  gapBidPercent: DimesionType,
  gapClickPercent: DimesionType,
  gapImpPercent: DimesionType,
  gapReqPercent: DimesionType,
  imp: DimesionType,
  impRate: DimesionType,
  income: DimesionType,
  req: DimesionType,
  thirdBid: DimesionType,
  thirdBidRate: DimesionType,
  thirdClick: DimesionType,
  thirdClickRate: DimesionType,
  thirdEcpc: DimesionType,
  thirdEcpm: DimesionType,
  thirdImp: DimesionType,
  thirdImpRate: DimesionType,
  thirdIncome: DimesionType,
  thirdReq: DimesionType,
}
interface SummaryData {
  data: DataDimesionType,
  adspotId: string,
  adspotName: string,
  channelId: string,
  channelName: string,
  dealId: string,
  dealName: string,
  mediaId: string,
  mediaName: string,
  sdkAdspotId: string
}

interface IReportDetail {
  data: DataDimesionType,
  adspotId: string,
  adspotName: string,
  channelId: string,
  channelName: string,
  dealId: string,
  dealName: string,
  mediaId: string,
  mediaName: string,
  sdkAdspotId: string
}

const initColumnsList = {
  'timestamp' :{
    title: '时间',
    dataIndex: 'timestamp',
    key: 'timestamp',
    render: (dom, reportDetail) => (<>
      <Text>{reportDetail.data.dateRange.basic}</Text>
      { reportDetail && reportDetail.data && reportDetail.data.dateRange && reportDetail.data.dateRange.crease ? (<p>{reportDetail.data.dateRange.crease}</p>) : (<></>) 
      }
    </>),
    fixed: 'left',
    sorter: true,
    width: 125,
  },
  'mediaId':{
    title: '媒体',
    dataIndex: 'mediaId',
    key: 'mediaId',
    sorter: false,
    render: (dom, reportDetail) => (<Space size={5} className={styles['media-container']}>
      <Image src={mediaIconMap[reportDetail['platform']] || DefaultIcon} preview={false} style={{width: '36px', height: 'auto'}} />
      <div>
        <Typography.Paragraph ellipsis={{ rows: 1, tooltip: reportDetail.mediaName || '-' }}>
          {reportDetail.mediaName || '-'}
        </Typography.Paragraph>
        { reportDetail && reportDetail.noNeedJump ? (<p>{reportDetail.mediaId}</p>) : (<Link style={{ display: 'block' }} to={{pathname:'/traffic/media', search: `mediaId=${reportDetail.mediaId}`}} target='_blank'>{reportDetail.mediaId || '-'}</Link>) }
      </div>
    </Space>),
    fixed: 'left',
    width: 160,
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
    render: (dom, reportDetail) => (<Space size={0}>
      <Image src={channelIconMap[reportDetail.channelId] ? channelIconMap[reportDetail.channelId] : DefaultIcon} style={{width: '18px', height: 'auto'}}/>
      <Text>{reportDetail.channelName || '-'}</Text>
    </Space>
    ),
    fixed: 'left',
    width: 140,
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
    width: 140,
  },
  'sdkAdspotId': {
    title: '广告源',
    dataIndex: 'sdkAdspotId',
    key: 'sdkAdspotId',
    fixed: 'left',
    sorter: false,
    width: 140,
  },
  'req': {
    title: <><Tooltip title="接收到的来自客户端的广告请求数，当一个请求要请求多条广告时，广告请求数会记为1次"><QuestionCircleOutlined /></Tooltip>  请求</>,
    dataIndex: 'req',
    key: 'req',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'req', 'number')),
    sorter: true,
    width: 180,
  },
  'bid':{
    title: <><Tooltip title="返回给客户端的广告数"><QuestionCircleOutlined /></Tooltip>  返回</>,
    dataIndex: 'bid',
    key: 'bid',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'bid', 'number')),
    sorter: true,
    width: 170,
  },
  'bidRate':{
    title: <><Tooltip title="填充率=广告返回数/广告请求数 * 100%"><QuestionCircleOutlined /></Tooltip>  填充率</>,
    dataIndex: 'bidRate',
    key: 'bidRate',
    sorter: true,
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'bidRate')),
    width: 150,
  },
  'imp': {
    title: <><Tooltip title="统计的广告有效展示次数"><QuestionCircleOutlined /></Tooltip>  展示</>,
    dataIndex: 'imp',
    key: 'imp',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'imp', 'number')),
    sorter: true,
    width: 170,
  },
  'impRate': {
    title: <><Tooltip title="展示率=广告展示数/广告返回数 * 100%；分广告网络时，展示率=展示/竞胜"><QuestionCircleOutlined /></Tooltip>  展示率</>,
    dataIndex: 'impRate',
    key: 'impRate',
    sorter: true,
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'impRate')),
    width: 150,
  },
  'click': {
    title: <><Tooltip title="统计的广告有效点击次数"><QuestionCircleOutlined /></Tooltip>  点击</>,
    dataIndex: 'click',
    key: 'click',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'click', 'number')),
    sorter: true,
    width: 160,
  },
  'clickRate': {
    title: <><Tooltip title="点击率=广告点击数/广告展示数 * 100%"><QuestionCircleOutlined /></Tooltip>  点击率</>,
    dataIndex: 'clickRate',
    key: 'clickRate',
    sorter: true,
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'clickRate')),
    width: 140,
  },
  'income': {
    title: <><Tooltip title="因当天收益有所偏差，无法准确记录，所以记录的数据是昨天的预估收入，黄色部分表示收益还未被全部录入"><QuestionCircleOutlined /></Tooltip>  预估收益</>,
    dataIndex: 'income',
    key: 'income',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'income', 'rmb')),
    sorter: true,
    width: 180,
  },
  'ecpm': {
    title: <><Tooltip title="eCPM=（收入/展示数）* 1000"><QuestionCircleOutlined /></Tooltip>  eCPM(¥)</>,
    dataIndex: 'ecpm',
    key: 'ecpm',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'ecpm', 'rmb')),
    sorter: true,
    width: 150,
  },
  'ecpc': {
    title: <><Tooltip title="eCPC=收入/点击数"><QuestionCircleOutlined /></Tooltip>  eCPC(¥)</>,
    dataIndex: 'ecpc',
    key: 'ecpc',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'ecpc', 'rmb')),
    sorter: true,
    width: 150,
  },
  'cpa': {
    title: 'CPA(¥)',
    dataIndex: 'cpa',
    key: 'cpa',
    sorter: true,
    width: 200,
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'cpa', 'rmb')),
  },
  'action': {
    title: '激活',
    dataIndex: 'action',
    key: 'action',
    sorter: true,
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'action', 'number')),
    width: 200,
  },
  'thirdReq': {
    title: <><Tooltip title="通过ADN Reporting API获取的广告请求数"><QuestionCircleOutlined /></Tooltip>  三方请求</>,
    dataIndex: 'thirdReq',
    key: 'thirdReq',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'thirdReq', 'number')),
    // sorter: true,
    width: 180,
  },
  'thirdBid':{
    title: <><Tooltip title="通过ADN Reporting API获取的广告返回数"><QuestionCircleOutlined /></Tooltip>  三方返回</>,
    dataIndex: 'thirdBid',
    key: 'thirdBid',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'thirdBid', 'number')),
    // sorter: true,
    width: 170,
  },
  'thirdBidRate':{
    title: <><Tooltip
      title={<>通过Reporting API获取的请求数和返回数计算出来的三方填充率，公式为：<br/>三方填充率 = 三方返回 / 三方请求</>}><QuestionCircleOutlined /></Tooltip>  三方填充率</>,
    dataIndex: 'thirdBidRate',
    key: 'thirdBidRate',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'thirdBidRate')),
    // sorter: true,
    width: 140,
  },
  'thirdImp': {
    title: <><Tooltip title="通过Reporting API获取的展示数，由于网络环境和口径差异等情况，与倍联统计的可能有一定差异"><QuestionCircleOutlined /></Tooltip>  三方展示</>,
    dataIndex: 'thirdImp',
    key: 'thirdImp',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'thirdImp', 'number')),
    // sorter: true,
    width: 170,
  },
  'thirdImpRate': {
    title: <><Tooltip title="三方展示率 = 三方展示 / 三方返回 * 100%"><QuestionCircleOutlined /></Tooltip>  三方展示率</>,
    dataIndex: 'thirdImpRate',
    key: 'thirdImpRate',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'thirdImpRate')),
    // sorter: true,
    width: 140,
  },
  'thirdClick': {
    title: <><Tooltip title="通过Reporting API获取的点击数"><QuestionCircleOutlined /></Tooltip>  三方点击</>,
    dataIndex: 'thirdClick',
    key: 'thirdClick',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'thirdClick', 'number')),
    // sorter: true,
    width: 160,
  },
  'thirdClickRate': {
    title: <><Tooltip title="三方点击率 = 三方点击数 / 三方展示数 * 100%"><QuestionCircleOutlined /></Tooltip>  三方点击率</>,
    dataIndex: 'thirdClickRate',
    key: 'thirdClickRate',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'thirdClickRate')),
    // sorter: true,
    width: 140,
  },
  'thirdIncome': {
    title: <><Tooltip title="通过Reporting API获取的收益，经实时汇率转换为账号的货币单位"><QuestionCircleOutlined /></Tooltip>  三方预估收益</>,
    dataIndex: 'thirdIncome',
    key: 'thirdIncome',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'thirdIncome', 'rmb')),
    width: 180,
  },
  'thirdEcpm': {
    title: <><Tooltip
      title={<>通过Reporting API获取的收益和展示数计算出来的每千次广告展示收益，公式为:<br/>三方eCPM(¥) =（三方预估收益 / 三方展示）* 1000</>}><QuestionCircleOutlined /></Tooltip>  三方eCPM(¥)</>,
    dataIndex: 'thirdEcpm',
    key: 'thirdEcpm',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'thirdEcpm', 'rmb')),
    width: 140,
  },
  'thirdEcpc': {
    title: <><Tooltip title="通过reporting api获取的eCPC"><QuestionCircleOutlined /></Tooltip>  三方eCPC(¥)</>,
    dataIndex: 'thirdEcpc',
    key: 'thirdEcpc',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'thirdEcpc', 'rmb')),
    width: 140,
  },
  'gapReqPercent': {
    title: <><Tooltip
      title={<>统计请求量与第三方广告平台统计请求量的差异，公式为:<br/> 请求gap率 = (请求 - 三方请求) / 三方请求</>}><QuestionCircleOutlined /></Tooltip>  请求Gap率</>,
    dataIndex: 'gapReqPercent',
    key: 'gapReqRatio',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'gapReqPercent')),
    width: 140,
  },
  'gapBidPercent': {
    title: <><Tooltip
      title={<>统计返回量与广告平台统计返回量的差异，公式为:<br/> 返回gap率 = (返回 - 三方返回) / 三方返回</>}><QuestionCircleOutlined /></Tooltip>  返回Gap率</>,
    dataIndex: 'gapBidPercent',
    key: 'gapBidPercent',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'gapBidPercent')),
    width: 140,
  },
  'gapImpPercent': {
    title: <><Tooltip
      title={<>统计展示量与广告平台统计展示量的差异，公式为:<br/> 展示gap = (展示 - 三方展示) / 三方展示</>}><QuestionCircleOutlined /></Tooltip>  展现Gap率</>,
    dataIndex: 'gapImpPercent',
    key: 'gapImpPercent',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'gapImpPercent')),
    width: 140,
  },
  'gapClickPercent': {
    title: <><Tooltip
      title={<>统计点击与广告平台统计点击的差异，公式为:<br/> 点击gap = (点击 - 三方点击) / 三方点击</>}><QuestionCircleOutlined /></Tooltip>  点击Gap率</>,
    dataIndex: 'gapClickPercent',
    key: 'gapClickPercent',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'gapClickPercent')),
    width: 140,
  },
  'bidWin': {
    title: <><Tooltip
      title='渠道竞价胜出的次数'><QuestionCircleOutlined /></Tooltip>  竞胜数</>,
    dataIndex: 'bidWin',
    key: 'bidWin',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'bidWin', 'number')),
    // sorter: true,
    width: 135,
  },
  'bidWinRate': {
    title: <><Tooltip
      title='竞胜/返回'><QuestionCircleOutlined /></Tooltip>  竞胜率</>,
    dataIndex: 'bidWinRate',
    key: 'bidWinRate',
    render: (dom, reportDetail) => (dimensionsTemplate(reportDetail, 'bidWinRate')),
    // sorter: true,
    width: 110,
  },
};

export { SummaryData, IReportDetail, initColumnsList };
