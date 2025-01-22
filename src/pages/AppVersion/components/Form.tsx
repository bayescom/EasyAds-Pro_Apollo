
import store from '@/store';
import { ModalForm, ProFormInstance } from '@ant-design/pro-form';
import { useRef, useState, useEffect } from 'react';
import { Form, Row, Col, Image, Select, Input, Typography, Space } from 'antd';
import styles from '../index.module.less';
import { SearchOutlined } from '@ant-design/icons';
import { platformIconMap, mediaIconMap } from '@/components/Utils/Constant';
import { IAppVersion } from '@/models/types/version';

interface IProps {
  modalData: IAppVersion,
  open: boolean,
  mediumList: MediumFilterOption [],
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

const { Option } = Select;
const { Text } = Typography;

type MediumFilterOption = {
  id: number,
  name: string,
  platformType: number;
};

const appVersionDispatcher = store.getModelDispatchers('appVersion');

function VersionForm({
  modalData,
  open, 
  mediumList,
  onClose, 
  onFinish,
  isEditing
}: IProps) {
  const formRef = useRef<ProFormInstance>();
  const [filterOption, setFilterOption] = useState<any[]>();

  
  useEffect(() => {
    setFilterOption(mediumList);
  }, [mediumList]);

  const resetForm = () => {
    formRef.current?.resetFields();
  };

  useEffect(() => {
    formRef.current?.setFieldsValue(modalData);
  });

  if (!modalData) {
    return <></>;
  }

  const handleSearch = (e) => {
    if (e.target.value) {
      const text: string = e.target.value.trim();
      const result = mediumList.filter(item => item.id.toString().includes(text)
       || item.name.toString().toLowerCase().includes(text.toLowerCase()));
      setFilterOption && setFilterOption(result);
    } else {
      setFilterOption && setFilterOption(mediumList);
    }
  };

  return (
    <ModalForm<IAppVersion>
      formRef={formRef}
      {...formItemLayout}
      title='添加app版本号'
      width={500}
      grid={true}
      layout="horizontal"
      visible={open}
      onFinish={async (values) => {
        let result;
        if (!isEditing) {
          const data = values;
          result = await appVersionDispatcher.new(data);
        } else {
          const data = {
            ...modalData,
            ...values
          };
          result = await appVersionDispatcher.update(data);
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

      <Row gutter={8} wrap={false} className={styles['media-container']} style={{width : '100%'}}>
        <Col span={20}>
          <Form.Item
            label="选择媒体"
            name="mediaId"
            required={true}
            rules={[{
              required: true,
              message: '选择媒体',
            }]}
            className={styles['media-select']}
          >
            <Select 
              allowClear
              placeholder={mediumList.length ? '请选择媒体' : '当前无媒体，请创建媒体'}
              dropdownRender={(menu) => (
                <>
                  <div className={styles['custom-container']}>
                    <Form.Item name='search-mediaId'>
                      <Input onChange={(e) => handleSearch(e)}
                        className={styles['custom-input']}
                        allowClear 
                        prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }}/>}
                        ref={input => input?.focus()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </Form.Item>
                  </div>
                  {menu}
                </>
              )}
              popupClassName={styles['media-popup-container']}
            >
              {filterOption && filterOption.map(item => (
                <Option key={item.id} value={item.id} label={item.name} className={styles['adspot-media-option']}>
                  <Space size={0}>
                    <Image src={ mediaIconMap[item.platform] } style={{ width: '32px', height: 'auto', marginBottom: 4 }} preview={false}/>
                    <div>
                      <Text>{item.name}</Text>
                      <div>
                        <Image 
                          src={ platformIconMap[item.platform] }
                          style={{ width: '16px', height: 'auto', marginBottom: 4 }} 
                          preview={false}
                        />
                        <Text type="secondary">{item.id}</Text>
                      </div>
                    </div>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
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
