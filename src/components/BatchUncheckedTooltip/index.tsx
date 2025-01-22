import { Tooltip } from 'antd';
import styles from './index.module.less';

type IProps = {
  /**
   * 有勾选内容隐藏该提示，无勾选内容显示该提示
   */
  isHideTooltip: boolean,
  title: string
}

const BatchUncheckedTooltip: React.FC<IProps> = ({ isHideTooltip, title } : IProps) => {
  return ( <Tooltip
    key='tooltip'
    className={[styles['batch-dropdown-tooltip'], isHideTooltip ? styles['batch-tooltip-hide'] : ''].join(' ')}
    title={title}
    placement='left'
  />);
};

export default BatchUncheckedTooltip;
