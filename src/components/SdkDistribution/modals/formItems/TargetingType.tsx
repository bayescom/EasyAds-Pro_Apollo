import { BaseModel } from '@/models/types/common';
import { Col, Form, Row, Select } from 'antd';
import { useEffect, useState } from 'react';

type Props = {
  includeKey: string,
  excludeKey: string,
  model: BaseModel,
  fieldName?,
  children: (name: string) => React.ReactNode
};

/**
 * 0 - 包含, 1 - 排除
 */
type TargetingType = 0 | 1;

const sdkDistributionDirectionCommonList = ['osv', 'location', 'maker'];

function TargetingType({ includeKey, excludeKey, model, children, fieldName }: Props) {
  const commonProperty = fieldName ? `${fieldName[1]}Property` : '';
  const form = Form.useFormInstance();
  const [targetingType, setTargetingType] = useState<TargetingType>(
    () => {
      if (fieldName) {
        return model[`${commonProperty}`] == '!' ? 1 : 0;
      } else {
        return !model[includeKey] && model[excludeKey] ? 1 : 0;
      }
    }
  );

  useEffect(() => {
    if (model[includeKey] || model[excludeKey]) {
      if (fieldName) {
        model[`${commonProperty}`] == '!' ? setTargetingType(1) : setTargetingType(0);
      } else {
        !model[includeKey] ? setTargetingType(1) : setTargetingType(0);
      }
    }
  }, [model, includeKey, excludeKey, fieldName]);

  const name = targetingType === 0 ? includeKey : excludeKey;

  const onTargetingTypeChange = (value: TargetingType) => {
    if (fieldName !== undefined) {
      // 这个是因为在SDK流量的分组的时候，form表单是一个list
      const groupStrategyList = form.getFieldsValue().groupStrategyList;

      const currentChangeItemIndex = fieldName[0];
      groupStrategyList.map((item, groupStrategyIndex) => {
        // 这里是个坑，因为是list，所以用 else 下面那个赋值方法不行，includeKey 和 excludeKey 交换的方式也不行，所以，只能多加了一个参数，来取对的值
        if (sdkDistributionDirectionCommonList.includes(fieldName[1])) {
          if (groupStrategyIndex == currentChangeItemIndex) {
            item[`${commonProperty}`] = (value === 0 ? '' : '!');
          } else {
            item[`${commonProperty}`] = '';
          }
        }
        
        return item;
      });
      form.setFieldValue('groupStrategyList', groupStrategyList);
    } else {
      form.setFieldValue(
        value === 0 ? includeKey : excludeKey,
        form.getFieldValue(value === 0 ? excludeKey : includeKey)
      );
    }
    setTargetingType(value);
  };

  return (<Row wrap={false} gutter={8}>
    <Col flex="0 0 108px">
      <Form.Item noStyle>
        <Select
          value={targetingType}
          options={[
            { label: '包含', value: 0 },
            { label: '排除', value: 1 },
          ]}
          onChange={onTargetingTypeChange}
        />
      </Form.Item>
    </Col>
    <Col flex="1 1 auto">
      {children(name)}
    </Col>
  </Row>);
}

export default TargetingType;
