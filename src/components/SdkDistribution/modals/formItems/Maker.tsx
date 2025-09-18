import MultipleSelect from '@/components/MultipleSelect';
import store from '@/store';
import { useEffect } from 'react';

type Props = {
  name: string,
  notRequired?: boolean,
  isSdkGroup?: boolean
};

const makerOptions = store.getModelState('dimension').options.make;
const dimensionDispatcher = store.getModelDispatchers('dimension');

function Maker({ name, notRequired, isSdkGroup }: Props) {
  const dimensionState = store.useModelState('dimension');
  useEffect(() => {
    makerOptions || dimensionDispatcher.getCommonDimensionOptions('make');
  }, []);

  return (
    <MultipleSelect
      name={name}
      isSdkGroup={isSdkGroup}
      options={dimensionState.options.make || []}
      label=''
      keyType='value'
      rules={[{ required: notRequired ? false : true, message: '请选择制造商' }]}
      isNoShowIdOrValue={true}
      optionValueType='string'
      noStyle={true}
      isDimension={true}
    />
  );
}

export default Maker;
