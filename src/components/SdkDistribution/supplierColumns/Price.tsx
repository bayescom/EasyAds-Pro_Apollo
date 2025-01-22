import { Space, Tooltip } from 'antd';
import styles from './index.module.less';
import { ISdkAdspotChannel } from '@/models/types/sdkAdspotChannel';

function Price({ model }: { model: ISdkAdspotChannel }) {
  return (<Space align='center' className={styles['font']}>
    {model.isHeadBidding ? (<Tooltip title={'竞价系数:' + model.bidRatio}>竞价</Tooltip>) : <>¥{model.bidPrice}</>}
  </Space>);
}

export default Price;
