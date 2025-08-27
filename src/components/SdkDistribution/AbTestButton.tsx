import { ExperimentOutlined, MoreOutlined, TableOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Space } from 'antd';
// 这个是流量分组的ab测试表单
import PercentageGroupListForm from './modals/PercentageGroupListForm';
import store from '@/store';
// 这个是瀑布流的 ab测试表单
import PercentageGroupListFormByWaterfall from './modals/PercentageGroupListFormByWaterfall';
import SelectAbTestType from './modals/SelectAbTestType';
import StopAbForm from './modals/StopAbForm';
import styles from './index.module.less';
import { useState, useEffect } from 'react';
import { ISdkDistribution } from '@/models/types/sdkDistribution';
import { useHistory } from 'ice';

type Props = {
  /**
   * 是否已开启AB测试
   */
  abTesting: boolean,
  adspotId: number,
  percentageList: ISdkDistribution['percentageList']
};

function AbTestButton({ abTesting, adspotId, percentageList }: Props) {
  const distributionState = store.useModelState('sdkDistribution');
  const distribution = distributionState[adspotId];
  const distributionModel = store.useModelState('distribution');
  const history = useHistory();

  // 这个是流量分组ab 测试的表单
  const [isPercentageGroupModalVisible, setIsPercentageGroupModalVisible] = useState(false);
  const [stopAbModalVisible, setStopAbModalVisible] = useState(false);

  // ab 测试创建之前的导航，选择是 瀑布流还是 流量分组的
  const [abTestSelectTypeModalVisible, setAbTestSelectTypeModalVisible] = useState(false);
  const [isWaterfall, setIsWaterfall] = useState(false);
  const [currentIsWaterfall, setCurrentIsWaterfall] = useState(false);

  // 当他从又ab实验的时候，停止之后，变为最初状态 要出现引导。
  // 如果 targetPercentageStrategyList 的长度只要有一项大于1 ，那么他是 瀑布流的ab测试，因为不进行测试或者是分组测试，targetPercentageStrategyList里面是只有一项的
  useEffect(() => {
    if (distribution.percentageList) {
      if (distribution.percentageList && distribution.percentageList[0].trafficGroupList.every(trafficGroup => trafficGroup.targetPercentageStrategyList.length == 1)) {
        setCurrentIsWaterfall(false);
      } else {
        setCurrentIsWaterfall(true);
      }
    } 
  }, [distribution.percentageList]);

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
      currentIsWaterfall={currentIsWaterfall}
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
        onClick={() => {
          if (currentIsWaterfall) {
            setAbTestSelectTypeModalVisible(false);
            setIsPercentageGroupModalVisible(true);
            setIsWaterfall(true);
          } else {
            setAbTestSelectTypeModalVisible(true);
          }
        }}
      >
        创建A/B测试
      </Button>
    }

    { abTesting
      ? <div className={currentIsWaterfall ? styles['waterfall-to-detail'] : styles['to-detail']}><a onClick={() => {
        if (currentIsWaterfall) {
          console.log(distributionModel.currentTargetId, distributionModel.currentGroupTargetId);
          const currentTrafficGroup = percentageList[0].trafficGroupList.find(trafficGroup => trafficGroup.groupStrategy.groupTargetId == distributionModel.currentTargetId);
          history.push(`/data_report/ab_report_detail/${currentTrafficGroup?.expId}`);
        } else {
          history.push(`/data_report/ab_report_detail/${distribution.percentageList[0].expId}`);
        }
      }}><TableOutlined />  查看A/B测试数据</a></div>
      : <></>
    }

    {
      isWaterfall || currentIsWaterfall ? <PercentageGroupListFormByWaterfall
        visible={isPercentageGroupModalVisible}
        onClose={() => setIsPercentageGroupModalVisible(false)}
        adspotId={adspotId}
      /> : <PercentageGroupListForm
        visible={isPercentageGroupModalVisible}
        onClose={() => setIsPercentageGroupModalVisible(false)}
        adspotId={adspotId}
      />
    }
    

    <SelectAbTestType
      visible={abTestSelectTypeModalVisible}
      onClose={() => setAbTestSelectTypeModalVisible(false)}
      onFinish={(value) => {
        setAbTestSelectTypeModalVisible(false);
        setIsWaterfall(value == 'waterfall');
        setIsPercentageGroupModalVisible(true);
      }}
    />
  </>);
}

export default AbTestButton;
