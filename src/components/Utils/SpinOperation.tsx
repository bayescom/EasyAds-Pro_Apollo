import { Spin, SpinProps } from 'antd';
import { ReactNode, useState } from 'react';

interface Props extends SpinProps {
  children: (any) => ReactNode
}

function SpinOperation(props: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <Spin {...props} spinning={loading}>
      {props.children(setLoading)}
    </Spin>
  );
}

export default SpinOperation;
