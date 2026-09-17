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
  onDelete: (targetingGroupId: number) => Promise<any>,
  children: (group: TrafficGroupType) => React.ReactNode
}) {
  const [isTargetingGroupsModalVisible, setIsTargetingGroupsModalVisible] = useState(false);
  const distributionState = store.useModelState('distribution');

  const [activeKey, setActiveKey] = useState('');

  useEffect(() => {
    setActiveKey(`${distributionState.groupTargetId}-${distributionState.currentPercentageId}`);
  }, [distributionState.groupTargetId, distributionState.currentPercentageId]);

  const deleteTargetingGroup = (groupTargetId: number, trafficGroupIndex, targetingGroupId?: number, ) => {
    if (!targetingGroupId) {
      return;
    }

    onDelete(targetingGroupId).then((res) => {
      // 删除之后，也需要更新一下tab
      if (groupTargetId == distributionState.groupTargetId) {
        // 这里直接通过传入的group拿不到最新的结果，why
        const _group = res.percentageList[0];
        const index = trafficGroupIndex == 0 ? trafficGroupIndex : trafficGroupIndex - 1;
        distributionDispatcher.setGroupTargetId(_group.trafficGroupList[index].groupStrategy.groupTargetId);
        distributionDispatcher.setCurrentTargetPercentageStrategyTrafficId(_group.trafficGroupList[index].targetPercentageStrategyList[0].targetPercentage.targetPercentageId);
      }
    });
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
    distributionDispatcher.setGroupTargetId(currentId);
    distributionDispatcher.setCurrentPercentageId(currentPercentageId);

    // 这个是切换 瀑布流的 流量分组之后，最下面的ab 需要重置到第一个
    const current = group.trafficGroupList.find(item => item.groupStrategy.groupTargetId == currentId);

    if (current && current.targetPercentageStrategyList.length > 0) {
      const firstTabKey = current.targetPercentageStrategyList[0].targetPercentage.targetPercentageId + '';
      distributionDispatcher.setCurrentTargetPercentageStrategyTrafficId(Number(firstTabKey));
    }
  }, [distributionDispatcher, group]);

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
        activeKey={activeKey}
        // defaultActiveKey={activeKey}
        items={group.trafficGroupList.map((trafficGroup, trafficGroupIndex) => {
          return {
            key: `${trafficGroup.groupStrategy.groupTargetId}-${group.trafficPercentage.percentageId}`,
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
                onConfirm={() => deleteTargetingGroup(trafficGroup.groupStrategy.groupTargetId, trafficGroupIndex, trafficGroup.targetPercentageStrategyList[0].trafficId)}
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
