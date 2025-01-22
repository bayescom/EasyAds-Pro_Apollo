import { ExperimentOutlined, MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Space } from 'antd';
import PercentageGroupListForm from './modals/PercentageGroupListForm';
import StopAbForm from './modals/StopAbForm';
import styles from './index.module.less';
import { useState } from 'react';
import { ISdkDistribution } from '@/models/types/sdkDistribution';

type Props = {
  /**
   * 是否已开启AB测试
   */
  abTesting: boolean,
  adspotId: number,
  percentageList: ISdkDistribution['percentageList']
};

function AbTestButton({ abTesting, adspotId, percentageList }: Props) {
  const [isPercentageGroupModalVisible, setIsPercentageGroupModalVisible] = useState(false);
  const [stopAbModalVisible, setStopAbModalVisible] = useState(false);

  const edit = <Space className={styles['percentage-edit-button-container']}>
    <Button
      type="default"
      className={styles['percentage-group-edit-button']}
      icon={<ExperimentOutlined style={{color: 'gray', marginRight: '3px'}}/>}
      onClick={() => setIsPercentageGroupModalVisible(true)}
    >
      A/B测试编辑
    </Button>
    <Dropdown overlay={
      <Menu
        items={[{label: '停止AB测试', key: 'stop'}]}
        onClick={({ key }) => key === 'stop' && setStopAbModalVisible(true)}
      />
    } overlayStyle={{minWidth: '100px'}}>
      <a onClick={e => e.preventDefault()}>
        <MoreOutlined style={{color: '#575757'}}/>
      </a>
    </Dropdown>
    <StopAbForm
      adspotId={adspotId}
      percentageGroups={percentageList}
      open={stopAbModalVisible}
      onClose={() => setStopAbModalVisible(false)}
    />
  </Space>;

  return (<>
    { abTesting
      ? edit
      : <Button
        type="default"
        className={styles['percentage-group-create-button']}
        icon={<ExperimentOutlined style={{color: 'gray', marginRight: '3px'}}/>}
        onClick={() => setIsPercentageGroupModalVisible(true)}
      >
        创建A/B测试
      </Button>
    }
    <PercentageGroupListForm
      visible={isPercentageGroupModalVisible}
      onClose={() => setIsPercentageGroupModalVisible(false)}
      adspotId={adspotId}
    />
  </>);
}

export default AbTestButton;
