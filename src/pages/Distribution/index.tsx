import SdkDistribution from '@/components/SdkDistribution';
import DistributionHeader from './components/distributionHeader';
import DefaultPage from './components/DefaultPage';
import store from '@/store';
import ProCard from '@ant-design/pro-card';
import { useLocation } from 'ice';
import { useEffect, useState } from 'react';
import styles from './index.module.less';

const distributionDispatcher = store.getModelDispatchers('distribution');

function Sdk() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDefaultPage, setShowDefaultPage] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const locationMediaId = new URLSearchParams(location.search).get('mediaId');
    // 先获取header内容：1.媒体 2.广告位
    distributionDispatcher.getMediumList({})
      .then(medium_res => {
        setShowDefaultPage(!medium_res.total);
        if (medium_res.total) {
          const mediaId = locationMediaId ? +locationMediaId : medium_res.data[0].id;
          if (mediaId) { // mediaId 存在
            const isCurrentCompanyMediaId = medium_res.data.find(item => item.id == mediaId);
            if (isCurrentCompanyMediaId) { // 是本公司的媒体
              distributionDispatcher.getAdspotList({ mediaIds: mediaId });
            } else {
              distributionDispatcher.getAdspotList({ mediaIds:  medium_res.data[0].id });
            }
          } else {
            // 存在从报表跳过来没mediaId的情况
            distributionDispatcher.getAdspotList({});
          }
        }
      });

    return () => {
      distributionDispatcher.setAdspotId(0);
      distributionDispatcher.setMediaId(0);
      distributionDispatcher.setCurrentAdspot([]);
      distributionDispatcher.setMediumList([]);
      distributionDispatcher.setAdspotList([]);
    };
  }, []);

  return (<ProCard gutter={[0, 16]} split="horizontal" ghost className={styles['distribution-container']}>
    <DistributionHeader/>
    
    {showDefaultPage ? <DefaultPage/> : <>
      <SdkDistribution
        visible={visible}
        setVisible={(value) => setVisible(value)}
        loading={loading}
        setLoading={(value) => setLoading(value)}
      />
    </>}
  </ProCard>);
}

export default Sdk;
