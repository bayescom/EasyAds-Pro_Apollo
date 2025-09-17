import ProCard from '@ant-design/pro-card';
import { Space } from 'antd';
import { useEffect } from 'react';
import styles from './index.module.less';
import store from '@/store';

const distributionDispatcher = store.getModelDispatchers('distribution');

function TargetingGroup() {
  const distributionState = store.useModelState('distribution');

  useEffect(() => {
    if (distributionState.currentTargetId) {
      distributionDispatcher.getSdkStrategyDirection({targetId: distributionState.currentTargetId});
    }
  }, [distributionState.currentTargetId]);

  return (<>
    {
      distributionState.sdkStrategyDirection && distributionState.sdkStrategyDirection.directionList && distributionState.sdkStrategyDirection.directionList.length ? <>
        <ProCard bodyStyle={{ padding: '8px 14px 6px', height: '34px', minWidth: '1100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
          <Space style={{color: '#4d4b4b'}}>
            规则：
            {
              distributionState.sdkStrategyDirection.directionList.map(item => (<>
                {
                  <span key={item.name} className={styles['targeting-item-info']}>
                    {[item.name, item.property, item.value].join(' | ')}
                  </span>
                }
              </>))
            }
          </Space>
        </ProCard>
      </>
        : <></>
    }
  </>
  );
}

export default TargetingGroup;
