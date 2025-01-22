import { Col, Form, Input } from 'antd';
import MetaAppId from './components/MetaAppId';
import MetaAppKey from './components/MetaAppKey';
import styles from './index.module.less';

type Iprops = {
  config: { metaKey: string, metaName: string },
  isSeverHasSaveMetaAppId: boolean,
  isSeverHasSaveMetaAppKey: boolean,
  metaAppIdDisabled: boolean,
  savePervMetaAppId: string | null,
  setMetaAppIdDisabled: (value: boolean) => void,
  setSavePervMetaAppId: (value) => void,
  metaAppKeyDisabled: boolean,
  savePervMetaAppKey: string | null,
  setMetaAppKeyDisabled: (value: boolean) => void,
  setSavePervMetaAppKey: (value) => void
}

export default function SelectedChannelConfigs ({
  config,
  isSeverHasSaveMetaAppId,
  isSeverHasSaveMetaAppKey,
  metaAppIdDisabled,
  savePervMetaAppId,
  setMetaAppIdDisabled,
  setSavePervMetaAppId,
  metaAppKeyDisabled,
  savePervMetaAppKey,
  setMetaAppKeyDisabled,
  setSavePervMetaAppKey
}: Iprops) {

  const getContnet = (config) => {
    switch (config.metaKey) {
    case 'app_id':
      return (<MetaAppId 
        config={config}
        isSeverHasSaveMetaAppId={isSeverHasSaveMetaAppId}
        metaAppIdDisabled={metaAppIdDisabled}
        savePervMetaAppId={savePervMetaAppId}
        setMetaAppIdDisabled={(value) => setMetaAppIdDisabled(value)}
        setSavePervMetaAppId={(value) => setSavePervMetaAppId(value)}
      />);
    case 'app_key':
      return (<MetaAppKey
        config={config}
        isSeverHasSaveMetaAppKey={isSeverHasSaveMetaAppKey}
        metaAppKeyDisabled={metaAppKeyDisabled}
        savePervMetaAppKey={savePervMetaAppKey}
        setMetaAppKeyDisabled={(value) => setMetaAppKeyDisabled(value)}
        setSavePervMetaAppKey={(value) => setSavePervMetaAppKey(value)}
      />);
    default: 
      return (<Col span={16} key={config.metaKey}>
        <Form.Item
          name={['params', config.metaKey]}
          tooltip={config.metaName.length >10 ? config.metaName || config.metaKey.toUpperCase() : false || config.metaName === '广告位ID' ? '此广告位ID为您在第三方广告平台创建的广告位/代码位ID，请填写在此处' : false }
          label={
            <span className={styles['channel-configs-label']}>{config.metaName || config.metaKey.toUpperCase()}</span>
          }
          rules={[{ required: true, type: 'string', message: '请输入' }]}
          required={true}
          getValueFromEvent={e => e.target.value.trim()}
        >
          <Input placeholder="请输入" />
        </Form.Item>
      </Col>);
    }
  };
  
  return (<>
    {getContnet(config)}
  </>);
}
