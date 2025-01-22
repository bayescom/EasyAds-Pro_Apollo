import { IMedium } from '@/models/types/medium';
import store from '@/store';
import ProCard from '@ant-design/pro-card';
import ProForm, { ProFormInstance } from '@ant-design/pro-form';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Space, Breadcrumb } from 'antd';
import { useHistory, Link } from 'ice';
import { useRef, useEffect } from 'react';
import MediumForm from './form';
import defer from 'lodash/defer';
import styles from './index.module.less';

const { Item } = Breadcrumb;

export default function CreateMedium() {
  const mediumDispatcher = store.useModelDispatchers('medium');
  const history = useHistory();
  const formRef = useRef<ProFormInstance>();

  const medium = store.useModelState('medium');

  useEffect(() => {
    formRef.current?.setFieldsValue(medium.new);
  });

  const toCreateNewAdspot = () => {
    formRef.current?.validateFields()
      .then(async () => {
        const value = formRef.current?.getFieldsValue();
        const data = {
          ...medium.new,
          ...value,
        };
        const result = await mediumDispatcher.new(data);

        if (result) {
          history.push({ pathname: '/traffic/list/adspot/new' }, {
            mediumId: result.id,
            mediumName: result.mediaName
          });
        }
        return result;
      });
  };

  return (<>
    <Breadcrumb style={{marginBottom: '9px', marginTop: '-5px'}}>
      <Item><Link to='/traffic/media'>返回</Link></Item>
      <Item>
        <Space>新建媒体</Space>
      </Item>
    </Breadcrumb>
    <ProCard style={{maxWidth: '855px', margin: '9px auto'}}>
      <PageContainer
        ghost={true}
        content={(
          <ProForm<IMedium>
            formRef={formRef}
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 8 }}
            layout="horizontal"
            submitter={false}
            onFinish={async (formFields) => {
              const data = await mediumDispatcher.new(formFields);
              if (data) {
                defer(() => history.push('/traffic/media'));
              }
              return data;
            }}
            className={styles['media-container']}
          >
            <MediumForm isEditing={false} />
          </ProForm>
        )}
      />
    </ProCard>
    <ProCard style={{ textAlign: 'right', maxWidth: '855px', margin: '9px auto'}}>
      <Space>
        <Button onClick={() => history.goBack()}>取消</Button>
        <Button onClick={toCreateNewAdspot}>提交并继续创建广告位</Button>
        <Button type="primary" onClick={() => formRef.current?.submit()}>提交</Button>
      </Space>   
    </ProCard>
  </>);
}
