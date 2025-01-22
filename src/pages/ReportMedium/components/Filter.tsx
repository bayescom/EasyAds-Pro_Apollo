import store from '@/store';
import styles from '../index.module.less';
import { Form, Select, Col, Row, Checkbox } from 'antd';
import  { useEffect, useState } from 'react';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import DateRange from '@/components/DateRange';
import moment from 'moment';
import { getSearchParams } from 'ice';
import MultipleSelect from '@/components/MultipleSelect';
import commonStyles from '@/styles/index.module.less';

const { Option } = Select;

const reportMediumDispatcher = store.getModelDispatchers('reportMedium');

function Index() {
  const reportMedium  = store.useModelState('reportMedium');
  const [codeState, codeDispatcher] = store.useModel('code');
  const [timeCompareType, setTimeCompareType] = useState(1);

  const [form] = Form.useForm();
  const type = Form.useWatch('type', form);
  const channelIds = Form.useWatch('channelIds', form);

  const { adspotId } = getSearchParams();

  useEffect(() => {
    codeDispatcher.fetchCodeList(['layout', true]);

    const localDateType = window.sessionStorage.getItem('commonDateType');
    if (localDateType) {
      const dateType = JSON.parse(localDateType);

      // 当选择的跨度是1天的时候，将汇总方式变为按小时
      const diffDays = moment(dateType.endTime * 1000).diff(moment(moment(dateType.beginTime * 1000)), 'days');
      if (diffDays == 0) {
        form.setFieldsValue({
          type: 1
        });
        reportMediumDispatcher.setCurrentTimeType(1);
      }
      
      reportMediumDispatcher.setQueryParams({...reportMedium.queryParams, time: [moment(dateType.beginTime * 1000), moment(dateType.endTime * 1000)], type: diffDays ? reportMedium.queryParams.type : 1});
      form.setFieldValue('time', [moment(dateType.beginTime * 1000), moment(dateType.endTime * 1000)]);
    } else {
      form.setFieldValue('time', [moment().subtract(7, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')]);
    }

    // 将数据清空，在页面离开的时候
    return () => {
      reportMediumDispatcher.setActiveKey('detail');
      reportMediumDispatcher.setCurrentCompareValue(1);
      reportMediumDispatcher.setIsContrastTime(false);
      reportMediumDispatcher.setCurrentTimeType(1);
    };
  }, []);

  // 首页top广告位跳转收益报表，有个坑：离开页面后，通过导航栏点回来，会在第一次点回来的时候也发两次请求，直到第二次才正常
  useEffect(() => {
    if (adspotId !== undefined) {
      form.setFieldValue('adspotIds', adspotId);
      reportMediumDispatcher.setQueryParams(form.getFieldsValue());
    }
  }, [adspotId]);

  // 这里改动是为了兼顾，图表选择了时间对比，也需要将上面的时间对比选择上，且需要初始化对比的时间
  useEffect(() => {
    if (reportMedium.isContrastTime) {
      const time = form.getFieldValue('time');
      form.setFieldsValue({
        contrastTime: [moment(time[0]).subtract(1, 'days').startOf('day'), moment(time[1]).subtract(1, 'days').endOf('day')]
      });
      reportMediumDispatcher.setQueryParams(form.getFieldsValue());
    }
    queryMediaChannelAndAdspot();
  }, [reportMedium.isContrastTime, form, reportMedium.currentTimeType]);

  useEffect(() => {
    // 加上这段代码是修复，数据图表上 选择时间对比，然后切换时间选择快捷键，比如一个月前的时候，此时，切换到指标对比再次切换回时间对比，还是一月前，但是后面的时间不对。
    //  只要切换【纬度对比】、【时间对比】、【指标对比】都需要将 上面的时间快捷选项给重置
    setTimeCompareType(1);
    form.setFieldValue('timeCompareType', 1);
  }, [reportMedium.currentCompareType, form]);

  // 清空媒体、广告位、广告网络、广告源 
  const resetMediaAdspotAndChannel = () => {
    form.setFieldsValue({
      adspotIds: undefined,
      mediaIds: undefined,
      sdkAdspotIds: undefined,
      channelIds: undefined,
    });
  };

  // 汇总方式改变
  const changeType = (value) => {
    reportMediumDispatcher.setCurrentTimeType(value);
    form.setFieldValue('timeCompareType', 1);
    setTimeCompareType(1);
    
    // 去掉汇总方式切换之后时间切回到默认值的逻辑。只是在选择范围大于7天而且是按小时的时候，进行特殊处理。比如7-23号，切换到按小时，则7-14号。
    const currentTime = form.getFieldValue('time');
    const diffDays = moment(currentTime[1]).diff(moment(currentTime[0]), 'days');

    // 跨度为7天，则 diffDays = 6
    if (diffDays > 6 &&  value == 1) {
      form.setFieldsValue({
        time: [currentTime[0], moment(currentTime[0]).add(6, 'day').endOf('day')]
      });

      if (reportMedium.isContrastTime) {
        form.setFieldsValue({
          contrastTime: [moment(currentTime[0]).subtract(timeCompareType, 'days').startOf('day'), moment(currentTime[1]).subtract(timeCompareType, 'days').endOf('day')]
        });
      }

      const commonDataType = {
        beginTime: currentTime[0].startOf('day').unix(),
        endTime: moment(currentTime[0]).add(6, 'day').endOf('day').unix()
      };
      // resetMediaAdspotAndChannel();
      window.sessionStorage.setItem('commonDateType', JSON.stringify(commonDataType));
    }
    reportMediumDispatcher.setQueryParams(form.getFieldsValue());
  };

  const changeTime = (time) => {
    if (moment().startOf('day').unix() === moment(time[0]).unix() && moment().endOf('day').unix() === moment(time[1]).unix()) {
      form.setFieldsValue({
        time: [time[0], moment().subtract(1, 'hours')]
      });
    }

    const diffDays = moment(time[1]).diff(moment(time[0]), 'days');
    // 当选择的跨度是1天的时候，将汇总方式变为按小时
    if (diffDays == 0) {
      form.setFieldsValue({
        type: 1
      });
      reportMediumDispatcher.setCurrentTimeType(1);
    }
    if (timeCompareType == 100) {
      form.setFieldsValue({
        contrastTime: [moment(time[0]).subtract(1 + diffDays, 'days').startOf('day'), moment(time[0]).subtract(1, 'days').endOf('day')]
      });
    } else {
      if (timeCompareType != 30) {
        form.setFieldsValue({
          contrastTime: [moment(time[0]).subtract(timeCompareType, 'days').startOf('day'), moment(time[1]).subtract(timeCompareType, 'days').endOf('day')]
        });
      } else {
        const diffDays = moment(time[1]).diff(moment(time[0]), 'days');
        const month = moment(time[0]).subtract(1, 'month');
        form.setFieldsValue({
          contrastTime: [month.startOf('day'), moment(month).add(diffDays, 'days').endOf('day')]
        });
      }
    }
   
    const commonDataType = {
      beginTime: time[0].unix(),
      endTime: time[1].unix()
    };
    window.sessionStorage.setItem('commonDateType', JSON.stringify(commonDataType));
    // resetMediaAdspotAndChannel();
    reportMediumDispatcher.setQueryParams(form.getFieldsValue());
    queryMediaChannelAndAdspot();
  };

  // 手动设置form值，setFieldsValue， 不会触发valueChange
  const changeContrastTime = (contrastTime) => {
    const diffDays = moment(contrastTime[1]).diff(moment(contrastTime[0]), 'days');

    // 当选择的跨度是1天的时候，将汇总方式变为按小时
    if (diffDays == 0) {
      form.setFieldsValue({
        type: 1
      });
      reportMediumDispatcher.setCurrentTimeType(1);
    }

    const currentTime = form.getFieldValue('time');
    form.setFieldsValue({
      time: [moment(currentTime[1]).subtract(diffDays, 'days').startOf('day'), currentTime[1]]
    });
    // resetMediaAdspotAndChannel();
    reportMediumDispatcher.setQueryParams(form.getFieldsValue());
    queryMediaChannelAndAdspot();
  };

  const changeIsContrastTime = (e) => {
    setTimeCompareType(1);
    form.setFieldValue('timeCompareType', 1);
    reportMediumDispatcher.setIsContrastTime(e.target.checked);
  };

  // 切换是一天、一周、一月、自定义对比
  const changeTimeCompareType = (value) => {
    setTimeCompareType(value);
    const time = form.getFieldValue('time');
    if (value != 100) {
      if (value != 30) {
        form.setFieldsValue({
          contrastTime: [moment(time[0]).subtract(value, 'days').startOf('day'), moment(time[1]).subtract(value, 'days').endOf('day')]
        });
      } else {
        const diffDays = moment(time[1]).diff(moment(time[0]), 'days');
        const month = moment(time[0]).subtract(1, 'month');
        form.setFieldsValue({
          contrastTime: [month.startOf('day'), moment(month).add(diffDays, 'days').endOf('day')]
        });
      }
      queryMediaChannelAndAdspot();
    }
    reportMediumDispatcher.setQueryParams(form.getFieldsValue());
  };

  // 在时间、对比时间 改变之后，都需要调用这几个接口，时间改变包括
  // 1、汇总方式改变 reportMedium.currentTimeType
  // 2、时间、对比时间选择框选择
  // 3、时间对比勾选或者取消 reportMedium.isContrastTime
  // 4、切换是一天、一周、一月 这种来改变时间
  // 5、自定义时，改变对比的时间，从而使得两个时间都改变
  // 6、图表下面，切换为时间对比，
  const queryMediaChannelAndAdspot = () => {
    reportMediumDispatcher.getChannelList();
    reportMediumDispatcher.getMediaList();
    reportMediumDispatcher.getSdkAdspotList(channelIds);
    const currentFormValue = form.getFieldsValue();
    reportMediumDispatcher.getAdspotList({mediaIds: currentFormValue.mediaIds, adspotTypes: currentFormValue.adspotTypes});
  };

  const handleChange = () => {
    form.setFieldValue('adspotIds', undefined);
    const currentFormValue = form.getFieldsValue();
    reportMediumDispatcher.getAdspotList({mediaIds: currentFormValue.mediaIds, adspotTypes: currentFormValue.adspotTypes});
    reportMediumDispatcher.setQueryParams(form.getFieldsValue());
  };

  const formatParams = () => {
    const { sdkAdspotIds,  channelIds} = form.getFieldsValue();
    // 选择的广告源所在的channelId，这样做是为了接口方便区分，同名的sdkAdspotIds
    const sdkAdspotIdsInvertChannelIdList: string[] = [];
    // 用户选择的广告网络id
    const formChannelIdsList = channelIds ? channelIds.split(',') : [];
    if (sdkAdspotIds) {
      const sdkAdspotIdList = sdkAdspotIds.split(',');
      
      sdkAdspotIdList.map(selectSdkAdspotIdItem => {
        const selectSdkAdspotIdObj = reportMedium.sdkAdspotList.find(item => item.id == selectSdkAdspotIdItem);
        if (selectSdkAdspotIdObj && selectSdkAdspotIdObj?.channelId) {
          sdkAdspotIdsInvertChannelIdList.push(selectSdkAdspotIdObj?.channelId.toString());
        }
      });
    }
    const allChannelIdsList = new Set([...formChannelIdsList, ...sdkAdspotIdsInvertChannelIdList]);

    const queryParams = {
      ...form.getFieldsValue(),
      channelIds: Array.from(allChannelIdsList).join(',')
    };

    reportMediumDispatcher.setQueryParams(queryParams);
  };

  return (
    <>
      <Form 
        form={form}
        className={[styles['inline-form'], commonStyles['common-inline-form']].join(' ')}
        initialValues={{
          type: 2,
          contrastTime: []
        }}
      >
        <Row style={{width: '100%'}}>
          <Col span={6}>
            <Form.Item
              name="type"
              label="汇总"
            >
              <Select onChange={changeType}>
                <Option value={1}>按小时</Option>
                <Option value={2}>按天</Option>
                <Option value={3}>按周</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="time"
              label="时间"
              getValueFromEvent={value => ([value[0].startOf('day'), value[1].endOf('day')])}
            >
              <DateRange 
                canSelectRangeDay={type == 1 ? 7 : 90}
                canSelectToday={true}
                changeTime={changeTime}
                hideMonth={ type == 1 }
                hideLastHour={ true }
              />
            </Form.Item>
          </Col>
          <>
            <div className={styles['contrast-time']}>
              <Checkbox onChange={(e: CheckboxChangeEvent) => changeIsContrastTime(e)} checked={reportMedium.isContrastTime}>时间对比</Checkbox>
            </div>
            {
              reportMedium.isContrastTime && (<div style={{width: '120px', margin: '0 10px'}}>
                <Form.Item
                  name="timeCompareType"
                >
                  <Select onChange={changeTimeCompareType} style={{width: '100%'}} defaultValue={1}>
                    <Option value={1}>一天前</Option>
                    <Option value={7}>一周前</Option>
                    <Option value={30}>一月前</Option>
                    <Option value={100}>自定义</Option>
                  </Select>
                </Form.Item>
                
              </div>)
            }
          </>
          <Col span={6}>
            {
              <div className={styles[(reportMedium.isContrastTime) ? '' : 'contrast-time-hide']}>
                <Form.Item
                  name="contrastTime"
                  label="时间"
                  getValueFromEvent={value => ([value[0].startOf('day'), value[1].endOf('day')])}
                >
                  <DateRange 
                    canSelectRangeDay={type == 1 ? 7 : 90}
                    canSelectToday={type == 1}
                    changeTime={changeContrastTime}
                    hideMonth={ type == 1 }
                    hideToday={ true }
                    disabled = { timeCompareType != 100 }
                  />
                </Form.Item>
              </div>
            }
          </Col>
        </Row>
        <Row style={{width: '100%', marginTop: '17px'}}>
          <Col span={6}>
            <MultipleSelect 
              options={reportMedium.mediaList}
              label='媒体'
              name='mediaIds'
              keyType='value'
              changeFormValue={() => handleChange()}
              isMedia={true} 
              urlKey='url'
              onChangeCurrentSelect={(value: string) => handleChange()}
              hasPlatform={true}
              platformKey='platform'
            />
          </Col>
          <Col span={6}>
            <MultipleSelect 
              options={codeState.layout ? codeState.layout : []}
              label='广告位类型'
              name='adspotTypes' 
              keyType='value'
              changeFormValue={() => handleChange()}
              onChangeCurrentSelect={(value: string) => handleChange()}
              isNoShowIdOrValue={true}
              notShowSearchInput={true}
            />
          </Col>
          <Col span={6}>
            <MultipleSelect 
              options={reportMedium.adspotList}
              label='广告位'
              name='adspotIds' 
              keyType='value'
              changeFormValue={() => {
                reportMediumDispatcher.setQueryParams(form.getFieldsValue());
              }}
              onChangeCurrentSelect={(value: string) => {
                reportMediumDispatcher.setQueryParams(form.getFieldsValue());
              }}
            />
          </Col>
          <Col span={6}>
            <MultipleSelect 
              options={reportMedium.channelList}
              label='广告网络'
              name='channelIds' 
              keyType='value'
              changeFormValue={() => {
                form.setFieldValue('sdkAdspotIds', undefined);
                reportMediumDispatcher.setQueryParams(form.getFieldsValue());
                const currentFormValue = form.getFieldsValue();
                reportMediumDispatcher.getSdkAdspotList(currentFormValue.channelIds);
              }}
              isChannel={true}
              urlKey='url'
              isNoShowIdOrValue={true}
              onChangeCurrentSelect={(value: string) => {
                form.setFieldValue('sdkAdspotIds', undefined);
                reportMediumDispatcher.setQueryParams(form.getFieldsValue());
                const currentFormValue = form.getFieldsValue();
                reportMediumDispatcher.getSdkAdspotList(currentFormValue.channelIds);
              }}
            />
          </Col>
          <Col span={6}>
            <MultipleSelect 
              options={reportMedium.sdkAdspotList}
              label='广告源'
              name='sdkAdspotIds' 
              keyType='id'
              changeFormValue={() => {
                formatParams();
              }}
              onChangeCurrentSelect={(value: string) => {
                formatParams();
              }}
              isNoShowIdOrValue={true}
              isRight={true}
            />
          </Col>
        </Row>

      </Form>
    </>
  );
}

export default Index;
