import { IPercentage, TrafficGroupType } from '@/models/types/sdkDistribution';
import { CloseOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Tabs, Image } from 'antd';
import { useEffect, useState, useCallback } from 'react';
import TargetingGroupListForm from './modals/TargetingGroupListForm';
import AbTestIcon from '@/assets/icons/distribution/abTest.png';
import styles from './index.module.less';
import store from '@/store';

const distributionDispatcher = store.getModelDispatchers('distribution');

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

  const handleClick = useCallback((currentId, currentPercentageId) => {
    distributionDispatcher.setCurrentTargetId(currentId);
    distributionDispatcher.setCurrentGroupTargetId(currentPercentageId);
  }, [distributionDispatcher]);

  return (
    <>
      <Tabs
        type="editable-card"
        className={styles['targeting-group-tab-by-waterfall']}
        tabBarExtraContent={{ left: EditTargetingGroupsButton }}
        // destroyInactiveTabPane
        tabBarStyle={showTargetingGroups ? {} : { display: 'none' }}
        onTabClick={(key, e) => {
          // 从key中解析出需要的信息
          const [currentId, currentPercentageId] = key.split('_')[0].split('-');
          handleClick(Number(currentId), Number(currentPercentageId));
        }}
        items={group.trafficGroupList.map((trafficGroup, trafficGroupIndex) => {
          return {
            key: `${trafficGroup.groupStrategy.groupTargetId}-${group.trafficPercentage.percentageId}_${trafficGroupIndex}`,
            label: (<>
              {
                trafficGroup.targetPercentageStrategyList.length > 1
                  ? <Image src={AbTestIcon} preview={false} width={17} style={{marginLeft: '-4px', marginRight: '7px', verticalAlign: 'top'}} />
                  : <></>
              }
              {`${trafficGroup.groupStrategy.priority}: ${trafficGroup.groupStrategy.name}`}
            </>),
            closeIcon: (
              <Popconfirm
                title="确定要删除这个流量分组吗"
                okText="确定"
                cancelText="取消"
                onConfirm={() => deleteTargetingGroup(trafficGroup.targetPercentageStrategyList[0].trafficId)}
              >
                <CloseOutlined
                  className={styles['targeting-close-icon']}
                  onClick={(e) => {e.stopPropagation();}}
                  style={{}}
                />
              </Popconfirm>
            ),
            children: children(trafficGroup),
            closable: group.trafficGroupList.length > 1
          };
        })}
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
