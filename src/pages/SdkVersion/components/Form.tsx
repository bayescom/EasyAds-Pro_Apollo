
import store from '@/store';
import { ModalForm, ProFormInstance } from '@ant-design/pro-form';
import { useRef, useEffect } from 'react';
import { Form, Row, Col, Input} from 'antd';
import styles from '../index.module.less';
import { IAppVersion } from '@/models/types/version';

interface IProps {
  modalData: IAppVersion,
  open: boolean,
  isEditing?: boolean,
  onClose: () => void,
  onFinish: () => void,
}

const formItemLayout = {
  labelCol: {
    flex: '0 1 100px'
  },
  wrapperCol: {
    flex: '1 1 auto'
  },
};

const sdkVersionDispatcher = store.getModelDispatchers('sdkVersion');

function VersionForm({
  modalData,
  open, 
  onClose, 
  onFinish,
  isEditing
}: IProps) {
  const formRef = useRef<ProFormInstance>();

  const resetForm = () => {
    formRef.current?.resetFields();
  };

  useEffect(() => {
    formRef.current?.setFieldsValue(modalData);
  });

  if (!modalData) {
    return <></>;
  }

  return (
    <ModalForm<IAppVersion>
      formRef={formRef}
      {...formItemLayout}
      title='添加sdk版本号'
      width={500}
      grid={true}
      layout="horizontal"
      visible={open}
      onFinish={async (values) => {
        let result;
        if (!isEditing) {
          const data = values;
          result = await sdkVersionDispatcher.new(data);
        } else {
          const data = {
            ...modalData,
            ...values
          };
          result = await sdkVersionDispatcher.update(data);
        }
        
        if (result) {
          onClose();
          onFinish();
        }
      }}
      modalProps={{
        onCancel: () => {
          onClose();
        },
        afterClose: () => {
          resetForm();
        },
        wrapClassName: styles['value-form-container']
      }}
    >
      <Row gutter={8} style={{width : '100%'}}>
        <Col span={20}>
          <Form.Item 
            label="版本号" 
            name="version"
            required={true}
            rules={[
              { required: true, message: '请填写版本号', type: 'string' }
            ]}
            style={{height: '30px'}}
            getValueFromEvent={e => e.target.value.trim()}
          >
            <Input placeholder='请输入版本号' style={{height: '30px'}}/>
          </Form.Item>
        </Col>
      </Row>
    </ModalForm>
  );
}

export default VersionForm;
