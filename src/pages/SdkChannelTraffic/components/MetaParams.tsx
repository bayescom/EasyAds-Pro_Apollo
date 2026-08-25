import CopyableText from '@/components/CopyableText';
import { ISdkChannelTrafficList } from '@/models/types/sdkChannelTrafficList';
import { Space, Typography } from 'antd';
import styles from '../index.module.less';

const { Text } = Typography;

const getCopyableText  = (model, mediaId, adspotId) => {
  let text = '';
  if (model.sdkChannelConfigs.length) {
    model.sdkChannelConfigs.forEach(item => {
      if (item.name !== '媒体Key') {
        text += `${item.name}:${model.sdkChannelParams[item.key] || '-'}\n`;
      }
    });
  } else {
    text = `媒体ID:${mediaId ? mediaId : '-'}\n广告位ID:${adspotId ? adspotId : '-'}`;
  }

  return text;
};

function MetaParams({ model, adspotId, mediaId }: { model: ISdkChannelTrafficList, adspotId?: number, mediaId?: number | undefined}) {
  return (<Space direction='vertical' style={{width: '100%'}} className={styles['meta-params']}>
    <Text type='secondary'>广告源:
      <span className={styles['meta-channel-name']}>{model.sdkChannelAlias || model.sdkChannelName}</span>
      <CopyableText
        text={getCopyableText(model, mediaId, adspotId)}
        nameInTooltip='ID信息'
      >
        <a>复制ID信息</a>
      </CopyableText>
    </Text>
    {
      model.sdkChannelConfigs.length ? model.sdkChannelConfigs.map(item => (<span key={item.key}>
        {
          item.name === '媒体Key' ? <div className={styles['blank-key']}></div> : <>
            <Text type='secondary'>{item.name}: </Text>
            <span>{model.sdkChannelParams[item.key] || '-'}</span>
            <CopyableText
              text={model.sdkChannelParams[item.key] || '-'}
              nameInTooltip={`${item.name}`}
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
