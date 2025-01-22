import store from '@/store';
import styles from '../index.module.less';
import MediumDetail from './Detail';
import MediumChart from './ChartNew';
import { Tabs, Tooltip } from 'antd';
import Icon, { BarChartOutlined, LineChartOutlined } from '@ant-design/icons';

const header = <p className={styles['title']}>数据概览</p>;
const reportMediumDispatcher = store.getModelDispatchers('reportMedium');

export default function DataTest() {
  
  const items = [
    {
      key: 'detail',
      label: <Tooltip title='数据报表'><BarChartOutlined/><span style={{fontSize: '12px', marginRight: '15px'}}>数据报表</span></Tooltip>,
      children: <MediumDetail/>,
    },
    {
      key: 'chart',
      label: <Tooltip title='数据图表'><LineChartOutlined/><span style={{fontSize: '12px'}}>数据图表</span></Tooltip>,
      children: <MediumChart/>,
      icon: <Icon />,
    }
  ];

  const changeTab = (value) => {
    reportMediumDispatcher.setActiveKey(value);
  };
  
  return (<>
    <Tabs
      defaultActiveKey="1"
      items={items}
      tabBarExtraContent={{ left: header }}
      onChange={changeTab}
    />
  </>);
}
