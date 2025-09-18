import { Select, Tooltip, Typography, Input } from 'antd';
import { maxTagPlaceholder } from '@/components/Utils';
import styles from './index.module.less';
import { useEffect, useState, useRef } from 'react'; // 引入 useRef
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
  const [customInputValue, setCustomInputValue] = useState<string | undefined>();
  const [manualVersions, setManualVersions] = useState<string[]>([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 存储防抖定时器

  useEffect(() => {
    if (options) {
      // 合并 options 和手动输入的版本号（去重）
      const manualOptions = manualVersions
        .filter(manual => !options.some(opt => opt.value === manual))
        .map(manual => ({ value: manual, label: `${manual} (0%)` }));
      setFilterOption([...manualOptions, ...options]);
    }
  }, [options, manualVersions]);

  useEffect(() => {
    if (value && value.length) {
      const resultExcludes: FilterOptionHasLabel[] = [];
      // 无论是单选还是多选，value 都转为数组处理
      const valueArray = Array.isArray(value) ? value : [value];
      
      valueArray.forEach(item => {
        const matchedOption = options.find(opt => opt.value === item);
        resultExcludes.push(
          matchedOption || { value: item, label: `${item} (0%)` }
        );
      });
      setShowRightList(resultExcludes);
    } else {
      setShowRightList([]);
    }
  }, [value, options]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setCustomInputValue(text);

    // 清除之前的防抖定时器（避免多次触发）
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 设置新的防抖定时器（500ms 后执行）
    searchTimeoutRef.current = setTimeout(() => {
      const trimmedText = text.trim();
      if (trimmedText) {
        // 1. 先尝试在现有 options 中匹配
        const matchedOptions = options.filter(item =>
          item.value.toString().includes(trimmedText) ||
          item.label.toLowerCase().includes(trimmedText.toLowerCase())
        );

        if (matchedOptions.length > 0) {
          setFilterOption(matchedOptions);
        } else {
          // 2. 如果没有匹配项，则调用 onSearch 进行搜索
          onSearch(trimmedText);
          // 3. 如果仍然没有匹配项，则添加到手动版本号列表
          if (!manualVersions.includes(trimmedText)) {
            setManualVersions(prev => [...prev, trimmedText]);
          }
        }
      } else {
        // 输入为空时，恢复完整 options
        setFilterOption(options);
      }
    }, 500); // 防抖延迟时间（可调整）
  };

  const handleCustomAll = () => {
    const contrastList = customInputValue ? filterOption : options;
    const unselectedOptions = contrastList.filter(item => !value.includes(item.value));
    const unselectedValues = unselectedOptions.map(item => item.value);
    onChange([...value, ...unselectedValues]);
    setShowRightList([...showRightList, ...unselectedOptions]);
  };

  const clearAll = () => {
    onChange([]);
    setShowRightList([]);
  };

  const clearOption = (clearValue: string) => {
    const newValue = value.filter(item => item !== clearValue);
    const newShowRightList = showRightList.filter(item => item.value !== clearValue);
    onChange(newValue);
    setShowRightList(newShowRightList);
  };

  const handleDropdownVisibleChange = (open: boolean) => {
    if (!open) {
      setCustomInputValue(undefined);
      // 关闭下拉框时，清理防抖定时器
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    } else {
      setCustomInputValue(undefined);
      setFilterOption(options);
    }
    onDropdownVisibleChange(open);
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
      onDropdownVisibleChange={handleDropdownVisibleChange}
      dropdownRender={(originDom) => (<>
        <div className={styles['select-container']}>
          <div className={styles['left-container']}>
            <Input
              onChange={(e) => handleSearch(e)}
              className={styles['custom-input']}
              allowClear 
              prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }}/>}
              ref={input => {
                setTimeout(function(){
                  input?.focus();
                },100);
              }}
              autoComplete='off'
              onKeyDown={(e) => e.stopPropagation()}
              value={customInputValue}
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
