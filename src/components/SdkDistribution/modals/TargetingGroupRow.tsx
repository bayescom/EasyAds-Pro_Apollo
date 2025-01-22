import { GroupStrategyType } from '@/models/types/sdkDistribution';
import store from '@/store';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Collapse, Dropdown, Form, FormInstance, Input, Menu, Row } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import styles from './index.module.less';
import TargetingItem, { isCommonConfig, TargetingItemConfig } from '@/components/SdkDistribution/modals/formItems/TargetingItem';
import { TargetingsVisibility } from '@/models/types/common';

const { Panel } = Collapse;

type GroupType = {
  groupTargetId: number, // 用于区分不同的分组
  priority: number,
  name: string,
  appVersion: string,
  sdkVersion: string,
};

const targetingItems: TargetingItemConfig[] = [
  { key: 'appVersion', name: 'APP版本定向', keys: ['appVersion'] },
  { key: 'sdkVersion', name: 'SDK版本定向', keys: ['sdkVersion'] },
];

const getVisibility = (model: GroupType) => targetingItems.reduce((pre, cur) => {
  if (isCommonConfig(cur)) {
    pre[cur.key] = !!(model[cur.includeKey] || model[cur.excludeKey]);
  } else {
    pre[cur.key] = cur.keys.some(key => model[key]);
  }
  return pre;
}, {} as TargetingsVisibility);

type InputProps = {
  fieldName: number,
  adspotId: number,
  disableRemoveGroup: boolean,
  onRemove: () => void,
  children: React.ReactNode,
  model: GroupType,
  onChange?: (value: GroupStrategyType) => void,
  form: FormInstance<any>,
  index: number
};

const adspotDispatchers = store.getModelDispatchers('adspot');

function TargetingGroupRow({ fieldName, adspotId, disableRemoveGroup, onRemove, children, model, form, index }: InputProps) {
  const [targetingItemsVisibility, setTargetingItemsVisibility] = useState(getVisibility(model));

  const [isCollapseOpen, setIsCollapseOpen] = useState(
    () => targetingItems.some(item => model[item.key])
  );

  const unusedTargetingKeyList = useMemo(
    () => targetingItems.filter(item => !targetingItemsVisibility[item.key]),
    [targetingItemsVisibility]
  );

  useEffect(() => {
    adspotDispatchers.getOne(adspotId);
  }, [adspotId]);

  const adspotState = store.useModelState('adspot');

  if (!model) {
    return <></>;
  }

  const mediumId = adspotState.map[adspotId]?.mediaId; 

  const addTargeting = (key: string) => {
    setTargetingItemsVisibility({
      ...targetingItemsVisibility,
      [key]: true
    });

    setIsCollapseOpen(true);
  };

  const removeTargeting = (key: string) => {
    setTargetingItemsVisibility({
      ...targetingItemsVisibility,
      [key]: false
    });
    // TargetingItem下的remove方法删除分组规则无效，暂用直接操作form数组进行删除
    const values = form.getFieldsValue();
    values.groupStrategyList[index][key] = '';
    form.setFieldsValue(values);
  };

  return (<>
    <Row align="top" wrap={false}>
      <Col flex="0 0 40px" className={styles['priority-column']}>
        {model.priority}
        <Form.Item name="priority" style={{marginBottom: 0}} noStyle>
          <Input hidden />
        </Form.Item>
      </Col>
      <Col flex="0 0 50px">
        {children}
      </Col>
      <Col flex="1 1 auto" className={styles['targeting-item']}>
        <Collapse
          collapsible='header'
          activeKey={isCollapseOpen ? 'only' : undefined}
          onChange={() => { setIsCollapseOpen((state) => !state); }}
          bordered
        >
          <Panel
            key="only"
            className={styles['targeting-group-item-panel']}
            header={
              <Form.Item
                name={[fieldName, 'name']}
                label="分组名称"
                labelCol={{ flex: '0 0 76px' }}
                style={{marginBottom: 0}}
                required={true}
                rules={[{ required: true, message: '分组名称不能为空' }]}
                getValueFromEvent={e => e.target.value.trim()}
              >
                <Input
                  bordered={false}
                  placeholder="请输入"
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: '100%', paddingLeft: 5, paddingRight: 0 }}
                />
              </Form.Item>
            }
          >
            {targetingItems.filter(item => targetingItemsVisibility[item.key]).map(item => 
              (<Form.Item name={[fieldName, item.key]} key={item.key}>
                <TargetingItem
                  key={item.key}
                  config={item}
                  model={model}
                  fieldName={[fieldName, item.key]}
                  mediumId={mediumId}
                  onRemove={(key) => removeTargeting(key)}
                />
              </Form.Item>)
            )}
          </Panel>
        </Collapse>
      </Col>
      <Col flex="0 0 32px">
        {!disableRemoveGroup && <Button
          type="text"
          style={{ padding: '4px 8px' }}
          icon={<DeleteOutlined />}
          onClick={() => onRemove()}
        />}
      </Col>
    </Row>
    <Row>
      <Col flex="1 0 100%" className={styles['add-targeting-column']}>
        <Dropdown
          overlay={<Menu>
            {
              targetingItems.filter(item => !targetingItemsVisibility[item.key]).map(item => (
                <Button
                  key={item.key}
                  type="text"
                  onClick={() => addTargeting(item.key)}
                  style={{ padding: '4px 8px', display: 'block'}}
                >
                  {item.name}
                </Button>)
              )
            }
          </Menu>}
          placement="bottomRight"
          disabled={!unusedTargetingKeyList.length}
          overlayClassName={styles['targeting-group-dropdown']}
        >
          <Button className={styles['add-targeting-button']} type="link" icon={<PlusOutlined />} >添加规则</Button>
        </Dropdown>
      </Col>
    </Row>
  </>);
}

export default TargetingGroupRow;
