import { Select, Tooltip, Typography, Input } from 'antd';
import { maxTagPlaceholder } from '@/components/Utils';
import styles from './index.module.less';
import { useEffect, useState } from 'react';
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { FilterOptionHasLabel } from '@/models/types/common';

const { Paragraph } = Typography;

type IProps = {
  value: string | string[],
  mode: 'multiple' | 'tags' | undefined,
  /** 展示列表 */
  options:  FilterOptionHasLabel[],
  /** select onChange事件 */
  onChange: (newVersion: any) => void,
  /** search input 搜索事件 */
  onSearch: ((value: string) => void),
  /** 下拉展开/关闭事件 */
  onDropdownVisibleChange: ((open: boolean) => void)
}

const TargetingAppVersionSelect: React.FC<IProps> = ({value, mode, options, onChange, onSearch, onDropdownVisibleChange} : IProps) => {
  const [showRightList, setShowRightList] = useState<FilterOptionHasLabel[]>([]);
  const [filterOption, setFilterOption] = useState<FilterOptionHasLabel[]>([]);

  useEffect(() => {
    if (options) {
      setFilterOption(options);
    }
  }, [options]);

  useEffect(() => {
    // 手动输入的percent反正都是0%
    if (value && value.length) {
      const resultExcludes: FilterOptionHasLabel[] = [];
      const valueList = mode ? value : Array(value);
      if (Array.isArray(valueList)) {
        valueList.forEach(item => {
          const test = options.filter(inner => inner.value == item);
          resultExcludes.push(...test);
          if (!test.length) {
            resultExcludes.push({value: item, label: `${item}`});
          }
        });
        setShowRightList(resultExcludes);
      }
    } else {
      setShowRightList([]);
    }
  }, [value, options, mode]);
  
  const handleSearch = (e) => {
    if (e.target.value) {
      const text: string = e.target.value.trim();
      const result = options.filter(item => item.value.toString().includes(text)
       || item.label.toString().toLowerCase().includes(text.toLowerCase()));
      if (result.length) {
        // options里找到了
        setFilterOption(result);
      } else {
        // 这里是自定义输入
        onSearch(e.target.value);
      }
    } else {
      setFilterOption(options);
    }
  };

  const handleCustomAll = () => {
    const checkOther = options.filter(item => !value.includes(item.value));
    const checkOtherValues = checkOther.map(item => item.value);
    onChange([...value, ...checkOtherValues]);
    setShowRightList([...showRightList, ...checkOther]);
  };

  const clearAll = () => {
    onChange([]);
    setShowRightList([]);
  };

  const clearOption = (clearValue) => {
    const newValue = value.filter(item => item !== clearValue);
    const rightList = showRightList.filter(item => item.value !== clearValue);
    onChange(newValue);
    setShowRightList(rightList);
  };

  return (<>
    <Select
      key='targetingAppVersion'
      value={value}
      mode={mode}
      options={filterOption}
      placeholder="请选择..."
      showArrow={true}
      onChange={(value) => onChange(value)}
      maxTagCount='responsive'
      maxTagPlaceholder={(omittedValues) => maxTagPlaceholder(omittedValues)}
      onDropdownVisibleChange={(open) => onDropdownVisibleChange(open)}
      dropdownRender={(originDom) => (<>
        <div className={styles['select-container']}>
          <div className={styles['left-container']}>
            <Input onChange={(e) => handleSearch(e)}
              className={styles['custom-input']}
              allowClear 
              prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }}/>}
              ref={input => {
                setTimeout(function(){
                  input?.focus();
                },100);
              }}
              onKeyDown={(e) => e.stopPropagation()}
            />
            <p className={styles['custom-btn']}>
              <span className={styles['custom-btn-all']} onClick={() => handleCustomAll()}>全选</span>
            </p>
            <Paragraph className={styles['hint-text']} type="secondary">可以直接输入暂未检测到的版本号</Paragraph>
            {originDom}
          </div>
          <div className={styles['right-container']}>
            <div className={styles['top-operation']}>
              <span style={{color: '#545454'}}>已选：&nbsp;{showRightList.length}</span>
              <a onClick={() => clearAll()}>清空全部</a>
            </div>
            <ul className={styles['show-select-container']}>
              {
                showRightList.length ? showRightList.map((item, index) => {
                  return ( <li key={`${item.value}_${index}`}>
                    <p>
                      {
                        item.label.length > 14 ? <Tooltip title={item.label} placement='right'>{item.label}</Tooltip>
                          : <>{item.label}</>
                      }
                    </p>
                    <span className={styles['clear-icon']} onClick={() => clearOption(item.value)}><CloseOutlined /></span>
                  </li>);
                }) : <></>
              }
            </ul>
          </div>
        </div>
      </>)}
    />
  </>);
};

export default TargetingAppVersionSelect;
