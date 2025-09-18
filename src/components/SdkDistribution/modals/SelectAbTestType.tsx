import { CheckCard } from '@ant-design/pro-card';
import { Modal, Image } from 'antd';
import { useState } from 'react';
import waterfallAbTestingIcon from '@/assets/icons/distribution/waterfallAbTesting.png';
import trafficAbTestingIcon from '@/assets/icons/distribution/trafficAbTesting.png';
import styles from './index.module.less';

interface IProps {
  visible: boolean,
  onClose: () => void,
  onFinish: (value) => void,
}

function SelectAbTestType ({
  visible,
  onClose, 
  onFinish 
}: IProps) {

  const [value, setValue] = useState('');

  return (<Modal
    open={visible}
    title={'选择A/B测试类型'}
    width={800}
    onCancel={() => {
      setValue('');
      onClose();
    }}
    onOk={() => onFinish(value)}
    okText="下一步"
    afterClose={() => {
      setValue('');
    }}
    maskClosable={false}
    okButtonProps={{disabled: value ? false : true}}
    className={styles['ab-type-container']}
  >
    <CheckCard.Group
      onChange={(value: string) => {
        setValue(value);
      }}
      value={value}
    >
      <CheckCard 
        description={
          <div>
            <div className={styles['ab-type-image-container']}>
              <Image
                src={waterfallAbTestingIcon}
                style={{ width: 'auto', height: '110px' }}
                preview={false}
              />
            </div>
            
            <p className={styles['ab-type-title']}>A/B测试「瀑布流」</p>
            <p>该测试用于对比使用不同瀑布流的效果。支持在当前流量分组下（若没有创建流量分组，则在默认分组下）创建A/B测试，在A/B组使用不同的瀑布流配置，帮您找到更适合该流量分组的瀑布流配置。</p>
          </div>
        } 
        value="waterfall"
      />
      <CheckCard 
        description={
          <div>
            <div className={styles['ab-type-image-container']}>
              <Image
                src={trafficAbTestingIcon}
                style={{ width: 'auto', height: '110px' }}
                preview={false}
              />
            </div>
            <p className={styles['ab-type-title']}>A/B测试「流量分组」</p>
            <p>该测试用于对比使用不同流量分组的效果。支持在A/B组下分别创建多个流量分组，对比使用/不使用流量分组或使用不同流量分组规则时收益，帮您找到收益更高的流量分组规则。</p>
          </div>
        } 
        value="traffic"
      />
    </CheckCard.Group>
    
  </Modal>);
}

export default SelectAbTestType;
