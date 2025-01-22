import store from '@/store';
import { Col, Row } from 'antd';
import { columnWidth } from '../utils';
import styles from './index.module.less';
import { initColumnsList } from '@/components/Utils/TableColumnCostomization';

export default function ChannelHeader() {
  const distributionState = store.useModelState('distribution');

  return (
    <Row className={styles['header-scroll-col']} align='middle' wrap={false}>
      <Col span={8}>
        <Col flex={columnWidth.priority}>
          <span>优先级</span>
        </Col>
        <Col flex={columnWidth.name}>
          <span>广告源</span>
        </Col>
        <Col flex={columnWidth.price} style={{marginLeft: '-3px'}}>
          <span>价格</span>
        </Col>
        <Col flex={columnWidth.operation}>
          <span>操作</span>
        </Col>
      </Col>
      <Col span={16}>
        {
          distributionState.distributionDataTarget.map(item => (<Col flex={columnWidth[item]} key={item}>
            <span className={styles['header-anticon']}>{initColumnsList[item].title}</span>
          </Col>))
        }
      </Col>
    </Row>);
}
