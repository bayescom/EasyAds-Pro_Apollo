import React, { useState, useEffect } from 'react';
import { Input, message, Form, Button } from 'antd';
import styles from './index.module.less';
import store from '@/store';
import loginBgImg from '@/assets/icons/defaultLogin.jpg';

const { Item } = Form;

export interface IDataSource {
  name: string;
  password: string;
  autoLogin: boolean;
}

const DEFAULT_DATA: IDataSource = {
  name: '',
  password: '',
  autoLogin: true
};

interface LoginProps {
  dataSource?: IDataSource;
}

const LoginBlock: React.FunctionComponent<LoginProps> = (
  props = { dataSource: DEFAULT_DATA },
): JSX.Element => {
  const { dataSource = DEFAULT_DATA } = props;

  const [postData, setValue] = useState(dataSource);
  const dispatchers = store.useModelDispatchers('token');
  const locationSearch = new URLSearchParams(location.search);

  useEffect(() => {
    document.title = '聚合SDK管理平台';
    const link: Element & {type: string, rel: string, href: string} = document.querySelector('link[rel*=\'icon\']') || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = 'data:;';
    document.getElementsByTagName('head')[0].appendChild(link);
  });

  useEffect(() => {
    const username = locationSearch.get('username');
    const password = locationSearch.get('password');
    if (username && password) {
      handleSubmit({ name: username, password,  autoLogin: true });
    }
  }, [locationSearch]);

  const formChange = (values: IDataSource) => {
    setValue(values);
  };

  const handleSubmit = async (values: IDataSource, errors?: object[]) => {
    if (errors) {
      message.error('请正确填写用户名和密码');
      return;
    }

    await dispatchers.login({
      username: values.name,
      password: values.password,
      rememberMe: true
    });
  };

  const accountForm = (
    <>
      <Item
        name="name"
        rules={[
          {
            validator: (_, value) => {
              if (!value){
                return Promise.reject('请填写用户名');
              } else if (/[\u4e00-\u9fa5]/.test(value)) {
                return Promise.reject('不能使用中文字符');
              } 
              return Promise.resolve(); 
            },
          },
        ]}
        getValueFromEvent={e => e.target.value.trim()}
      >
        <Input maxLength={20} placeholder="用户名" />
      </Item>
      <Item
        name="password"
        rules={[
          {
            required: true,
            message: '请填写用户密码',
          },
        ]}
        style={{ marginBottom: 0 }}
        getValueFromEvent={e => e.target.value.trim()}
      >
        <Input.Password placeholder="密码" />
      </Item>
    </>
  );

  return (
    <div className={styles.LoginBlock}>
      <div className={styles.bgPic}>
        <img src={loginBgImg}  data-src={loginBgImg} data-src-retina={loginBgImg} alt=""/>
      </div>
      <div className={styles.innerBlock}>
        <div className={styles.loginContainer}>
          <h4 className={styles.webName}>聚合SDK管理平台</h4>
          <p className={styles.tips}>登录到您的帐户</p>
          <Form
            initialValues={postData}
            onValuesChange={formChange}
            size="large"
            className={styles.loginForm}
            onFinish={(value) => handleSubmit(value)}
            onFinishFailed={({ values, errorFields }) => handleSubmit(values, errorFields)}
          >
            {accountForm}
            <Item style={{ marginBottom: 10 }}>
              <Button
                type="primary"
                htmlType="submit"
                className={styles.submitBtn}
              >
                登录
              </Button>
            </Item>
          </Form>
        </div>
      </div>
    </div>
  );
};
export default LoginBlock;
