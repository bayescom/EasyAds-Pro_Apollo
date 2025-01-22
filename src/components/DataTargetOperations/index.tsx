import store from '@/store';
import { useEffect } from 'react';
import styles from './index.module.less';
import { Button, Tooltip } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import DataTargetForm from './components/DataTargetForm';
import { defaultDataTargetCheckAllFlagMap, defaultDataTargetCheckedListMap, defaultDragTagList, pageDataTarget } from '@/models/dataTargetOperation';

type Iprops = {
  /** 组件类名 */
  className?: string,
  /* 引用组件类型：比如：广告网络 */
  type: string,
}

const dataTargetOperationsDispatcher = store.getModelDispatchers('dataTargetOperation');

export default function DataTargetOperations({className, type}: Iprops) {

  useEffect(() => {
    // 获取本地指标
    const localDataTargetListMap = window.localStorage.getItem('localDataTargetListMap');
    const localDataTargetCheckAllFlagMap = window.localStorage.getItem('localDataTargetCheckAllFlagMap');
    const localDataTargetDragTagList = window.localStorage.getItem('localDataTargetDragTagList');
    if (localDataTargetListMap && localDataTargetCheckAllFlagMap && localDataTargetDragTagList) {
      dataTargetOperationsDispatcher.setLocalStorageParams(JSON.parse(localDataTargetCheckAllFlagMap), JSON.parse(localDataTargetListMap));
      dataTargetOperationsDispatcher.setDragTagList(JSON.parse(localDataTargetDragTagList));
      const data = JSON.parse(localDataTargetDragTagList).map(item => item.value);
      dataTargetOperationsDispatcher.setPageDataTarget(data);
    } else {
      dataTargetOperationsDispatcher.setLocalStorageParams(defaultDataTargetCheckAllFlagMap, defaultDataTargetCheckedListMap);
      dataTargetOperationsDispatcher.setDragTagList(defaultDragTagList);
      dataTargetOperationsDispatcher.setPageDataTarget(pageDataTarget);
    }
  }, []);

  const changeDataTargetModalVisible = () => {
    dataTargetOperationsDispatcher.setDataTargetModalVisible(true);
  };

  return (<div className={[styles['setting-check-container'], className ? className : ''].join(' ')}>
    <Tooltip title='自定义数据指标'>
      <Button icon={<SettingOutlined style={{color: '#bdbdbd'}}/>} onClick={() => changeDataTargetModalVisible()}>指标</Button>
    </Tooltip>

    <DataTargetForm type={type}/>
  </div>);
}
