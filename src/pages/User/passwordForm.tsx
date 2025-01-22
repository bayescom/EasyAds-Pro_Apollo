import { IUser } from '@/models/types/user';
import store from '@/store';
import { useCallback, useEffect, useRef } from 'react';
import { ModalForm, ProFormInstance, ProFormText } from '@ant-design/pro-form';

const formItemLayout = {
  labelCol: {
    flex: '0 1 70px'
  },
  wrapperCol: {
    flex: '1 1 auto'
  },
};
const userDispatcher = store.getModelDispatchers('user');
function UserForm({
  user,
  visible,
  onClose,
  onFinish,
}: {
  user: IUser | undefined,
  visible: boolean,
  onClose: () => void,
  onFinish?: () => void,
}) {
  const formRef = useRef<ProFormInstance>();

  const resetForm = useCallback(() => {
    if (!user) {
      return;
    }

    formRef.current?.setFieldValue('password', '');
    formRef.current?.setFieldValue('confirm', '');
  }, [user]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  useEffect(() => {
    formRef.current?.setFieldValue('password', '');
    formRef.current?.setFieldValue('confirm', '');
  });

  if (!user) {
    return <></>;
  }

  return (
    <ModalForm<IUser>
      formRef={formRef}
      {...formItemLayout}
      visible={visible}
      width={540}
      title='修改密码'
      layout="horizontal"
      onFinish={async (values) => {
        const result = await userDispatcher.updatePassword({
          ...user,
          ...values
        });
        if (result) {
          onClose();
          onFinish && onFinish();
        }
        store.getModelDispatchers('token').logout();
      }}
      modalProps={{
        maskClosable: false,
        okText: '提交',
        onCancel: () => {
          onClose();
        },
        afterClose: () => {
          resetForm();
        },
        bodyStyle: {padding: '21px'}
      }}
    >
      <ProFormText.Password
        name="password"
        label='密码'
        required={true}
        placeholder='请输入密码'
        rules={[
          {
            validator: (_, value) => {
              if (!value) {
                return Promise.reject('请输入密码');
              } else if (value.length < 6 || value.length > 16) {
                return Promise.reject('长度在 6 到 16 个字符');
              }
              return Promise.resolve();
            }
          },
        ]}
        getValueFromEvent={e => e.target.value.trim()}
      />
      <ProFormText.Password
        name="confirm"
        label='确认密码'
        placeholder='请再次输入新密码'
        dependencies={['password']}
        rules={[
          {
            required: true,
            message: '确认密码必须和新密码相同！',
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('您输入的两个密码不相同!'));
            },
          }),
        ]}
        getValueFromEvent={e => e.target.value.trim()}
      />
    </ModalForm>
  );
}

export default UserForm;
