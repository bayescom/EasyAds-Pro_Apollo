import { IPercentage, TrafficGroupType } from '@/models/types/sdkDistribution';
import { CloseOutlined, EditOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import { Button, Popconfirm, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import TargetingGroupListForm from './modals/TargetingGroupListForm';
import styles from './index.module.less';

function PercentageGroup({ group, adspotId, abTesting: showTargetingGroups, onDelete, children }: {
  group: IPercentage,
  adspotId: number,
  abTesting: boolean,
  onDelete: (targetingGroupId: number) => void,
  children: (group: TrafficGroupType) => React.ReactNode
}) {
  const [isTargetingGroupsModalVisible, setIsTargetingGroupsModalVisible] = useState(false);

  const deleteTargetingGroup = (targetingGroupId?: number) => {
    if (!targetingGroupId) {
      return;
    }

    onDelete(targetingGroupId);
  };

  const EditTargetingGroupsButton = <Button
    type='link'
    icon={<EditOutlined />}
    onClick={() => setIsTargetingGroupsModalVisible(true)}
  >流量分组管理</Button>;

  useEffect(() => {
    const dom = document.querySelector(`.${styles['targeting-group-tab']}`);
    if (!dom) {
      return;
    }

    dom.classList.remove('ant-tabs-card');
  }, []);

  return (
    <>
      <Tabs
        type="editable-card"
        className={styles['targeting-group-tab']}
        tabBarExtraContent={{ left: EditTargetingGroupsButton }}
        destroyInactiveTabPane
        tabBarStyle={showTargetingGroups ? {} : { display: 'none' }}
        items={group.trafficGroupList.map(trafficGroup => ({
          key: trafficGroup.groupStrategy.groupTargetId + '',
          label: (<>
            {
              trafficGroup.suppliers.some(innerSuppliers => !innerSuppliers.length)
                ? <ExclamationCircleFilled style={{ color: '#f8b601' }} />
                : <></>
            }
            {`${trafficGroup.groupStrategy.priority}: ${trafficGroup.groupStrategy.name}`}
          </>),
          closeIcon: (
            <Popconfirm
              title="确定要删除这个流量分组吗"
              okText="确定"
              cancelText="取消"
              onConfirm={() => deleteTargetingGroup(trafficGroup.trafficId)}
            >
              <CloseOutlined
                className={styles['targeting-close-icon']}
                onClick={(e) => {e.stopPropagation();}}
              />
            </Popconfirm>
          ),
          children: children(trafficGroup),
          closable: group.trafficGroupList.length > 1
        }))}
        hideAdd
      />
      <TargetingGroupListForm
        adspotId={adspotId}
        percentageGroupId={group.trafficPercentage.percentageId}
        visible={isTargetingGroupsModalVisible}
        onClose={() => setIsTargetingGroupsModalVisible(false)}
      />
    </>
  );
}

export default PercentageGroup;
