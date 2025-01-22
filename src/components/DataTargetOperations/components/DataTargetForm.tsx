import store from '@/store';
import { Checkbox, Collapse, Form, Modal, Space } from 'antd';
import styles from '../index.module.less';
import { useEffect } from 'react';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import DataTargetDragModel from './DataTargetDragModel';
import { dataTargetArray } from '../utils';
import { initColumnsList } from '@/components/Utils/TableColumnCostomization';
import { formatArray } from '@/components/SdkDistribution/utils';
import { CaretRightOutlined } from '@ant-design/icons';

const CheckboxGroup = Checkbox.Group;
const { Panel } = Collapse;

type Iprop = {
  type: string
};

const dataTargetOperationDispatcher = store.getModelDispatchers('dataTargetOperation');

export default function DataTargetForm({type}: Iprop) {
  const dataTargetOperationState = store.useModelState('dataTargetOperation');
  const [form] = Form.useForm();

  useEffect(() => {
    dataTargetOperationDispatcher.setUpPageDisplay(dataTargetArray);
  }, [type]);

  // checkboxGroup的change方法: indeterminate 半选框样式   checkAll 全选框的checked权柄  checkedListMap checkbox的list权柄
  const onChange = (dataKey, fatherKey, list: CheckboxValueType[]) => {
    let newCheckedChildrenList: CheckboxValueType[] = [];
    // 比对数组
    const comparisonArray = dataTargetOperationState.dataTargetArray.filter(data => data.key === dataKey)[0].children.filter(item => item.key == fatherKey)[0].children;
    newCheckedChildrenList = [...list];
    dataTargetOperationDispatcher.setCheckedListMap({dataKey, fatherKey, newCheckedChildrenList});
    
    // 全选、反选
    const indeterminate = !!list.length && list.length < comparisonArray.length;
    const checkAll = list.length === comparisonArray.length;
    const newFlagMap = {
      indeterminate: indeterminate,
      checkAll: checkAll
    };
    dataTargetOperationDispatcher.setCheckAllFlagMap({dataKey, fatherKey, newFlagMap});

    const storeKeys = dataTargetOperationState.dragTagList.map(item => item.value);
    // 勾选
    const checkedItem = list.filter(item => !storeKeys.includes(item as string));
    // 取消勾选
    const cancelItem = comparisonArray.filter(item => !list.includes(item.value));
    
    if (checkedItem.length) {
      const data = formatArray(checkedItem, fatherKey, dataKey);
      const newDragTagList = [...dataTargetOperationState.dragTagList, ...data];
      dataTargetOperationDispatcher.setDragTagList(newDragTagList);
    } else {
      const clearIndex = cancelItem.filter(item => storeKeys.includes(item.value));
      const newDragTagList = [...dataTargetOperationState.dragTagList];
      newDragTagList.splice(storeKeys.indexOf(clearIndex[0].value), 1);
      dataTargetOperationDispatcher.setDragTagList(newDragTagList);
    }
  };

  // 全选框的是否选中方法
  const onCheckAllChange = (dataKey, fatherKey, e: CheckboxChangeEvent) => {
    let list: string[] = [];
    if (e.target.checked) {
      list = dataTargetOperationState.dataTargetArray.filter(data => data.key === dataKey)[0].children.filter(item => item.key == fatherKey)[0].children.map(child  => child.value);
     
      const newCheckedChildrenList = list;
      dataTargetOperationDispatcher.setCheckedListMap({dataKey, fatherKey, newCheckedChildrenList});
      const storeKeys = dataTargetOperationState.dragTagList.map(item => item.value);
      const chedkedItem = list.filter(item => !storeKeys.includes(item));
      const data = formatArray(chedkedItem, fatherKey, dataKey);
      const newDragTagList = [...dataTargetOperationState.dragTagList, ...data];
      dataTargetOperationDispatcher.setDragTagList(newDragTagList);
    } else { // 全部清空时不需要多做判断，在setLocalStorage的formatValue里面进行是否全部清空判断了
      const clearList = dataTargetOperationState.dataTargetArray.filter(data => data.key === dataKey)[0].children.filter(item => item.key == fatherKey)[0].children;
      const newDragTagList = [...dataTargetOperationState.dragTagList];
      clearList.forEach(item => {
        const storeKeys = newDragTagList.map(item => item.value);
        newDragTagList.splice(storeKeys.indexOf(item.value), 1);
      });

      dataTargetOperationDispatcher.setDragTagList(newDragTagList);
      dataTargetOperationDispatcher.setCheckedListMap({dataKey, fatherKey, newCheckedChildrenList: []});
    }

    const newFlagMap = {indeterminate: false, checkAll: e.target.checked};
    dataTargetOperationDispatcher.setCheckAllFlagMap({dataKey, fatherKey, newFlagMap});
  };

  const setLocalStorage = () => {
    window.localStorage.setItem('localDataTargetListMap', JSON.stringify(dataTargetOperationState.dataTargetCheckedListMap));
    window.localStorage.setItem('localDataTargetCheckAllFlagMap', JSON.stringify(dataTargetOperationState.dataTargetCheckAllFlagMap));
    window.localStorage.setItem('localDataTargetDragTagList', JSON.stringify(dataTargetOperationState.dragTagList));
  };

  const onSubmit = () => {
    const data = dataTargetOperationState.dragTagList.map(item => item.value);
    dataTargetOperationDispatcher.setPageDataTarget(data);
    dataTargetOperationDispatcher.setDataTargetModalVisible(false);
    setLocalStorage();
  };

  const onClose = () => {
    dataTargetOperationDispatcher.setDataTargetModalVisible(false);
  };

  return (
    <Modal
      title='数据指标设置'
      open={dataTargetOperationState.dataTargetModalVisible}
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
      maskClosable={false}
    >
      <div className={styles['data-target-left']}>
        {
          dataTargetOperationState.dataTargetArray.map(data => (
            <Collapse
              ghost
              expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : -90} />}
              defaultActiveKey={[data.key]}
              key={data.key}
              collapsible={'header'}
            >
              <Panel key={data.key} header={data.title}>
                {
                  data.children.map(item => (<div className={styles['left-item']} key={item.key}>
                    <Checkbox
                      indeterminate={dataTargetOperationState.dataTargetCheckAllFlagMap[data.key][item.key].indeterminate}
                      onChange={(e) => onCheckAllChange(data.key, item.key, e)}
                      checked={dataTargetOperationState.dataTargetCheckAllFlagMap[data.key][item.key].checkAll}
                      className={styles['left-header']}
                    >
                      {item.title}
                    </Checkbox>
                    <CheckboxGroup value={dataTargetOperationState.dataTargetCheckedListMap[data.key][item.key]} onChange={(list) => onChange(data.key, item.key, list)}>
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
          dataTargetOperationState.dragTagList.length ?
            <DataTargetDragModel type={type}/>
            : <div className={styles['drag-header']}>
              <span>已选0列</span>
              <span>清空</span>
            </div>
        }
      </div>
    </Modal>);
}
