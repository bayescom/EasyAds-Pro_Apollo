import ProCard from '@ant-design/pro-card';
import Filter from './components/Filter';
import DataOverview from './components/DataOverview';
import styles from './index.module.less'; 
import store from '@/store';
import { useEffect } from 'react';

const reportMediumDispatcher = store.getModelDispatchers('reportMedium');
export default function Dashboard() {
  useEffect(() => {
    reportMediumDispatcher.setActiveKey('detail');
  }, []);
  return (
    <>
      <ProCard direction="column" ghost gutter={[0, 24]}>
        <ProCard className={styles['medium-search-filter']}>
          <Filter />
        </ProCard>
        <ProCard className={styles['medium-data-overview']}>
          <DataOverview />
        </ProCard>
      </ProCard>
    </>
  );
}
