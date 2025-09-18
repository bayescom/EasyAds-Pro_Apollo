import store from '@/store';
import styles from '../index.module.less';
import { useEffect, useState } from 'react';
import ProCard from '@ant-design/pro-card';
import MultipleSelect from '@/components/MultipleSelect';
import { chartDimensionList } from '@/components/Utils/Constant';
import { Row, Col, Form, Select } from 'antd';
import commonStyles from '@/styles/index.module.less';
import MutipleLineStack from '@/components/MutipleLineStack';
import { DimensionChartItemData } from '@/models/types/reportAbTest';
import { dataDimension, dataMapToFloat } from '../utils/index';

const { Option } = Select;

function Index() {
  const reportAbTestDetail = store.useModelState('reportAbTestDetail');
  const [chartData, setChartData] = useState<DimensionChartItemData[]>([]);

  const [form] = Form.useForm();

  const dimensions = Form.useWatch('dimensions', form);
  const data = Form.useWatch('data', form);

  useEffect(() => {
    if (reportAbTestDetail.dimensionChart.length && dimensions!= undefined) {
      setChartData(reportAbTestDetail.dimensionChart.filter(item => dimensions.includes(item.groupId)));
    }
  }, [dimensions, reportAbTestDetail.dimensionChart]);

  useEffect(() => {
    // 默认全选
    if (reportAbTestDetail.groupList.length) {
      form.setFieldValue('dimensions', reportAbTestDetail.groupList.map(item => item.value.toString()).join(','));
    }
  }, [reportAbTestDetail.groupList]);

  const chartDimensionLeftList = dataDimension.map(item => ({
    key: chartDimensionList[item].key,
    name: chartDimensionList[item].name
  }));

  return (
    <ProCard className={styles['chart-detail-container']} style={{marginTop: '10px'}}>
      <h3 className={styles['common-title']}>A/B测试数据图表</h3>
      <div className={styles['chart-detail-select-container']}>
        <Form 
          form={form}
          className={[styles['inline-form'], styles['dimension-container'], commonStyles['common-inline-form']].join(' ')}
          initialValues={{
            data: 'income'
          }}
        >
          <Row>
            <Col span={12}>
              <Form.Item
                name="data"
                label="指标"
              >
                <Select
                >
                  {
                    chartDimensionLeftList.map(item => (
                      <Option 
                        key={item.key} 
                        value={item.key} 
                        label={item.name } 
                      >
                        {item.name}
                      </Option>
                    ))
                  }
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <MultipleSelect 
                options={reportAbTestDetail.groupList}
                label='纬度'
                name='dimensions'
                keyType='value'
                isNoShowIdOrValue={true}
              />
            </Col>
          </Row>
        </Form>
      </div>
      {reportAbTestDetail.dimensionChart.length && data && form.getFieldValue('dimensions') != undefined ?
        <MutipleLineStack 
          xAxisData={reportAbTestDetail.timeList || []}
          yAxis={data ? chartDimensionList[data] : {}}
          seriesData={chartData.map(dimensionItem => {
            return {
              name: dimensionItem.tag,
              data: dimensionItem[dataMapToFloat[data]],
              type: 'line',
              smooth: true,
              lineStyle: {width : 1},
              showSymbol: false
            };
          }) || []}
        /> : <></>
      }
    </ProCard>
  );
}

export default Index;
