import { IMedium } from '@/models/types/medium';
import store from '@/store';
import ProCard from '@ant-design/pro-card';
import ProForm, { ProFormInstance } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Form, Space, Typography, Breadcrumb } from 'antd';
import { useHistory, useParams, Link } from 'ice';
import { useEffect, useRef } from 'react';
import MediumForm from './form';
import CopyableText from '@/components/CopyableText';
import defer from 'lodash/defer';
import styles from './index.module.less';

const { Text } = Typography;
const { Item } = Breadcrumb;

export default function EditMedium() {
  const { id } = useParams<{ id: string }>();
  const [mediumState, mediumDispatcher] = store.useModel('medium');
  const history = useHistory();
  const formRef = useRef<ProFormInstance>();
  const [form] = Form.useForm();

  const mediumId = +id;
  const medium = mediumState.editing?.id === mediumId ? mediumState.editing : undefined;

  useEffect(() => {
    if (!medium) {
      mediumDispatcher.getEditingOne(mediumId);
    }
  });

  useEffect(() => {
    formRef.current?.setFieldsValue(medium);
  }, [medium]);

  const toCreateNewAdspot = () => {
    formRef.current?.validateFields()
      .then(async () => {
        const value = formRef.current?.getFieldsValue();
        const data = { ...medium, ...value };

        const result = await mediumDispatcher.update(data);

        if (result) {
          history.push({ pathname: '/traffic/list/adspot/new' }, {
            mediumId: result.id,
            mediumName: result.mediaName
          });
        }
        return result;
      });
  };

  if (!medium) {
    return <Text>加载中。。。</Text>;
  }

  const goBack = () => {
    defer(() => history.push('/traffic/media'));
  };

  return (<>
    <Breadcrumb style={{marginBottom: '9px', marginTop: '-5px'}}>
      <Item><Link to='/traffic/media'>返回</Link></Item>
      <Item>
        <Space>编辑媒体</Space>
      </Item>
    </Breadcrumb>
    <ProCard style={{maxWidth: '950px', margin: '9px auto'}}>
      <PageContainer
        ghost={true}
        content={(
          <ProForm<IMedium>
            formRef={formRef}
            form={form}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 8 }}
            layout="horizontal"
            submitter={false}
            onFinish={async (formFields) => {
              const newValues = { ...medium, ...formFields };
              
              const data = await mediumDispatcher.update(newValues);
              if (data) {
                defer(() => history.push('/traffic/media'));
              }
              return data;
            }}
          >
            <Form.Item label="媒体ID">
              <CopyableText text={medium.id}>
                <Text style={{ color: '#606060' }}>
                  {medium.id}
                </Text>
              </CopyableText>
            </Form.Item>
            <MediumForm isEditing={true}/>
          </ProForm>
        )}
        className={styles['media-container']}
      />
    </ProCard>
    <ProCard style={{ textAlign: 'right', maxWidth: '950px', margin: '9px auto'}}>
      <Space>
        <Button onClick={() => goBack()}>取消</Button>
        <Button onClick={toCreateNewAdspot}>提交并继续创建广告位</Button>
        <Button type="primary" onClick={() => formRef.current?.submit()}>提交</Button>
      </Space>   
    </ProCard>
  </>);
}
