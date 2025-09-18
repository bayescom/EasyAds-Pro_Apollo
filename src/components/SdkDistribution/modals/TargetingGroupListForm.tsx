import { GroupStrategyType } from '@/models/types/sdkDistribution';
import store from '@/store';
import { DragOutlined } from '@ant-design/icons';
import { Alert, Button, Col, Form, message, Modal, Row, Typography } from 'antd';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import styles from './index.module.less';
import TargetingGroupRow from './TargetingGroupRow';
import { formatPayloadDataFromTargetingGroupModal, formatTargetingGroupDataFromPayload } from '@/components/SdkDistribution/utils/formatSdkAdspotChannel';

type FormValuesType = {
  groupStrategyList: GroupStrategyType[] | GroupType [] | undefined
};

type GroupType = {
  groupTargetId: number, // 用于区分不同的分组
  priority: number,
  name: string,
  appVersion: string,
  sdkVersion: string,
  location: string,
  osv: string,
  maker: string
}

const { Text } = Typography;

const reorderPriority = (groupStrategyList: GroupStrategyType[]) => groupStrategyList.map((group, index) => ({
  ...group,
  priority: index + 1
}));

const getDroppableStyle = (isDraggingOver: boolean, draggingFromThisWith?: string) => {
  if (isDraggingOver) {
    return {
      backgroundColor: 'rgba(223, 255, 255, 0.3)'
    };
  }

  if (draggingFromThisWith) {
    return {
      boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px'
    };
  }

  return {};
};

const getDraggableStyle = (isDragging) => {
  if (isDragging) {
    return {
      backgroundColor: 'rgba(247, 247, 247)',
      boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
      opacity: 0.8,
    };
  }

  return {};
};

const sdkDistributionDispatcher = store.getModelDispatchers('sdkDistribution');
const distributionDispatcher = store.getModelDispatchers('distribution');

function TargetingGroupListForm({ visible, onClose, adspotId, percentageGroupId }: {
  visible: boolean,
  onClose: () => void,
  adspotId: number,
  percentageGroupId: number
}) {
  const [form] = Form.useForm();
  const distributionState = store.useModelState('sdkDistribution');
  const distribution = distributionState[adspotId];
  const distributionModel = store.useModelState('distribution');

  // 仅获取 ITargetingGroup的字段，去掉suppliers和percentageGroups
  const _groupStrategyList = distribution.percentageList.find(item => item.trafficPercentage.percentageId === percentageGroupId)?.trafficGroupList.map(item => item.groupStrategy);

  const groupStrategyList = _groupStrategyList?.map(item => formatTargetingGroupDataFromPayload(item));

  const onSubmit = async () => {
    try {
      const values: FormValuesType = await form.validateFields();
      const _values = Object.assign(values, {});
      const groupsToSubmit = _values.groupStrategyList.map(item => {
        if (item.groupTargetId && item.groupTargetId < 0) {
          delete item.groupTargetId;
        }
        return formatPayloadDataFromTargetingGroupModal(item);
      });
      console.log(groupsToSubmit, 'groupsToSubmit')
      // return ;
      const data = await sdkDistributionDispatcher.updateTargetingGroups({
        adspotId,
        groupStrategyList: groupsToSubmit,
        percentageGroupId
      });

      if (data) {
        // 修改流量分组的信息之后，还要重新获取一下 使得最外面的定向信息能够更新
        if (distributionModel.currentTargetId) {
          distributionDispatcher.getSdkStrategyDirection({targetId: distributionModel.currentTargetId});
        }
        onCancel();
      }
    } catch (errorInfo) {
      if (errorInfo.errorFields[0].errors) {
        message.error(errorInfo.errorFields[0].errors);
      }
    }
  };

  const onCancel = () => {
    onClose();
  };

  const onDragEnd = (result: DropResult, move: (from: number, to: number) => void) => {
    if (result.destination) {
      move(result.source.index, result.destination.index);
      setTimeout(() => {
        form.setFieldsValue({ groupStrategyList: reorderPriority(form.getFieldValue('groupStrategyList')) });
      }, 500);
    }
  };

  const onAddGroup = (add: (defaultValue?, insertIndex?: number) => void) => {
    const newGroup: GroupType = {
      groupTargetId: -1, // 用于区分不同的分组
      priority: 1,
      name: '',
      appVersion: '',
      sdkVersion: '',
      location: '',
      osv: '',
      maker: ''
    };

    form.getFieldValue('groupStrategyList').forEach(item => {
      if (item.groupTargetId < 0 && (!newGroup.groupTargetId || item.groupTargetId <= newGroup.groupTargetId)) {
        newGroup.groupTargetId = item.groupTargetId - 1;
      }

      if (item.priority <= item.priority) {
        newGroup.priority = item.priority + 1;
      }
    });

    add(newGroup);
  };

  const onRemoveGroup = (remove: (index: number | number[]) => void, index: number) => {
    remove(index);
    setTimeout(() => {
      form.setFieldsValue({ groupStrategyList: reorderPriority(form.getFieldValue('groupStrategyList')) });
    }, 500);
  };


  return (
    <Modal
      title="编辑流量分组"
      open={visible}
      okText="提交"
      cancelText="取消"
      width={820}
      maskClosable={false}
      onOk={onSubmit}
      onCancel={onCancel}
      afterClose={() => form.resetFields()}
      wrapClassName={styles['targeting-group-container']}
    >
      <Form form={form} initialValues={{groupStrategyList}}>
        <Alert
          style={{marginBottom: 10}}
          message="流量按从左到右顺序依次请求流量分组，直至命中分组规则"
          type="info"
          showIcon
          banner
        />
        <Form.List name="groupStrategyList">
          {(fields, { add, move, remove }) => (<>
            <Row className={styles['form-title-row']} align='middle'>
              <Col flex="1 0 auto">
                <Text style={{fontSize: 13}}>优先级</Text>
              </Col>
              <Col flex="0 0 auto">
                <Button
                  type='primary'
                  size="small"
                  style={{color: '#fff'}}
                  onClick={() => onAddGroup(add)}
                  ghost
                >
                  添加分组
                </Button>
              </Col>
            </Row>
            <DragDropContext onDragEnd={(dropResult: DropResult) => onDragEnd(dropResult, move)}>
              <Droppable droppableId="targetingGroup">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={getDroppableStyle(snapshot.isDraggingOver, snapshot.draggingFromThisWith)}
                  >
                    {fields.map((field, index) => (
                      <Draggable
                        key={form.getFieldValue('groupStrategyList')[field.name]?.groupTargetId}
                        draggableId={'' + form.getFieldValue('groupStrategyList')[field.name]?.groupTargetId}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={styles['draggable-item']}
                            style={{
                              ...provided.draggableProps.style,
                              ...getDraggableStyle(snapshot.isDragging)
                            }}
                          >
                            <Form.Item
                              name={field.name}
                              noStyle
                            >
                              <TargetingGroupRow
                                form={form}
                                index={index}
                                fieldName={field.name}
                                adspotId={adspotId}
                                disableRemoveGroup={fields.length <= 1}
                                onRemove={() => onRemoveGroup(remove, index)}
                                model={form.getFieldValue('groupStrategyList')[index]}
                              >
                                <Button {...provided.dragHandleProps} type="text" ><DragOutlined /></Button>
                              </TargetingGroupRow>
                            </Form.Item>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </>)}
        </Form.List>
      </Form>
    </Modal>
  );
}

export default TargetingGroupListForm;
