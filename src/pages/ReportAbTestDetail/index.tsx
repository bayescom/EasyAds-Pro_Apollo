import { Space, Breadcrumb, Alert } from 'antd';
import styles from './index.module.less';
import { useHistory } from 'ice';
import BasicInfo from './components/BasicInfo';
import DataDetail from './components/DataDetail';
import ChartDetail from './components/ChartDetail';
import store from '@/store';

const { Item } = Breadcrumb;

function ReportAbTestDetail() {
  const history = useHistory();
  const reportAbTestDetailState = store.useModelState('reportAbTestDetail');
  return (<>
    <Breadcrumb style={{marginBottom: '10px'}}>
      <Item onClick={() => {
        history.goBack();
      }}>返回</Item>
      <Item>
        <Space>A/B 测试报表</Space>
      </Item>
      <Item>
        <Space>{reportAbTestDetailState.currentExperiment.experimentName}</Space>
      </Item>
    </Breadcrumb>
    <BasicInfo />
    <div className={styles['alert-top-container']}>
      <Alert
        className={styles['realtime-alert']}
        message={<>API 数据均在次日更新，若参考即时数据，建议选择 Blink 统计数据。当前API数据不完整时，请前往【资源管理】-【广告网络】配置报表API以获取完整数据。</>}
        type="info"
        showIcon
        banner
      />
    </div>

    <DataDetail />
    <ChartDetail />
  </>);
}

export default ReportAbTestDetail;
