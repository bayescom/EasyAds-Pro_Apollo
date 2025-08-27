import { DatePicker } from 'antd';
import  { useState } from 'react';
import moment, { Moment } from 'moment';
import { RangeValue } from '@/models/types/common';

const { RangePicker } = DatePicker;

interface IProps {
  /**
   * 可选择时间天数，
   */
  canSelectRangeDay: number,
  value?: RangeValue,
  onChange?: (time: Moment) => void,
  /**
   * 主要是做时间对比使用，对比左边的时间变化之后，会影响右边组件的值，需要在父组件中进行changeTime的手动处理
   */
  changeTime?: (time: Moment) => void,
  hideMonth?: boolean,
  hideToday?: boolean,
  hideLastHour?: boolean,
  hideSevenDays?: boolean,
  hideLastMonth?: boolean,
  /**
   * 是否可以选择今天，场景：报表时间选择的时候，按天或者周汇总，时间不能选择今天
   */
  canSelectToday?: boolean,
  // 是否被禁用
  disabled?: boolean,
}

const DateRange: React.FC<IProps> = ({ canSelectRangeDay, canSelectToday, value, onChange, changeTime, hideMonth, hideToday, hideLastHour, disabled, hideSevenDays, hideLastMonth }: IProps) => {
  const [dates, setDates] = useState<RangeValue>(null);
  const [hackValue, setHackValue] = useState<RangeValue>(null);
  const [timeValue, setTimeValue] = useState<RangeValue>(null);

  // 放函数组件外面不会随着每次函数组件的重新加载而进行新一轮的if判断，所以需要放到里面
  const rangeTime: Record<string, [Moment, Moment]> = {
    '最近一小时': [moment().subtract(61, 'minutes').startOf('minute'),moment().subtract(1, 'minutes').startOf('minute')],
    '今天': [moment().startOf('day'), moment()],
    '昨天': [moment().startOf('day').subtract(1, 'days'), moment().endOf('day').subtract(1, 'days')],
    '最近7天':[moment().subtract(7, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
    '本月': [moment().startOf('month'), moment()],
    '上月': [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')],
  };
  
  if (hideToday) {
    delete rangeTime['最近一小时'];
    delete rangeTime['今天'];
  }
  if (hideMonth) {
    delete rangeTime['本月'];
  }
  if (hideLastHour) {
    delete rangeTime['最近一小时'];
  }
  if (hideSevenDays) {
    delete rangeTime['最近7天'];
  }
  if (canSelectRangeDay < 30 || hideLastMonth) {
    delete rangeTime['上月'];
  }

  const disabledDate = (current: Moment) => {
    if (!dates) {
      return false;
    }

    const tooLate = (!!dates[0] && current.diff(dates[0], 'days') > (canSelectRangeDay - 1)) || current > (canSelectToday ? moment().endOf('day') : moment().startOf('day'));
    const tooEarly = !!dates[1] && dates[1].diff(current, 'days') > (canSelectRangeDay - 1);
    return tooLate || tooEarly;
  };

  const onOpenChange = (open: boolean) => {
    if (open) {
      setHackValue([null, null]);
      setDates([null, null]);
    } else {
      setHackValue(null);
    }
  };

  const onChangeTime = (time) => {
    setTimeValue(time);
    onChange?.(time);
    changeTime?.(time);
  };

  return (
    <>
      <RangePicker
        allowClear={false}
        value={ hackValue || value || timeValue}
        disabledDate={disabledDate}
        onCalendarChange={val => setDates(val)}
        onChange={onChangeTime}
        ranges={rangeTime}
        onOpenChange={onOpenChange}
        disabled={disabled}
      />
    </>
  );
};

export default DateRange;
