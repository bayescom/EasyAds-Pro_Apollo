import { Space, Statistic, Tooltip } from 'antd';
import styles from './index.module.less';
import { formatData } from '@/services/utils/utils';

const isRmb = ['income', 'ecpm', 'ecpc', 'thirdIncome', 'thirdEcpm', 'thirdEcpc'];

function Count({ model, param }: { model, param: string }) {
  return (<Space style={{width: '100%'}} className={styles['sdk-channel-count']}>
    {
      model.data ? <>
        <Tooltip title={String(model.data[param]).length > 7 ? formatData(model.data[param], 0) : false} overlayClassName={styles['sdk-channel-count-tooltip']}>
          <Statistic 
            value={model.data[param]}
            className={styles['statistic-style']}
            prefix={isRmb.includes(param) && '¥'}
            valueStyle={{color:  '#000'}}
          />
        </Tooltip>
      </> :'-'
    }
  </Space>);
}

export default Count;
