import { ModalForm, ProFormInstance, ProFormSwitch } from '@ant-design/pro-form';
import { Col, Dropdown, Empty, Form, Menu, Row, Spin, Typography, Image } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './index.module.less';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';
import store from '@/store';
import { defaultBatchEditDropdownSelect, defaultShowSelectedFormItemMap } from './utils';
import hintWarning from '@/assets/icons/distribution/hintWarning.png';
import { IMedium } from '@/models/types/medium';

const { Text } = Typography;

type Iprops = {
  editOpen: boolean,
  onClose: (bool?: boolean) => void,
  selectedRowArray: number[],
  selectedDataSource: IMedium[]
}

const mediumDispatcher = store.getModelDispatchers('medium');

export default function BatchEditModal({editOpen, onClose, selectedRowArray, selectedDataSource}: Iprops) {
  const [form] = Form.useForm();
  const formRef = useRef<ProFormInstance>();  

  const [batchEditDropdownSelect, setBatchEditDropdownSelect] = useState(defaultBatchEditDropdownSelect);
  const [showEmpty, setShowEmpty] = useState(false);

  // 控制表单项显示与隐藏
  const [showSelectedFormItemMap, setShowSelectedFormItemMap] = useState(defaultShowSelectedFormItemMap);
  
  const [submitterLoading, setSubmitterLoading] = useState(false);
  const [formSpinLoading, setFormSpinLoading] = useState(false);
  const [statusFlag, setStatusFlag] = useState(true);

  useEffect(() => {
    if (editOpen) {
      const batchEditSelectHasDisabled = batchEditDropdownSelect.some(item => item.disable);
      batchEditSelectHasDisabled ? setShowEmpty(false) : setShowEmpty(true);
    }
  }, [editOpen, batchEditDropdownSelect]);

  const handleClickSelect = (value, type) => {
    const newShowSelectedFormItemMap = {...showSelectedFormItemMap};
    newShowSelectedFormItemMap[value.key] = type == 'open' ? true : false;
    setShowSelectedFormItemMap(newShowSelectedFormItemMap);

    const clickFormItem = batchEditDropdownSelect.filter(item => item.key == value.key)[0];
    const currentClickFormItem = {...clickFormItem};
    currentClickFormItem.disable = (type == 'open' ? true : false);
    const newBatchEditDropdownSelect = [...batchEditDropdownSelect];
    const currentIndex = newBatchEditDropdownSelect.findIndex(item => item.key == value.key);
    newBatchEditDropdownSelect.splice(currentIndex, 1, currentClickFormItem);
    setBatchEditDropdownSelect(newBatchEditDropdownSelect);
  };

  const afterResetUseState = () => {
    setBatchEditDropdownSelect(defaultBatchEditDropdownSelect);
    setShowSelectedFormItemMap(defaultShowSelectedFormItemMap);
    setSubmitterLoading(false);
    setStatusFlag(true);
  };

  const handleSubmit = async (value) => {
    const newValuesList = selectedDataSource.map(item => {
      return {
        ...item,
        status: value.status ? 1 : 0
      };
    });

    setSubmitterLoading(true);
    const result = await mediumDispatcher.updateBatchMediums(newValuesList);
    if (result) {
      setSubmitterLoading(false);
      onClose(true);
    }
  };
  
  return (<ModalForm
    formRef={formRef}
    form={form}
    open={editOpen}
    width={663}
    title='批量编辑'
    layout="horizontal"
    onFinish={(value) => handleSubmit(value)}
    modalProps={{
      maskClosable: false,
      okText: '提交',
      onCancel: () => {
        onClose();
      },
      afterClose: () => {
        formRef.current?.resetFields();
        afterResetUseState();
      },
      bodyStyle: { paddingBottom: 0 },
      className: styles['batch-medium-edit-modal'],
    }}
    submitter={{
      submitButtonProps: { disabled: showEmpty, loading: submitterLoading }
    }}
    labelCol={{ span: 7 }}
    wrapperCol={{ span: 24 }}
    initialValues={{
      status: true
    }}
  >
    <Dropdown
      overlay={<Menu
        onClick={(value) => handleClickSelect(value, 'open')}
        items={batchEditDropdownSelect.map(item => {
          return {
            key: item.key,
            label: (<div>{item.label}</div>),
            disabled: item.disable
          };
        })}
      />}
      overlayClassName={styles['create-button-dropdown']}
      className={styles['batch-add-button']}
    >
      <a><PlusOutlined />&nbsp;添加批量编辑选项</a>
    </Dropdown>
    <Spin spinning={formSpinLoading}>
      {showEmpty && <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        className={styles['empty-container']}
        description={<>点击【+ 添加批量编辑选项】按钮操作需要批量编辑的内容</>}
      />}
      {showSelectedFormItemMap.status &&
        <Row className={styles['batch-edit-row']}>
          <Col span={20} className={[styles['batch-edit-status'], statusFlag ? '' : styles['batch-medium-edit-status']].join(' ')}>
            <ProFormSwitch
              name="status"
              label="状态"
              required
              fieldProps={{
                size: 'small',
                defaultChecked: true,
                onChange: (value) => {
                  setStatusFlag(value);
                }
              }}
            />
            {statusFlag ? <Text>此操作会将所选媒体状态置为打开</Text> :
              <Text className={styles['status-warning']}>
                <Image src={hintWarning} preview={false}/>
                此操作会将所选媒体状态置为关闭，且此媒体下全部广告位状态也会置为关闭，请谨慎操作
              </Text>}
          </Col>
          <Col span={4} className={styles['batch-edit-close-col']}>
            <CloseOutlined className={styles['batch-edit-close-icon']} onClick={() => handleClickSelect({key: 'status'}, 'close')}/>
          </Col>
        </Row>
      }
    </Spin>
  </ModalForm>);
}
