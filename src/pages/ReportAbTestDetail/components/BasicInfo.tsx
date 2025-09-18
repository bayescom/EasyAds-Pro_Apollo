import { Form, Space, Typography, Image, Divider, Tooltip, Radio } from 'antd';
import styles from '../index.module.less';
import ProCard from '@ant-design/pro-card';
import { EditOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useParams, Link } from 'ice';
import store from '@/store';
import { useEffect, useState } from 'react';
import { getTimeDifference } from '@/services/utils/utils';
import moment, { Moment } from 'moment';
import DateRange from '@/components/DateRange';
// 这个是流量分组的ab测试表单
import PercentageGroupListForm from '@/components/SdkDistribution/modals/PercentageGroupListForm';
// 这个是瀑布流的 ab测试表单
import PercentageGroupListFormByWaterfall from '@/components/SdkDistribution/modals/PercentageGroupListFormByWaterfall';

const { Title, Text } = Typography;

const reportAbTestDetailDispatcher = store.getModelDispatchers('reportAbTestDetail');
const sdkAdspotChannelDispatcher = store.getModelDispatchers('sdkAdspotChannel');
const distributionDispatcher = store.getModelDispatchers('distribution');
const sdkDistributionDispatcher = store.getModelDispatchers('sdkDistribution');

function BasicInfo () {
  const { id } = useParams<{ id: string }>();
  const reportAbTestDetailState = store.useModelState('reportAbTestDetail');
  const distributionState = store.useModelState('sdkDistribution');
  const sdkDistributionState = store.useModelState('sdkDistribution');

  const [form] = Form.useForm();

  const [isPercentageGroupModalVisible, setIsPercentageGroupModalVisible] = useState(false);

  useEffect(() => {
    const localDateType = window.sessionStorage.getItem('commonDateType');
    let time: Moment | [Moment, Moment] = moment();
    if (localDateType) {
      const dateType = JSON.parse(localDateType);
      time = [moment(dateType.beginTime * 1000), moment(dateType.endTime * 1000)];
    } else {
      time = [moment().subtract(1, 'day').startOf('day'), moment().subtract(1, 'day').endOf('day')];
    }
    form.setFieldValue('time', time);
    const queryParams = {
      ...reportAbTestDetailState.queryParams,
      beginTime: time[0].unix(),
      endTime: time[1].unix()
    };
    reportAbTestDetailDispatcher.setQueryParams(queryParams);
  }, []);

  useEffect(() => {
    reportAbTestDetailDispatcher.getOneExperimentById(id);
  }, [id]);

  useEffect(() => {
    if (reportAbTestDetailState.currentExperiment.adspotId) {
      const localDateType = window.sessionStorage.getItem('commonDateType');
      const [beginTime, endTime] = form.getFieldValue('time');
      const dateType = localDateType ? JSON.parse(localDateType) : { beginTime: beginTime.unix(), endTime: endTime.unix() };
      // 1. 获取广告位SDK渠道列表
      sdkAdspotChannelDispatcher.getList({ adspotId: reportAbTestDetailState.currentExperiment.adspotId, dateType });
      // 2. 获取AB分组信息
      sdkDistributionDispatcher.queryAdspotSdkDistribution({ adspotId: reportAbTestDetailState.currentExperiment.adspotId, dateType });
    }
  }, [reportAbTestDetailState.currentExperiment.adspotId]);

  useEffect(() => {
    if (sdkDistributionState[reportAbTestDetailState.currentExperiment.adspotId] && sdkDistributionState[reportAbTestDetailState.currentExperiment.adspotId].percentageList) {
      if (reportAbTestDetailState.currentExperiment.experimentType == '2') {
        // 如果是ab 实验的话, 需要根据 currentExperiment 的id ,找到  percentageList 里面对应的 currentTrafficGroup。他们是 id  = expId 的关系
        const currentTrafficGroup = sdkDistributionState[reportAbTestDetailState.currentExperiment.adspotId].percentageList[0].trafficGroupList.find(trafficGroup => trafficGroup.expId == reportAbTestDetailState.currentExperiment.id);
        distributionDispatcher.setCurrentTargetId(currentTrafficGroup?.groupStrategy.groupTargetId);
        distributionDispatcher.setCurrentGroupTargetId(sdkDistributionState[reportAbTestDetailState.currentExperiment.adspotId].percentageList[0].trafficPercentage.percentageId);
      } else {
        // 如果是 普通的流量分组实验，
        distributionDispatcher.setCurrentTargetId(sdkDistributionState[reportAbTestDetailState.currentExperiment.adspotId].percentageList[0].trafficGroupList[0].groupStrategy.groupTargetId);
        distributionDispatcher.setCurrentGroupTargetId(sdkDistributionState[reportAbTestDetailState.currentExperiment.adspotId].percentageList[0].trafficPercentage.percentageId);
      }
    }
    
  }, [sdkDistributionState, reportAbTestDetailState.currentExperiment.adspotId]);

  const toGroupListForm = () => {
    setIsPercentageGroupModalVisible(true);
  };

  return (<>
    <ProCard className={styles['ab-test-basic-info-container']}>
      <Title level={5} className={styles['ab-test-basic-info-title']}>
        <div>A/B测试基本信息</div>
        <a className={styles['to-edit-form']} onClick={(e) => {
          e.stopPropagation();
          toGroupListForm();
        }}><EditOutlined /> 修改分组设置</a>
      </Title>
      {JSON.stringify(reportAbTestDetailState.currentExperiment) != '{}' ? <div className={styles['ab-test-basic-info-wrap']}>
        <div className={styles['basic-info-block']}>
          <Space size={0} style={{minWidth: '200px', display: 'flex'}} className={styles['chineseName-container']}>
            <Image src={reportAbTestDetailState.currentExperiment.mediaIcon} preview={false} style={{width: '36px', height: 'auto', marginRight: '5px'}}/>
            <Space direction="vertical" size={0}>
              <Text>{reportAbTestDetailState.currentExperiment.mediaName}</Text>  
              <Text type="secondary">{reportAbTestDetailState.currentExperiment.mediaId}</Text>
            </Space>
          </Space>
          <Divider type="vertical" style={{width: '20px'}} />
          <Space direction="vertical" size={0} style={{marginRight: '35px', minWidth: '200px'}}>
            <Text>
              <Typography.Paragraph
                style={{marginBottom: '0px', wordBreak: 'break-all'}}
                ellipsis={{ rows: 2 }}
              >
                <Tooltip title={reportAbTestDetailState.currentExperiment.adspotName}>{reportAbTestDetailState.currentExperiment.adspotName}</Tooltip>
              </Typography.Paragraph>
            </Text>
            <Text type="secondary">{reportAbTestDetailState.currentExperiment.adspotId}</Text>
          </Space>
          <Divider type="vertical" />
          <Space direction="vertical" size={0} style={{marginRight: '35px', minWidth: '200px'}}>
            <Text>{reportAbTestDetailState.currentExperiment.createdAt}</Text>
            <Text type="secondary">{reportAbTestDetailState.currentExperiment.status ? getTimeDifference(reportAbTestDetailState.currentExperiment.createdAt, moment().format('YYYY-MM-DD HH:mm:ss')) : getTimeDifference(reportAbTestDetailState.currentExperiment.createdAt, reportAbTestDetailState.currentExperiment.endAt)}</Text>
          </Space>
        </div>
        <div className={[styles['basic-info-operation'], styles['setting-container']].join(' ')}>
          <Form 
            style={{display: 'flex', width: '475px', marginRight: '-20px'}}
            form={form}
            onValuesChange={(values) => {
              const { time, isThird } = form.getFieldsValue();
              const dateType = {
                beginTime: time[0].unix(),
                endTime: time[1].unix()
              };
              const commonDateType = dateType;
              window.sessionStorage.setItem('commonDateType', JSON.stringify(commonDateType));
              reportAbTestDetailDispatcher.setQueryParams({
                ...reportAbTestDetailState.queryParams,
                beginTime: dateType.beginTime,
                endTime: dateType.endTime,
                isThird
              });
            }}
            initialValues={{
              isThird: 0
            }}
          >
            <Form.Item
              name="time"
              getValueFromEvent={value => ([value[0].startOf('day'), value[1].endOf('day')])}
            >
              <DateRange 
                canSelectRangeDay={30}
                hideLastHour={ true }
                canSelectToday={ true }
              />
            </Form.Item>

            <Form.Item
              label="数据来源"
              name="isThird"
              style={{marginLeft: '10px'}}
            >
              <Radio.Group size="small">
                <Radio value={0}>平台</Radio>
                <Radio value={1}>三方API数据<Tooltip title='A/B测试分组中的三方API数据为整个代码位维度的数据，即此代码位的实际收益。实际不会发生拆分。'><QuestionCircleOutlined /><span className={styles['required-red']}></span></Tooltip></Radio>
              </Radio.Group>
            </Form.Item>
          </Form>
        </div>
      </div> : <></>}
    </ProCard>
    {
      !distributionState[reportAbTestDetailState.currentExperiment.adspotId] ? <></> : reportAbTestDetailState.currentExperiment.experimentType == '2' ? <PercentageGroupListFormByWaterfall
        visible={isPercentageGroupModalVisible}
        onClose={() => setIsPercentageGroupModalVisible(false)}
        adspotId={reportAbTestDetailState.currentExperiment.adspotId}
        onFinish={() => reportAbTestDetailDispatcher.getExperimentReportDetailById()}
        isFromDataReportDetail={true}
      /> : <PercentageGroupListForm
        visible={isPercentageGroupModalVisible}
        onClose={() => setIsPercentageGroupModalVisible(false)}
        adspotId={reportAbTestDetailState.currentExperiment.adspotId}
        onFinish={() => reportAbTestDetailDispatcher.getExperimentReportDetailById()}
        isFromDataReportDetail={true}
      />
    }
  </>
  );
}

export default BasicInfo;
