import { Image, Popover, Space, Typography } from 'antd';
import { ISdkChannelTrafficList } from '@/models/types/sdkChannelTrafficList';
import SdkChannelMetaParam from './MetaParams';
import styles from '../index.module.less';
import auto from '@/assets/icons/distribution/auto.png';

function Name({ model }: { model: ISdkChannelTrafficList }) {
  return (<Space align='center' className={styles['name-container']} size={6}>
    {!!model.sdkChannelIcon && <Image
      src={model.sdkChannelIcon}
      style={{width: '18px', height: 'auto'}}
      preview={false}
    />}
    <Popover content={<SdkChannelMetaParam model={model}/>} trigger='hover' placement='bottom' overlayClassName={styles['popover-container']}>
      <Typography.Paragraph ellipsis={{rows: 1}}>{model.sdkChannelAlias || model.sdkChannelName}</Typography.Paragraph>
    </Popover>
    {!!model.isAutoCreate && <Image src={auto} preview={false} className={styles['auto-image']}/>}
  </Space>);
}

export default Name;
