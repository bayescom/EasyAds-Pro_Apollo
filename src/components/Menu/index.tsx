import { Menu, MenuProps } from 'antd';
import { Link } from 'ice';
import { useEffect, useState } from 'react';
import styles from './index.module.less';

const versionMenuList = [
  {
    path: '/version_app',
    label: 'app版本',
    key: 'version_app'
  },
  {
    path: '/version_sdk',
    label: 'sdk版本',
    key: 'version_sdk'
  },
];

export default function VersionMenu ({ currentActive }: {currentActive: string}) {
  const [current, setCurrent] = useState('');

  useEffect(() => {
    setCurrent(currentActive);
  }, [currentActive]);

  const items: MenuProps['items'] = versionMenuList.map(item => {
    return {
      label: (
        <Link to={item.path}>{item.label}</Link>
      ),
      key: item.key
    };
  });
  
  return <Menu selectedKeys={[current]} mode="horizontal" items={items} rootClassName={styles['menu-container']}/>;
}