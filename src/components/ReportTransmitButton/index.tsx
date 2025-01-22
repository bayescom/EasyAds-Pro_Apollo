import store from '@/store';
import { Space } from 'antd';
import styles from './index.module.less';
import { CloudDownloadOutlined } from '@ant-design/icons';
import { config } from 'ice';

interface IProps {
  showCheckedKey: string[],
}

const ReportTransmitButton: React.FC<IProps> = ({showCheckedKey}: IProps) => {
  const reportMedium  = store.useModelState('reportMedium');

  const download = () => {

    // 媒体报表
    const mediaIds = reportMedium.queryParams.mediaIds == undefined ? '' : reportMedium.queryParams.mediaIds;
    const adspotIds = reportMedium.queryParams.adspotIds == undefined ? '' : reportMedium.queryParams.adspotIds;
    const channelIds = reportMedium.queryParams.channelIds == undefined ? '' : reportMedium.queryParams.channelIds;
    const sdkAdspotIds = reportMedium.queryParams.sdkAdspotIds == undefined ? '' : reportMedium.queryParams.sdkAdspotIds;
    window.open(`${config.luna}/traffic/report/download?type=${reportMedium.queryParams.type}&dimensions=${reportMedium.tableParams.dimensions}&beginTime=${reportMedium.queryParams.beginTime}&endTime=${reportMedium.queryParams.endTime}&display=${showCheckedKey}&mediaIds=${mediaIds}&adspotIds=${adspotIds}&channelIds=${channelIds}&sdkAdspotIds=${sdkAdspotIds}`, '_blank');
  };

  return (
    <>
      <a
        key="download"
        onClick={download}
        className={styles['download-button']}
      >
        <Space style={{color: '#403f3f'}}>
          <CloudDownloadOutlined />下载报表
        </Space>
      </a>
    </>
  );
};

export default ReportTransmitButton;
