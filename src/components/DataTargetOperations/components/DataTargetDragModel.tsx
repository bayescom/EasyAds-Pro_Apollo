import store from '@/store';
import { MenuOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import styles from '../index.module.less';

type Iprop = {
  type: string
};

const dataTargetOperationDispatcher = store.getModelDispatchers('dataTargetOperation');

function DataTargetDragModel({ type }: Iprop) {
  const dataTargetOperationState = store.useModelState('dataTargetOperation');
  // 获取到的参与分发的数组id
  const [list, setList] = useState(dataTargetOperationState.dragTagList);

  useEffect(() => {
    setList(dataTargetOperationState.dragTagList);
  }, [dataTargetOperationState.dragTagList, type]);

  // 处理同列表之间的数据
  const reorder = (list: any, startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  // 在拖拽结束后
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    if (result.source.droppableId === 'droppable') {
      const newList: any = reorder(list, result.source.index, result.destination.index);
      dataTargetOperationDispatcher.setDragTagList([...newList]);
    }
  };

  // 清除某一项
  const clearItem = (fatherKey, son, dataKey) => {
    // state里存储的勾选状态
    const newCheckedChildrenList = Object.assign([], dataTargetOperationState.dataTargetCheckedListMap[dataKey][fatherKey]);
    if (newCheckedChildrenList.indexOf(son)! > -1) {
      newCheckedChildrenList.splice(newCheckedChildrenList.indexOf(son), 1);
    }
    dataTargetOperationDispatcher.setCheckedListMap({ dataKey, fatherKey, newCheckedChildrenList });

    const newDragTagList = [...dataTargetOperationState.dragTagList];
    newDragTagList.splice(newDragTagList.findIndex(item => item.value == son), 1);
    dataTargetOperationDispatcher.setDragTagList(newDragTagList);

    const comparisonArray = dataTargetOperationState.dataTargetArray.filter(data => data.key === dataKey)[0].children.filter(item => item.key == fatherKey)[0].children;
    // 页面展示的勾选项（因为存在有的指标不显示，所以就会造成页面和state比对，数量永远小于state里存储的情况，因此需要再次过滤）
    const pageRealityChecked = comparisonArray.filter(item => newCheckedChildrenList.includes(item.value)).map(child => child.value);
    const indeterminate = !!pageRealityChecked.length && pageRealityChecked.length < comparisonArray.length;
    const checkAll = pageRealityChecked.length === comparisonArray.length;
    const newFlagMap = { indeterminate, checkAll };
    dataTargetOperationDispatcher.setCheckAllFlagMap({ dataKey, fatherKey, newFlagMap });
  };

  // 清除全部
  const clearAll = () => {
    dataTargetOperationDispatcher.setClearAll();
  };

  return (<>
    <DragDropContext
      onDragEnd={onDragEnd}
    >
      <div className={styles['drag-header']}>
        <span>已选{list.length}列</span>
        <span onClick={() => clearAll()} className={styles['clear-all']}>清空</span>
      </div>
      <Droppable droppableId='droppable'>
        {droppableProvided => (
          <div ref={droppableProvided.innerRef} className={styles['droppable-container']}>
            {list.map((item: any, index: number) => ( // 循环的数组
              <Draggable key={item.value} draggableId={item.value} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={styles['draggable-item']}
                  >
                    <MenuOutlined style={{ color: '#c3c3c3', verticalAlign: 'middle' }} />
                    <span className={styles['draggable-item-title']}>{item.title}</span>
                    <span className={styles['drag-clear']} onClick={() => clearItem(item.father, item.value, item.belong)}>X</span>
                  </div>
                )}
              </Draggable>
            ))}
            {droppableProvided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  </>);
}

export default DataTargetDragModel;
