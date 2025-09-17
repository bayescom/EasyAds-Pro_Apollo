import { IVersion, VersionType } from '@/models/types/version';
import store from '@/store';
import { Col, Row, Select } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import TargetingAppVersionSelect from '@/components/TargetingAppVersionSelect';
import { firstLetterToOperatorMap } from '@/models/common';

interface InputProps {
  mediumId?: number,
  type: VersionType,
  value?: string,
  onChange?: (value: string) => void,
  appVersion: string
}
type Operator = '>=' | '<=' | '' | '!';
type Version = string | string[];

const codeDispatcher = store.getModelDispatchers('code');
const versionDispatcher = store.getModelDispatchers('version');

function AppVersionPicker({ mediumId, type, value, onChange, appVersion }: InputProps) {
  const codeState = store.useModelState('code');
  const versionState = store.useModelState('version');
  const initialOperator: Operator = '';
  const [operator, setOperator] = useState<Operator>(initialOperator);

  const isMultiSelect = ['!', ''].includes(operator);

  let initialVersion: Version = [];
  const [version, setVersion] = useState<Version>(initialVersion);

  useEffect(() => {
    if (value && firstLetterToOperatorMap[value[0]]) {
      setOperator(firstLetterToOperatorMap[value[0]]);
    }

    if (value) {
      // TODO: export transform function
      const operatorRegex = Object.values(firstLetterToOperatorMap).map(item => `(${item})`).join('|');
      initialVersion = value.replace(new RegExp(operatorRegex), '');
      if (isMultiSelect) {
        initialVersion = initialVersion.split(',');
      }
      setVersion(initialVersion);
    }
  }, [value]);
  
  const [manualVersion, setManualVersion] = useState<string>('');

  useEffect(() => {
    mediumId && versionDispatcher.getVersionList({ mediumId, type }); // TODO: cache，避免多次请求
  }, [mediumId, type]);

  useEffect(() => {
    codeDispatcher.fetchCodeList(['versionOperator']);
  }, []);

  useEffect(() => {
    if (appVersion) {
      if (['>', '<', '!'].includes(appVersion[0])) {
        setOperator(firstLetterToOperatorMap[appVersion[0]]);
      } else {
        setOperator('');
      }
    }
  }, [appVersion]);

  const changeValue = (newOperator: Operator, newVersion: Version) => {
    if (!onChange) {
      return;
    }

    if (newVersion.length === 0) {
      onChange('');
    } else {
      onChange(newOperator + (Array.isArray(newVersion) ? newVersion.join(',') : newVersion ));
    }
  };

  // 把相同逻辑的重复代码提取出来封装
  const changeVersionFun = (versionParam, newOperator) => {
    const singleVersion = versionParam[0] || [];
    setVersion(singleVersion);
    changeValue(newOperator, singleVersion);
  };

  const onOperatorChange = (newOperator) => {
    setOperator(newOperator);
    // Version selector changed from multiple-select to single-select
    if (isMultiSelect == true && ['>=', '<='].includes(newOperator)) {
      if (Array.isArray(version)) { // must be array when isMultiSelect is true, or there will be a bug in somewhere
        changeVersionFun(version, newOperator);
      } else {
        changeVersionFun(version, newOperator);
      }
    } else if (isMultiSelect == true && ['!', ''].includes(newOperator)) {
      if (Array.isArray(version)) { // must be array when isMultiSelect is true, or there will be a bug in somewhere
        changeVersionFun(version, newOperator);
      } else {
        changeVersionFun(version, newOperator);
      }
    }  else if (!!isMultiSelect && ['!', ''].includes(newOperator)) {
      if (!Array.isArray(version)) { // never be array when isMultiSelect is false, or there will be a bug in somewhere
        setVersion(version ? [version] : []);
        changeValue(newOperator, [version]);
      }
    } else {
      changeValue(newOperator, version);
    }
  };

  const onVersionChange = (newVersion) => {
    setVersion(newVersion);
    changeValue(operator, newVersion);
  };

  const [manualVersions, setManualVersions] = useState<string[]>([]); // Add this line

  useEffect(() => {
    if (value) {
      const operatorRegex = Object.values(firstLetterToOperatorMap).map(item => `(${item})`).join('|');
      const versionStr = value.replace(new RegExp(operatorRegex), '');
      const versions = isMultiSelect ? versionStr.split(',') : [versionStr];
      setManualVersions(prev => {
        const newManualVersions = versions.filter(v => 
          !versionState[type][mediumId]?.some(vs => vs.version === v) &&
          !prev.includes(v)
        );
        return [...prev, ...newManualVersions];
      });
    }
  }, [value, mediumId, type, versionState]);

  const versions: { label: string, value: string }[] = useMemo(() => {
    if (!mediumId) {
      return [];
    }

    let versions: IVersion[] = [];
    if (versionState[type][mediumId]) {
      versions = [...versionState[type][mediumId]];
    }

    const result = versions.map(({ version, percent }) => ({
      label: `${version} (${percent})`,
      value: version
    }));

    // Add manual versions that aren't in the API results
    const manualOptions = manualVersions
      .filter(manual => !result.some(r => r.value === manual))
      .map(manual => ({
        label: `${manual} (0%)`,
        value: manual
      }));

    return [...manualOptions, ...result];
  }, [mediumId, type, versionState, manualVersions]);

  const handleManualVersionSearch = (value: string) => {
    if (value && !manualVersions.includes(value)) {
      setManualVersions(prev => [...prev, value]);
    }
  };

  const handleDropdownVisibleChange = (open: boolean) => {
    if (open) {
      setManualVersion(''); // Clear the temporary manual version state
    }
  };

  return (<Row gutter={8} wrap={false}>
    <Col flex="0 0 108px">
      <Select
        value={operator}
        options={codeState.versionOperator}
        fieldNames={{ label: 'name' }}
        onChange={onOperatorChange}
      />
    </Col>
    <Col flex="0 1 100%">
      <TargetingAppVersionSelect
        value={version}
        mode={isMultiSelect ? 'multiple' : undefined}
        options={versions}
        onChange={(value) => onVersionChange(value)}
        onSearch={handleManualVersionSearch}
        onDropdownVisibleChange={handleDropdownVisibleChange}
      />
    </Col>
  </Row>);
}

export default AppVersionPicker;
