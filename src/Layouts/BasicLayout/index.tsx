import { useEffect, useState } from 'react';
import { Link, useAuth, useHistory } from 'ice';
import { Dropdown, Image, Menu, Space, Tooltip, Typography } from 'antd';
import { DownOutlined, FileTextOutlined } from '@ant-design/icons';
import ProLayout, { MenuDataItem } from '@ant-design/pro-layout';
import store from '@/store';
import { Location } from 'history';
import styles from './index.module.less';
import useMenus from '@/hooks/useMenus';
import companyIcon from '@/assets/icons/company.png';
import PasswordForm from '@/pages/User/passwordForm';
import { IUser } from '@/models/types/user';

const { Text } = Typography;

// eslint-disable-next-line react/prop-types
export default function BasicLayout(
  {
    children,
    location
  }:
    {
      children,
      location: Location<{ noAuthFallBack?: boolean }>
    }
) {
  const history = useHistory();
  const [auth, setAuth] = useAuth();
  const tokenState = store.useModelState('token');
  const menuConfigs = useMenus();
  const [modalData, setModalData] = useState<IUser>();
  const [passWordmodalVisible, setPasswordModalVisible] = useState(false);

  useEffect(() => {
    if (location.state?.noAuthFallBack && Object.keys(auth).length) {
      const getFirstMenu = menus => menus[0].children?.length ? getFirstMenu(menus[0].children) : menus[0];
      const firstRouteConfig = getFirstMenu(menuConfigs);
      history.push(firstRouteConfig.path);
    }
  }, [auth, history, location.state?.noAuthFallBack, menuConfigs, setAuth, tokenState]);

  useEffect(() => {
    if (!tokenState.user.id) {
      return;
    }

  }, [tokenState]);

  useEffect(() => {
    document.title = '聚合SDK管理平台';
    const link: Element & {type: string, rel: string, href: string} = document.querySelector('link[rel*=\'icon\']') || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = 'data:;';
    document.getElementsByTagName('head')[0].appendChild(link);
  });

  const onUserMenuClick = () => {
    store.getModelDispatchers('token').logout();
  };

  const skipToHelpDocument = () => {
    window.open('http://easyads-pro.bayescom.cn/documents/operation');
  };

  return (
    <ProLayout
      title={false}
      layout="top"
      navTheme="light"
      logo={<></>}
      style={{
        minHeight: '100vh',
      }}
      location={{ pathname: location.pathname }}
      menuDataRender={() => menuConfigs}
      menuItemRender={(props: MenuDataItem, dom) => {
        if (!props.path) {
          return { dom };
        }

        return <Link to={props.path}>{dom}</Link>;
      }}
      fixedHeader={true}
      disableMobile={true}
      headerHeight={52}
      rightContentRender={() => (
        <Space className={styles['header-right']} size={0}>
          <Tooltip title='帮助文档'><FileTextOutlined onClick={skipToHelpDocument}/></Tooltip>
          <Dropdown
            overlay={<Menu
              items={[
                {
                  key: 'companyName',
                  label: (<div className={styles['company-container']}>
                    <div className={styles['company-info']}>
                      <div className={styles['company-info-name']}>{tokenState.user.userName}</div>
                      <div><Image src={companyIcon} preview={false} /></div>
                    </div>
                    <p style={{ marginBottom: '5px' }}>
                      {tokenState.user.nickName} - {tokenState.user.roleTypeName}
                    </p>
                  </div>)
                },
                {
                  key: 'operation',
                  label: (<>
                    <div className={styles['operation-block']}>
                      <Text className={styles['user-dropdown-menu-item']} onClick={() => {
                        setModalData(tokenState.user);
                        setPasswordModalVisible(true);
                      }}>修改密码</Text>
                    </div>
                    <div className={styles['operation-block']} onClick={onUserMenuClick}>
                      <Text className={styles['user-dropdown-menu-item']}>退出账号</Text>
                    </div>
                  </>),
                },
              ]}
            />}
            placement="bottomRight"
            trigger={['hover', 'click']}
            arrow
            overlayClassName={styles['header-right-dropdown']}
          >
            <a onClick={e => e.preventDefault()}>
              <Space>
                <Text className={styles['header-right-text']}>{tokenState.user.userName}</Text>
                <DownOutlined className={styles['header-right-text']} />
              </Space>
            </a>
          </Dropdown>
        </Space>
      )}
    >
      <div style={{ minHeight: '60vh' }}>{children}</div>
      <PasswordForm
        user={modalData}
        visible={passWordmodalVisible}
        onClose={() => setPasswordModalVisible(false)}
      />
    </ProLayout>
  );
}
