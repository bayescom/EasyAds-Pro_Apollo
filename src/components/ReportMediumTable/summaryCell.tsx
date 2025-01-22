import store from '@/store';
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { Statistic } from 'antd';

type IProps = {
  item: string,
  index: number,
  modelName: 'reportMedium'
}

const SummaryCell: React.FC<IProps> = ({item, index, modelName}: IProps) => {
  const [state, stateDispatcher] = store.useModel(modelName);
  const rmbList = ['income', 'thirdIncome', 'ecpc', 'ecpm', 'cpa', 'thirdEcpm', 'thirdEcpc'];
  
  return (<>
    {
      state && state.summaryData && state.summaryData.data && state.summaryData.data[item] &&
      <Statistic 
        value={state.summaryData && state.summaryData.data && state.summaryData.data[item] && state.summaryData.data[item].basic ? state.summaryData.data[item].basic : 0}
        prefix={rmbList.includes(item) ? '¥' : ''}
        valueStyle={{color: '#000', fontSize: 13}}
      />
    }
    {
      state && state.summaryData && state.summaryData.data && state.summaryData.data[item] && state.summaryData.data[item].crease != null ? (<div style={{color: state.summaryData.data[item].trend == 1 ? 'red' : 'green', marginBottom: 0, marginTop: '5px'}}>
        {state.summaryData.data[item].trend == 1 ? <CaretUpOutlined style={{color: 'red'}} /> : <CaretDownOutlined style={{color: 'green'}} />}
        <Statistic 
          value={state.summaryData.data[item].crease || 0}
          prefix={rmbList.includes(item) ? '¥' : ''}
          valueStyle={{color: state.summaryData.data[item].trend == 1 ? 'red' : 'green' , fontSize: 13}}
          style={{display: 'inline-block'}}
        />
        <span style={{color: state.summaryData.data[item].trend == 1 ? 'red' : 'green'}}>({state.summaryData.data[item].ratio})</span>
      </div>) : (<></>)
    }
    
  </>);
};

export default SummaryCell;
