import store from '@/store';
import { useMemo, useEffect } from 'react';
import TargetIngTreeSelect from '@/components/TargetIngTreeSelect';

type Props = {
  name: string,
  mediumId: number | undefined,
  notRequired?: boolean,
  isSdkGroup?: boolean
};

const platformTypeMap = {
  0: {
    value: 'iOS'
  },
  1: {
    value: 'Android'
  }
};

const mediumDispatcher = store.getModelDispatchers('medium');
const osvOptions = store.getModelState('dimension').options.osv;
const dimensionDispatcher = store.getModelDispatchers('dimension');

function Osv({ name, mediumId, notRequired, isSdkGroup }: Props) {
  const dimensionState = store.useModelState('dimension');
  const optionsData = dimensionState.options.osv || [];

  const mediumMap = store.useModelState('medium').map;

  useEffect(() => {
    osvOptions || dimensionDispatcher.getCommonDimensionOptions('osv');
  }, []);

  const platformType = useMemo(() => {
    if (!mediumId) {
      return null;
    }

    const medium = mediumMap[mediumId];
    if (medium) {
      return medium.platformType;
    }

    mediumDispatcher.getOne(mediumId);
    return null;
  }, [mediumId, mediumMap]);


  const currentOsVersionOptions = () => {
    if (platformType === null) {
      return optionsData;
    }
    if (platformType !== null && platformTypeMap[platformType]) {
      return optionsData.filter(item =>
        // dimension value: '1' - IOS, '2' - Android
        // medium platformType: 0 - IOS, 1 - Android, 2 - H5;
        item.value === platformTypeMap[platformType].value
      );
    } else if (platformType !== null && platformTypeMap[platformType]) {
      return [];
    }
  };

  return (<TargetIngTreeSelect isSdkGroup={isSdkGroup} formName={name} notRequired={notRequired} optionList={currentOsVersionOptions()} errorMessage='请选择操作系统版本'/>);
}

export default Osv;
