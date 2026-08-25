import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Dropdown, Form, Input, Menu, Switch } from 'antd';
import { createDefaultPlatformConfig } from './utils';
import styles from './index.module.less';

type PlatformAdapterConfigProps = {
  osType: number;
  platformLabel: string;
  adapterOptions: { value: string; label: string }[];
};

function AdapterTypeLabel({
  osType,
  fieldName,
  adapterOptions,
}: {
  osType: number;
  fieldName: number;
  adapterOptions: { value: string; label: string }[];
}) {
  const adapterType = Form.useWatch(
    ['platforms', osType, 'adapters', fieldName, 'type'],
    Form.useFormInstance()
  );
  const adapterLabel = adapterOptions.find(item => item.value === adapterType)?.label || '';

  return (
    <span className={styles['platform-field-label-required']}>
      {adapterLabel}
    </span>
  );
}

export default function PlatformAdapterConfig({
  osType,
  platformLabel,
  adapterOptions,
}: PlatformAdapterConfigProps) {
  const isHarmonyOs = osType === 4;
  const form = Form.useFormInstance();
  Form.useWatch(['platforms', osType, 'enabled'], form);
  const platformValue: ISdkCustomerChannelPlatformConfig =
    form.getFieldValue(['platforms', osType]) || createDefaultPlatformConfig();
  const enabled = !!platformValue.enabled;
  const hasPlatformContent = !!(
    platformValue.module_name ||
    platformValue.initClassName ||
    (platformValue.adapters && platformValue.adapters.length)
  );
  const shouldShowFields = enabled || hasPlatformContent;

  const handlePlatformEnabledChange = (checked: boolean) => {
    form.setFieldValue(['platforms', osType], {
      ...platformValue,
      enabled: checked,
    });
  };

  return (
    <div className={styles['platform-block']}>
      <div className={styles['platform-header']}>
        <span className={styles['platform-label']}>{platformLabel}</span>
        <Form.Item name={['platforms', osType, 'osConfigId']} hidden>
          <Input />
        </Form.Item>
        <Form.Item
          name={['platforms', osType, 'enabled']}
          valuePropName="checked"
          noStyle
        >
          <Switch onChange={handlePlatformEnabledChange} size='small' />
        </Form.Item>
      </div>

      {shouldShowFields ? (
        <div className={styles['platform-fields']}>
          {isHarmonyOs ? (
            <div className={styles['platform-field-row']}>
              <span className={styles['platform-field-label-required']}>模块名称</span>
              <div className={styles['platform-field-control']}>
                <Form.Item
                  name={['platforms', osType, 'module_name']}
                  rules={[{ required: enabled, message: '请输入模块名称' }]}
                  noStyle
                >
                  <Input placeholder="请输入" />
                </Form.Item>
              </div>
              <span className={styles['platform-field-action']} />
            </div>
          ) : null}

          <div className={styles['platform-field-row']}>
            <span className={styles['platform-field-label-required']}>初始化类名</span>
            <div className={styles['platform-field-control']}>
              <Form.Item
                name={['platforms', osType, 'initClassName']}
                rules={[{ required: enabled, message: '请输入初始化类名' }]}
                noStyle
              >
                <Input placeholder="请输入" />
              </Form.Item>
            </div>
            <span className={styles['platform-field-action']} />
          </div>

          <Form.List name={['platforms', osType, 'adapters']}>
            {(fields, { add, remove }) => {
              const currentAdapters: ISdkCustomerChannelAdapterItem[] =
                form.getFieldValue(['platforms', osType, 'adapters']) || [];
              const usedTypes = currentAdapters
                .map(item => String(item?.type || ''))
                .filter(Boolean);
              const availableTypes = adapterOptions.filter(item => !usedTypes.includes(item.value));

              return (
                <>
                  {fields.map(field => (
                    <div key={field.key} className={styles['platform-field-row']}>
                      <AdapterTypeLabel
                        osType={osType}
                        fieldName={field.name}
                        adapterOptions={adapterOptions}
                      />
                      <div className={styles['platform-field-control']}>
                        <Form.Item
                          name={[field.name, 'className']}
                          rules={[{ required: enabled, message: '请输入类名' }]}
                          noStyle
                        >
                          <Input placeholder="请输入" />
                        </Form.Item>
                        <Form.Item name={[field.name, 'type']} hidden>
                          <Input />
                        </Form.Item>
                      </div>
                      <span className={styles['platform-field-action']}>
                        <DeleteOutlined
                          className={styles['adapter-delete']}
                          onClick={() => remove(field.name)}
                        />
                      </span>
                    </div>
                  ))}

                  <div className={styles['add-adapter-row']}>
                    <Dropdown
                      disabled={availableTypes.length === 0}
                      overlay={
                        <Menu
                          onClick={({ key }) => {
                            add({ type: String(key), className: '' });
                          }}
                          items={availableTypes.map(item => ({
                            key: item.value,
                            label: item.label,
                          }))}
                        />
                      }
                      trigger={['click']}
                      getPopupContainer={triggerNode => triggerNode.parentElement || document.body}
                    >
                      <span className={styles['add-adapter-link']}>
                        <PlusOutlined /> 新增Adapter
                      </span>
                    </Dropdown>
                  </div>
                </>
              );
            }}
          </Form.List>
        </div>
      ) : null}
    </div>
  );
}

export function PlatformAdapterConfigSection({
  platformOptions,
  adapterOptions,
}: {
  platformOptions: ISdkCustomerChannelPlatformOption[];
  adapterOptions: { value: string; label: string }[];
}) {
  return (
    <Form.Item
      label="Adapter类名"
      tooltip='开发者需为自定义广告网络的不同广告类型配置相应的Adapter类名，包括初始化自定义广告网络SDK类及对应的广告类型的调用类。 倍业聚合SDK将根据此Adapter类名调用相应的Adapter方法。'
      className={styles['adapter-class-label']}
    >
      <div className={styles['platform-config-section']}>
        {platformOptions.map(({ osType, name }) => (
          <PlatformAdapterConfig
            key={osType}
            osType={osType}
            platformLabel={name}
            adapterOptions={adapterOptions}
          />
        ))}
      </div>
    </Form.Item>
  );
}
