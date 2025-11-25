import ProCard from '@ant-design/pro-card';
import store from '@/store';
import { PageContainer } from '@ant-design/pro-layout';
import { useHistory, Link, useLocation } from 'ice';
import defer from 'lodash/defer';
import { useEffect, useState } from 'react';
import { Form, Space, Button, Row, Breadcrumb } from 'antd';
import styles from './index.module.less';
import AdspotForm from './components/form';
import { randomString } from '@/services/utils/utils';

const { Item } = Breadcrumb;

const adspotDispatcher = store.getModelDispatchers('adspot');

export default function CreateAdspot() {
  const history = useHistory();
  const adspot = store.useModelState('adspot');

  // 从媒体表单跳转过来的新建广告位
  const state: { mediumId: string, mediumName: string } = useLocation<{ mediumId: string, mediumName: string }>().state;

  const [form] = Form.useForm();
  const mediaId = Form.useWatch('mediaId', form);
  const adspotType = Form.useWatch('adspotType', form);
  const integrationType = Form.useWatch('integrationType', form);
  const switchFcrequency = Form.useWatch('switchFcrequency', form);
  const rewardReveal = Form.useWatch('rewardReveal', form);
  
  const [mediaName, setMediaName] = useState(state && state.mediumName ? state.mediumName : '');
  const [adspotTypeName, setAdspotTypeName] = useState('');
  const [showFcrequencySetting, setShowFcrequencySetting] = useState(false);
  const [filterOption, setFilterOption] = useState<any[]>([]);
  const [securityKey, setSecurityKey] = useState('');
  const [isShowRewardReveal, setIsShowRewardReveal] = useState(false);

  useEffect(() => {
    if (integrationType !== undefined) {
      adspotDispatcher.getLayoutList()
        .then((res) => {
          form.setFieldValue('adspotType', +res[0].value);
          setAdspotTypeName(res[0].name);
        });
    }
  }, [form, integrationType]);

  useEffect(() => {
    if (mediaName || adspotTypeName) {
      form.setFieldValue('adspotName', mediaName + '_' + adspotTypeName);
    }
  }, [mediaName, adspotTypeName, form]);

  useEffect(() => {
    if(!switchFcrequency) {
      form.setFieldValue('deviceDailyReqLimit', undefined);
      form.setFieldValue('deviceDailyImpLimit', undefined);
      form.setFieldValue('deviceReqInterval', undefined);
    }
  }, [switchFcrequency]);

  useEffect(() => {
    if (mediaId) {
      // 选择媒体选中后清空搜索框
      form.setFieldValue('search-mediaId', undefined);
      setFilterOption(adspot.mediumList);
    }
  }, [mediaId]);

  useEffect(() => {
    rewardReveal ? setIsShowRewardReveal(true) : setIsShowRewardReveal(false);
  }, [rewardReveal]);

  useEffect(() => {
    if (rewardReveal) {
      setSecurityKey(randomString(16));
    } else {
      setSecurityKey('');
      form.setFieldValue('rewardName', '');
      form.setFieldValue('rewardAmount', '');
      form.setFieldValue('rewardCallback', '');
    }
  }, [rewardReveal]);

  const adspotTypeChanged = (value) => {
    setAdspotTypeName(value);
  };

  const mediaChanged = async (value) => {
    setMediaName(value);
  };

  const handleValues = (value) => {
    const data = {
      ...adspot.new,
      ...value,
    };

    data.securityKey = securityKey;
    return data;
  };

  const handleSubmit = async (value) => {
    const data = handleValues(value);

    const result = await adspotDispatcher.new(data);

    if (result) {
      defer(() => history.push('/traffic/adspot'));
    }
    return result;
  };
 
  const goDistribution = () => {
    form.validateFields()
      .then(async () => {
        const value = form.getFieldsValue();
        const data = handleValues(value);

        const result = await adspotDispatcher.new(data);

        if (result) {
          defer(() => history.push(`/traffic/distribution?mediaId=${data.mediaId}&adspotId=${Object.keys(result)[0]}`));
        }
        return result;
      });
  };

  return (<>
    <Breadcrumb style={{marginBottom: '10px'}}>
      <Item><Link to='/traffic/adspot'>返回</Link></Item>
      <Item>
        <Space>新建广告位</Space>
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
            initialValues={{
              'integrationType': 0,
              'mediaId': state && state.mediumId ? Number(state.mediumId) : null,
              'timeout': 2000,
              'rewardReveal': 0
            }}
          >
            <AdspotForm 
              mediaChanged={mediaChanged}
              adspotTypechanged={adspotTypeChanged}
              currentAdspotType={adspotType + ''}
              mediaId={mediaId}
              showFcrequencySetting={showFcrequencySetting}
              setShowFcrequencySetting={(value) => setShowFcrequencySetting(value)}
              setFilterOption={(value) => setFilterOption(value)}
              filterOption={filterOption}
              currentImplementMethod={integrationType}
              isShowRewardReveal={isShowRewardReveal}
              securityKey={securityKey}
              setSecurityKey={(value) => setSecurityKey(value)}
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
