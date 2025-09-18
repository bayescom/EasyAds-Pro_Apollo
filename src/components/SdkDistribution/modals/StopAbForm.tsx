import { IPercentage } from '@/models/types/sdkDistribution';
import store from '@/store';
import { Col, message, Modal, Radio, Row, Typography } from 'antd';
import { useMemo, useState } from 'react';
import styles from './index.module.less';

const { Paragraph } = Typography;

type Props = {
  open: boolean,
  adspotId: number,
  currentIsWaterfall: boolean,
  targetingGroupId?: number,
  percentageGroups?: IPercentage[],
  onClose: () => void
};

const sdkDistributionDispatcher = store.getModelDispatchers('sdkDistribution');

function StopAbForm({ open, adspotId, currentIsWaterfall, percentageGroups, onClose }: Props) {
  const [groupIdToUse, setGroupIdToUse] = useState(null);
  const distributionState = store.useModelState('distribution');

  const options = useMemo(() => {
    if (!percentageGroups) {
      return [];
    }

    if (currentIsWaterfall) {
      return (percentageGroups[0].trafficGroupList.filter(trafficGroup => trafficGroup.groupStrategy.groupTargetId == distributionState.currentTargetId).map(trafficGroup => {
        return trafficGroup.targetPercentageStrategyList.filter(targetPercentageStrategy => targetPercentageStrategy.targetPercentage.status == 1).map(targetPercentageStrategy => ({
          label: targetPercentageStrategy.targetPercentage.tag + '组',
          value: targetPercentageStrategy.targetPercentage.targetPercentageId || 0
        }));
      })).flat();
    } else {
      return percentageGroups.filter(item => item.trafficPercentage.percentageId && item.trafficPercentage.status == 1)
        .map(item => ({
          label: item.trafficPercentage.tag + '组',
          value: item.trafficPercentage.percentageId || 0
        }));
    }
  }, [currentIsWaterfall, distributionState.currentTargetId, percentageGroups]);

  if (!percentageGroups) {
    return <></>;
  }

  const onSubmit = async () => {
    if (!groupIdToUse) {
      message.error('请选择要使用的分组');
      return;
    }

    if(currentIsWaterfall) {
      const currentTrafficGroup = percentageGroups[0].trafficGroupList.find(trafficGroup => trafficGroup.groupStrategy.groupTargetId == distributionState.currentTargetId);
      const expName = currentTrafficGroup?.expName || '';
      const expId = currentTrafficGroup?.expId || 0;
      const targetPercentageObj = {
        targetPercentageList: [{ targetPercentageId: groupIdToUse, tag: 'A', percentage: 100, status: 1, copyTargetPercentageId: undefined}],
        experiment: {
          expId,
          expName
        }
      };
      const result = await sdkDistributionDispatcher.updatePercentageGroupsByWaterfall({
        adspotId,
        targetPercentageObj,
        percentageGroupId: distributionState.currentGroupTargetId,
        targetId: distributionState.currentTargetId
      });
      result && onCancel();
    } else {
      const selectedGroup = percentageGroups.find(item => item.trafficPercentage.percentageId === groupIdToUse);
      if (!selectedGroup) {
        message.error('选择的分组无效');
        return;
      }
      const targetPercentageObj = {
        trafficPercentageList: [{ percentageId: selectedGroup.trafficPercentage.percentageId, tag: 'A', percentage: 100, status: 1 }],
        experiment: {
          expId: selectedGroup.expId,
          expName: selectedGroup.expName
        }
      };
      const result = await sdkDistributionDispatcher.updatePercentageGroups({
        adspotId,
        targetPercentageObj
      });
      result && onCancel();
    }
  };

  const onCancel = () => {
    onClose();
  };

  return (
    <Modal
      title="停止AB测试"
      okText="提交"
      cancelText="取消"
      width={500}
      open={open}
      onOk={onSubmit}
      onCancel={onCancel}
      className={styles['stop-ad-form-btn']}
    >
      <Paragraph>请选择要使用的分组:</Paragraph>
      <Row>
        <Col span={24} style={{ textAlign: 'center' }}>
          <Radio.Group
            optionType="button"
            buttonStyle="solid"
            value={groupIdToUse}
            options={options}
            onChange={(e) => {
              setGroupIdToUse(e.target.value);
            }}
          />
        </Col>
      </Row>
    </Modal>
  );
}

export default StopAbForm;
