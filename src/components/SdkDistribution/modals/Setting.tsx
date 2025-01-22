import store from '@/store';
import { SettingOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import styles from './index.module.less';

const distributionDispatcher = store.getModelDispatchers('distribution');

export default function Setting() {

  const changeDataTargetModalVisible = () => {
    distributionDispatcher.setDataTargetModalVisible(true);
  };

  return (<div className={styles['setting-check-container']}>
    <Tooltip title='自定义数据指标'>
      <Button icon={<SettingOutlined style={{color: '#bdbdbd', width: '13px', height: '13px'}}/>} onClick={() => changeDataTargetModalVisible()}>指标</Button>
    </Tooltip>
  </div>);
}
