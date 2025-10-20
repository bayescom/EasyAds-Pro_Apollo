import ProCard from '@ant-design/pro-card';
import store from '@/store';
import { PageContainer } from '@ant-design/pro-layout';
import { ProFormInstance } from '@ant-design/pro-form';
import { useHistory, useParams } from 'ice';
import defer from 'lodash/defer';
import { useEffect, useRef, useState } from 'react';
import { Form, Space, Button, Row, Typography, Breadcrumb } from 'antd';
import styles from './index.module.less';
import AdspotForm from './components/form';
import { randomString } from '@/services/utils/utils';

const { Text } = Typography;
const { Item } = Breadcrumb;

const adspotDispatcher = store.getModelDispatchers('adspot');

export default function EditAdspot() {
  const { id } = useParams<{ id: string }>();
  const adspotState = store.useModelState('adspot');
  const history = useHistory();
  const formRef = useRef<ProFormInstance>();

  const adspotId = +id;
  const adspot = adspotState.editing?.id === adspotId ? adspotState.editing : undefined;

  const [form] = Form.useForm();
  const switchFcrequency = Form.useWatch('switchFcrequency', form);
  const integrationType = Form.useWatch('integrationType', form);

  const [showFcrequencySetting, setShowFcrequencySetting] = useState(false);
  const [filterOption, setFilterOption] = useState<any[]>([]);
  const [securityKey, setSecurityKey] = useState('');
  const [isShowRewardReveal, setIsShowRewardReveal] = useState(false);
 
  useEffect(() => {
    if (!adspot) {
      adspotDispatcher.getEditingOne(adspotId);
    } else {
      adspotDispatcher.getLayoutList();

      if (adspot.rewardReveal) {
        setIsShowRewardReveal(true);
        setSecurityKey(adspot?.securityKey);
      } else {
        setIsShowRewardReveal(false);
      }
    }
  }, [adspot]);

  useEffect(() => {
    if (switchFcrequency !== undefined) {
      if(switchFcrequency) {
        setShowFcrequencySetting(true);
      } else {
        form.setFieldValue('deviceDailyReqLimit', undefined);
        form.setFieldValue('deviceDailyImpLimit', undefined);
        form.setFieldValue('deviceReqInterval', undefined);
        setShowFcrequencySetting(false);
      }
    }
  }, [switchFcrequency]);

  useEffect(() => {
    formRef.current?.setFieldsValue(adspot);
  });

  const changeRewardReveal = (value) => {
    if (value) {
      setSecurityKey(randomString(16));
      setIsShowRewardReveal(true);
    } else {
      setSecurityKey('');
      setIsShowRewardReveal(false);
    }
  };

  const handleValues = (value) => {
    const data = {
      ...adspot,
      ...value,
    };

    if (!data.switchFcrequency) {
      data.deviceDailyReqLimit = null;
      data.deviceDailyImpLimit = null;
      data.deviceReqInterval = null;
    }

    if (data.adspotType == 5 && !data.rewardReveal) {
      data.rewardName = '';
      data.rewardAmount = null;
      data.rewardCallback = '';
    }

    data.securityKey = securityKey;

    return data;
  };

  const handleSubmit = async (value) => {
    const data = handleValues(value);
    const result = await adspotDispatcher.update(data);
            
    if (result) {
      defer(() => history.goBack());
    }
    return result;
  };

  if (!adspot) {
    return <Text>加载中。。。</Text>;
  }

  const goDistribution = () => {
    form.validateFields()
      .then(async () => {
        const value = form.getFieldsValue();
        const data = handleValues(value);
        
        const result = await adspotDispatcher.update(data);

        if (result) {
          defer(() => history.push(`/traffic/distribution?mediaId=${result.basic.mediaId}&adspotId=${result.id}`));
        }
        return result;
      });
  };

  return (<>
    <Breadcrumb style={{marginBottom: '10px'}}>
      <Item><Space style={{cursor: 'pointer'}} onClick={() => {
        history.goBack();
      }}>返回</Space></Item>
      <Item>
        <Space>编辑广告位</Space>
      </Item>
    </Breadcrumb>
    <PageContainer
      ghost={true}
      className={styles['adspot-container']}
      content={(
        <Row style={{ maxWidth: '1178px', margin: '0 auto', marginTop: 0, justifyContent: 'center', alignItems: 'center'}}>
          <Form
            form={form}
            labelCol={{ flex: '0 0 160px' }}
            labelWrap={true}
            layout="horizontal"
            className={styles['adspot-form']}
            onFinish={handleSubmit}
            initialValues={adspot}
          >
            <AdspotForm 
              currentAdspotType={adspot?.adspotType + ''}
              isEdit={true}
              mediaId={adspot.mediaId}
              showFcrequencySetting={showFcrequencySetting}
              setShowFcrequencySetting={(value) => setShowFcrequencySetting(value)}
              setFilterOption={(value) => setFilterOption(value)}
              filterOption={filterOption}
              currentImplementMethod={integrationType}
              isShowRewardReveal={isShowRewardReveal}
              securityKey={securityKey}
              setSecurityKey={(value) => setSecurityKey(value)}
              changeRewardReveal={changeRewardReveal}
            />
            <ProCard style={{maxWidth: '900px', height: '72px', margin: '9px auto 0px', textAlign: 'right' }}>
              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Space>
                  <Button htmlType="button" onClick={() => history.goBack()}>取消</Button>
                  <Button onClick={() => goDistribution()}>提交并配置分发</Button>
                  <Button type="primary" htmlType="submit">提交</Button>
                </Space>
              </Form.Item>
            </ProCard>
          </Form>
        </Row>
      )}
    />
  </>);
}
