import { IUser } from '@/models/types/user';
import store from '@/store';
import { useCallback, useEffect, useRef } from 'react';
import { ModalForm, ProFormInstance, ProFormSelect, ProFormText } from '@ant-design/pro-form';
import styles from './index.module.less';

const formItemLayout = {
  labelCol: {
    flex: '0 1 95px'
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
  isEditing
}: {
  user: IUser | undefined,
  visible: boolean,
  onClose,
  onFinish,
  isEditing
}) {
  const userState = store.useModelState('user');
  const tokenState = store.useModelState('token');

  const formRef = useRef<ProFormInstance>();

  const resetForm = useCallback(() => {
    if (!user) {
      return;
    }

    formRef.current?.setFieldsValue(user);
  }, [user]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  useEffect(() => {
    formRef.current?.setFieldsValue(user);
  });

  if (!user) {
    return <></>;
  }

  return (
    <ModalForm<IUser>
      formRef={formRef}
      initialValues={user}
      {...formItemLayout}
      visible={visible}
      width={540}
      title={ isEditing ? '编辑用户' : '新建用户'}
      layout="horizontal"
      onFinish={async (values) => {
        const userObject = {
          userName: values.userName,
          password: values.password,
          email: values.email,
          nickName: values.nickName,
          roleType: values.roleType,
        };

        if (isEditing) {
          const result = await userDispatcher.update({
            ...user,
            ...userObject
          });
          if (result) {
            onClose();
            onFinish();
          }
        } else {
          const result = await userDispatcher.new(userObject);
          if (result) {
            onClose();
            onFinish();
          }
        }
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
        wrapClassName: styles['user-modal-form-container']
      }}
    >
      <ProFormText
        name='userName'
        label="登录名"
        required={true}
        rules={[
          {
            validator: (_, value) => {
              if (!value){
                return Promise.reject('请填写登录名');
              } else if (/[\u4e00-\u9fa5]/.test(value)) {
                return Promise.reject('不能使用中文字符');
              } else if(value.length < 4 || value.length > 15) {
                return Promise.reject('长度在 4 到 15 个字符');
              } 
              return Promise.resolve();
            },
          },
        ]}
        getValueFromEvent={e => e.target.value.trim()}
      />
      {
        isEditing ? (<></>) : (<ProFormText.Password
          name="password"
          label='密码'
          placeholder='请输入密码'
          required={true}
          rules={[
            {
              validator: (_, value) => {
                if (!value) {
                  return Promise.reject('请输入密码');
                } else if (value.length < 6 || value.length > 16) {
                  return Promise.reject('长度在 6 到 16 个字符');
                }
                return Promise.resolve();
              },
            },
          ]}
          getValueFromEvent={e => e.target.value.trim()}
        />)
      }
      <ProFormText
        name='nickName'
        label="昵称"
        getValueFromEvent={e => e.target.value.trim()}
      />
      <ProFormSelect
        name='roleType'
        label="角色"
        request={async () => {
          const roleTypeList = userState.userRoleTypeList || await userDispatcher.getUserRoleType(tokenState.user.roleType);
          return roleTypeList.map((item) => ({
            label: item.name,
            value: Number(item.value),
          }));
        }}
        required={true}
        rules={[{ required: true, message: '请选择角色' }]}
      />
    </ModalForm>
  );
}

export default UserForm;
