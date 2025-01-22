import { ProFormText, ProFormRadio } from '@ant-design/pro-form';
import store from '@/store';
interface IProps {
  isEditing?: boolean,
}

export default function MediumForm({ isEditing } : IProps) {
  const [codeState, codeDispatcher] = store.useModel('code');

  return (<>
    <ProFormRadio.Group
      name="platformType"
      radioType='button'
      label="系统"
      request={async () => {
        const data = codeState.platform_type || await codeDispatcher.fetchCodeList(['platform_type', true]);
        return data.map(({ name, value }) => ({ label: name, value }));
      }}
      required
      rules={[{ required: true, message: '请选择${label}' }]}
      disabled={isEditing}
    />
    <ProFormText
      name="bundleName"
      label="媒体包名"
      required
      rules={[
        { required: true, message: '${label}不能为空' },
        { pattern: /^.+(\..+)+$/, message: '请确认${label}格式是否正确，如xxx.xxx.xxx', warningOnly: true }
      ]}
      colProps={{ md: 12, lg: 8, xl: 6 }}
      getValueFromEvent={e => e.target.value.trim()}
    />
    <ProFormText
      name="mediaName"
      label="媒体名称"
      required
      rules={[
        { required: true, message: '${label}不能为空' },
        { min: 2, max: 40, message: '${label}长度在2~40之间' }
      ]}
      colProps={{ md: 12, lg: 8, xl: 6 }}
      getValueFromEvent={e => e.target.value.trim()}
    />
  </>);
}
