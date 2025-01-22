import { GroupStrategyType } from '@/models/types/sdkDistribution';
import ProCard from '@ant-design/pro-card';
import { Space } from 'antd';
import { useMemo } from 'react';
import styles from './index.module.less';

type TargetingInfo = {
  key: string,
  label: string,
  operator: string,
  value: string
};

const firstLetterToOperatorNameMap = {
  '>=': '大于等于',
  '<=': '小于等于',
  'exclude': '排除',
  'include': '包含'
};

function TargetingGroup({ groupStrategy}: { groupStrategy: GroupStrategyType }) {

  const settings = useMemo(() => {
    const list: TargetingInfo[] = [];

    if (groupStrategy.direction.appVersion.property) {
      list.push({
        key: 'appVersion',
        label: 'APP版本定向',
        operator: firstLetterToOperatorNameMap[groupStrategy.direction.appVersion.property],
        value: groupStrategy.direction.appVersion.value.join(',').replace(/>=|<=|!/, '')
      });
    }

    if (groupStrategy.direction.sdkVersion.property) {
      list.push({
        key: 'sdkVersion',
        label: 'SDK版本定向',
        operator: firstLetterToOperatorNameMap[groupStrategy.direction.sdkVersion.property],
        value: groupStrategy.direction.sdkVersion.value.join(',').replace(/>=|<=|!/, '')
      });
    }
    return list;
  }, [groupStrategy]);

  return (<>
    {
      settings.length ? 
        <ProCard bodyStyle={{ padding: '8px 14px 6px', height: '34px'}}>
          <Space style={{color: '#4d4b4b'}}>
            规则：
            {
              settings.map(item => (<span key={item.key} className={styles['targeting-item-info']}>
                {[item.label, item.operator, item.value].join(' | ')}
              </span>))
            }
          </Space>
        </ProCard> 
        : <></>
    }
  </>
  );
}

export default TargetingGroup;
