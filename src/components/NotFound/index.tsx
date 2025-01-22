import { Link, useHistory } from 'ice';
import notFound from '@/assets/icons/404.png';
import { Image } from 'antd';
import styles from './index.module.less';
import { useEffect, useState } from 'react';
import { HomeOutlined } from '@ant-design/icons';
import store from '@/store';
export interface Props {
  name: string;
}

const Greeting = () => {
  const tokenState = store.useModelState('token');
  const [count, setCount] = useState(5);
  const [goPagePath, setGoPagePath] = useState('/data_report/media_report');
  const history = useHistory();

  useEffect(() => {
    if (tokenState.routerList.length) {
      setGoPagePath('/data_report/media_report');
    }
  }, [tokenState]);

  useEffect(() => {
    if (count >= 0) {
      setTimeout(() => {
        const newCount = count - 1;
        setCount(newCount);
      }, 1000);
    } else {
      history.push(goPagePath);
    }
  }, [count]);

  return (
    <div className={styles['not-found-container']}>
      <Image src={notFound} preview={false}/>
      <div className={styles['not-found-info']}>
        <p className={styles['not-found-text']}>抱歉！您访问的页面不存在，将在 {count} 秒后跳转至媒体收益报表.....</p>
        <p className={styles['not-found-operate']}>
          <Link className={styles['operate-go-home']} to={goPagePath}><HomeOutlined />返回媒体收益报表</Link>
        </p>
      </div>
    </div>
  );
};

export default Greeting;
