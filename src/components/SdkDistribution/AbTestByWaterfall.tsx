import { TargetPercentageStrategyListType } from '@/models/types/sdkDistribution';
import { Tabs, Tooltip } from 'antd';
import { useEffect } from 'react';
import styles from './index.module.less';
import { ExclamationCircleFilled } from '@ant-design/icons';

function PercentageGroup({ targetPercentageStrategyList, children }: {
  // 只显示 status = 1 的ab组
  targetPercentageStrategyList: TargetPercentageStrategyListType [],
  children: (targetPercentage: TargetPercentageStrategyListType) => React.ReactNode
}) {

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
        className={[styles['targeting-group-tab'], targetPercentageStrategyList.length == 1 ? styles['targeting-group-tab-no-ab-testing'] : ''].join(' ')}
        destroyInactiveTabPane
        items={targetPercentageStrategyList.map(targetPercentage => ({
          key: targetPercentage.trafficId + '',
          label: (<>
            {`${targetPercentage.targetPercentage.tag}: ${targetPercentage.targetPercentage.percentage}%`}
            {
              targetPercentage.suppliers.some(innerSuppliers => !innerSuppliers.length) || !targetPercentage.suppliers.length
                ? <Tooltip title={'该测试分组未启用任何广告源暂不生效，流量将分配到其他有可用广告源的测试分组。请先在该测试分组上配置启用的广告源。'} placement={'right'}><ExclamationCircleFilled style={{ color: 'red', marginLeft: '10px' }} /></Tooltip>
                : <></>
            }
          </>),
          children: children(targetPercentage),
        }))}
        hideAdd
      />
    </>
  );
}

export default PercentageGroup;
