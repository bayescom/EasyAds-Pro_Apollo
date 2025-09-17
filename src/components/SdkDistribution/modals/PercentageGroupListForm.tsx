import { TrafficPercentageType, TargetPercentageListType } from '@/models/types/sdkDistribution';
import store from '@/store';
import { PlusOutlined, CopyOutlined, CloseCircleFilled } from '@ant-design/icons';
import { Button, Col, Form, Input, Modal, Popover, Row, Switch, Tooltip, Typography, Select, Alert } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import styles from './index.module.less';
import { floatAdd } from '@/services/utils/utils';

type Props = {
  visible: boolean,
  onClose: () => void,
  adspotId: number,
  trafficId?: number,
  onFinish?: () => void,
  // 是否来自报表详情，报表详情的name 不能更改
  isFromDataReportDetail?: boolean,
};

const { Text } = Typography;
type PercentageTagType = {
  copyPercentageTag: string,
};

type NextGroupInfo = TrafficPercentageType | PercentageTagType;

const distributionDispatcher = store.getModelDispatchers('sdkDistribution');

// 在 100 / 个数 除不尽的时候，需要保证最后的值加起来是100
const calculateEqualPercentages = (count: number): number[] => {
  if (count === 0) return [];
  const basePercentage = parseFloat((100 / count).toFixed(2)); // 基础值（如 33.33）
  const percentages = Array(count - 1).fill(basePercentage);   // 前 N-1 个分组
  const lastPercentage = 100 - basePercentage * (count - 1);   // 最后一个分组补差值
  return [...percentages, parseFloat(lastPercentage.toFixed(2))]; // 确保总和=100
};

const content = () => {
  return (<p>
    打开【复制现有WaterFall】开关时，新组将复制<br/>
    当前广告位的WaterFall分发策略(包括流量分组<br/>
    及相关广告源策略)。关闭【复制现有WaterFall】<br/>
    开关时，新组中没有任何参与分发的广告源，需要<br/>
    手动配置分发策略。
  </p>);
};

function PercentageGroupListForm({ visible, onClose, adspotId, onFinish, isFromDataReportDetail }: Props) {
  const [form] = Form.useForm();
  const distributionState = store.useModelState('sdkDistribution');
  const distribution = distributionState[adspotId];
  const distributionModel = store.useModelState('distribution');

  useEffect(() => {
    if (visible) {
      const currentTrafficGroupList = distribution.percentageList[0];

      form.setFieldValue('expName', currentTrafficGroupList?.expName || '');
    }
  }, [distribution, visible, distributionModel.currentTargetId, form]);

  const groupStrategy = distribution.percentageList[0].trafficGroupList.map(item => ({
    name: item.groupStrategy.name,
    id: item.groupStrategy.groupTargetId
  }));

  // 表单默认值
  const initialTrafficPercentageList: TrafficPercentageType[] = useMemo(() => {
    const groups = distribution.percentageList;
    if (!groups || !groups.length) {
      return [];
    }

    // 如果后端有数据，就循环遍历塞进去
    const result: TrafficPercentageType[] = [];
    for (let i = 0; i < groups.length; i++) {
      result.push({ percentageId: groups[i].trafficPercentage.percentageId, tag: groups[i].trafficPercentage.tag, percentage: groups[i].trafficPercentage.percentage, status: groups[i].trafficPercentage.status });
    }

    // 如果a/b分组只有两组，newGroup塞个B组进去
    if (groups.length === 1) {
      result[0].tag = 'A';
      result[0].percentage = 50;
      const newGroup: TrafficPercentageType = { percentageId: -1, tag: 'B', percentage: 50, status: 1 };
      if (!!distribution.percentageList && distribution.percentageList.length <= 1) { // is creating ab
        newGroup.copyPercentageId = null;
      }
      result.push(newGroup);
    }

    return result;
  }, [distribution]);

  useEffect(() => {
    if (distributionModel.currentTargetId) {
      form.setFieldValue('groupId', distributionModel.currentTargetId);
    } else {
      form.setFieldValue('groupId', groupStrategy[0].id);
    }
  });

  const [tagMap, setTagMap] = useState(initialTrafficPercentageList.reduce((pre, cur) => {
    pre[cur.percentageId] = { 
      percentageId: cur.percentageId, 
      copyPercentageTag: '' 
    };
    return pre;
  }, {}));

  const getNextGroupInfo = (groups: TrafficPercentageType[], isCreatingAb: boolean, currentCopyIndex?: number): NextGroupInfo => {
    const tagCharMap = {};
    let nextId = -1;
    let leftPercentage = 100;
  
    for (let i = 0; i < groups.length; i++) {
      if (groups[i].tag && groups[i].tag.length === 1) {
        const charCode = groups[i].tag.charCodeAt(0);
        if (charCode >= 65 && charCode <= 90) {
          tagCharMap[charCode] = true;
        }
      }
  
      const id = groups[i]?.percentageId;
      if (id && id <= nextId) {
        nextId = id - 1;
      }
  
      if (groups[i].percentage) {
        if (isCreatingAb) {
          // 如果是新建的，那么需要更新 平均分比例
          const currentGroups = form.getFieldValue('trafficPercentageList') || [];
          const newCount = currentGroups.length + 1;
          const newPercentagesList = calculateEqualPercentages(newCount); // 直接获取均分后的值
          const trafficPercentageList = form.getFieldValue('trafficPercentageList');
          const _trafficPercentageList = trafficPercentageList.map((item, index) => ({
            ...item,
            percentage: newPercentagesList[index]
          }));
          
          form.setFieldValue('trafficPercentageList', _trafficPercentageList);
          leftPercentage = newPercentagesList[newPercentagesList.length-1];
        } else {
          leftPercentage -= groups[i].percentage;
        }
      }
    }
  
    let nextGroupTagCharCode = 65; // 65 is ascii code for A
    for (let i = 65; i <= 90; i++) {
      if (!tagCharMap[i]) {
        nextGroupTagCharCode = i;
        break;
      }
    }
  
    setTagMap({...tagMap, [nextId]: {
      percentageId: nextId,
      copyPercentageTag: isCreatingAb ? '' : (currentCopyIndex != undefined ? groups[currentCopyIndex].tag : '')
    }});
    return {
      percentageId: nextId,
      tag: String.fromCharCode(nextGroupTagCharCode),
      percentage: isCreatingAb ? (leftPercentage < 0 ? 0 : leftPercentage) : (currentCopyIndex != undefined ? groups[currentCopyIndex].percentage : 0),
      status: 1,
      copyPercentageId: isCreatingAb ? null : (currentCopyIndex != undefined ? groups[currentCopyIndex].percentageId : null),
      // 编辑的时候copy功能，需要显示是copy哪个组的
      copyPercentageTag: isCreatingAb ? '' : (currentCopyIndex != undefined ? groups[currentCopyIndex].tag : ''),
    };
  };

  useEffect(() => {
    // reset form initial value when initialPercentageGroups changes
    form.setFieldValue('trafficPercentageList', initialTrafficPercentageList);
  }, [form, initialTrafficPercentageList]);

  let isCreatingAb = false;
  if (distribution.percentageList.length <= 1) {
    if (distribution.percentageList[0].trafficGroupList.find(trafficGroup => trafficGroup.groupStrategy.groupTargetId == distributionModel.currentTargetId)?.targetPercentageStrategyList.length == 1) {
      isCreatingAb = true;
    } 
  }

  // 在新建A/B实验的时候，允许复制现有的WaterFall功能，是复制第一条数据的 percentageId, 如果打开了，就默认进行 copyPercentageId = group[0].percentageId
  const changeIsCopy = (value, currentChangeIndex) => {
    const trafficPercentageList = form.getFieldsValue().trafficPercentageList;

    form.setFieldValue('trafficPercentageList', trafficPercentageList.map((item, index) => {
      if (index == currentChangeIndex) {
        return {
          ...item,
          copyPercentageId: value ? trafficPercentageList[0].percentageId : null
        };
      } else {
        return item;
      }
    }));
  };

  const onSubmit = async () => {
    const values: { trafficPercentageList: TrafficPercentageType[], expName: string } = await form.validateFields();
    values.trafficPercentageList.forEach(item => {
      if (item.percentageId && item.percentageId < 0) {
        delete item.percentageId;
      }
      delete item.copyPercentageTag;
      item.percentage = Number(item.percentage);
      delete item.copy;
    });

    const currentTrafficGroupList = distribution.percentageList[0];
    const targetPercentageObj = {
      trafficPercentageList: values.trafficPercentageList.map(item => ({...item, status: item.status ? 1 : 0})),
      experiment: {
        expId: currentTrafficGroupList.expId,
        expName: values.expName
      }
    };
    
    const result = await distributionDispatcher.updatePercentageGroups({
      adspotId,
      targetPercentageObj
    });
    onFinish && onFinish();
    result && onCancel();
    return;
  };

  const onCancel = () => {
    onClose();
  };

  const onRemove = (remove: (index: number) => void, index: number) => {
    remove(index);
  };

  return (
    <Modal
      title={`${isCreatingAb ? '开启' : '编辑'}A/B测试分组`}
      open={visible}
      okText="提交"
      cancelText="取消"
      width={720}
      maskClosable={false}
      onOk={onSubmit}
      onCancel={onCancel}
      afterClose={() => form.resetFields()}
      forceRender
      className={styles['ab-test-modal']}
    >
      {
        !isCreatingAb ? <Alert
          className={styles['report-alert']}
          message='为了确保A/B测试结果更加准确，建议测试周期≥7天，测试期间不建议随意更改A/B组配置。'
          type="info"
          showIcon
          banner
        /> : <></>
      }
      <Form
        form={form}
        initialValues={{ trafficPercentageList: initialTrafficPercentageList }}
        onValuesChange={(changedValues) => {
          if (changedValues.trafficPercentageList && changedValues.trafficPercentageList.some(item => item && item.percentage !== undefined)) {
            form.validateFields(['trafficPercentageList']);
          }
        }}
      >
        <Form.Item 
          name='expName' 
          label='测试名称'
          getValueFromEvent={e => e.target.value.trim()} 
          labelCol={{ flex: '0 0 100px' }}
          wrapperCol={{ span: 12 }}
          rules={[{ required: true, type: 'string', message: '请输入' }]}
        >
          <Input placeholder='请输入' disabled={isFromDataReportDetail} />
        </Form.Item>
        <Form.Item 
          label="分组设置" 
          labelCol={{ flex: '0 0 100px' }}
          tooltip="各分组按比例自动计算切量比例，请按需填入总比例为100的系数"
        >
          <div className={styles['traffic-percentage-list']}>
            <Form.List
              name="trafficPercentageList"
              rules={[
                { validator: (_, value) => {
                  let totalPercentage = 0;
                  value.forEach(item => {
                    if (item.status) {
                      totalPercentage = floatAdd(+item.percentage, totalPercentage);
                    }
                  });
                  if (totalPercentage > 100) {
                    return Promise.reject(new Error(`总比例不能大于100，当前为${totalPercentage}`));
                  }
                  return Promise.resolve();
                }},
                { warningOnly: true, validator: (_, value) => {
                  let totalPercentage = 0;
                  value.forEach(item => {
                    if (item.status) {
                      totalPercentage = floatAdd(+item.percentage, totalPercentage);
                    }
                  });
                  if (totalPercentage < 100) {
                    return Promise.reject(new Error(`总比例不足100，存在流量浪费，当前为${totalPercentage}`));
                  }
                  return Promise.resolve();
                }},
                { validator: (_, value) => {
                  const groupCount = value.length;
                  if (groupCount < 2) {
                    return Promise.reject(new Error('至少有两个分组'));
                  }
                  return Promise.resolve();
                }},
              ]}
            >
              {(fields, { add, remove}, { errors, warnings }) => (<>
                <Row className={styles['column-title-row']} gutter={8} style={{marginLeft: '0px'}}>
                  <Col flex={isCreatingAb ? '0 0 25%' : '0 0 30%'}>
                    <Text style={{fontSize: 12}}>分组名称</Text>
                  </Col>
                  <Col flex={isCreatingAb ? '0 0 25%' : '0 0 30%'}>
                    <Text style={{fontSize: 12}}>比例</Text>
                  </Col>
                  { isCreatingAb && <Col flex='0 0 25%'>
                    <Popover content={content}>
                      <Text style={{fontSize: 12}}>复制现有WaterFall</Text>
                    </Popover>
                  </Col>}
                  <Col flex={isCreatingAb ? '0 0 20%' : '0 0 30%'} style={{ paddingLeft: '9px' }}>
                    <Text style={{fontSize: 12}}>操作</Text>
                  </Col>
                </Row>
                {fields.map((field, index) => (
                  <Row key={index} gutter={8} wrap={false} className={styles['percentage-column-row']}>
                    <Col className={styles['percentage-column']} flex={isCreatingAb ? '0 0 25%' : '0 0 30%'}>
                      <Form.Item
                        name={[field.name, 'tag']}
                        rules={[
                          { type: 'string', required: true, message: '请输入比例分组名称' }
                        ]}
                        getValueFromEvent={e => e.target.value.trim()}
                      >
                        <Input suffix="组" placeholder="请输入" />
                      </Form.Item>
                    </Col>
                    <Col flex={isCreatingAb ? '0 0 25%' : '0 0 30%'}>
                      <Form.Item
                        name={[field.name, 'percentage']}
                        className={styles['percentage-input']}
                        getValueFromEvent={e => e.target.value.trim()}
                        rules={[
                          {required: true, message: '比例不能为空'},
                          { type: 'number', transform: value => +value, message: '比例只能是数字' },
                        ]}
                      >
                        <Input placeholder="请输入" suffix ='%'/>
                      </Form.Item>
                    </Col>
                    { isCreatingAb && <Col flex="0 1 25%">
                      {
                        field.name === 0
                          ? <div className={styles['percentage-group-copy-column-disable']}>-</div>
                          : <Form.Item
                            name={[field.name, 'copy']}
                            valuePropName="checked"
                          >
                            <Switch onChange={(value) => changeIsCopy(value, field.name)} />
                          </Form.Item>
                      }
                    </Col>}
                    <Col flex="0 0 20px" style={{ padding: '0px' }}>
                      {field.name === 0 || form.getFieldValue('trafficPercentageList').length <= 2 ? <></> :
                        <Tooltip title="提交后，此分组下的所有流量分组都会被删除">
                          <Button
                            type="text"
                            icon={<CloseCircleFilled />}
                            onClick={() => {onRemove(remove, index);}}
                            disabled={isCreatingAb ? field.name === 0 || form.getFieldValue('trafficPercentageList').length <= 2 : (form.getFieldValue('trafficPercentageList').length <= 2 || !form.getFieldValue('trafficPercentageList')[field.name].status)}
                          />
                        </Tooltip>}
                    </Col>
                    {/* 编辑分组的时候，添加复制功能，点击复制，可以复制出来一个相同的组 */}
                    {/* 编辑分组的时候，需要有关闭的功能，
                        有大于两个分组且【不是本次添加的分组】都可以操作关闭
                        已关闭状态的分组不支持删除和复制
                        关闭状态后的分组不在流量分发页面显示 
                    */}
                    {}
                    { !isCreatingAb && <Col className={styles['group-status-operate']}>
                      <Form.Item
                        name={[field.name, 'status']}
                        valuePropName="checked"
                      >
                        {/* 新增的不允许操作关闭按钮 */}
                        <Switch
                          checked={form.getFieldValue('trafficPercentageList')[field.name]?.status}
                          onChange={(checked) => {
                            // 手动更新表单值
                            const list = form.getFieldValue('trafficPercentageList');
                            list[field.name].status = checked;
                            form.setFieldsValue({ trafficPercentageList: list });
                            form.validateFields();
                          }}
                          disabled={
                            form.getFieldValue('trafficPercentageList')[field.name]?.percentageId < 0 ||
                            form.getFieldValue('trafficPercentageList').length <= 2
                          }
                        />
                      </Form.Item>
                      <Button
                        type="text"
                        style={{ padding: '4px 8px' }}
                        icon={<CopyOutlined />}
                        disabled={
                          !form.getFieldValue('trafficPercentageList')[field.name].status
                        }
                        onClick={() => add(
                          getNextGroupInfo(
                            form.getFieldValue('trafficPercentageList'),
                            !!isCreatingAb,
                            index
                          )
                        )}
                      />
                    </Col>}
                    { !isCreatingAb && <Col style={{marginTop: '4px'}}>
                      {
                        !!tagMap[form.getFieldValue('trafficPercentageList')[field.name].percentageId] && !!tagMap[form.getFieldValue('trafficPercentageList')[field.name].percentageId].copyPercentageTag && <span>（从{tagMap[form.getFieldValue('trafficPercentageList')[field.name].percentageId].copyPercentageTag}组复制）</span>
                      }
                    </Col>}
                  </Row>
                ))}
                <Row gutter={8}>
                  <Col flex="0 0 50%"></Col>
                  <Col flex="0 0 50%">
                    <Form.ErrorList errors={errors} warnings={warnings} />
                  </Col>
                </Row>
                <Row className={styles['form-title-row-ab']} align='middle'>
                  <Col flex="0 0 auto">
                    <Button
                      type='default'
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={() => {add(
                        getNextGroupInfo(
                          form.getFieldValue('trafficPercentageList'),
                          !!isCreatingAb
                        )
                      );}}
                      ghost
                    >
                      添加分组
                    </Button>
                  </Col>
                </Row>
              </>)}
            </Form.List>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default PercentageGroupListForm;
