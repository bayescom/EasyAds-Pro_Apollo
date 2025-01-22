import { BaseModel, TargetingsVisibility } from '@/models/types/common';
import { PlusOutlined } from '@ant-design/icons';
import { Col, FormItemProps, Row, Space } from 'antd';
import { useEffect, useState } from 'react';
import TargetingItem, { isCommonConfig, TargetingItemConfig } from './formItems/TargetingItem';
import styles from './index.module.less';

type Props = {
  targetingConfig: TargetingItemConfig[],
  mediumId: number,
  changeCurrentTargeting?: (value) => void,
  closeModal: boolean
} & Pick<FormItemProps, 'labelCol' | 'wrapperCol'>;

function TargetingItemsPicker<T extends BaseModel>({
  targetingConfig,
  mediumId,
  model,
  labelCol,
  wrapperCol,
  changeCurrentTargeting,
  closeModal
}: Props & { model: T }) {
  const getVisibility = (model: T) => targetingConfig.reduce((pre, cur) => {
    if (isCommonConfig(cur)) {
      pre[cur.key] = !!(model[cur.includeKey] || model[cur.excludeKey]);
    } else {
      pre[cur.key] = cur.keys.some(key => model[key]);
    }

    return pre;
  }, {} as TargetingsVisibility);

  const [targetingItemsVisibility, setTargetingItemsVisibility] = useState(getVisibility(model));

  const afterClose = () => {
    setTargetingItemsVisibility(getVisibility(model));
    // form.resetFields();
  };

  useEffect(() => {
    if (closeModal) {
      afterClose();
    }
  }, [closeModal]);

  const addTargeting = (key: string) => {
    setTargetingItemsVisibility({
      ...targetingItemsVisibility,
      [key]: true
    });

    changeCurrentTargeting && changeCurrentTargeting('addTargeting');
  };

  const removeTargeting = (key: string) => {
    setTargetingItemsVisibility({
      ...targetingItemsVisibility,
      [key]: false
    });
    
    changeCurrentTargeting && changeCurrentTargeting('removeTargeting');
  };

  return ( <>
    <Row className={styles['add-targeting-button-row']}>
      <Col span={24}>
        <Space>
          {targetingConfig.filter(item => !targetingItemsVisibility[item.key]).map(item => {
            return (<a
              key={item.key}
              type="link"
              onClick={() => addTargeting(item.key)}
            >
              <PlusOutlined /> {item.name}
            </a>);
          })}
        </Space>
      </Col>
    </Row>
    {targetingConfig.filter(item => targetingItemsVisibility[item.key]).map(item => {
      return (<TargetingItem
        labelCol={labelCol}
        wrapperCol={wrapperCol}
        key={item.key}
        config={item}
        model={model}
        mediumId={mediumId}
        onRemove={(key) => removeTargeting(key)}
      />);
    })}
  </>);
}

export default TargetingItemsPicker;
