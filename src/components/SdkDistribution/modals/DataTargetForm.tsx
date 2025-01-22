import store from '@/store';
import { Checkbox, Collapse, Form, Modal, Space } from 'antd';
import styles from './index.module.less';
import { useEffect } from 'react';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { formatArray } from '../utils/index';
import DataTargetDragModel from './DataTargetDragModel';
import { CaretRightOutlined } from '@ant-design/icons';
import { defaultDataTargetCheckAllFlagMap, defaultDataTargetCheckedListMap, defaultDistributionDataTarget, defaultDragTagList } from '@/models/distribution';
import { dataTargetArray } from '@/components/DataTargetOperations/utils';
import { initColumnsList } from '@/components/Utils/TableColumnCostomization';

const CheckboxGroup = Checkbox.Group;
const { Panel } = Collapse;

const distributionDispatcher = store.getModelDispatchers('distribution');

export default function DataTargetForm() {
  const distributionState = store.useModelState('distribution');
  const [form] = Form.useForm();

  useEffect(() => {
    getLocalStorage();
  }, [distributionState.dataTargetModalVisible]);

  // checkboxGroup的change方法: indeterminate 半选框样式   checkAll 全选框的checked权柄  checkedListMap checkbox的list权柄
  const onChange = (dataKey, fatherKey, list: CheckboxValueType[]) => {
    // 比对数组
    const comparisonArray = dataTargetArray.filter(data => data.key === dataKey)[0].children.filter(item => item.key == fatherKey)[0].children;
    distributionDispatcher.setCheckedListMap({dataKey, fatherKey, newCheckedChildrenList: list});

    //  全选、反选
    const indeterminate = !!list.length && list.length < comparisonArray.length;
    const checkAll = list.length === comparisonArray.length;
    const newFlagMap = {
      indeterminate: indeterminate,
      checkAll: checkAll
    };
    distributionDispatcher.setCheckAllFlagMap({dataKey, fatherKey, newFlagMap});

    const storeKeys = distributionState.dragTagList.map(item => item.value);
    // 勾选
    const checkedItem = list.filter(item => !storeKeys.includes(item as string));
    // 取消勾选
    const cancelItem = comparisonArray.filter(item => !list.includes(item.value));
    
    if (checkedItem.length) {
      const data = formatArray(checkedItem, fatherKey, dataKey);
      const newDragTagList = [...distributionState.dragTagList, ...data];
      distributionDispatcher.setDragTagList(newDragTagList);
    } else {
      const clearIndex = cancelItem.filter(item => storeKeys.includes(item.value));
      const newDragTagList = [...distributionState.dragTagList];
      newDragTagList.splice(storeKeys.indexOf(clearIndex[0].value), 1);
      distributionDispatcher.setDragTagList(newDragTagList);
    }
  };

  // 全选框的是否选中方法
  const onCheckAllChange = (dataKey, fatherKey, e: CheckboxChangeEvent) => {
    let list: string[] = [];
    if (e.target.checked) {
      list = dataTargetArray.filter(data => data.key === dataKey)[0].children.filter(item => item.key == fatherKey)[0].children.map(child  => child.value);

      distributionDispatcher.setCheckedListMap({dataKey, fatherKey, newCheckedChildrenList: list});
      const storeKeys = distributionState.dragTagList.map(item => item.value);
      const chedkedItem = list.filter(item => !storeKeys.includes(item));
      const data = formatArray(chedkedItem, fatherKey, dataKey);
      const newDragTagList = [...distributionState.dragTagList, ...data];
      distributionDispatcher.setDragTagList(newDragTagList);
    } else {
      const clearList = dataTargetArray.filter(data => data.key === dataKey)[0].children.filter(item => item.key == fatherKey)[0].children;
      const newDragTagList = [...distributionState.dragTagList];
      clearList.forEach(item => {
        const storeKeys = newDragTagList.map(item => item.value);
        newDragTagList.splice(storeKeys.indexOf(item.value), 1);
      });

      distributionDispatcher.setDragTagList(newDragTagList);
      distributionDispatcher.setCheckedListMap({dataKey, fatherKey, newCheckedChildrenList: []});
    }

    const newFlagMap = {indeterminate: false, checkAll: e.target.checked};
    distributionDispatcher.setCheckAllFlagMap({dataKey, fatherKey, newFlagMap});
  };

  const setLocalStorage = () => {
    window.localStorage.setItem('localDataTargetListMap', JSON.stringify(distributionState.dataTargetCheckedListMap));
    window.localStorage.setItem('localDataTargetCheckAllFlagMap', JSON.stringify(distributionState.dataTargetCheckAllFlagMap));
    window.localStorage.setItem('localDataTargetDragTagList', JSON.stringify(distributionState.dragTagList));
  };

  const getLocalStorage = () => {
    const localDataTargetListMap = window.localStorage.getItem('localDataTargetListMap');
    const localDataTargetCheckAllFlagMap = window.localStorage.getItem('localDataTargetCheckAllFlagMap');
    const localDataTargetDragTagList = window.localStorage.getItem('localDataTargetDragTagList');
    if (localDataTargetListMap && localDataTargetCheckAllFlagMap && localDataTargetDragTagList) {
      distributionDispatcher.setLocalStorageParams(JSON.parse(localDataTargetCheckAllFlagMap), JSON.parse(localDataTargetListMap));
      distributionDispatcher.setDragTagList(JSON.parse(localDataTargetDragTagList));
      const data = JSON.parse(localDataTargetDragTagList).map(item => item.value);
      distributionDispatcher.setDistributionDataTarget(data);
    } else {
      distributionDispatcher.setLocalStorageParams(defaultDataTargetCheckAllFlagMap, defaultDataTargetCheckedListMap);
      distributionDispatcher.setDragTagList(defaultDragTagList);
      distributionDispatcher.setDistributionDataTarget(defaultDistributionDataTarget);
    }
  };

  const onSubmit = () => {
    const data = distributionState.dragTagList.map(item => item.value);
    distributionDispatcher.setDistributionDataTarget(data);
    distributionDispatcher.setDataTargetModalVisible(false);
    setLocalStorage();
  };

  const onClose = () => {
    distributionDispatcher.setDataTargetModalVisible(false);
  };

  return (
    <Modal
      title='数据指标设置'
      open={distributionState.dataTargetModalVisible}
      okText='提交'
      onOk={onSubmit}
      onCancel={onClose}
      afterClose={() => {
        form.resetFields();
      }}
      destroyOnClose
      width={880}
      wrapClassName={styles['data-target-container']}
      centered
    >
      <div className={styles['data-target-left']}>
        {
          dataTargetArray.map(data => (
            <Collapse
              ghost
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : -90} />}
              defaultActiveKey={[data.key]}
              key={data.key}
            >
              <Panel key={data.key} header={data.title}>
                {
                  data.children.map(item => (<div className={styles['left-item']} key={item.key}>
                    <Checkbox
                      indeterminate={distributionState.dataTargetCheckAllFlagMap[data.key][item.key].indeterminate}
                      onChange={(e) => onCheckAllChange(data.key, item.key, e)}
                      checked={distributionState.dataTargetCheckAllFlagMap[data.key][item.key].checkAll}
                      className={styles['left-header']}
                    >
                      {item.title}
                    </Checkbox>
                    <CheckboxGroup value={distributionState.dataTargetCheckedListMap[data.key][item.key]} onChange={(list) => onChange(data.key, item.key, list)}>
                      {
                        item.children.map(child => (<Space key={child.value}>
                          <Checkbox value={child.value} onClick={(e) => e.stopPropagation()}>
                            {initColumnsList[child.value].title}
                          </Checkbox>
                        </Space>
                        ))
                      }
                    </CheckboxGroup>
                  </div>))
                }
              </Panel>
            </Collapse>
          ))
        }
      </div>
      <div className={styles['data-target-right']}>
        {
          distributionState.dragTagList.length ?
            <DataTargetDragModel/>
            : <div className={styles['drag-header']}>
              <span>已选0列</span>
              <span>清空</span>
            </div>
        }
      </div>
    </Modal>);
}
