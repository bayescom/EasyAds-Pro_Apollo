import { IPercentage } from '@/models/types/sdkDistribution';
import store from '@/store';
import { Col, message, Modal, Radio, Row, Typography } from 'antd';
import { useState } from 'react';
import styles from './index.module.less';

const { Paragraph } = Typography;

type Props = {
  open: boolean,
  adspotId: number,
  targetingGroupId?: number,
  percentageGroups?: IPercentage[],
  onClose: () => void
};

const sdkDistributionDispatcher = store.getModelDispatchers('sdkDistribution');

function StopAbForm({ open, adspotId, percentageGroups, onClose }: Props) {
  const [groupIdToUse, setGroupIdToUse] = useState(null);

  if (!percentageGroups) {
    return <></>;
  }

  const options = percentageGroups.filter(item => item.trafficPercentage.percentageId)
    .map(item => ({
      label: item.trafficPercentage.tag + '组',
      value: item.trafficPercentage.percentageId || 0
    }));

  const onSubmit = async () => {
    if (!groupIdToUse) {
      message.error('请选择要使用的分组');
      return;
    }

    const selectedGroup = percentageGroups.find(item => item.trafficPercentage.percentageId === groupIdToUse);
    if (!selectedGroup) {
      message.error('选择的分组无效');
      return;
    }

    await sdkDistributionDispatcher.updatePercentageGroups({
      adspotId,
      trafficPercentageList: [{ percentageId: selectedGroup.trafficPercentage.percentageId, tag: 'A', percentage: 100 }]
    });
    onCancel();
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
            onChange={(e) => setGroupIdToUse(e.target.value)}
          />
        </Col>
      </Row>
    </Modal>
  );
}

export default StopAbForm;
