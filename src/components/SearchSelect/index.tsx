import { Form, Select, Space, Tooltip, Typography, Image, Input } from 'antd';
import styles from './index.module.less';
import { useEffect, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import DefaultIcon from '@/assets/icons/channel/defaultIcon.png';
import { Rule } from 'antd/lib/form';
import { ColProps } from 'antd/es/grid/col';
import { platformIconMap } from '../Utils/Constant';

type IProps = {
  options: any[],
  label: string,
  name: string,
  /**
   * option的value
   */
  valueKey: string,
  /**
   * option的名称
   */
  valueName: string,
  /**
   * 是否带图标
   */
  hasImage?: boolean
  /**
   * 图标键名
   */
  imageKey?: string,
  onChange?: (value) => void,
  /**
   * 是否带投放平台小图标
   */
  hasPlatform?: boolean,
  platformKey?: string,
  /** 是否不显示id， 比如广告网络、广告源 */
  notShowOptionsValue?: boolean,
  /** 是否必填 */
  required?: boolean
  /** 必填规则 */
  rules?: Rule[],
  labelCol?: ColProps,
  style?: React.CSSProperties,
  hasChannelImage?: boolean,
  channelImageKey?: string,
  getValueProps?: ((value: any) => Record<string, unknown>),
  placeholder?: React.ReactNode
}

const { Option } = Select;
const { Text } = Typography;

const SearchSelect: React.FC<IProps> = ({options, label, name, valueKey, valueName, hasImage, imageKey, onChange, hasPlatform, platformKey, notShowOptionsValue, required, rules, labelCol, style, hasChannelImage, channelImageKey, getValueProps, placeholder} : IProps) => {
  const form = Form.useFormInstance();
  const watchFormItem = Form.useWatch(name, form);

  const [filterOption, setFilterOption] = useState<any[]>([]);
  const [value, setValue] = useState();

  useEffect(() => {
    form.setFieldValue(name, watchFormItem);
  }, [watchFormItem]);

  useEffect(() => {
    setFilterOption(options);
  }, [options]);

  const handleSearch = (e) => {
    setValue(e.target.value);
    if (e.target.value) {
      const text: string = e.target.value.trim();
      const result = options.filter(item => item[valueKey].toString().includes(text)
       || item[valueName].toString().toLowerCase().includes(text.toLowerCase()));
      setFilterOption(result);
    } else {
      setFilterOption(options);
    }
  };

  return (<>
    <Form.Item
      label={label}
      name={name}
      className={hasImage || hasChannelImage ? styles['search-select'] : ''}
      required={required}
      rules={rules}
      labelCol={labelCol}
      getValueProps={getValueProps}
    >
      <Select
        allowClear
        placeholder={placeholder ? placeholder : '请选择'}
        popupClassName={[styles['popup-search-select'], hasPlatform || hasImage ? styles['platform-container'] : ''].join(' ')}
        dropdownRender={(menu) => (
          <>
            <div className={styles['custom-container']}>
              <Input onChange={(e) => handleSearch(e)}
                className={styles['custom-input']}
                allowClear 
                prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }}/>}
                ref={input => input?.focus()}
                value={value}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
            {menu}
          </>
        )}
        onChange={(value) => onChange && onChange(value)}
        style={style}
        onSelect={()  => {
          // 单选选中后清空搜索框
          setValue(undefined);
          setFilterOption(options);
        }}
      >
        {filterOption.length && filterOption.map(item => (
          <Option key={item[valueKey]} value={item[valueKey]} label={item[valueName]}>
            <Space size={0} style={{width:'100%'}}>
              {hasImage && imageKey && <Image src={item[imageKey]} preview={false} style={{width: '32px', height: 'auto', marginRight: '4px'}} className={styles['image-container']}/>}
              <Space align='start' direction="vertical" size={0} className={styles['text-contianer']}>
                <div> 
                  {hasChannelImage && channelImageKey && <Image src={item[channelImageKey] ? item[channelImageKey] : DefaultIcon} preview={false} style={{width: '20px', height: 'auto', marginRight: '10px', verticalAlign: 'baseline'}}/>}
                  {item[valueName].length > 12 ? <Tooltip title={item[valueName]} placement='right'>{item[valueName]}</Tooltip> : <Text>{item[valueName]}</Text>}
                </div>
                {!notShowOptionsValue && <div>
                  {hasPlatform && platformKey && <Image 
                    src={ platformIconMap[item[platformKey]] }
                    style={{ width: '16px', height: '15px', marginTop: -17 }} 
                    preview={false}
                  />}
                  <Text type="secondary">{item[valueKey]}</Text>
                </div>}
              </Space>
            </Space>
          </Option>
        ))}
      </Select>
    </Form.Item>
  </>);
};

export default SearchSelect;
