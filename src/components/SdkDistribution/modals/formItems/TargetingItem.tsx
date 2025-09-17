import AppVersionPicker from '@/components/Utils/AppVersionPicker';
import { BaseModel } from '@/models/types/common';
import { CloseCircleOutlined } from '@ant-design/icons';
import { Button, Col, Form, FormItemProps, Input, Row } from 'antd';
import Location from './Location';
import Maker from './Maker';
import Osv from './Osv';
import TargetingType from './TargetingType';

type CommonConfig = {
  key: 'location' | 'maker' | 'osv',
  name: string,
  includeKey: string,
  excludeKey: string
};

type KeysConfig = {
  key: 'appVersion' | 'sdkVersion',
  name: string,
  keys: string[]
};

export type TargetingItemConfig = CommonConfig | KeysConfig;
export const isCommonConfig = (config: TargetingItemConfig): config is CommonConfig => {
  return (config as CommonConfig).includeKey !== undefined;
};

type Props = {
  config: TargetingItemConfig,
  model: BaseModel,
  mediumId?: number,
  fieldName?,
  onRemove: (key: TargetingItemConfig['key']) => void,
  notRequired?: boolean
  isSdkGroup?: boolean
} & Pick<FormItemProps, 'labelCol' | 'wrapperCol'>;

function TargetingItem({
  config,
  model,
  mediumId,
  onRemove,
  labelCol,
  fieldName,
  wrapperCol,
  isSdkGroup,
  notRequired
}: Props) {
  const form = Form.useFormInstance();

  // 删除的时候，对应的值也要删除
  const remove = (key) => {
    if (isCommonConfig(config)) {
      form.setFieldValue(`${config.excludeKey}`, '');
      form.setFieldValue(`${config.includeKey}`, '');
    } else {
      form.setFieldValue(`${config.keys.join(',')}`, '');
    }
    onRemove(key);
  };

  const getContent = () => {
    if (isCommonConfig(config)) {
      return <Col span={24}>
        <Form.Item label={config.name} labelCol={labelCol} wrapperCol={wrapperCol} required={notRequired ? false : true}>
          <TargetingType
            includeKey={config.includeKey}
            excludeKey={config.excludeKey}
            model={model}
            fieldName={fieldName}
          >
            {(name) => {
              switch (config.key) {
              case 'location':
                return (<Location isSdkGroup={isSdkGroup} name={fieldName || name} notRequired={notRequired}/>);
              case 'maker':
                return (<Maker isSdkGroup={isSdkGroup} name={fieldName || name} notRequired={notRequired}/>);
              case 'osv':
                return (<Osv isSdkGroup={isSdkGroup} name={fieldName || name} mediumId={mediumId} notRequired={notRequired}/>);
              default:
                return <></>;
              }
            }}
          </TargetingType>
        </Form.Item>
      </Col>;
    }

    switch (config.key) {
    case 'appVersion':
      return <Col span={24}>
        <Form.Item name={fieldName || config.keys[0]} label={config.name} labelCol={labelCol} wrapperCol={wrapperCol} rules={[{ required: notRequired ? false : true, message: '请选择' }]}>
          <AppVersionPicker mediumId={mediumId} appVersion={model.appVersion} type="app" />
        </Form.Item>
      </Col>;
    case 'sdkVersion':
      return <Col span={24}>
        <Form.Item name={fieldName || config.keys[0]} label={config.name} labelCol={labelCol} wrapperCol={wrapperCol} rules={[{ required: true, message: '请选择' }]}>
          <AppVersionPicker mediumId={mediumId} appVersion={model.appVersion} type="sdk" />
        </Form.Item>
      </Col>;

    default:
      // eslint-disable-next-line no-case-declarations
      const _key: never = config;
      return _key;
    }
  };

  return <Row wrap={false}>
    <Col flex="1 1 100%">
      <Row>
        {getContent()}
      </Row>
    </Col>
    <Col flex="0 0 auto">
      <Button
        type="text"
        style={{ padding: '4px 8px' }}
        icon={<CloseCircleOutlined />}
        onClick={() => remove(config.key)}
      />
    </Col>
  </Row>;
}

export default TargetingItem;
