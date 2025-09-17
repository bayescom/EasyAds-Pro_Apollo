import { Tooltip } from 'antd';
import { EChartsType } from 'echarts';

export const maxTagPlaceholder = (omittedValues) => (
  <Tooltip title={omittedValues.map(item => item.label).join(', ')}>
    <span style={{cursor: 'pointer'}}>{`+${omittedValues.length}`}</span>
  </Tooltip>
);

export const maxTagPlaceholderForCustomSelect = (omittedValues) => {
  return <>{omittedValues.length}项</>;
};

export const maxTagPlaceholderWithTestTool = (omittedValues) => {
  const newOmittedValues: any[] = [];
  if (omittedValues.length && omittedValues[0].label.props) {
    omittedValues.map(item => {
      newOmittedValues.push(item.label.props.children[0].props.children[0]);
    });
  }

  return (<Tooltip title={newOmittedValues.map(item => item).join(', ')}>
    <span style={{cursor: 'pointer'}}>{`+${newOmittedValues.length}`}</span>
  </Tooltip>);
};

export const maxTagPlaceholderWithMaker = (omittedValues) => {
  const newOmittedValues: any[] = [];
  if (omittedValues.length && omittedValues[0].label.props) {
    omittedValues.map(item => {
      if (item.label.props) {
        newOmittedValues.push(item.label.props.children[2].props.children[0].props.children);
      } else {
        newOmittedValues.push(item.label);
      }
    });
  }

  return (<Tooltip title={newOmittedValues.map(item => item).join(', ')}>
    <span style={{cursor: 'pointer'}}>{`+${newOmittedValues.length}`}</span>
  </Tooltip>);
};

/**
 * 将echarts图表变为自适应，适合于单图或者多图
 * @param {*} eDom 
 */
const echartsDom = [];
export const chartsResize = (eDom: EChartsType | undefined) => {  
  echartsDom.push(eDom as never); 
  window.onresize = () => {
    echartsDom.map((item: EChartsType) => item.resize());
  };
};

export const base64 = {
  encode: (str) => btoa(
    encodeURIComponent(str).replace(
      /%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
        return String.fromCharCode(+('0x' + p1));
      })
  ),

  decode: (str) => decodeURIComponent(atob(str).split('').map(c =>
    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  ).join(''))
};
