import { DrawerForm, ProFormText } from '@ant-design/pro-form';
import { Form, message } from 'antd';
import { useEffect } from 'react';
import { PlatformAdapterConfigSection } from './PlatformAdapterConfig';
import styles from './index.module.less';
import store from '@/store';
import {
  toSdkCustomerChannel,
  toFormValues,
} from './utils';

const sdkCustomerChannelDispatcher = store.getModelDispatchers('sdkCustomerChannel');

type SdkCustomerChannelFormProps = {
  open: boolean;
  editingItem?: ISdkCustomerChannel;
  onClose: () => void;
  platformOptions: ISdkCustomerChannelPlatformOption[];
  adapterOptions: { value: string; label: string }[];
  onSave: (result: ISdkCustomerChannel | undefined) => void;
};

export default function SdkCustomerChannelForm({
  open,
  editingItem,
  onClose,
  platformOptions,
  adapterOptions,
  onSave
}: SdkCustomerChannelFormProps) {
  const [form] = Form.useForm<ISdkCustomerChannelFormValues>();

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!adapterOptions.length) {
      sdkCustomerChannelDispatcher.getAdapterAdspotType();
    }
  }, [open, adapterOptions.length]);

  useEffect(() => {
    if (open && platformOptions.length) {
      form.setFieldsValue(toFormValues(editingItem, platformOptions));
    }
  }, [open, editingItem, form, platformOptions]);

  const handleSubmit = async (values: ISdkCustomerChannelFormValues) => {
    try {
      const item = toSdkCustomerChannel(values, editingItem);
      const result = item.id
        ? await sdkCustomerChannelDispatcher.update(item)
        : await sdkCustomerChannelDispatcher.create(item);

      if (!result) {
        return false;
      }

      message.success(editingItem ? '编辑成功' : '添加成功');
      onSave(result);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <DrawerForm<ISdkCustomerChannelFormValues>
      open={open}
      title={editingItem ? '编辑自定义广告网络' : '添加自定义广告网络'}
      width={570}
      form={form}
      layout="horizontal"
      labelCol={{ flex: '0 0 120px' }}
      labelWrap
      onFinish={handleSubmit}
      drawerProps={{
        className: styles['form-drawer'],
        maskClosable: false,
        destroyOnClose: true,
        onClose,
      }}
    >
      <ProFormText
        name="name"
        label="广告网络名称"
        rules={[{ required: true, message: '请输入广告网络名称' }]}
        fieldProps={{ placeholder: '请输入广告网络名称' }}
      />

      <PlatformAdapterConfigSection
        platformOptions={platformOptions}
        adapterOptions={adapterOptions}
      />
    </DrawerForm>
  );
}
