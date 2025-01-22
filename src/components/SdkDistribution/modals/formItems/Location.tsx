import store from '@/store';
import { useEffect } from 'react';
import TargetIngTreeSelect from '@/components/TargetIngTreeSelect';

type Props = {
  name: string,
  notRequired?: boolean,
};

const locationOptions = store.getModelState('dimension').options.location;
const dimensionDispatcher = store.getModelDispatchers('dimension');

function Location({ name, notRequired }: Props) {
  const dimensionState = store.useModelState('dimension');
  const optionsData = dimensionState.options.location || [];
  
  useEffect(() => {
    locationOptions || dimensionDispatcher.getCommonDimensionOptions('location');
  }, []);

  return (<TargetIngTreeSelect formName={name} notRequired={notRequired} optionList={optionsData} errorMessage='请选择地域' isLocation={true}/>);
}

export default Location;
