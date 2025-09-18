import { Image, Popover, Space, Typography } from 'antd';
import { ISdkAdspotChannel } from '@/models/types/sdkAdspotChannel';
import SdkChannelMetaParam from './MetaParams';
import styles from './index.module.less';
import { channelIconMap } from '@/components/Utils/Constant';
import auto from '@/assets/icons/distribution/auto.png';

function Name({ model }: { model: ISdkAdspotChannel }) {
  return (<Space align='center' className={styles['name-container']} size={6}>
    {!!model.adnId && <Image
      src={channelIconMap[model.adnId]}
      style={{width: '18px', height: 'auto'}}
      preview={false}
    />}
    <Popover content={<SdkChannelMetaParam model={model}/>} trigger='hover' placement='bottom' overlayClassName={styles['popover-container']}>
      <Typography.Paragraph ellipsis={{rows: 1}}>{model.channelName}</Typography.Paragraph>
    </Popover>
    {model.isAutoCreate ? <Image src={auto} preview={false} className={styles['auto-image']}/> : <></>}
  </Space>);
}

export default Name;
