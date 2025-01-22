import store from '@/store';
import { Form } from 'antd';
import DateRange from '@/components/DateRange';
import moment from 'moment';
import { useEffect } from 'react';

const sdkDistributionDispatcher = store.getModelDispatchers('sdkDistribution');
const distributionDispatcher = store.getModelDispatchers('distribution');
const sdkAdspotChannelDispatcher = store.getModelDispatchers('sdkAdspotChannel');

export default function TimeType({adspotId}: {adspotId: number}) {
  const [form] = Form.useForm();

  useEffect(() => {
    const localDateType = window.sessionStorage.getItem('commonDateType');
    if (localDateType) {
      const dateType = JSON.parse(localDateType);
      form.setFieldValue('time', [moment(dateType.beginTime * 1000), moment(dateType.endTime * 1000)]);
    } else {
      form.setFieldValue('time', [moment().subtract(1, 'day').startOf('day'), moment().subtract(1, 'day').endOf('day')]);
    }
  }, []);
  
  return (<Form 
    form={form}
    onValuesChange={() => {
      const { time } = form.getFieldsValue();
      const dateType = {
        beginTime: time[0].unix(),
        endTime: time[1].unix()
      };
      window.sessionStorage.setItem('commonDateType', JSON.stringify(dateType));
      distributionDispatcher.setTime(dateType);
      sdkDistributionDispatcher.queryAdspotSdkDistribution({ adspotId, dateType});
      sdkAdspotChannelDispatcher.getList({ adspotId, dateType});
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
  </Form>);
}
