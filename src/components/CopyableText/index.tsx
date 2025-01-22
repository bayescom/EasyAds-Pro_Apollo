import copy from 'copy-to-clipboard';
import { Tooltip } from 'antd';
import { ReactNode, useState } from 'react';
import styles from './index.module.less';
import { TooltipPlacement } from 'antd/es/tooltip';

type Props = {
  /**
   * ReactNode to trigger copy. Required when no text prop
   */
  children: ReactNode,
  /**
   * Text to trigger copy. Required when no children
   */
  text: string | number,
  /**
   * Name in tooltip after '点击复制'
   */
  nameInTooltip?: string,
  /**
   * toolTip placement
   */
  placement?: TooltipPlacement
};

function CopyableText({ children, text, nameInTooltip, placement }: Props) {
  const [copied, setCopied] = useState(false);
  const title = copied ? '复制成功' : '点击复制' + (nameInTooltip || '');

  return (
    <Tooltip title={title} placement={placement}>
      <span
        className={styles['text-container-to-copy']}
        onClick={() => {
          setCopied(true);
          copy(text.toString().trim());
        }}
        onMouseEnter={() => setCopied(false)}
      >{children}</span>
    </Tooltip>
  );
}

export default CopyableText;
