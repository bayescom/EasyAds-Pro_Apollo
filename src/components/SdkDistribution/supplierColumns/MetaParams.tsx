import CopyableText from '@/components/CopyableText';
import { ISdkAdspotChannel } from '@/models/types/sdkAdspotChannel';
import { Space, Typography } from 'antd';
import styles from './index.module.less';

const { Text } = Typography;

const getCopyableText  = (model, mediaId, adspotId) => {
  let text = '';
  if (model.adnParamsMeta.length) {
    model.adnParamsMeta.forEach(item => {
      if (item.metaName !== '媒体Key') {
        text += `${item.metaName}:${model.params[item.metaKey] || '-'}\n`;
      }
    });
  } else {
    text = `媒体ID:${mediaId ? mediaId : '-'}\n广告位ID:${adspotId ? adspotId : '-'}`;
  }

  return text;
};

function MetaParams({ model, adspotId, mediaId }: { model: ISdkAdspotChannel, adspotId?: number, mediaId?: number | undefined}) {
  return (<Space direction='vertical' style={{width: '100%', gap: 0}} className={styles['meta-params']}>
    <Text type='secondary'>广告源:
      <span className={styles['meta-channel-name']}>{model.channelName}</span>
      <CopyableText
        text={getCopyableText(model, mediaId, adspotId)}
        nameInTooltip='ID信息'
      >
        <a>复制ID信息</a>
      </CopyableText>
    </Text>
    {
      model.adnParamsMeta.length ? model.adnParamsMeta.map(item => (<span key={item.metaKey}>
        {
          item.metaName === '媒体Key' ? <div className={styles['blank-key']}></div> : <>
            <Text type='secondary'>{item.metaName}: </Text>
            <span>{model.params[item.metaKey] || '-'}</span>
            <CopyableText
              text={model.params[item.metaKey] || '-'}
              nameInTooltip={`${item.metaName}`}
            >
              <a>复制</a>
            </CopyableText>
          </>
        }
      </span>)) : (<>
        <span><Text type='secondary'>媒体ID: </Text>
          <span>{mediaId || '-'}</span>
          <CopyableText
            text={mediaId && mediaId || '-'}
            nameInTooltip='媒体ID'
          >
            <a>复制</a>
          </CopyableText>
        </span><span><Text type='secondary'>广告位ID: </Text>
          <span>{adspotId || '-'}</span>
          <CopyableText
            text={adspotId && adspotId || '-'}
            nameInTooltip='广告位ID'
          >
            <a>复制</a>
          </CopyableText>
        </span>
      </>)}
  </Space>);
}

export default MetaParams;
